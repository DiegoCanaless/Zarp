import React, { useEffect, useMemo, useState, useCallback } from "react";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { useNavigate, useParams } from "react-router-dom";
import type { PropiedadResponseDTO } from "../../types/entities/propiedad/PropiedadResponseDTO";
import toast from "react-hot-toast";
import { FormaPago } from "../../types/enums/FormaPago";
import { useSelector } from "react-redux";
import type { ReservaDTO } from "../../types/entities/reserva/ReservaDTO";
import { SiMercadopago } from "react-icons/si";
import { FaPaypal } from "react-icons/fa";

// Calendarios
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// helpers
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const toUTCDate = (d: Date) =>
    new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
const formatARS = (n: number) =>
    n.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    });

const ReservarPropiedad = () => {

    const { id } = useParams<{ id: string }>();
    const [propiedad, setPropiedad] = useState<PropiedadResponseDTO>();
    const [formaPago, setFormaPago] = useState<FormaPago | null>(null);
    const navigate = useNavigate();

    const usuario = useSelector((state: any) => state.user);

    // ⬇️ sin fechas preseleccionadas
    const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
    const [fechaHasta, setFechaHasta] = useState<Date | null>(null);

    useEffect(() => {
        const fetchPropiedad = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/api/propiedades/getById/${id}`
                );
                if (!res.ok) throw new Error("Error al traer la propiedad");
                const data: PropiedadResponseDTO = await res.json();
                setPropiedad(data);
            } catch (error: any) {
                toast.error("Error al traer la propiedad");
            }
        };
        fetchPropiedad();
    }, [id]);

    // noches (check-in exclusivo, check-out exclusivo)
    const noches = useMemo(() => {
        if (!fechaDesde || !fechaHasta) return 0;
        const inicio = toUTCDate(fechaDesde);
        const fin = toUTCDate(fechaHasta);
        const diferencia = Math.round((+fin - +inicio) / MS_PER_DAY);
        return Math.max(0, diferencia);
    }, [fechaDesde, fechaHasta]);

    const precioPorNoche = propiedad?.precioPorNoche ?? 0;
    const total = noches * precioPorNoche;

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
    }, [
        propiedad,
        usuario?.id,
        formaPago,
        fechaDesde,
        fechaHasta,
        noches,
        total,
    ]);

    const minHasta = useMemo(() => {
        if (!fechaDesde) return null;
        const next = new Date(fechaDesde);
        next.setDate(next.getDate() + 1);
        return next;
    }, [fechaDesde]);

    const onChangeDesde = useCallback(
        (date: Date | null) => {
            if (!date) {
                setFechaDesde(null);
                setFechaHasta(null);
                return;
            }
            setFechaDesde(date);
            if (fechaHasta && toUTCDate(fechaHasta) <= toUTCDate(date)) {
                setFechaHasta(null);
            }
        },
        [fechaHasta]
    );

    const confirmarReserva = async () => {
        try {
            const res = await fetch(
                "https://579f9e4aecb7.ngrok-free.app/api/mercadoPago/create-preference",
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
            let data: any = raw

            try{
                data = JSON.parse(raw)
            } catch{

            }

            

            // ✅ redirige al link de pago
            window.location.href = raw;
        } catch (err) {
            console.error(err);
            toast.error("No se pudo crear la preferencia.");
        }
    };



    return (
        <>
            <UsuarioHeader />

            {/* ====== CONTENIDO ====== */}
            <main className="bg-secondary min-h-screen text-white pt-24 sm:pt-36">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
                    {/* Título + precio */}
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

                    {/* GRID: izquierda (inputs) / derecha (resumen) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ===== IZQUIERDA ===== */}
                        <section className="lg:col-span-2 space-y-6">
                            {/* Fechas */}
                            <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 sm:p-6">
                                <h3 className="text-lg font-semibold mb-4">Fechas</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1 opacity-90">
                                            Desde
                                        </label>
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
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 opacity-90">
                                            Hasta
                                        </label>
                                        <DatePicker
                                            selected={fechaHasta}
                                            onChange={(date) => setFechaHasta(date)}
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
                                        />
                                    </div>
                                </div>

                                {/* Hint de validación */}
                                <p className="text-xs mt-3 opacity-80">
                                    {fechaDesde && fechaHasta
                                        ? noches > 0
                                            ? `Has seleccionado ${noches} noche${noches === 1 ? "" : "s"
                                            }.`
                                            : "El check-out debe ser posterior al check-in."
                                        : "Seleccioná fechas para ver las noches totales."}
                                </p>
                            </div>

                            {/* Método de pago (estilo tarjetas) */}
                            <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5 sm:p-6">
                                <h3 className="text-lg font-semibold mb-4">Método de pago</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            <p className="text-sm text-zinc-400">
                                                Tarjeta, débito o billetera
                                            </p>
                                        </div>
                                    </button>

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
                                </div>
                            </div>
                        </section>

                        {/* ===== DERECHA: RESUMEN ===== */}
                        <aside className="lg:sticky lg:top-28 h-fit">
                            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 sm:p-6">
                                <h3 className="text-lg font-semibold mb-4">Resumen de pago</h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-300">
                                            {formatARS(precioPorNoche)} × {noches} noche(s)
                                        </span>
                                        <span className="font-medium">
                                            {formatARS(precioPorNoche * (noches || 0))}
                                        </span>
                                    </div>

                                    <div className="h-px bg-white/10 my-2" />

                                    <div className="flex items-center justify-between text-base">
                                        <span className="font-medium">Total</span>
                                        <span className="font-semibold">{formatARS(total)}</span>
                                    </div>
                                </div>

                                {/* Botón principal (mantiene tu handler confirmarReserva) */}
                                <button
                                    onClick={confirmarReserva}
                                    type="button"
                                    className="mt-5 w-full rounded-xl bg-white text-zinc-900 font-semibold py-3 hover:bg-zinc-200 transition disabled:opacity-60"
                                >
                                    Continuar
                                </button>

                                {/* Píldora de estado opcional */}
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
