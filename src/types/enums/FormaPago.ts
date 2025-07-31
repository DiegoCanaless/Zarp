export const FormaPago = {
  MERCADO_PAGO: "MERCADO_PAGO",
  PAYPAL: "PAYPAL",
} as const;

export type FormaPago = typeof FormaPago[keyof typeof FormaPago];