import { useEffect, useState } from "react"
import { Footer } from "../../components/layout/Footer"
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader"
import type { ConversacionResponseDTO } from "../../types/entities/conversacion/ConversacionResponseDTO"
import { useSelector } from "react-redux"
import fotoDefault from "../../assets/Imagenes/fotoPerfilDefault.jpg"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { Client } from '@stomp/stompjs';

const getInterlocutor = (conv: ConversacionResponseDTO, userId: number) =>
    conv.cliente1?.id === userId ? conv.cliente2 : conv.cliente1;

const getUltimoMensaje = (conv: ConversacionResponseDTO) =>
    conv.mensajes?.length ? conv.mensajes[conv.mensajes.length - 1] : undefined;

const BandejaChats = () => {
    const [conversaciones, setConversaciones] = useState<ConversacionResponseDTO[]>([])
    const [cargando, setCargando] = useState<boolean>(true)
    const [error, setError] = useState<boolean>(false)



    const user = useSelector((state: any) => state.user)
    const navigate = useNavigate()



    useEffect(() => {
        const traerConversaciones = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_APIBASE}/api/conversaciones/cliente/${user.id}`)
                const data: ConversacionResponseDTO[] = await response.json()
                setConversaciones(data)
                setCargando(false)
                console.log(data)

                if (!response.ok) {
                    setError(true)
                    setCargando(false)
                    toast.error("Surgio un error al cargar las conversaciones")
                    throw new Error(`Error ${response.status}: ${response.statusText}`)
                }
            } catch {
                setError(true)
                setCargando(false)
                toast.error("Surgio un error al cargar las conversaciones")
            } finally {
                setCargando(false)
            }

        }

        traerConversaciones()
    }, [])
    


    return (
        <>
            <UsuarioHeader />
            <main className="min-h-screen bg-secondary pt-20">
                <h1 className="text-white px-4 text-lg">Mensajes</h1>
                <ul className="w-full justify-center mt-4 text-white flex flex-col items-center">

                    {error && <p className="mt-20 text-gray-300">Surgio un error al traer tus conversaciones</p>}
                    {cargando && <p className="mt-20 text-gray-300">Cargando conversaciones...</p>}

                    {!cargando && !error && conversaciones.length === 0 && (
                        <p className="mt-20 text-gray-300">No tienes conversaciones</p>
                    )}

                    {!cargando && !error && conversaciones.length > 0 && (
                        conversaciones.map((conversacion) => {
                            const otro = getInterlocutor(conversacion, user.id);
                            const ultimo = getUltimoMensaje(conversacion);

                            return (
                                <li onClick={() => navigate(`/Chat/${conversacion.id}`, { state: conversacion})} key={conversacion.id} className="bg-primary w-full flex px-5 py-3 gap-3 items-center cursor-pointer hover:bg-primary/90 transition">
                                    <img src={otro?.fotoPerfil?.urlImagen || fotoDefault} alt={otro?.nombreCompleto} className="w-10 h-10 object-cover rounded-md" />

                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{otro?.nombreCompleto || otro?.correoElectronico || "Usuario"}</p>
                                        <p className="text-white text-sm truncate">{ultimo?.contenido || "Sin mensajes todavía..."}</p>
                                    </div>

                                </li>
                            );
                        })
                    )}






                </ul>

            </main>
            <Footer />
        </>
    )
}

export default BandejaChats