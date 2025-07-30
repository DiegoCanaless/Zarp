export const VerificacionPropiedad = {
  PENDIENTE: "PENDIENTE",
  APROBADA: "APROBADA",
  RECHAZADA: "RECHAZADA",
} as const;

export type VerificacionPropiedad = typeof VerificacionPropiedad[keyof typeof VerificacionPropiedad];