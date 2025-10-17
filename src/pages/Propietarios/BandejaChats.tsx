// src/pages/mensajes/BandejaChats.tsx
import { useEffect, useState } from "react";
import { Footer } from "../../components/layout/Footer";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import type { ConversacionResponseDTO } from "../../types/entities/conversacion/ConversacionResponseDTO";
import { useSelector } from "react-redux";
import fotoDefault from "../../assets/Imagenes/fotoPerfilDefault.jpg";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

const getInterlocutor = (conv: ConversacionResponseDTO, userId: number) =>
    conv.cliente1?.id === userId ? conv.cliente2 : conv.cliente1;

const getUltimoMensaje = (conv: ConversacionResponseDTO) =>
    conv.mensajes?.length ? conv.mensajes[conv.mensajes.length - 1] : undefined;

const BandejaChats = () => {
    const [conversaciones, setConversaciones] = useState<ConversacionResponseDTO[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [conectado, setConectado] = useState<boolean>(false);

    const user = useSelector((state: any) => state.user);
    const navigate = useNavigate();

    // Fetch inicial: se dispara cuando user.id esté disponible
    useEffect(() => {
        if (!user?.id) {
            setCargando(false);
            return;
        }

        let mounted = true;
        const traerConversaciones = async () => {
            setCargando(true);
            setError(false);
            try {
                const url = `${import.meta.env.VITE_APIBASE}/api/conversaciones/cliente/${user.id}`;
                const response = await fetch(url);
                if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    console.error("Fetch conversaciones error:", response.status, text);
                    setError(true);
                    toast.error("Surgió un error al cargar las conversaciones");
                    return;
                }
                const data: ConversacionResponseDTO[] = await response.json();
                if (!mounted) return;
                setConversaciones(data || []);
            } catch (err) {
                console.error("Error trayendo conversaciones:", err);
                setError(true);
                toast.error("Surgió un error al cargar las conversaciones");
            } finally {
                if (mounted) setCargando(false);
            }
        };

        traerConversaciones();
        return () => {
            mounted = false;
        };
    }, [user?.id]);

    // WS: suscripciones a /topic/conversaciones/save/:id y /topic/conversaciones/update/:id
    useEffect(() => {
        if (!user?.id) return;

        const brokerUrl = import.meta.env.VITE_WS_URL as string;
        if (!brokerUrl) {
            console.warn("VITE_WS_URL no configurado - no se conectará STOMP.");
            return;
        }

        const cliente = new Client({
            brokerURL: brokerUrl, // ej: ws://localhost:8080/ws
            reconnectDelay: 5000,
            debug: (msg) => console.log({ STOMP: msg }),
            // Si necesitás headers en el connect, agregalos con connectHeaders
        });

        let subsSave: StompSubscription | null = null;
        let subsUpdate: StompSubscription | null = null;
        let conectadoLocal = false;

        cliente.onConnect = () => {
            console.log("STOMP CONECTADO");
            conectadoLocal = true;
            setConectado(true);

            try {
                subsSave = cliente.subscribe(`/topic/conversaciones/save/${user.id}`, (message: IMessage) => {
                    try {
                        const payload = JSON.parse(message.body) as ConversacionResponseDTO;
                        console.log("WS save recibido:", payload);
                        if (!payload?.id) return;

                        setConversaciones(prev => {
                            if (!prev || prev.length === 0) return [payload];
                            const idx = prev.findIndex(c => c.id === payload.id);
                            if (idx !== -1) {
                                const newArr = [...prev];
                                newArr.splice(idx, 1);
                                newArr.unshift(payload);
                                return newArr;
                            }
                            return [payload, ...prev];
                        });
                    } catch (err) {
                        console.error("Error parseando WS save:", err);
                    }
                });
            } catch (err) {
                console.error("Error suscribiendo a save topic:", err);
            }

            try {
                subsUpdate = cliente.subscribe(`/topic/conversaciones/update/${user.id}`, (message: IMessage) => {
                    try {
                        const payload = JSON.parse(message.body) as ConversacionResponseDTO;
                        console.log("WS update recibido:", payload);
                        if (!payload?.id) return;

                        setConversaciones(prev => {
                            if (!prev || prev.length === 0) return [payload];
                            const idx = prev.findIndex(c => c.id === payload.id);
                            if (idx !== -1) {
                                const newArr = [...prev];
                                newArr.splice(idx, 1);
                                newArr.unshift(payload);
                                return newArr;
                            }
                            return [payload, ...prev];
                        });
                    } catch (err) {
                        console.error("Error parseando WS update:", err);
                    }
                });
            } catch (err) {
                console.error("Error suscribiendo a update topic:", err);
            }
        };

        cliente.onStompError = (frame) => {
            console.error("STOMP error:", frame);
        };

        cliente.onDisconnect = () => {
            console.log("STOMP desconectado");
            setConectado(false);
            conectadoLocal = false;
        };

        // Activar conexión
        cliente.activate();
        setStompClient(cliente);

        // Cleanup
        return () => {
            try {
                subsSave?.unsubscribe();
            } catch (e) { /* ignore */ }
            try {
                subsUpdate?.unsubscribe();
            } catch (e) { /* ignore */ }
            try {
                if (conectadoLocal) cliente.deactivate();
                else cliente.deactivate(); // safe deactivate
            } catch (e) {
                console.warn("Error al desactivar STOMP:", e);
            }
            setStompClient(null);
            setConectado(false);
        };
    }, [user?.id]);

    return (
        <>
            <UsuarioHeader />
            <main className="min-h-screen bg-secondary pt-20">
                <h1 className="text-white px-4 text-lg">Mensajes</h1>
                <ul className="w-full justify-center mt-4 text-white flex flex-col items-center">

                    {error && <p className="mt-20 text-gray-300">Surgió un error al traer tus conversaciones</p>}
                    {cargando && <p className="mt-20 text-gray-300">Cargando conversaciones...</p>}

                    {!cargando && !error && conversaciones.length === 0 && (
                        <p className="mt-20 text-gray-300">No tienes conversaciones</p>
                    )}

                    {!cargando && !error && conversaciones.length > 0 && (
                        conversaciones.map((conversacion) => {
                            const otro = getInterlocutor(conversacion, user.id);
                            const ultimo = getUltimoMensaje(conversacion);

                            return (
                                <li
                                    onClick={() => navigate(`/Chat/${conversacion.id}`, { state: conversacion })}
                                    key={conversacion.id}
                                    className="bg-primary w-full flex px-5 py-3 gap-3 items-center cursor-pointer hover:bg-primary/90 transition"
                                >
                                    <img
                                        src={otro?.fotoPerfil?.urlImagen || fotoDefault}
                                        alt={otro?.nombreCompleto}
                                        className="w-10 h-10 object-cover rounded-md"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{otro?.nombreCompleto || otro?.correoElectronico || "Usuario"}</p>
                                        <p className="text-white text-sm truncate">{ultimo?.contenido || "Sin mensajes todavía..."}</p>
                                    </div>
                                </li>
                            );
                        })
                    )}

                </ul>

                {/* Indicador de estado WS (opcional) */}
                <div className="fixed bottom-2 right-2 px-3 py-1 rounded-md text-xs bg-black/30 text-white">
                    {conectado ? "WS: Conectado" : "WS: Desconectado"}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default BandejaChats;
