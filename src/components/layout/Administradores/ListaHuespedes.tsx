import React, { useEffect, useState, useMemo } from "react";
import type { ClienteResponseDTO } from "../../../types/entities/cliente/ClienteResponseDTO";
import type { PropiedadResponseDTO } from "../../../types/entities/propiedad/PropiedadResponseDTO";
import { GenericTable } from "../../ui/TablaGenerica";

const CLIENTES_API = "http://localhost:8080/api/clientes";
const PROPIEDADES_API = "http://localhost:8080/api/propiedades";

const Huespedes = () => {
    const [clientes, setClientes] = useState<ClienteResponseDTO[]>([]);
    const [propiedades, setPropiedades] = useState<PropiedadResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    // Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        setLoading(true);
        setErr(null);
        Promise.all([
            fetch(CLIENTES_API).then(res => res.ok ? res.json() : Promise.reject(res)),
            fetch(PROPIEDADES_API).then(res => res.ok ? res.json() : Promise.reject(res)),
        ])
            .then(([clientesData, propiedadesData]) => {
                setClientes(clientesData);
                setPropiedades(propiedadesData);
            })
            .catch(e => {
                setErr("No se pudieron cargar los huéspedes");
            })
            .finally(() => setLoading(false));
    }, []);

    // IDs de clientes que tienen al menos una propiedad
    const clientesConPropiedadesIds = useMemo(() => {
        const setIds = new Set<number>();
        propiedades.forEach((prop) => {
            if (prop.propietario && typeof prop.propietario.id === "number") {
                setIds.add(prop.propietario.id);
            }
        });
        return setIds;
    }, [propiedades]);

    // Solo clientes que NO tengan propiedades
    const huespedesSinPropiedades = useMemo(() =>
        clientes.filter(c => !clientesConPropiedadesIds.has(c.id)), [clientes, clientesConPropiedadesIds]
    );

    // Para paginación
    const pagedRows = huespedesSinPropiedades.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // PATCH toggleActivo
    const handleToggleActivo = async (id: number) => {
        try {
            const resp = await fetch(`${CLIENTES_API}/toggleActivo/${id}`, { method: "PATCH" });
            if (!resp.ok) throw new Error(`Error PATCH ${resp.status}`);
            // Actualiza localmente el campo activo (toggle)
            setClientes(cur =>
                cur.map(c =>
                    c.id === id ? { ...c, activo: !c.activo } : c
                )
            );
        } catch (err) {
            alert("No se pudo actualizar el usuario.");
        }
    };

    const columns = useMemo(() => [
        {
            key: "numero",
            label: "Número",
            render: (row: ClienteResponseDTO) => `N°${row.id}`,
        },
        {
            key: "nombreCompleto",
            label: "Nombre",
        },
        {
            key: "correoElectronico",
            label: "Correo",
        },
        {
            key: "activo",
            label: "Activo",
            render: (row: ClienteResponseDTO) => row.activo ? "Activo" : "Inactivo",
        },
        {
            key: "accion",
            label: "",
            render: (row: ClienteResponseDTO) => (
                <button
                    className={
                        row.activo
                            ? "bg-red-700 text-white px-3 py-1 rounded text-xs hover:bg-red-800 transition"
                            : "bg-green-700 text-white px-3 py-1 rounded text-xs hover:bg-green-800 transition"
                    }
                    onClick={() => handleToggleActivo(row.id)}
                >
                    {row.activo ? "Bloquear" : "Activar"}
                </button>
            ),
        },
    ], []);

    return (
        <div className="mt-4">
            <h1 className="text-lg font-medium mb-4 ml-4 text-white">Huéspedes</h1>
            <div className="mt-2">
                {loading ? (
                    <div>Cargando...</div>
                ) : err ? (
                    <div className="text-red-500">{err}</div>
                ) : (
                    <GenericTable
                        columns={columns}
                        rows={pagedRows}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        totalCount={huespedesSinPropiedades.length}
                    />
                )}
            </div>
        </div>
    );
};

export default Huespedes;