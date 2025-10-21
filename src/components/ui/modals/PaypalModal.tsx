import React, { useEffect, useState } from "react";
import { FaPaypal } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { ButtonSecondary } from "../../ui/buttons/ButtonSecondary";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../../../reducer/user/userSlice";
import { AutorizacionesCliente } from "../../../types/enums/AutorizacionesCliente";
import { getAuth } from "firebase/auth";

type PayPalModalProps = {
    isOpen: boolean;
    onClose: () => void;
    usuario: any; // reemplazar por tipo real si lo tenés
};

const PayPalModal: React.FC<PayPalModalProps> = ({ isOpen, onClose, usuario }) => {
    const [paypalEmail, setPaypalEmail] = useState("");
    const [paypalEmailRepeat, setPaypalEmailRepeat] = useState("");
    const [saving, setSaving] = useState(false);
    const dispatch = useDispatch();

    const emailsIguales = paypalEmail === paypalEmailRepeat;
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        if (isOpen) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!emailValido) return toast.error("Ingresá un correo válido");
        if (!emailsIguales) return toast.error("Los correos no coinciden");
        if (!usuario?.id) return toast.error("Usuario no identificado");

        try {
            setSaving(true);
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await user?.getIdToken().catch(() => undefined);

            const res = await fetch(
                `${import.meta.env.VITE_APIBASE}/api/paypal/guardarDireccionPaypal/${usuario.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "text/plain",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: paypalEmail.trim(),
                }
            );

            if (!res.ok) {
                let msg = "No se pudo guardar el correo.";
                try {
                    const data = await res.json();
                    if (data?.mensaje) msg = data.mensaje;
                } catch {
                    msg = await res.text().catch(() => msg);
                }
                toast.error(msg);
                return;
            }

            // Actualizo el estado global (igual que en tu MiPerfil)
            dispatch(
                setUser({
                    ...usuario,
                    autorizaciones:
                        usuario.autorizaciones === AutorizacionesCliente.MERCADO_PAGO
                            ? AutorizacionesCliente.AMBAS
                            : AutorizacionesCliente.PAYPAL,
                })
            );

            toast.success("Correo de PayPal guardado");
            setPaypalEmail("");
            setPaypalEmailRepeat("");
            onClose();
        } catch (err) {
            toast.error("Error de red o CORS. Intenta nuevamente.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="paypal-title"
            onMouseDown={handleBackdrop}
        >
            <div
                className="relative w-[min(560px,92vw)] rounded-2xl shadow-2xl ring-1 ring-white/10 bg-primary/95 text-white p-6 md:p-7 transition-all"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                    aria-label="Cerrar modal"
                    type="button"
                >
                    <MdClose size={20} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-white/10">
                        <FaPaypal size={24} />
                    </div>
                    <h3 id="paypal-title" className="text-xl font-semibold tracking-tight">
                        Vincular tu cuenta de PayPal
                    </h3>
                </div>

                <p className="text-white/80 text-sm mb-5">
                    Ingresá el correo electrónico asociado a tu cuenta de PayPal.
                </p>

                <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
                    <label htmlFor="paypal-email" className="block">
                        <span className="block text-sm mb-1">Correo electrónico</span>
                        <input
                            id="paypal-email"
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="w-full rounded-lg bg-white text-black placeholder:text-black/50 px-3 py-2 outline-none ring-2 ring-transparent focus:ring-white/40"
                            autoFocus
                            required
                        />
                    </label>

                    <label htmlFor="paypal-email-repeat" className="block">
                        <span className="block text-sm mb-1">Repetir correo electrónico</span>
                        <input
                            id="paypal-email-repeat"
                            type="email"
                            value={paypalEmailRepeat}
                            onChange={(e) => setPaypalEmailRepeat(e.target.value)}
                            placeholder="Repite tu correo"
                            className="w-full rounded-lg bg-white text-black placeholder:text-black/50 px-3 py-2 outline-none ring-2 ring-transparent focus:ring-white/40"
                            required
                        />
                    </label>

                    {paypalEmailRepeat.length > 0 && !emailsIguales && (
                        <p className="text-red-200 text-xs">Los correos no coinciden.</p>
                    )}
                    {!emailValido && paypalEmail.length > 0 && (
                        <p className="text-red-200 text-xs">Ingresá un correo válido.</p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            Cancelar
                        </button>

                        <ButtonSecondary
                            className={`cursor-pointer ${!emailValido || !emailsIguales ? "opacity-60 pointer-events-none" : ""}`}
                            fontSize="text-md"
                            text={saving ? "Enviando..." : "Enviar"}
                            maxWidth="w-[120px]"
                            onClick={handleSubmit as any}
                            disabled={!emailValido || !emailsIguales || saving}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayPalModal;
