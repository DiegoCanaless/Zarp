import { useEffect, useMemo, useState, useCallback } from "react";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { useParams } from "react-router-dom";
import type { PropiedadResponseDTO } from "../../types/entities/propiedad/PropiedadResponseDTO";
import toast from "react-hot-toast";
import { FormaPago } from "../../types/enums/FormaPago";
import { useSelector } from "react-redux";
import type { ReservaDTO } from "../../types/entities/reserva/ReservaDTO";
import { SiMercadopago } from "react-icons/si";
import { FaPaypal } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Client } from '@stomp/stompjs';
import { AutorizacionesCliente } from "../../types/enums/AutorizacionesCliente";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function mergeIntervalsInclusive(list: Intervalo[]): Intervalo[] {
    if (list.length <= 1) return list.slice().sort((a, b) => +a.start - +b.start);
    const sorted = list.slice().sort((a, b) => +a.start - +b.start);
    const res: Intervalo[] = [];
    let cur = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
        const nxt = sorted[i];
        const dayAfterCurEnd = addDaysUTC(cur.end, 1);
        if (nxt.start <= dayAfterCurEnd) {
            if (nxt.end > cur.end) cur.end = nxt.end;
        } else {
            res.push(cur);
            cur = { ...nxt };
        }
    }
    res.push(cur);
    return res;
}

function pushReservedInterval(
    cur: Intervalo[],
    nuevo: Intervalo
): Intervalo[] {
    return mergeIntervalsInclusive([...cur, nuevo]);
}


const parseDateOnlyUTC = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
};
const addDaysUTC = (d: Date, n: number) => {
    const dt = new Date(d.getTime());
    dt.setUTCDate(dt.getUTCDate() + n);
    return dt;
};
const toUTCDate = (d: Date) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const formatARS = (n: number) =>
    n.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    });

type Intervalo = { start: Date; end: Date };

function rangoCruzaBloqueados(start: Date, end: Date, intervals: Intervalo[]): boolean {
    let d = new Date(start.getTime());
    while (d <= end) {
        const dUTC = toUTCDate(d);
        if (intervals.some(({ start, end }) => dUTC >= start && dUTC <= end)) {
            return true;
        }
        d = new Date(d.getTime() + MS_PER_DAY);
    }
    return false;
}

