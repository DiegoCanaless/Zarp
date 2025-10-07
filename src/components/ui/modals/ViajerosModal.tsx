import { useEffect, useRef } from "react";
import { TipoPersonaResponseDTO } from "../../../types/entities/tipoPersona/TipoPersonaResponseDTO";

export type ViajerosSeleccion = Record<number, number>;
// key = tipoPersona.id, value = cantidad seleccionada

interface ViajerosModalProps {
    open: boolean;
    tiposPersona: TipoPersonaResponseDTO[];
    valores: ViajerosSeleccion;
    onClose: () => void;
    onChange: (next: ViajerosSeleccion) => void;
}

const Row = ({
    label,
    sublabel,
    value,
    onDec,
    onInc,
    onClear,
}: {
    label: string;
    sublabel?: string;
    value: number;
    onDec: () => void;
    onInc: () => void;
    onClear: () => void;
}) => (
    <div className="bg-[#1c3137] text-white rounded-xl p-3 flex items-center justify-between">
        <div>
            <div className="font-semibold">{label}</div>
            {sublabel && <div className="text-white/70 text-xs">{sublabel}</div>}

        </div>
        <div className="flex items-center gap-3">
            <button
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl"
                onClick={onDec}
                aria-label={`Disminuir ${label}`}
            >
                –
            </button>
            <span className="w-6 text-center text-lg">{value}</span>
            <button
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl"
                onClick={onInc}
                aria-label={`Aumentar ${label}`}
            >
                +
            </button>
        </div>
    </div>
);

export function ViajerosModal({ open, tiposPersona, valores, onClose, onChange }: ViajerosModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const set = (tipoId: number, v: number) => onChange({ ...valores, [tipoId]: Math.max(0, v) });

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    // 👇 solo mostrar tipos activos
    const tiposActivos = (tiposPersona ?? []).filter((t) => t?.activo === true);

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-sm rounded-2xl bg-[#0c1c1f] shadow-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Viajeros:</h3>
                    <button className="text-white/70 hover:text-white" onClick={onClose} aria-label="Cerrar">
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    {tiposActivos.map((t) => {
                        const value = valores[t.id] ?? 0;
                        return (
                            <Row
                                key={t.id}
                                label={`${t.denominacion}:`}
                                sublabel={t.descripcion}
                                value={value}
                                onDec={() => set(t.id, value - 1)}
                                onInc={() => set(t.id, value + 1)}
                                onClear={() => set(t.id, 0)}
                            />
                        );
                    })}

                    {tiposActivos.length === 0 && (
                        <div className="text-white/70 text-sm">No hay tipos de persona activos.</div>
                    )}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        className="px-4 text-white py-2 rounded-xl border transition-colors border-gray-300 cursor-pointer hover:bg-gray-300 hover:text-black"
                        onClick={onClose}
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
}
