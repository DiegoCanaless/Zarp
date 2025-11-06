import { useEffect, useRef, useState } from 'react'
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader'
import { Footer } from '../../components/layout/Footer'
import type { PagoPendienteResponseDTO } from '../../types/entities/pagosPendientes/PagoPendienteResponseDTO';
import { useNavigate } from 'react-router-dom';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';

const PagosPendientes = () => {
    const [Loading, setLoading] = useState<boolean>(true);
    const [Pagos, setPagos] = useState<PagoPendienteResponseDTO[]>([]);
    const [error, setError] = useState<boolean>(false)
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [conectado, setConectado] = useState<boolean>(false);
    const [opcionElegida, setOpcionElegida] = useState<string>("PENDIENTE")

    const cambiarOpcion = (opcion: string) => {
        setOpcionElegida(opcion)
    }

    const opcionRef = useRef(opcionElegida);
  useEffect(() => { opcionRef.current = opcionElegida }, [opcionElegida]);

    useEffect(() => {
        const cargaInicialPagos = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_APIBASE}/api/pagosPendientes/getByEstado/${opcionElegida}`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const data = await res.json()
                setPagos(data)
                setLoading(false)
                console.log(data)
            } catch (error) {
                setError(true)
                setLoading(false)
                console.log(error)
            }
        }
        cargaInicialPagos()
    }, [opcionElegida])


    const navigate = useNavigate()

    /* WebSockets: conectar una sola vez y suscribirse a save y update */
    useEffect(() => {
        let cliente: Client | null = null;
        let subsSave: StompSubscription | null = null;
        let subsUpdate: StompSubscription | null = null;
        let isCleaningUp = false;

        const conectarWebSocket = () => {
            cliente = new Client({
                brokerURL: import.meta.env.VITE_WS_URL,
                reconnectDelay: 5000,
                debug: (msg) => console.log({ STOMP: msg }),
            });

            cliente.onConnect = () => {
                if (isCleaningUp) return;

                console.log("Stomp conectado");
                setConectado(true);

                // SUBSCRIBE - SAVE (nuevo pagos)
                try {
                    subsSave = cliente!.subscribe("/topic/pagosPendientes/save", (message: IMessage) => {
                        try {
                            const payload = JSON.parse(message.body) as PagoPendienteResponseDTO;
                            console.log("WS save recibido", payload);
                            if (!payload?.id) return;

                            // Si el pago entrante coincide con el filtro actual, agregarlo (evitar duplicados)
                            if (String(payload.estadoPagosPendientes).toUpperCase() === String(opcionRef.current).toUpperCase()) {
                                setPagos(prev => {
                                    const existe = prev.some(p => p.id === payload.id);
                                    if (existe) return prev;
                                    return [payload, ...prev];
                                });
                            }
                        } catch (error) {
                            console.log("Error parseando WS save: ", error);
                        }
                    });
                } catch (error) {
                    console.log("Error subscribiendo a save topic: ", error);
                }

                // SUBSCRIBE - UPDATE (cambios de estado)
                try {
                    subsUpdate = cliente!.subscribe("/topic/pagosPendientes/update", (message: IMessage) => {
                        try {
                            const payload = JSON.parse(message.body) as PagoPendienteResponseDTO;
                            console.log("WS update recibido", payload);
                            if (!payload?.id) return;

                            setPagos(prev => {
                                const estadoPayload = String(payload.estadoPagosPendientes).toUpperCase();
                                const filtro = String(opcionRef.current).toUpperCase();

                                if (estadoPayload === filtro) {
                                    // Si coincide con filtro, actualizar si existe o agregar al principio
                                    const existe = prev.some(p => p.id === payload.id);
                                    if (existe) {
                                        return prev.map(p => p.id === payload.id ? payload : p);
                                    } else {
                                        return [payload, ...prev];
                                    }
                                } else {
                                    // Si ya no coincide con el filtro, eliminarlo de la lista
                                    return prev.filter(p => p.id !== payload.id);
                                }
                            });
                        } catch (error) {
                            console.log("Error parseando WS update: ", error);
                        }
                    });
                } catch (error) {
                    console.log("Error subscribiendo a update topic: ", error);
                }
            };

            cliente.onStompError = (frame) => {
                console.error("Stomp error: ", frame);
            };

            cliente.onDisconnect = () => {
                console.log("Stomp desconectado");
                setConectado(false);
            };

            cliente.activate();
            setStompClient(cliente);
        };

        conectarWebSocket();

        // Cleanup
        return () => {
            isCleaningUp = true;

            if (subsSave) {
                try { subsSave.unsubscribe(); } catch (e) { console.warn("Error al desuscribir save:", e); }
            }
            if (subsUpdate) {
                try { subsUpdate.unsubscribe(); } catch (e) { console.warn("Error al desuscribir update:", e); }
            }

            if (cliente) {
                try { cliente.deactivate(); } catch (e) { console.warn("Error al desactivar STOMP:", e); }
            }

            setStompClient(null);
            setConectado(false);
        };
    }, []);

    return (
        <>
            <UsuarioHeader />
            <main className='bg-secondary min-h-screen pt-15'>

                <div className='flex justify-around'>
                    <button onClick={() => cambiarOpcion("PENDIENTE")} className='cursor-pointer px-6 bg-primary text-white rounded-2xl my-4 py-2'>Pendientes</button>
                    <button onClick={() => cambiarOpcion("INICIADO")} className='cursor-pointer px-6 bg-primary text-white rounded-2xl my-4 py-2'>Iniciados</button>
                    <button onClick={() => cambiarOpcion("COMPLETADO")} className='cursor-pointer px-6 bg-primary text-white rounded-2xl my-4 py-2'>Finalizados</button>
                </div>

                {Loading && <p className='text-white text-center mt-20'>Cargando pagos pendientes</p>}
                {!Loading && error && <p className='text-white text-center mt-20'>Error al cargar pagos</p>}
                {!Loading && !error && Pagos.length === 0 && <p className='text-white text-center mt-20'>Aun no hay pagos en este estado</p>}
                {!Loading && !error && Pagos.length > 0 && (
                    <table className='w-full text-white'>
                        <thead className='bg-primary'>
                            <tr className='font-medium'>
                                <th className='px-4 py-2'>N°Pago</th>
                                <th className='px-4 py-2'>Propietario</th>
                                <th className='px-4 py-2'>Metodo de Pago</th>
                                <th className='px-4 py-2'>Monto</th>
                                <th className='px-4 py-2'>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Pagos.map((pago) => (
                                <tr key={pago.id} className='bg-tertiary h-15 text-center hover:bg-primary cursor-pointer transition-colors' onClick={() => navigate(`/TransaccionFinal/${pago.id}`)}>
                                    <td className='px-4 py-2'>{pago.id}</td>
                                    <td className='px-4 py-2'>{pago.propietario.nombreCompleto}</td>
                                    <td className='px-4 py-2'>{pago.formaPago}</td>
                                    <td className='px-4 py-2'>{pago.monto}</td>
                                    <td className='px-4 py-2'>{pago.fechaCreacion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}


            </main>
            <Footer />
        </>

    )
}

export default PagosPendientes