const ReservarPropiedad = () => {
    const { id } = useParams<{ id: string }>();
    const [propiedad, setPropiedad] = useState<PropiedadResponseDTO>();
    const [formaPago, setFormaPago] = useState<FormaPago | null>(null);
    const [excludeIntervals, setExcludeIntervals] = useState<Intervalo[]>([]);
    const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
    const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [conectado, setConectado] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [mensajeFecha, setMensajeFecha] = useState<string | null>(null);
    const setAviso = useCallback((msg: string) => {
        setMensajeFecha(msg);
    }, []);

    const usuario = useSelector((state: any) => state.user);

    useEffect(() => {
        const fetchPropiedad = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_APIBASE}/api/propiedades/getById/${id}`
                );
                if (!res.ok) throw new Error("Error al traer la propiedad");
                const data: PropiedadResponseDTO = await res.json();
                setPropiedad(data);
            } catch {
                toast.error("Error al traer la propiedad");
            }
        };
        if (id) fetchPropiedad();
    }, [id]);



    useEffect(() => {
        const fetchFechasReservadas = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_APIBASE}/api/propiedades/reservas/${id}`, {headers: { 'Authorization': `Bearer ${usuario.token}`}}
                );
                if (!res.ok) {
                    const msg = await res.text();
                    throw new Error(msg || "Error al traer las fechas reservadas");
                }
                const data = await res.json();

                const intervals: Intervalo[] = data.map((r: any) => {
                    const start = toUTCDate(parseDateOnlyUTC(r.fechaInicio));
                    const endInclusive = toUTCDate(parseDateOnlyUTC(r.fechaFin));
                    return { start, end: endInclusive };
                });

                setExcludeIntervals(intervals);
            } catch (error: any) {
                toast.error(error?.message || "Error al traer las fechas reservadas");
            }
        };
        if (id) fetchFechasReservadas();
    }, [id])

    useEffect(() => {
        const cliente = new Client({
            brokerURL: import.meta.env.VITE_WS_URL,
            debug: (str) => {
                console.log({ str })
            },
            reconnectDelay: 5000,

            onConnect: () => {
                console.log("Conectado al servidor")
                setConectado(true)

                cliente.subscribe("/topic/reservas/save", (message) => {
                    try {
                        const nuevaReserva = JSON.parse(message.body);

                        const propId = nuevaReserva.propiedadId ?? nuevaReserva.propiedad?.id;
                        const inicioS = nuevaReserva.fechaInicio;
                        const finS = nuevaReserva.fechaFin;

                        if (!id || String(propId) !== String(id)) return;

                        const start = toUTCDate(parseDateOnlyUTC(inicioS));
                        const end = toUTCDate(parseDateOnlyUTC(finS));
                        const nuevo: Intervalo = { start, end };

                        setExcludeIntervals((prev) => pushReservedInterval(prev, nuevo));
                    } catch (e) {
                        console.error("Error parseando reserva WS:", e);
                    }

                })
            },

            onDisconnect: () => {
                console.log("Desconectado del servidor")
                setConectado(false)
            },

            onStompError: (frame) => {
                console.error("Error Stromp:", frame)
                setError("Error de conexion WebSocket")
            }
        })

        cliente.activate()
        setStompClient(cliente);

        return () => {
            if (cliente) {
                try {
                    cliente.deactivate();
                } catch { }
                setStompClient(null);

            }
        }
    }, [id])

    useEffect(() => {
        setMensajeFecha(null);
    }, [excludeIntervals]);

    const noches = useMemo(() => {
        if (!fechaDesde || !fechaHasta) return 0;
        const inicio = toUTCDate(fechaDesde);
        const fin = toUTCDate(fechaHasta);
        const diff = Math.round((+fin - +inicio) / MS_PER_DAY);
        return Math.max(0, diff);
    }, [fechaDesde, fechaHasta]);

    const precioPorNoche = propiedad?.precioPorNoche ?? 0;
    const total = noches * precioPorNoche;

    const isBlocked = useCallback(
        (d: Date) => {
            const x = toUTCDate(d);
            return excludeIntervals.some(({ start, end }) => x >= start && x <= end);
        },
        [excludeIntervals]
    );

    const onChangeDesde = useCallback(
        (date: Date | null) => {
            if (!date) {
                setFechaDesde(null);
                setFechaHasta(null);
                setMensajeFecha(null);
                return;
            }
            if (isBlocked(date)) {
                setFechaDesde(null);
                setFechaHasta(null);
                setAviso("Esa fecha no está disponible para check-in.");
                return;
            }
            setFechaDesde(date);
            setMensajeFecha(null);
            if (fechaHasta && toUTCDate(fechaHasta) <= toUTCDate(date)) {
                setFechaHasta(null);
            }
        },
        [fechaHasta, isBlocked, setAviso]
    );

    useEffect(() => {
        if (!mensajeFecha) return;
        const t = setTimeout(() => setMensajeFecha(null), 4000);
        return () => clearTimeout(t);
    }, [mensajeFecha]);


    const onChangeHasta = useCallback(
        (date: Date | null) => {
            if (!date) {
                setFechaHasta(null);
                setMensajeFecha(null);
                return;
            }
            if (!fechaDesde) {
                setFechaHasta(null);
                setAviso("Primero elegí la fecha de check-in.");
                return;
            }
            // Validación de rango: si cruza bloqueados, aviso inline
            if (rangoCruzaBloqueados(fechaDesde, date, excludeIntervals)) {
                setFechaHasta(null);
                setAviso("El rango elegido cruza fechas reservadas. Probá con otro check-out.");
                return;
            }
            // Si el propio check-out cae en bloqueado (por tu modelo inclusivo)
            if (isBlocked(date)) {
                setFechaHasta(null);
                setAviso("Esa fecha no está disponible para check-out.");
                return;
            }
            setFechaHasta(date);
            setMensajeFecha(null);
        },
        [fechaDesde, excludeIntervals, isBlocked, setAviso]
    );

    const minHasta = useMemo(() => {
        if (!fechaDesde) return null;
        const next = new Date(fechaDesde.getTime());
        next.setDate(next.getDate() + 1);
        return next;
    }, [fechaDesde]);

    const reservacion: ReservaDTO | null = useMemo(() => {
        if (
            !propiedad ||
            !usuario?.id ||
            !formaPago ||
            !fechaDesde ||
            !fechaHasta ||
            noches <= 0
        )
            return null;
        return {
            fechaInicio: fechaDesde,
            fechaFin: fechaHasta,
            precioTotal: total,
            clienteId: usuario.id,
            propiedadId: propiedad.id,
            formaPago,
        };
    }, [propiedad, usuario?.id, formaPago, fechaDesde, fechaHasta, noches, total]);

    const confirmarReserva = async () => {
        try {
            if (!reservacion) {
                toast.error("Faltan datos de reserva.");
                return;
            }

            if (reservacion.formaPago === FormaPago.MERCADO_PAGO) {
                const res = await fetch(
                    `${import.meta.env.VITE_APIBASE}/api/mercadoPago/create-preference`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json",'Authorization': `Bearer ${usuario.token}` },
                        
                        body: JSON.stringify(reservacion),
                    }
                );

                if (!res.ok) {
                    const msg = await res.text().catch(() => "");
                    throw new Error(msg || `Error HTTP ${res.status}`);
                }

                // El backend devuelve directamente el init_point como string
                const initPoint = await res.text();

                if (initPoint) {
                    // Redirigir al checkout de Mercado Pago
                    window.location.href = initPoint;
                    return;
                }

                throw new Error("No se recibió el link de pago");
            }

            if (reservacion.formaPago === FormaPago.PAYPAL) {
                const res = await fetch(
                    `${import.meta.env.VITE_APIBASE}/api/paypal/crearOrdenPago`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(reservacion),
                    }
                );

                if (!res.ok) {
                    const msg = await res.text().catch(() => "");
                    throw new Error(msg || `Error HTTP ${res.status}`);
                }

                const raw = await res.text();
                try {
                    const json = JSON.parse(raw);
                    if (json?.init_point) {
                        window.location.href = json.init_point;
                        return;
                    }
                } catch {
                    window.location.href = raw;
                }
            }

        } catch (error: any) {
            console.error("Error al crear la preferencia:", error);
            toast.error(error?.message || "No se pudo crear la preferencia de pago.");
        }
    };

    return (
        <>
            <UsuarioHeader />
            <main className="bg-secondary min-h-screen text-white pt-24 sm:pt-36">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
                    <header className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                            {propiedad?.nombre ?? "Propiedad"}
                        </h1>
                        <p className="text-sm opacity-80">
                            {precioPorNoche > 0
                                ? `${formatARS(precioPorNoche)} por noche`
                                : "Precio por noche no disponible"}
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <section className="lg:col-span-2 space-y-6">
                            <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 sm:p-6">
                                <h3 className="text-lg font-semibold mb-4">Fechas</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1 opacity-90">Desde</label>
                                        <DatePicker
                                            selected={fechaDesde}
                                            onChange={onChangeDesde}
                                            selectsStart
                                            startDate={fechaDesde}
                                            endDate={fechaHasta}
                                            minDate={new Date()}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Elegí fecha desde"
                                            className="w-full rounded-lg bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-indigo-400"
                                            calendarClassName="!text-black"
                                            isClearable
                                            excludeDateIntervals={excludeIntervals}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 opacity-90">Hasta</label>
                                        <DatePicker
                                            selected={fechaHasta}
                                            onChange={onChangeHasta}
                                            selectsEnd
                                            startDate={fechaDesde}
                                            endDate={fechaHasta}
                                            minDate={minHasta ?? undefined}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Elegí fecha hasta"
                                            className="w-full rounded-lg bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                                            calendarClassName="!text-black"
                                            disabled={!fechaDesde}
                                            isClearable
                                            excludeDateIntervals={excludeIntervals}
                                        />
                                    </div>
                                </div>

                                {/* Mensajes debajo de los calendarios */}
                                <p className="text-xs mt-3 opacity-80">
                                    {fechaDesde && fechaHasta
                                        ? noches > 0
                                            ? `Has seleccionado ${noches} noche${noches === 1 ? "" : "s"}.`
                                            : "El check-out debe ser posterior al check-in."
                                        : "Seleccioná fechas para ver las noches totales."}
                                </p>

                                {mensajeFecha && (
                                    <p className="text-xs mt-2 text-yellow-400">
                                        {mensajeFecha}
                                    </p>
                                )}

                                <p className="text-[11px] mt-2 text-zinc-400">
                                    * Algunas fechas pueden verse disponibles según el calendario, pero no están habilitadas como check-in/check-out si afectan reservas existentes.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 sm:p-6">
                                <h3 className="text-lg font-semibold mb-4">Método de pago</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* MERCADO PAGO */}
                                    {(propiedad?.propietario.autorizaciones === AutorizacionesCliente.MERCADO_PAGO ||
                                        propiedad?.propietario.autorizaciones === AutorizacionesCliente.AMBAS) && (
                                            <button
                                                type="button"
                                                aria-pressed={formaPago === FormaPago.MERCADO_PAGO}
                                                onClick={() => setFormaPago(FormaPago.MERCADO_PAGO)}
                                                className={`group rounded-2xl border p-4 transition flex items-center gap-3 ${formaPago === FormaPago.MERCADO_PAGO
                                                    ? "border-[#009ee3]/60 bg-[#009ee3]/10 ring-2 ring-[#009ee3]/40"
                                                    : "border-white/10 bg-zinc-800/30 hover:bg-zinc-800/50"
                                                    }`}
                                            >
                                                <div className="rounded-xl bg-white p-2">
                                                    <SiMercadopago className="text-[#009ee3]" size={28} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">Mercado Pago</p>
                                                    <p className="text-sm text-zinc-400">Tarjeta, débito o billetera</p>
                                                </div>
                                            </button>
                                        )}

                                    {/* PAYPAL */}
                                    {(propiedad?.propietario.autorizaciones === AutorizacionesCliente.PAYPAL ||
                                        propiedad?.propietario.autorizaciones === AutorizacionesCliente.AMBAS) && (
                                            <button
                                                type="button"
                                                aria-pressed={formaPago === FormaPago.PAYPAL}
                                                onClick={() => setFormaPago(FormaPago.PAYPAL)}
                                                className={`group rounded-2xl border p-4 transition flex items-center gap-3 ${formaPago === FormaPago.PAYPAL
                                                    ? "border-[#003087]/60 bg-[#003087]/10 ring-2 ring-[#003087]/40"
                                                    : "border-white/10 bg-zinc-800/30 hover:bg-zinc-800/50"
                                                    }`}
                                            >
                                                <div className="rounded-xl bg-white p-2">
                                                    <FaPaypal size={28} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">PayPal</p>
                                                    <p className="text-sm text-zinc-400">Pago internacional</p>
                                                </div>
                                            </button>
                                        )}
                                </div>
                            </div>

                        </section>

                        <aside className="lg:sticky lg:top-28 h-fit">
                            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6">
                                <h3 className="text-lg font-semibold mb-4">Resumen de pago</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-300">
                                            {formatARS(precioPorNoche)} × {noches} noche(s)
                                        </span>
                                        <span className="font-medium">{formatARS(total)}</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex items-center justify-between text-base">
                                        <span className="font-medium">Total</span>
                                        <span className="font-semibold">{formatARS(total)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={confirmarReserva}
                                    type="button"
                                    className="mt-5 w-full rounded-xl bg-white text-zinc-900 font-semibold py-3 hover:bg-zinc-200 transition disabled:opacity-60"
                                    disabled={!reservacion}
                                >
                                    Continuar
                                </button>
                                <p className="mt-3 text-xs text-zinc-400">
                                    Seleccioná fechas y el método de pago para habilitar el botón.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ReservarPropiedad;
