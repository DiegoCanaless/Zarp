import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ConversacionResponseDTO } from "../../types/entities/conversacion/ConversacionResponseDTO";
import toast from "react-hot-toast";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { useSelector } from "react-redux";
import { IoMdSend } from "react-icons/io";
import { Client } from '@stomp/stompjs';

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const [conversacion, setConversacion] = useState<ConversacionResponseDTO | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string>("");
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [conectado, setConectado] = useState<boolean>(false);

  const usuario = useSelector((state: any) => state.user)

  const mensajesRef = useRef<HTMLUListElement>(null)

  const scrollAlFinal = () => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }




  useEffect(() => {
    const traerConversacion = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_APIBASE}/api/conversaciones/getById/${id}`)
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data: ConversacionResponseDTO = await response.json()

        setConversacion(data)
        setCargando(false)
        console.log(data)


      } catch (err) {
        console.log(err)
      } finally {
        setCargando(false)
      }
    }

    traerConversacion()

  }, [id])

  const enviarMensaje = async () => {
    try {
      const msg = mensaje.trim();
      if (!msg) return;

      if (!conversacion) {
        toast.error("Conversacion no cargada.")
        return
      }

      const response = await fetch(`${import.meta.env.VITE_APIBASE}/api/conversaciones/agregar-mensaje/${conversacion.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contenido: msg,
          emisorId: usuario.id
        })
      })

      setMensaje("")


      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }


    } catch (error) {
      console.log(error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  useEffect(() => {
    if (!usuario.id) return

    const cliente = new Client({
      brokerURL: import.meta.env.VITE_WS_URL,
      reconnectDelay: 5000,
      debug: (msg) => console.log({ "STOMP": msg })
    })

    cliente.onConnect = () => {
      console.log("STOMP CONECTADO")
      setConectado(true);

      cliente.subscribe(`/topic/conversaciones/update/${usuario.id}`, (message) => {
        try {
          const payload = JSON.parse(message.body);
          console.log("Mensaje WS recibido: ", payload)

          if (payload && payload.id && conversacion && payload.id === conversacion.id) {
            setConversacion(prev => {
              if (!prev) return prev;

              if (payload && payload.mensajes) {
                return payload
              }
              return prev
            });
          }
        } catch (error) {
          console.error("Error parseando mensaje WS:", error)
        }
      });
    };


    cliente.onStompError = (frame) => {
      console.log("Stomp error : ", frame)
    }

    cliente.onDisconnect = () => {
      setConectado(false)
      console.log("STOMP desconectado");
    }

    cliente.activate()

    return () => {
      cliente.deactivate()
    }

  }, [usuario.id, conversacion?.id])


  useEffect(() => {
    scrollAlFinal();
  }, [conversacion?.mensajes.length]);


  return (
    <>
      <UsuarioHeader />

      <main className="bg-secondary min-h-screen pt-15 text-white">
        {cargando ? (
          <div>Cargando conversación...</div>
        ) : error || !conversacion ? (
          <div>No se pudo cargar la conversación.</div>
        ) : (
          <div className="flex flex-col items-center gap-5 lg:px-30">
            <div className="fixed top-15 z-10 left-0 bg-primary w-full h-15 px-5 flex items-center gap-3">
              <img src={conversacion.cliente1.id === usuario.id ? conversacion.cliente2.fotoPerfil?.urlImagen : conversacion.cliente1.fotoPerfil?.urlImagen} className="w-10 h-10" alt="" />
              <h1 className="text-lg font-bold">{conversacion.cliente1.id === usuario.id ? conversacion.cliente2.nombreCompleto : conversacion.cliente1.nombreCompleto}</h1>
            </div>
            <ul
              ref={mensajesRef}
              className="w-full pt-18 flex flex-col gap-3 px-4 overflow-y-auto overflow-x-hidden chat-scroll max-h-[calc(100vh-150px)]"
              style={{ paddingRight: 12 }}
            >
              {conversacion.mensajes.map((msg) => {
                const esMio = msg.emisor?.id === usuario.id;
                return (
                  <li key={msg.id} className={`flex items-end gap-2 transition-all duration-200 ${esMio ? "justify-end" : "justify-start"}`} >
                    {!esMio && (
                      <img src={msg.emisor?.fotoPerfil?.urlImagen} className="w-9 h-9 rounded-full object-cover shadow" alt={msg.emisor?.nombreCompleto} />
                    )}

                    <div className={`max-w-xs md:max-w-sm lg:max-w-md min-w-[70px] flex flex-col ${esMio ? "items-end" : "items-start"}`}>
                      {!esMio && (
                        <span className="text-xs text-gray-400 ml-1 mb-1">{msg.emisor?.nombreCompleto}</span>
                      )}
                      <p className={`
              px-4 py-2 rounded-2xl shadow-md break-words font-medium
              ${esMio ? "bg-tertiary text-white rounded-br-sm border border-tertiary" : "bg-primary/80 text-white rounded-bl-sm border border-primary/40"}
              hover:shadow-xl transition-transform
            `}>
                        {msg.contenido}
                      </p>
                    </div>

                    {esMio && (
                      <img src={msg.emisor?.fotoPerfil?.urlImagen} className="w-9 h-9 rounded-full object-cover shadow" alt={msg.emisor?.nombreCompleto} />
                    )}
                  </li>
                );
              })}
            </ul>

          </div>

        )}

        <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-between items-center text-gray-300 px-4 z-10 w-[90%] max-w-md h-12 bg-primary rounded-lg shadow-lg'>
          <input type="text" value={mensaje} onChange={(e) => setMensaje(e.target.value)} onKeyDown={handleKeyDown} id="mensajePersonal" placeholder="Escribe tu mensaje...." className="outline-none" />
          <button className="disabled:opacity-50" type="button" title={mensaje.trim() ? "Enviar" : "Escribe un mensaje"} disabled={!mensaje.trim()} onClick={enviarMensaje}><IoMdSend /></button>
        </div>
      </main>



    </>
  );
};

export default Chat;