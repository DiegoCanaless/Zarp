
export const Rol = {
  SUPERADMIN: "SUPERADMIN",
  EMPLEADO: "EMPLEADO",
  PROPIETARIO: "PROPIETARIO",
  CLIENTE: "CLIENTE",
} as const;

export type Rol = typeof Rol[keyof typeof Rol];