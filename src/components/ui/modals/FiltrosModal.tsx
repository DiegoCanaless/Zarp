import { useEffect, useRef } from "react";

export type SortOrder = "none" | "asc" | "desc";

interface FiltrosModalProps {
    open: boolean;
    sortOrder: SortOrder;
    onClose: () => void;
    onChangeOrder: (order: SortOrder) => void;
}

export function FiltrosModal({ open, sortOrder, onClose, onChangeOrder }: FiltrosModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);

    // Cerrar con ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    return (
        <div ref={backdropRef} onClick={handleBackdropClick} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true" >
            <div className="w-full max-w-sm rounded-2xl bg-primary shadow-lg p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Ordenar por precio</h3>
                    <button className="text-gray-500 hover:text-gray-200 cursor-pointer transition-colors" onClick={onClose} aria-label="Cerrar" >✕</button>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-secondary py-1 px-4 rounded">
                        <input type="radio" name="orden-precio" value="asc" checked={sortOrder === "asc"} onChange={() => onChangeOrder("asc")} />
                        <span>Menor a Mayor Precio</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-secondary py-1 px-4 rounded">
                        <input type="radio" name="orden-precio" value="desc" checked={sortOrder === "desc"} onChange={() => onChangeOrder("desc")} />
                        <span>Mayor a Menor Precio</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-secondary py-1 px-4 rounded">
                        <input type="radio" name="orden-precio" value="none" checked={sortOrder === "none"} onChange={() => onChangeOrder("none")} />
                        <span>Sin orden</span>
                    </label>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button className="px-4 py-2 rounded-xl border transition-colors border-gray-300 cursor-pointer hover:bg-gray-300 hover:text-black" onClick={onClose} > Cerrar </button>
                </div>
            </div>
        </div>
    );
}
