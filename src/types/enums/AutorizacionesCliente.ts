export const AutorizacionesCliente = {
    NINGUNA:"NINGUNA",
    MERCADO_PAGO:"MERCADO_PAGO",
    PAYPAL:"PAYPAL",
    AMBAS:"AMBAS"

} as const;

export type AutorizacionesCliente = typeof AutorizacionesCliente[keyof typeof AutorizacionesCliente];