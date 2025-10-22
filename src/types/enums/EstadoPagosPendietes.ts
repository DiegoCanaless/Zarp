export const EstadoPagosPendientes = {
  PENDIENTE: "PENDIENTE",
  INICIADO: "INICIADO",
  COMPLETADO: "COMPLETADO"
} as const;

export type EstadoPagosPendientes = typeof EstadoPagosPendientes[keyof typeof EstadoPagosPendientes];