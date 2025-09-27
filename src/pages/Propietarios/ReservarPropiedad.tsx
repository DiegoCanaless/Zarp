import React, { useEffect, useMemo, useState, useCallback } from "react";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { useParams } from "react-router-dom";
import type { PropiedadResponseDTO } from "../../types/entities/propiedad/PropiedadResponseDTO";
import toast from "react-hot-toast";
import { FormaPago } from "../../types/enums/FormaPago";
import { useSelector } from "react-redux";
import type { ReservaDTO } from "../../types/entities/reserva/ReservaDTO";
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary";

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
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const ReservarPropiedad = () => {
    const { id } = useParams<{ id: string }>();
    const [propiedad, setPropiedad] = useState<PropiedadResponseDTO>();
    const [formaPago, setFormaPago] = useState<FormaPago | null>(null);

    const usuario = useSelector((state: any) => state.user);

    const [fechaDesde, setFechaDesde] = useState<Date>(new Date());
    const [fechaHasta, setFechaHasta] = useState<Date>(() => {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        return t;
    });

    useEffect(() => {
        const fetchPropiedad = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/propiedades/getById/${id}`);
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
        const inicio = toUTCDate(fechaDesde);
        const fin = toUTCDate(fechaHasta);
        const diferencia = Math.round((+fin - +inicio) / MS_PER_DAY);
        return Math.max(0, diferencia);
    }, [fechaDesde, fechaHasta]);

    const precioPorNoche = propiedad?.precioPorNoche ?? 0;
    const total = noches * precioPorNoche;

    const reservacion: ReservaDTO | null = useMemo(() => {
        if (!propiedad || !usuario?.id || !formaPago || noches <= 0) return null;
        return {
            fechaInicio: fechaDesde,
            fechaFin: fechaHasta,
            precioTotal: total,
            clienteId: usuario.id,
            propiedadId: propiedad.id,
            formaPago,
        };
    }, [propiedad, usuario?.id, formaPago, fechaDesde, fechaHasta, noches, total]);

    const minHasta = useMemo(() => {
        const next = new Date(fechaDesde);
        next.setDate(next.getDate() + 1);
        return next;
    }, [fechaDesde]);

    const onChangeDesde = useCallback((date: Date | null) => {
        if (!date) return;
        setFechaDesde(date);
        // asegurar que "hasta" > "desde"
        const dUTC = toUTCDate(date);
        const hUTC = toUTCDate(fechaHasta);
        if (hUTC <= dUTC) {
            const next = new Date(date);
            next.setDate(next.getDate() + 1);
            setFechaHasta(next);
        }
    }, [fechaHasta]);

    const confirmarReserva = async () => {
        if (!reservacion) {
            toast.error("Completá fechas válidas y método de pago.");
            return;
        }
        // TODO: enviar reservacion al backend
        // await axios.post("/api/reservas", reservacion);
        toast.success("Reserva lista para enviar ✅");
    };

    const canContinuar = Boolean(reservacion);

    return (
        <>
            <UsuarioHeader />
            <main className="min-h-screen bg-secondary pt-24 sm:pt-36 text-white">
                <div className="max-w-5xl mx-auto px-5 pb-20">
                    {/* Título */}
                    <header className="mb-6">
                        <h1 className="text-2xl font-semibold tracking-tight">{propiedad?.nombre ?? "Propiedad"}</h1>
                        <p className="text-sm opacity-80">
                            {precioPorNoche > 0 ? `${formatARS(precioPorNoche)} por noche` : "Precio por noche no disponible"}
                        </p>
                    </header>

                    {/* Layout principal */}
                    <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                        {/* Columna izquierda */}
                        <section className="lg:col-span-2 space-y-6">
                            {/* Método de pago */}
                            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-4 sm:p-5">
                                <h3 className="text-lg font-medium mb-4">Método de pago</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        aria-pressed={formaPago === FormaPago.MERCADO_PAGO}
                                        onClick={() => setFormaPago(FormaPago.MERCADO_PAGO)}
                                        className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 border transition
                      ${formaPago === FormaPago.MERCADO_PAGO
                                                ? "border-[#00aae4]/60 bg-[#00aae4]/10 ring-2 ring-[#00aae4]/40"
                                                : "border-white/15 hover:border-white/30 bg-white/5"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-white p-2">
                                                <SiMercadopago size={26} color="#00aae4" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">Mercado Pago</p>
                                                <p className="text-xs opacity-70">Rápido y seguro</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        aria-pressed={formaPago === FormaPago.PAYPAL}
                                        onClick={() => setFormaPago(FormaPago.PAYPAL)}
                                        className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 border transition
                      ${formaPago === FormaPago.PAYPAL
                                                ? "border-[#003087]/60 bg-[#003087]/10 ring-2 ring-[#003087]/40"
                                                : "border-white/15 hover:border-white/30 bg-white/5"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-white p-2">
                                                <FaPaypal size={24} color="#003087" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">PayPal</p>
                                                <p className="text-xs opacity-70">Internacional</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Fechas */}
                            <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-4 sm:p-5">
                                <h3 className="text-lg font-medium mb-4">Fechas</h3>
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
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1 opacity-90">Hasta</label>
                                        <DatePicker
                                            selected={fechaHasta}
                                            onChange={(date) => date && setFechaHasta(date)}
                                            selectsEnd
                                            startDate={fechaDesde}
                                            endDate={fechaHasta}
                                            minDate={minHasta}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Elegí fecha hasta"
                                            className="w-full rounded-lg bg-white px-3 py-2 text-black outline-none focus:ring-2 focus:ring-indigo-400"
                                            calendarClassName="!text-black"
                                        />
                                    </div>
                                </div>

                                {/* Hint de validación */}
                                <p className="text-xs mt-3 opacity-80">
                                    {noches > 0
                                        ? `Has seleccionado ${noches} noche${noches === 1 ? "" : "s"}.`
                                        : "Seleccioná al menos una noche (el check-out debe ser posterior al check-in)."}
                                </p>
                            </div>
                        </section>

                        {/* Resumen (columna derecha) */}
                        <aside className="mt-6 lg:mt-0 lg:col-span-1">
                            <div className="sticky top-24 bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-4 sm:p-5">
                                <h3 className="text-lg font-medium mb-4">Resumen</h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between opacity-90">
                                        <span>Precio por noche</span>
                                        <span className="font-medium">{formatARS(precioPorNoche)}</span>
                                    </div>
                                    <div className="flex justify-between opacity-90">
                                        <span>Noches</span>
                                        <span className="font-medium">{noches}</span>
                                    </div>
                                    <div className="border-t border-white/10 my-2" />
                                    <div className="flex justify-between">
                                        <span className="font-medium">Total</span>
                                        <span className="text-lg font-semibold">{formatARS(total)}</span>
                                    </div>
                                    <div className="flex justify-between opacity-90">
                                        <span>Pago</span>
                                        <span className="font-medium">
                                            {formaPago ? (formaPago === FormaPago.MERCADO_PAGO ? "Mercado Pago" : "PayPal") : "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <ButtonSecondary
                                        onClick={confirmarReserva}
                                        disabled={!canContinuar}
                                        className={`w-full px-5 transition-colors
                      ${canContinuar ? "hover:bg-white hover:text-black" : "opacity-50 cursor-not-allowed"}
                    `}
                                        fontSize="text-md"
                                        bgColor="bg-tertiary"
                                        color="text-white"
                                        text="Continuar"
                                    />
                                    {!canContinuar && (
                                        <p className="text-xs mt-2 opacity-80">
                                            Seleccioná método de pago y un rango de fechas válido.
                                        </p>
                                    )}
                                </div>
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
