import { useEffect, useState, useMemo } from "react";
import type { ClienteResponseDTO } from "../../../types/entities/cliente/ClienteResponseDTO";
import type { PropiedadResponseDTO } from "../../../types/entities/propiedad/PropiedadResponseDTO";
import { GenericTable } from "../../ui/TablaGenerica";
import { Button, Modal, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';


// Modal custom style (usando color de fondo del sistema)
const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#223F47', // tu color principal
    color: 'white',
    boxShadow: 24,
    borderRadius: '12px',
    p: 4,
    minWidth: 500,
    minHeight: 300,
    maxHeight: '80vh',
    overflowY: 'auto',
};

type ClienteConPropiedades = ClienteResponseDTO & {
    propiedades: PropiedadResponseDTO[];
    propiedadesAprobadas: number;
};

const ListaPropiedades = () => {
    const [clientes, setClientes] = useState<ClienteResponseDTO[]>([]);
    const [propiedades, setPropiedades] = useState<PropiedadResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalCliente, setModalCliente] = useState<ClienteConPropiedades | null>(null);

    // Paginación principal
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Paginación de propiedades en el modal
    const [modalPage, setModalPage] = useState(0);
    const [modalRowsPerPage, setModalRowsPerPage] = useState(10);

    useEffect(() => {
        setLoading(true);
        setErr(null);

        Promise.all([
            fetch(`${import.meta.env.VITE_APIBASE}/api/clientes`).then(res => res.ok ? res.json() : Promise.reject(res)),
            fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades`).then(res => res.ok ? res.json() : Promise.reject(res)),
        ])
            .then(([clientesData, propiedadesData]) => {
                setClientes(clientesData);
                setPropiedades(propiedadesData);
            })
            .catch(e => {
                setErr("No se pudieron cargar los datos");
            })
            .finally(() => setLoading(false));
    }, []);

    // Agrupa propiedades por usuario y filtra solo las verificadas
    const clientesConPropiedades: ClienteConPropiedades[] = useMemo(() => {
        const propsPorCliente = new Map<number, PropiedadResponseDTO[]>();
        propiedades.forEach((prop) => {
            if (
                prop.propietario &&
                typeof prop.propietario.id === "number"
            ) {
                const arr = propsPorCliente.get(prop.propietario.id) ?? [];
                arr.push(prop);
                propsPorCliente.set(prop.propietario.id, arr);
            }
        });

        return clientes
            .filter(c => propsPorCliente.has(c.id))
            .map(c => {
                const allProps = propsPorCliente.get(c.id) ?? [];
                const propsAprobadas = allProps.filter(p => p.verificacionPropiedad === "APROBADA");
                return {
                    ...c,
                    propiedades: allProps,
                    propiedadesAprobadas: propsAprobadas.length,
                };
            });
    }, [clientes, propiedades]);

    // Para paginación principal
    const pagedRows = clientesConPropiedades.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // PATCH toggleActivo para usuario
    const handleToggleUsuario = async (id: number) => {
        try {
            const resp = await fetch(`${import.meta.env.VITE_APIBASE}/api/clientes/toggleActivo/${id}`, { method: "PATCH" });
            if (!resp.ok) throw new Error(`Error PATCH ${resp.status}`);
            setClientes(cur =>
                cur.map(c =>
                    c.id === id ? { ...c, activo: !c.activo } : c
                )
            );
        } catch (err) {
            alert("No se pudo actualizar el usuario.");
        }
    };

    // PATCH toggleActivo para propiedad
    const handleTogglePropiedad = async (id: number) => {
        try {
            const resp = await fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades/toggleActivo/${id}`, { method: "PATCH" });
            if (!resp.ok) throw new Error(`Error PATCH ${resp.status}`);
            setPropiedades(cur =>
                cur.map(p =>
                    p.id === id ? { ...p, activo: !p.activo } : p
                )
            );
            // Actualiza también el modalCliente si está abierto
            if (modalCliente) {
                setModalCliente(prev => prev
                    ? {
                        ...prev,
                        propiedades: prev.propiedades.map(p => p.id === id ? { ...p, activo: !p.activo } : p)
                    }
                    : prev
                );
            }
        } catch (err) {
            alert("No se pudo actualizar la propiedad.");
        }
    };

    // Columnas para tabla principal
    const columns = useMemo(() => [
        {
            key: "numero",
            label: "Número",
            render: (row: ClienteConPropiedades) => `N°${row.id}`,
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
            key: "propiedadesAprobadas",
            label: "Propiedades (Aprobadas)",
            render: (row: ClienteConPropiedades) => row.propiedadesAprobadas,
        },
        {
            key: "activo",
            label: "Activo",
            render: (row: ClienteConPropiedades) => row.activo ? "Activo" : "Inactivo",
        },
        {
            key: "accion",
            label: "",
            render: (row: ClienteConPropiedades) => (
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        className={
                            row.activo
                                ? "bg-red-700 text-white px-3 py-1 rounded text-xs hover:bg-red-800 transition"
                                : "bg-green-700 text-white px-3 py-1 rounded text-xs hover:bg-green-800 transition"
                        }
                        onClick={() => handleToggleUsuario(row.id)}
                    >
                        {row.activo ? "Desactivar" : "Activar"}
                    </button>
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            bgcolor: "#232e4a",
                            color: "white",
                            fontSize: "0.8rem",
                            "&:hover": { bgcolor: "#2d3957" },
                            textTransform: 'none',
                            boxShadow: "none",
                            borderRadius: 2,
                        }}
                        onClick={() => {
                            setModalOpen(true);
                            setModalCliente(row);
                            setModalPage(0);
                            setModalRowsPerPage(10);
                        }}
                    >Ver Propiedades</Button>
                </div>
            ),
        },
    ], []);

    // Columnas para minitabla de propiedades verificadas
    const propiedadColumns = [
        { key: "nombre", label: "Nombre" },
        { key: "descripcion", label: "Descripción" },
        {
            key: "activo",
            label: "Activo",
            render: (row: PropiedadResponseDTO) => row.activo ? "Activo" : "Inactivo",
        },
        {
            key: "accion",
            label: "",
            render: (row: PropiedadResponseDTO) => (
                <button
                    className={
                        row.activo
                            ? "bg-red-700 text-white px-3 py-1 rounded text-xs hover:bg-red-800 transition"
                            : "bg-green-700 text-white px-3 py-1 rounded text-xs hover:bg-green-800 transition"
                    }
                    onClick={() => handleTogglePropiedad(row.id)}
                >
                    {row.activo ? "Desactivar" : "Activar"}
                </button>
            ),
        },
    ];

    // Propiedades verificadas del cliente seleccionado en el modal
    const propiedadesModal = useMemo(() => {
        if (!modalCliente) return [];
        // Solo mostrar propiedades verificadas "APROBADA"
        return modalCliente.propiedades.filter(p => p.verificacionPropiedad === "APROBADA");
    }, [modalCliente, propiedades]);

    // Paginación para propiedades en el modal
    const pagedModalRows = propiedadesModal.slice(
        modalPage * modalRowsPerPage,
        modalPage * modalRowsPerPage + modalRowsPerPage
    );

    return (
        <div className="mt-4">
            <h1 className="text-lg font-medium mb-4 ml-4 text-white">Usuarios con propiedades</h1>
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
                        totalCount={clientesConPropiedades.length}
                    />
                )}
            </div>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography id="modal-title" variant="h6" component="h2" sx={{ color: "white" }}>
                            Propiedades verificadas de {modalCliente?.nombreCompleto}
                        </Typography>
                        <IconButton sx={{ color: "white" }} onClick={() => setModalOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <Typography variant="body2" sx={{ mb: 2, color: "white" }}>
                        Solo se muestran propiedades con verificación <b>APROBADA</b>.
                    </Typography>
                    <GenericTable
                        columns={propiedadColumns}
                        rows={pagedModalRows}
                        page={modalPage}
                        rowsPerPage={modalRowsPerPage}
                        onPageChange={(_, np) => setModalPage(np)}
                        onRowsPerPageChange={(e) => {
                            setModalRowsPerPage(parseInt(e.target.value, 10));
                            setModalPage(0);
                        }}
                        totalCount={propiedadesModal.length}
                    />
                </Box>
            </Modal>
        </div>
    );
};

export default ListaPropiedades;