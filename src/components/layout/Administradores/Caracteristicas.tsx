import { useEffect, useState, useMemo } from "react";
import { FiEdit2 } from "react-icons/fi";
import { ButtonPrimary } from "../../ui/buttons/ButtonPrimary";
import ModalCaracteristica from "../../ui/modals/ModalCaracteristicas";
import { GenericTable } from '../../ui/TablaGenerica';
import Switch from "@mui/material/Switch";
import type { CaracteristicaResponseDTO } from '../../../types/entities/caracteristica/CaracteristicaResponseDTO';

const API = `${import.meta.env.VITE_APIBASE}/api/caracteristicas`;

const Caracteristicas = () => {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editRow, setEditRow] = useState<CaracteristicaResponseDTO | null>(null);

    const abrirModal = () => {
        setEditRow(null);
        setModalAbierto(true);
    };

    const [rows, setRows] = useState<CaracteristicaResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

    const fetchCaracteristicas = () => {
        setLoading(true);
        setErr(null);
        const url = `${API}?_=${Date.now()}`;
        fetch(url, { cache: "no-store" })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: CaracteristicaResponseDTO[]) => {
                setRows(Array.isArray(data) ? data : []);
            })
            .catch((e) => {
                console.error("[FETCH] Error:", e);
                setErr("No se pudieron cargar las características");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCaracteristicas();
    }, []);

    const doToggleActivo = async (id: number, actual: boolean) => {
        setTogglingIds((prev) => new Set(prev).add(id));
        const prevRows = rows;

        setRows((curr) =>
            curr.map((r) => (r.id === id ? { ...r, activo: !actual } : r))
        );

        try {
            const resp = await fetch(`${API}/toggleActivo/${id}`, {
                method: "PATCH",
            });
            const txt = await resp.clone().text();

            if (!resp.ok) {
                setRows(prevRows);
                throw new Error(`Error PATCH ${resp.status}`);
            }
        } catch (error) {
            console.error("[TOGGLE] Error:", error);
            alert("No se pudo actualizar el estado. Intenta de nuevo.");
        } finally {
            setTogglingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const columns = useMemo(
        () => [
            { key: "denominacion", label: "Nombre" },
            { key: "descripcion", label: "Descripción" },
            {
                key: "toggle",
                label: "Estado",
                render: (row: CaracteristicaResponseDTO) => (
                    <Switch
                        checked={!!row.activo}
                        onChange={() => doToggleActivo(row.id, row.activo)}
                        disabled={togglingIds.has(row.id)}
                        color="success" // Verde cuando está activo
                        inputProps={{ "aria-label": `Toggle activo ${row.denominacion}` }}
                    />
                ),
            },
            {
                key: "imagen",
                label: "Icono",
                render: (row: CaracteristicaResponseDTO) => {
                    if (!row.imagen?.urlImagen) return "-";
                    const src = `${row.imagen.urlImagen}${row.imagen.urlImagen.includes("?") ? "&" : "?"
                        }cb=${row.id}`;
                    return (
                        <img
                            src={src}
                            alt={row.denominacion}
                            style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }}
                        />
                    );
                },
            },
            {
                key: "Edicion",
                label: "Editar",
                render: (row: CaracteristicaResponseDTO) => (
                    <button
                        onClick={() => {
                            setEditRow(row);
                            setModalAbierto(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        aria-label="Editar"
                        title="Editar"
                    >
                        <FiEdit2 className="text-slate-100" size={20} />
                    </button>
                ),
            },
        ],
        [togglingIds, rows]
    );

    return (
        <>
            <div className="flex justify-between items-end">
                <h1 className="mt-5 text-lg font-medium">Caracteristicas</h1>
                <ButtonPrimary
                    onClick={abrirModal}
                    text="Agregar Caracteristica"
                    className="cursor-pointer"
                    fontWeight="font-medium"
                    maxWidth="w-[200px]"
                />
            </div>

            <div className="mt-6">
                {loading ? (
                    <div>Cargando...</div>
                ) : err ? (
                    <div className="text-red-500">{err}</div>
                ) : (
                    <GenericTable
                        columns={columns}
                        rows={rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        totalCount={rows.length}
                    />
                )}
            </div>

            {modalAbierto && (
                <ModalCaracteristica
                    onClose={() => setModalAbierto(false)}
                    onSaved={() => {
                        setModalAbierto(false);
                        fetchCaracteristicas();
                    }}
                    caracteristica={editRow ?? undefined}
                />
            )}
        </>
    );
};

export default Caracteristicas;
