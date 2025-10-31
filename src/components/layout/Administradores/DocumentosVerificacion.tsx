import { useEffect, useState } from "react";
import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";
import { Client } from '@stomp/stompjs';

const DocumentosVerificacion = () => {

  const [verificaciones, setVerificaciones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [conectado, setConectado] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true)

  useEffect(() => {
    const cargarVerificacionesIniciales = async () => {
      try {
        const res = await fetch(`${import.meta.env.APIBASE}/api/verificacionClientes/activas`);
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

        cliente.subscribe("/topic/verificacionClientes/save", (message) => {
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
    <>

      <div className="flex flex-col px-20 min-h-screen">
        <h1 className="mt-5 text-white text-lg mb-5">Verificacion de Documentos</h1>

        {cargando && <p className="text-center">Cargando Verificaciones...</p>}
        {error && <p className="text-center text-red-600">Error: {error}</p>}
        {!cargando && !error && verificaciones.length === 0 && (
          <p className="text-center">No hay verificaciones</p>
        )}

        {verificaciones
          .filter((elemento) => elemento.activo === true)
          .map((elemento) => (
            <Link to="/VerificarDocumento" state={{ verificacion: elemento }} key={elemento.id} className="mb-5 w-full flex justify-between items-center h-12 rounded-lg text-white bg-tertiary">
              <p className="ml-10">Verificacion de: {elemento.cliente.nombreCompleto}</p>
              <MdArrowForward className="mr-10" size={22} />
            </Link>
          ))}

      </div>

    </>
  )
}

export default DocumentosVerificacion