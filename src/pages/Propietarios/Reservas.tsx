import { useEffect, useState } from "react";
import { Footer } from "../../components/layout/Footer";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import type { ReservaResponseDTO } from "../../types/entities/reserva/ReservaResponseDTO";
import { useSelector } from "react-redux";
import { ButtonTertiary } from "../../components/ui/buttons/ButtonTertiary";
import { AiOutlineClose } from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { ButtonPrimary } from "../../components/ui/buttons/ButtonPrimary";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Reservas = () => {
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [reservas, setReservas] = useState<ReservaResponseDTO[]>([]);
    const [modalPuntuacion, setModalPuntuacion] = useState<boolean>(false);
    const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaResponseDTO>()
    const [huespedes, setHuespedes] = useState<number>(0);

    const [comentario, setComentario] = useState<string>("");
    const [enviando, setEnviando] = useState<boolean>(false);

    const navigate = useNavigate();

    const enviarResena = async () => {
        if (!reservaSeleccionada?.propiedad?.id || !usuario?.id) {
            toast.error("Faltan datos para enviar la reseña");
            return;
        }
        if (rating <= 0) {
            toast.error("Elegí una calificación (al menos 1 estrella)");
            return;
        }

        // ⚠️ Aseguramos números (si tu Redux guarda strings)
        const propiedadId = Number(reservaSeleccionada.propiedad.id);
        const usuarioId = Number(usuario.id);

        const payload = {
            propiedadId,
            usuarioId,
            comentario: comentario.trim(),
            calificacion: Number(rating),
        };

        try {
            setEnviando(true);
            const url = `${import.meta.env.VITE_APIBASE}/api/resenias/save`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${usuario.token}` },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                let serverMsg = `Error (${res.status})`;
                try {
                    const data = await res.json();
                    serverMsg = data?.mensaje || serverMsg;
                } catch {
                    serverMsg = await res.text();
                }

                toast.error(serverMsg, {
                    duration: 4000,
                    icon: "⚠️",
                });
                return;
            }


            cerrarPuntuacion();
            toast.success("Reseña enviada correctamente");
        } catch (e: any) {
            console.error(e);
            const msg = e?.message?.includes("Failed to fetch")
                ? "No se pudo conectar con el servidor (¿CORS o back caído?)."
                : e?.message || "No se pudo enviar la reseña";
            toast.error(msg);
        } finally {
            setEnviando(false);
        }
    };


    useEffect(() => {
        if (modalPuntuacion) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = prev; };
        }
    }, [modalPuntuacion]);



    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);




    const abrirPuntuacion = (reserva: ReservaResponseDTO) => {
        setReservaSeleccionada(reserva);
        setHuespedes(calcularHuespedes(reserva));
        setModalPuntuacion(true);
    };

    const cerrarPuntuacion = () => {
        setModalPuntuacion(false);
        setReservaSeleccionada(null as any);
        setHuespedes(0);
        setComentario("");
        setRating(0);
        setHover(0);
    };

    function calcularHuespedes(reserva?: ReservaResponseDTO): number {
        return (reserva?.propiedad?.detalleTipoPersonas ?? [])
            .reduce((acc, item) => acc + (item?.cantidad ?? 0), 0);
    }




    const usuario = useSelector((state: any) => state.user);

    useEffect(() => {
        const obtenerReservas = async () => {
            try {
                setCargando(true);

                if (!usuario?.id) {
                    setReservas([]);
                    toast.error("No hay usuario logueado o falta el ID del cliente.");
                    setCargando(false);
                    return;
                }
                const url = `${import.meta.env.VITE_APIBASE}/api/reservas/cliente/${usuario.id}`;
                const response = await fetch(url, { headers: { 'Authorization': `Bearer ${usuario.token}`}});
                if (!response.ok) {
                    throw new Error(`Ocurrio un error desconocido`);
                }
                const data: ReservaResponseDTO[] = await response.json();
                setReservas(data);
            } catch (e: any) {
                console.error(e);
                const msg = e?.message?.includes("Failed to fetch")
                    ? "No se pudo conectar con el servidor (¿CORS o back caído?)."
                    : e?.message || "No se pudo enviar la reseña";
                setError(msg)
                toast.error(msg); // <-- así funciona bien
            } finally {
                setCargando(false);
            }
        };

        if (usuario?.id) {
            obtenerReservas();
        } else {
            setCargando(false);
        }
    }, [usuario?.id]);


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
                                <li key={reserva.id} className="flex flex-col sm:flex-row bg-tertiary justify-between rounded-xl gap-2 w-full overflow-hidden" >
                                    <img src={reserva.propiedad.detalleImagenes[0].imagen.urlImagen} alt="" className="w-full md:w-25 h-40 md:h-30 object-cover rounded-t-xl md:rounded-t-none md:rounded-l-xl" />
                                    <div className="w-50 py-2 flex justify-between w-full px-2">
                                        <div className="flex flex-col">
                                            <h3 className="mb-2">{reserva.propiedad.nombre}</h3>
                                            <p className="font-light text-xs">Desde: {reserva.fechaInicio}</p>
                                            <p className="font-light text-xs mb-3">Hasta: {reserva.fechaFin}</p>
                                            <p className="font-light text-xs mb-3">Estado: {reserva.estado}</p>
                                        </div>

                                        <div className="flex flex-col justify-end pr-2 gap-2">
                                            <ButtonTertiary onClick={() => abrirChat(usuario.id, reserva.propiedad.propietario?.id)} className="cursor-pointer" text="Abrir Chat" color="white" maxWidth="w-[70px]" fontSize="text-xs" />
                                            <ButtonTertiary onClick={() => abrirPuntuacion(reserva)} className="cursor-pointer" bgColor="bg-red-700" text="Ver Mas" color="white" maxWidth="w-[70px]" fontSize="text-xs" />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <h1 className="text-lg font-medium mt-10 text-white/50">Reservas Finalizadas:</h1>
                        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {reservas.filter((r: ReservaResponseDTO) => ["FINALIZADA", "CANCELADA"].includes(r.estado))
                                .map((reserva: ReservaResponseDTO) => (
                                    <li key={reserva.id} className="flex flex-col sm:flex-row bg-tertiary justify-between rounded-xl gap-2 w-full opacity-60 hover:opacity-80 transition overflow-hidden" >
                                        <img src={reserva.propiedad.detalleImagenes[0].imagen.urlImagen} alt="" className="w-full md:w-25 h-40 md:h-30 object-cover rounded-t-xl md:rounded-t-none md:rounded-l-xl" />
                                        <div className="w-50 py-2 flex justify-between w-full px-2">
                                            <div className="flex flex-col">
                                                <h3 className="mb-2">{reserva.propiedad.nombre}</h3>
                                                <p className="font-light text-xs">Desde: {reserva.fechaInicio}</p>
                                                <p className="font-light text-xs mb-3">Hasta: {reserva.fechaFin}</p>
                                                <p className="font-light text-xs mb-3">Estado: {reserva.estado}</p>
                                            </div>

                                            <div className="flex flex-col justify-end pr-2 gap-2">
                                                <ButtonTertiary onClick={() => abrirChat(usuario.id, reserva.propiedad.propietario?.id)} className="cursor-pointer" text="Abrir Chat" color="white" maxWidth="w-[70px]" fontSize="text-xs" />
                                                <ButtonTertiary onClick={() => abrirPuntuacion(reserva)} className="cursor-pointer" bgColor="bg-red-700" text="Ver Mas" color="white" maxWidth="w-[70px]" fontSize="text-xs" />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    </div>

                )}


            </main>


            {modalPuntuacion && reservaSeleccionada && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-end md:items-center md:justify-center" role="dialog" aria-modal="true"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) cerrarPuntuacion();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") cerrarPuntuacion();
                    }}
                    tabIndex={-1}
                >
                    <div className="w-full max-h-[85vh] bg-tertiary rounded-t-2xl p-4 overflow-y-auto md:w-[480px] md:rounded-2xl md:max-h-[90vh]">
                        <div className="flex justify-between text-white">
                            <div className="min-w-0">
                                <h2 className="font-medium truncate">{reservaSeleccionada.propiedad.nombre}</h2>
                                <span className="text-xs">{huespedes} Huespedes</span>
                            </div>
                            <button aria-label="Cerrar" className="p-1 -m-1" onClick={cerrarPuntuacion} > <AiOutlineClose fontSize={20} /></button>
                        </div>

                        <div className="flex justify-between text-xs text-white mt-1">
                            <p className="pr-2 truncate">Propietario: {reservaSeleccionada.propiedad.propietario?.nombreCompleto}</p>
                            <div className="flex flex-col mb-2 text-right shrink-0">
                                <p>Desde: {reservaSeleccionada.fechaInicio}</p>
                                <p>Hasta: {reservaSeleccionada.fechaFin}</p>
                            </div>
                        </div>

                        <hr className="w-full border-white/20 my-2" />

                        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Escriba un comentario" className="h-24 px-4 outline-none py-2 bg-white w-full rounded-2xl mt-3 mb-2 text-black" />

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)} aria-label={`${n} estrella${n > 1 ? "s" : ""}`} className="p-1" >
                                        <FaStar size={18} className={(hover || rating) >= n ? "text-yellow-400 cursor-pointer transition-colors" : "text-white/30"} />
                                    </button>
                                ))}
                            </div>

                            <ButtonPrimary className={`cursor-pointer ${enviando ? "opacity-60 pointer-events-none" : ""}`} text={enviando ? "Enviando..." : "Puntuar"} maxWidth="w-[110px]" onClick={enviarResena} />
                        </div>
                    </div>
                </div>
            )}



            <Footer />



        </>
    );
};

export default Reservas;
