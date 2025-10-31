// src/types/propiedadFormTypes.ts
export interface FormValues {
    nombre: string;
    descripcion: string;
    precioPorNoche: number;
    propietarioId: number;
    direccion: {
        calle: string;
        numero: string;
        piso: string;
        departamento: string;
        codigoPostal: string;
        localidad: string;
        provincia: string;
        latitud: number;
        longitud: number;
    };
    tipoPropiedadId: number;
    detalleTipoPersonas: {
        cantidad: number;
        tipoPersonaId: number;
    }[];
    detalleCaracteristicas: {
        caracteristicaId: number;
    }[];
    detalleImagenes: {
        imgPrincipal: boolean;
        imagen: {
            urlImagen: string;
        };
    }[];
    detalleAmbientes: {
        cantidad: number;
        ambienteId: number;
    }[];
}