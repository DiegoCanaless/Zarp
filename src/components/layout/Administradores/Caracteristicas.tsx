import { useEffect, useState } from "react";
import { ButtonPrimary } from "../../ui/buttons/ButtonPrimary";
import ModalCaracteristica from "../../ui/modals/ModalCaracteristicas";
import { GenericTable } from '../../ui/TablaGenerica';
import type { CaracteristicaResponseDTO } from '../../../types/entities/caracteristica/CaracteristicaResponseDTO';

const Caracteristicas = () => {
    const [modalAbierto, setModalAbierto] = useState(false);
    const abrirModal = () => setModalAbierto((v) => !v);

    const [rows, setRows] = useState<CaracteristicaResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchCaracteristicas = () => {
        setLoading(true);
        setErr(null);
        fetch('http://localhost:8080/api/caracteristicas')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: CaracteristicaResponseDTO[]) => {
                setRows(Array.isArray(data) ? data : []);
            })
            .catch(e => {
                setErr('No se pudieron cargar las características');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCaracteristicas();
    }, []);

    const columns = [
        { key: 'denominacion', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'activo', label: 'Estado', render: (row: CaracteristicaResponseDTO) => row.activo ? 'Activo' : 'Inactivo' },
        { key: 'imagen', label: 'Icono', render: (row: CaracteristicaResponseDTO) => row.imagen?.urlImagen ? <img src={row.imagen.urlImagen} alt={row.denominacion} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} /> : '-' },
    ];

    return (
        <>
            <div className="flex justify-between items-end">
                <h1 className="mt-5 text-lg font-medium">Caracteristicas</h1>
                <ButtonPrimary onClick={abrirModal} text="Agregar Caracteristica" className="cursor-pointer" fontWeight="font-medium" maxWidth="w-[200px]" />
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
                        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        totalCount={rows.length}
                    />
                )}
            </div>

            {modalAbierto && (
                <ModalCaracteristica
                    onClose={abrirModal}
                    onSaved={() => {
                        setModalAbierto(false);
                        fetchCaracteristicas();
                    }}
                />
            )}
        </>
    );
};

export default Caracteristicas;