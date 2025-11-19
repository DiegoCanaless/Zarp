import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Client } from '@stomp/stompjs';
import { useSelector } from "react-redux";


const PropiedadesVerificacion = () => {
    const [verificaciones, setVerificaciones] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [conectado, setConectado] = useState<boolean>(false);
    const [cargando, setCargando] = useState<boolean>(true)

    const usuario = useSelector((state: any) => state.user);

    useEffect(() => {
        const cargarVerificacionesIniciales = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades/aVerificar`, {
                    headers: {
                        'Authorization': `Bearer ${usuario.token}`
                    }
                });
                if (!res.ok) throw new Error("Error al cargar verificaciones");
                const data = await res.json();
                setVerificaciones(data);
                setCargando(false)
            } catch (err) {
                console.error(err);
                setCargando(false)
            }
        };

        cargarVerificacionesIniciales();
    }, []);

    useEffect(() => {
        const cliente = new Client({
            brokerURL: import.meta.env.VITE_WS_URL,
            debug: (str) => {
                console.log({ str })
            },
            reconnectDelay: 5000,

            onConnect: () => {
                console.log("Conectado al servidor")
                setConectado(true)

                cliente.subscribe("/topic/propiedades/save", (message) => {
                    console.log("Nueva verificacion creada")
                    const nuevaVerificacion = JSON.parse(message.body);
                    setVerificaciones(prev => [...prev, nuevaVerificacion])
                })
            },

            onDisconnect: () => {
                console.log("Desconectado del servidor")
                setConectado(false)
            },

            onStompError: (frame) => {
                console.error("Error Stromp:", frame)
                setError("Error de conexion WebSocket")
            }
        })

        cliente.activate()
        setStompClient(cliente);

        return () => {
            if (cliente) {
                cliente.deactivate()
            }
        }

    }, []);


    return (
        <div className="flex flex-col px-20 ">
            <h1 className="mt-5 text-white text-lg mb-5">Verificación de Propiedades</h1>

            {cargando && <p className="text-center">Cargando verificaciones...</p>}
            {error && <p className="text-center text-red-600">Error: {error}</p>}
            {!cargando && !error && verificaciones.length === 0 && (
                <p className="text-center">No hay verificaciones</p>
            )}

            {verificaciones
                .filter((element) => element.activo === true)
                .map((element) => {
                    // Buscar la imagen principal; si no hay, tomar la primera; si no hay ninguna, null
                    const principal =
                        element?.detalleImagenes?.find((d: any) => d?.imgPrincipal)?.imagen?.urlImagen ??
                        element?.detalleImagenes?.[0]?.imagen?.urlImagen ??
                        null;

                    return (
                        <Link
                            to="/VerificarPropiedad"
                            state={{ verificacion: element }}
                            key={element.id}
                            className="mb-5 w-full flex items-start gap-5 rounded-lg text-white bg-tertiary p-5"
                        >
                            <div className="flex flex-col flex-1">
                                <h3 className="text-lg">Verificación de: {element?.propietario?.nombreCompleto}</h3>
                                <p className="opacity-90">Descripción: {element?.descripcion}</p>
                            </div>

                            {principal ? (
                                <img src={principal} alt={element?.nombre ?? "Propiedad"} className="w-40 h-28 object-cover rounded-md shrink-0" loading="lazy" />
                            ) : (
                                <div className="w-40 h-28 bg-gray-700/40 rounded-md grid place-items-center shrink-0">
                                    <span className="text-sm opacity-70">Sin imagen</span>
                                </div>
                            )}

                        </Link>
                    );
                })}
        </div>
    );
};

export default PropiedadesVerificacion;
