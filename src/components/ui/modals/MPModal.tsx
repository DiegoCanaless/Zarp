import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { ButtonSecondary } from "../../ui/buttons/ButtonSecondary";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../../../reducer/user/userSlice";
import { AutorizacionesCliente } from "../../../types/enums/AutorizacionesCliente";

type MPModalProps = {
    isOpen: boolean;
    onClose: () => void;
    usuario: any;
};



const MPModal: React.FC<MPModalProps> = ({ isOpen, onClose, usuario }) => {
    const [cvu, setCvu] = useState("");
    const [titular, setTitular] = useState("");
    const [saving, setSaving] = useState(false);
    const dispatch = useDispatch();


    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        if (isOpen) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const cvuValido = /^\d{22}$/.test(cvu);
    const titularValido = titular.trim().length >= 3;

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!cvuValido) return toast.error("Ingresá un CVU válido (22 dígitos)");
        if (!titularValido) return toast.error("Ingresá el nombre del titular");

        if (!usuario?.id) return toast.error("Usuario no identificado");

        try {
            setSaving(true);

            // Ajustá endpoint según tu backend
            const res = await fetch(
                `${import.meta.env.VITE_APIBASE}/api/mercadoPago/guardarCredenciales/${usuario.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${usuario.token}`
                    },
                    body: JSON.stringify({
                        cvu: cvu.trim(),
                        nombreTitular: titular.trim(),
                    }),
                }
            );

            if (!res.ok) {
                let msg = "No se pudo guardar la cuenta.";
                try {
                    const data = await res.json();
                    if (data?.mensaje) msg = data.mensaje;
                } catch {
                    msg = await res.text().catch(() => msg);
                }
                toast.error(msg);
                return;
            }

            // Actualizo autorizaciones similar al PayPal
            dispatch(
                setUser({
                    ...usuario,
                    autorizaciones:
                        usuario.autorizaciones === AutorizacionesCliente.PAYPAL
                            ? AutorizacionesCliente.AMBAS
                            : AutorizacionesCliente.MERCADO_PAGO,
                })
            );

            toast.success("Cuenta de Mercado Pago guardada");
            setCvu("");
            setTitular("");
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
            aria-labelledby="mp-title"
            onMouseDown={handleBackdrop}
        >
            <div className="relative w-[min(560px,92vw)] rounded-2xl shadow-2xl ring-1 ring-white/10 bg-primary/95 text-white p-6 md:p-7 transition-all" onMouseDown={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-3 top-3 p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40" aria-label="Cerrar modal" type="button">
                    <MdClose size={20} />
                </button>

                <h3 id="mp-title" className="text-xl font-semibold mb-3">Vincular cuenta Bancaria / CVU</h3>
                <p className="text-white/80 text-sm mb-4">Ingresá el CVU de tu cuenta y el nombre del titular.</p>

                <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
                    <label className="block">
                        <span className="block text-sm mb-1">CVU (22 dígitos)</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={cvu}
                            onChange={(e) => setCvu(e.target.value.replace(/\D/g, ""))}
                            placeholder="0000000000000000000000"
                            className="w-full rounded-lg bg-white text-black px-3 py-2 outline-none ring-2 ring-transparent focus:ring-white/40"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="block text-sm mb-1">Nombre del Titular</span>
                        <input
                            type="text"
                            value={titular}
                            onChange={(e) => setTitular(e.target.value)}
                            placeholder="Nombre y Apellido"
                            className="w-full rounded-lg bg-white text-black px-3 py-2 outline-none ring-2 ring-transparent focus:ring-white/40"
                            required
                        />
                    </label>

                    {!cvuValido && cvu.length > 0 && (
                        <p className="text-red-200 text-xs">El CVU debe tener 22 dígitos numéricos.</p>
                    )}
                    {!titularValido && titular.length > 0 && (
                        <p className="text-red-200 text-xs">Ingresa al menos 3 caracteres para el titular.</p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Cancelar</button>
                        <ButtonSecondary
                            className={`cursor-pointer ${!(cvuValido && titularValido) ? "opacity-60 pointer-events-none" : ""}`}
                            fontSize="text-md"
                            text={saving ? "Guardando..." : "Guardar CVU"}
                            maxWidth="w-[150px]"
                            onClick={handleSubmit as any}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MPModal;
