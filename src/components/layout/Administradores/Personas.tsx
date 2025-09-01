import { useEffect, useMemo, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { ButtonPrimary } from "../../ui/buttons/ButtonPrimary";
import ModalTipoPersona from "../../ui/modals/ModalPersona";
import { GenericTable } from '../../ui/TablaGenerica';
import Switch from "@mui/material/Switch";
import type { TipoPersonaResponseDTO } from '../../../types/entities/tipoPersona/TipoPersonaResponseDTO';

const API = "http://localhost:8080/api/tipoPersona";

const TipoPersona = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editRow, setEditRow] = useState<TipoPersonaResponseDTO | null>(null);

  const abrirModal = () => {
    setEditRow(null);
    setModalAbierto(true);
  };

  const [rows, setRows] = useState<TipoPersonaResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  const fetchTipoPersonas = () => {
    setLoading(true);
    setErr(null);
    const url = `${API}?_=${Date.now()}`;
    fetch(url, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: TipoPersonaResponseDTO[]) => {
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error("[FETCH] Error:", e);
        setErr("No se pudieron cargar los tipos de persona");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTipoPersonas();
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
        render: (row: TipoPersonaResponseDTO) => (
          <Switch
            checked={!!row.activo}
            onChange={() => doToggleActivo(row.id, row.activo)}
            disabled={togglingIds.has(row.id)}
            color="success"
            inputProps={{ "aria-label": `Toggle activo ${row.denominacion}` }}
          />
        ),
      },
      {
        key: "Edicion",
        label: "Editar",
        render: (row: TipoPersonaResponseDTO) => (
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
        <h1 className="mt-5 text-lg font-medium">Tipos de Persona</h1>
        <ButtonPrimary
          onClick={abrirModal}
          text="Agregar Tipo de Persona"
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
        <ModalTipoPersona
          onClose={() => setModalAbierto(false)}
          onSaved={() => {
            setModalAbierto(false);
            fetchTipoPersonas();
          }}
          tipoPersona={editRow ?? undefined}
        />
      )}
    </>
  );
};

export default TipoPersona;