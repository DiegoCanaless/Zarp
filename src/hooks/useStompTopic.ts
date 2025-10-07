import { useEffect, useRef } from "react";
import SockJS from "sockjs-client/dist/sockjs";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

type UseStompTopicOpts = {
  wsBaseUrl: string;                // p.ej: `${import.meta.env.VITE_APIBASE}/ws`
  topics: string[];                 // p.ej: ["/topic/propiedades/save", ...]
  onMessage: (topic: string, msg: IMessage) => void;
  debug?: boolean;
  headers?: Record<string, string>;
  heartbeatMs?: number;             // frecuencia de heartbeat (evita conexiones zombies)
  reconnectDelayMs?: number;        // delay entre reintentos de reconexión
};

export function useStompTopic({
  wsBaseUrl,
  topics,
  onMessage,
  debug = false,
  headers,
  heartbeatMs = 10000,
  reconnectDelayMs = 5000,
}: UseStompTopicOpts) {
  const clientRef = useRef<Client | null>(null);
  const subsRef = useRef<StompSubscription[]>([]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(wsBaseUrl),
      reconnectDelay: reconnectDelayMs,
      heartbeatIncoming: heartbeatMs,
      heartbeatOutgoing: heartbeatMs,
      connectHeaders: headers,
      debug: debug ? (str) => console.log("[STOMP]", str) : () => {},
    });

    client.onConnect = () => {
      // por si acaso, limpiamos subs previas
      subsRef.current.forEach((s) => s.unsubscribe());
      subsRef.current = [];

      topics.forEach((t) => {
        const sub = client.subscribe(t, (msg) => onMessage(t, msg));
        subsRef.current.push(sub);
      });
    };

    client.activate();
    clientRef.current = client;

    return () => {
      subsRef.current.forEach((s) => s.unsubscribe());
      subsRef.current = [];
      client.deactivate();
      clientRef.current = null;
    };
    // ojo: si cambia la lista de topics, re-suscribe
  }, [wsBaseUrl, topics.join("|")]);
}
