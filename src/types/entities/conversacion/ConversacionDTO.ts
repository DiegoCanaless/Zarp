import type { MensajeDTO } from "../mensaje/MensajeDTO";

export interface ConversacionDTO {
  mensajes: MensajeDTO[];
  cliente1Id:number;
  cliente2Id:number; 
}