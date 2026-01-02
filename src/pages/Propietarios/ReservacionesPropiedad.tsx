import { useEffect, useState } from 'react'
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader'
import { Footer } from '../../components/layout/Footer'
import { useNavigate, useParams } from 'react-router-dom';
import type { ReservaResponseDTO } from '../../types/entities/reserva/ReservaResponseDTO';
import toast from 'react-hot-toast';
import { ButtonTertiary } from '../../components/ui/buttons/ButtonTertiary';
import { useSelector } from 'react-redux';

const ReservacionesPropiedad = () => {
    const [cargando, setCargando] = useState<boolean>(true);
    const [reservas, setReservas] = useState<ReservaResponseDTO[]>([])

    const navigate = useNavigate()

    const usuario = useSelector((s: any) => s.user);



    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        const obtenerReservas = async () => {
            try {
                setCargando(true);

                const response = await fetch(`${import.meta.env.VITE_APIBASE}/api/reservas/propiedad/${id}`, {headers:  {'Authorization': `Bearer ${usuario.token}`}})

                if (!response.ok) {
                    throw new Error(`Ocurrio un error desconocido`);
                }

                const data: ReservaResponseDTO[] = await response.json()
                setReservas(data);

                console.log(data)

            } catch (e: any) {
                const msg = e?.message?.includes("Failed to fetch")
                    ? "No se pudo conectar con el servidor (¿CORS o back caído?)."
                    : e?.message || "No se pudo enviar la reseña";
                toast.error(msg);
            } finally {
                setCargando(false);
            }
        }

        if (id) {
            obtenerReservas();
        } else {
            setCargando(false);
        }
    }, [id]);

    const abrirChat = async (cliente1Id: number, cliente2Id: number) => {
        try {
            const url = `${import.meta.env.VITE_APIBASE}/api/conversaciones/existe-conversacion/${cliente1Id}/${cliente2Id}`;
            const res = await fetch(url);
            if (!res.ok) {
                toast.error("No se pudo abrir la conversación");
                return;
            }
            const conversacion = await res.json();
            navigate(`/Chat/${conversacion.id}`);
        } catch (e) {
            toast.error("Error al abrir el chat");
        }
    };


    return (
        <>
            <UsuarioHeader />
            <main className="bg-secondary min-h-screen px-5 pt-25 pb-15 text-white md:px-20">
                <h1 className="text-lg font-medium mb-4">Reservas Actuales:</h1>

                {cargando && <p>Cargando...</p>}
                {!cargando && reservas.length === 0 && (
                    <p>No tenés reservas por ahora.</p>
                )}
                {!cargando && reservas.length > 0 && (
                    <div>
                        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {reservas.filter((r: ReservaResponseDTO) => ["RESERVADA", "ACTIVA"].includes(r.estado)).map((reserva: ReservaResponseDTO) => (
                                <li key={reserva.id} className="flex flex-col sm:flex-row bg-tertiary justify-between rounded-xl gap-2 overflow-hidden" >
                                    <img src={reserva.propiedad.detalleImagenes[0].imagen.urlImagen} alt="" className="w-full md:w-25 h-40 md:h-full object-cover rounded-t-xl md:rounded-t-none md:rounded-l-xl" />
                                    <div className="w-50 py-2 flex justify-between w-full px-2">
                                        <div className="flex flex-col">
                                            <h3 className="">{reserva.propiedad.nombre}</h3>
                                            <p className='text-xs mb-2'>Cliente: {reserva.cliente.nombreCompleto}</p>
                                            <p className="font-light text-xs">Desde: {reserva.fechaInicio}</p>
                                            <p className="font-light text-xs mb-3">Hasta: {reserva.fechaFin}</p>
                                            <p className="font-light text-xs mb-3">Estado: {reserva.estado}</p>
                                        </div>

                                        <div className="flex flex-col justify-end pr-2 gap-2">
                                            <ButtonTertiary onClick={() => abrirChat(reserva.cliente.id, reserva.propiedad.propietario?.id)} className="cursor-pointer" text="Abrir Chat" color="white" maxWidth="w-[70px]" fontSize="text-xs" />

                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <h1 className="text-lg font-medium mt-10 text-white/50">Reservas Finalizadas:</h1>
                        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {reservas.filter((r: ReservaResponseDTO) => ["FINALIZADA", "CANCELADA"].includes(r.estado))
                                .map((reserva: ReservaResponseDTO) => (
                                    <li key={reserva.id} className="flex flex-col sm:flex-row bg-tertiary justify-between rounded-xl gap-2 w-full overflow-hidden" >
                                        <img src={reserva.propiedad.detalleImagenes[0].imagen.urlImagen} alt="" className="w-full md:w-25 h-40 md:h-full   object-cover rounded-t-xl md:rounded-t-none md:rounded-l-xl" />
                                        <div className="w-50 py-2 flex justify-between w-full px-2">
                                            <div className="flex flex-col">
                                                <h3 className="">{reserva.propiedad.nombre}</h3>
                                                <p className='text-xs mb-2'>Cliente: {reserva.cliente.nombreCompleto}</p>
                                                <p className="font-light text-xs">Desde: {reserva.fechaInicio}</p>
                                                <p className="font-light text-xs mb-3">Hasta: {reserva.fechaFin}</p>
                                                <p className="font-light text-xs mb-3">Estado: {reserva.estado}</p>
                                            </div>

                                            <div className="flex flex-col justify-end pr-2 gap-2">

                                                <ButtonTertiary onClick={() => abrirChat(reserva.cliente.id, reserva.propiedad.propietario?.id)} className="cursor-pointer" text="Abrir Chat" color="white" maxWidth="w-[70px]" fontSize="text-xs" />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>        
                )}
            </main>
            <Footer />
        </>
    )
}

export default ReservacionesPropiedad