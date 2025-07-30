export const Estado = {
  PENDIENTE: "PENDIENTE",
  RESERVADA: "RESERVADA",
  ACTIVA: "ACTIVA",
  FINALIZADA: "FINALIZADA",
  CANCELADA: "CANCELADA",
} as const;

export type Estado = typeof Estado[keyof typeof Estado];