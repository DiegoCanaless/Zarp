import { useEffect, useRef, useState } from 'react'
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader'
import { Footer } from '../../components/layout/Footer'
import type { PagoPendienteResponseDTO } from '../../types/entities/pagosPendientes/PagoPendienteResponseDTO';
import { useNavigate } from 'react-router-dom';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const PagosPendientes = () => {
    const [Loading, setLoading] = useState<boolean>(true);
    const [Pagos, setPagos] = useState<PagoPendienteResponseDTO[]>([]);
    const [error, setError] = useState<boolean>(false)
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [conectado, setConectado] = useState<boolean>(false);
    const [opcionElegida, setOpcionElegida] = useState<string>("PENDIENTE")
    const [actionLoading, setActionLoading] = useState<number | null>(null); // id de pago que está procesando

    // Normalizo el usuario desde el store: soporta state.user.user o state.user
    const usuarioFromStore = useSelector((state: any) => state.user?.user ?? state.user);
    const usuario = usuarioFromStore ?? {};

    const cambiarOpcion = (opcion: string) => {
        setOpcionElegida(opcion)
    }

    const opcionRef = useRef(opcionElegida);
    useEffect(() => { opcionRef.current = opcionElegida }, [opcionElegida]);

    useEffect(() => {
        let cancelled = false;

        const cargaInicialPagos = async () => {
            // Si no hay token, no intento la petición (evita llamadas con Authorization vacío)
            if (!usuario?.token) {
                // si querés mostrar un mensaje de login: toast.error('Sesión no iniciada')
                setLoading(false);
                setPagos([]);
                return;
            }

            try {
                setLoading(true)
                setError(false)
                const res = await fetch(`${import.meta.env.VITE_APIBASE}/api/pagosPendientes/getByEstado/${opcionElegida}`, {
                    headers: {
                        'Authorization': `Bearer ${usuario.token}`
                    }
                })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const data = await res.json()
                if (!cancelled) setPagos(data)
                if (!cancelled) setLoading(false)
            } catch (err) {
                if (!cancelled) {
                    setError(true)
                    setLoading(false)
                    console.error("Error cargaInicialPagos:", err)
                }
            }
        }

        cargaInicialPagos()

        return () => { cancelled = true }
    }, [opcionElegida, usuario?.token]) // RE-INTENTA cuando el token llegue al store o cambie

    const navigate = useNavigate()

    /* WebSockets: conectar una sola vez y suscribirse a save y update.
       Incluyo connectHeaders Authorization si existe token. */
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
                connectHeaders: usuario?.token ? { Authorization: `Bearer ${usuario.token}` } : undefined
            });

            cliente.onConnect = () => {
                if (isCleaningUp) return;

                console.log("Stomp conectado");
                setConectado(true);

                // SUBSCRIBE - SAVE
                try {
                    subsSave = cliente!.subscribe("/topic/pagosPendientes/save", (message: IMessage) => {
                        try {
                            const payload = JSON.parse(message.body) as PagoPendienteResponseDTO;
                            if (!payload?.id) return;
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

                // SUBSCRIBE - UPDATE
                try {
                    subsUpdate = cliente!.subscribe("/topic/pagosPendientes/update", (message: IMessage) => {
                        try {
                            const payload = JSON.parse(message.body) as PagoPendienteResponseDTO;
                            if (!payload?.id) return;

                            setPagos(prev => {
                                const estadoPayload = String(payload.estadoPagosPendientes).toUpperCase();
                                const filtro = String(opcionRef.current).toUpperCase();

                                if (estadoPayload === filtro) {
                                    const existe = prev.some(p => p.id === payload.id);
                                    if (existe) {
                                        return prev.map(p => p.id === payload.id ? payload : p);
                                    } else {
                                        return [payload, ...prev];
                                    }
                                } else {
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

        // Si no tenemos token, igualmente podemos conectar si tu WS no requiere auth;
        // si sí requiere auth, el connectHeaders anterior usará token cuando exista.
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
    }, [usuario?.token]); // si el token cambia, reconectamos (útil si se loguea el user)

    // Handler al click en fila: si está PENDIENTE -> iniciar, si no -> navegar directamente.
    const handleOpenPago = async (pago: PagoPendienteResponseDTO) => {
        if (!pago?.id) return;
        if (actionLoading) return; // ya hay una acción en curso

        const uidEmpleado = usuario?.uid ?? null;
        const token = usuario?.token ?? null;

        if (!uidEmpleado || !token) {
            toast.error('UID o token de empleado no encontrado en el store. Revisa el login o el state de Redux.');
            console.error('Usuario desde store:', usuario);
            return;
        }

        // Si el pago ya no está en PENDIENTE localmente, no llamamos al endpoint iniciar.
        const estadoLocal = String(pago.estadoPagosPendientes ?? '').toUpperCase();
        if (estadoLocal !== 'PENDIENTE') {
            // actualizar localmente (por si vino stale) y navegar
            navigate(`/TransaccionFinal/${pago.id}`);
            return;
        }

        // Si está PENDIENTE, llamamos al iniciar
        setActionLoading(pago.id);
        try {
            const url = `${import.meta.env.VITE_APIBASE}/api/pagosPendientes/iniciar/${pago.id}?uidEmpleado=${encodeURIComponent(uidEmpleado)}`;
            const res = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                // leo body del error (json o texto)
                const contentType = res.headers.get('content-type') ?? '';
                const body = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => null);
                console.error('Error iniciar pago - status:', res.status, 'body:', body);

                // Si el backend responde que ya no está en PENDIENTE (p.ej. 500 con ese mensaje),
                // intentamos traer el pago actualizado y navegar.
                if (res.status >= 500) {
                    try {
                        const fetchPago = await fetch(`${import.meta.env.VITE_APIBASE}/api/pagosPendientes/getById/${pago.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (fetchPago.ok) {
                            const pagoActualizado = await fetchPago.json();
                            setPagos(prev => prev.map(p => p.id === pagoActualizado.id ? pagoActualizado : p));
                            navigate(`/TransaccionFinal/${pago.id}`);
                            toast('El pago ya no estaba en PENDIENTE. Abriendo transacción con datos actualizados.', { icon: 'ℹ️' });
                            return;
                        }
                    } catch (errFetchPago) {
                        console.error('No se pudo recuperar pago tras 500:', errFetchPago);
                    }
                }

                toast.error(`No se pudo iniciar el pago (HTTP ${res.status}). Revisa consola.`);
                return;
            }

            const actualizado: PagoPendienteResponseDTO = await res.json();
            console.log('Pago iniciado:', actualizado);

            // Actualizar lista local: reemplazar o agregar
            setPagos(prev => prev.map(p => p.id === actualizado.id ? actualizado : p));

            // Navegar a la pantalla de la transacción
            navigate(`/TransaccionFinal/${pago.id}`);
        } catch (err) {
            console.error('Error iniciando pago:', err);
            toast.error('No se pudo iniciar el pago. Revisa la consola o CORS.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            <UsuarioHeader />
            <main className='bg-secondary min-h-screen pt-15'>

                <div className='flex justify-around'>
                    <button onClick={() => cambiarOpcion("PENDIENTE")} className='cursor-pointer px-6 bg-primary text-white rounded-2xl my-4 py-2 hover:scale-105 duration-200'>Pendientes</button>
                    <button onClick={() => cambiarOpcion("INICIADO")} className='cursor-pointer px-6 bg-primary text-white rounded-2xl my-4 py-2 hover:scale-105 duration-200'>Iniciados</button>
                    <button onClick={() => cambiarOpcion("COMPLETADO")} className='cursor-pointer px-6 bg-primary text-white rounded-2xl my-4 py-2 hover:scale-105 duration-200'>Finalizados</button>
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
                                <tr
                                    key={pago.id}
                                    className={`bg-tertiary h-15 text-center hover:bg-primary cursor-pointer transition-colors ${actionLoading === pago.id ? 'opacity-60 pointer-events-none' : ''}`}
                                    onClick={() => handleOpenPago(pago)}
                                >
                                    <td className='px-4 py-2'>{pago.id}</td>
                                    <td className='px-4 py-2'>{pago.propietario?.nombreCompleto ?? '—'}</td>
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
