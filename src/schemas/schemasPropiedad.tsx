// src/schemas/propiedadSchemas.ts
import * as Yup from 'yup';
import { Provincia } from '../types/enums/Provincia';

export const propiedadInitialValues = {
    nombre: "",
    descripcion: "",
    precioPorNoche: 0,
    propietarioId: 0,
    direccion: {
        calle: "",
        numero: "",
        piso: "",
        departamento: "",
        codigoPostal: "",
        localidad: "",
        provincia: "",
        latitud: 0,
        longitud: 0,
    },
    tipoPropiedadId: 0,
    detalleTipoPersonas: [],
    detalleCaracteristicas: [],
    detalleImagenes: [
        {
            imgPrincipal: true,
            imagen: { urlImagen: "" }
        },
    ],
    detalleAmbientes: [],
};

// Schemas por paso
export const Schema1 = Yup.object().shape({
    nombre: Yup.string().required('El nombre es obligatorio'),
    descripcion: Yup.string().required('La descripción es obligatoria'),
    precioPorNoche: Yup.number()
        .min(1, 'El precio debe ser mayor a 0')
        .required('El precio es obligatorio'),
});

export const Schema2 = Yup.object().shape({
    direccion: Yup.object().shape({
        calle: Yup.string().required('La calle es obligatoria'),
        numero: Yup.string().required('El número es obligatorio'),
        localidad: Yup.string().required('La localidad es obligatoria'),
        provincia: Yup.string().required("La provincia es obligatoria"),
        codigoPostal: Yup.string().required('El código postal es obligatorio'),
    }),
});

export const Schema3 = Yup.object().shape({
    tipoPropiedadId: Yup.number()
        .min(1, 'Debe seleccionar un tipo de propiedad')
        .required('El tipo de propiedad es obligatorio'),
});

export const Schema4 = Yup.object().shape({
    detalleTipoPersonas: Yup.array()
        .of(
            Yup.object().shape({
                cantidad: Yup.number().min(1, 'La cantidad debe ser al menos 1'),
                tipoPersonaId: Yup.number().min(1, 'Debe seleccionar un tipo de persona'),
            })
        )
        .min(1, 'Debe agregar al menos un tipo de persona'),
});

export const Schema5 = Yup.object().shape({
    detalleAmbientes: Yup.array()
        .of(
            Yup.object().shape({
                cantidad: Yup.number().min(1, 'La cantidad debe ser al menos 1'),
                ambienteId: Yup.number().min(1, 'Debe seleccionar un ambiente'),
            })
        )
        .min(1, 'Debe agregar al menos un ambiente'),
});

export const Schema6 = Yup.object().shape({
    detalleImagenes: Yup.array()
        .of(
            Yup.object().shape({
                imagen: Yup.object().shape({
                    urlImagen: Yup.string().url('URL inválida').required('La URL de la imagen es obligatoria'),
                }),
            })
        )
        .min(1, 'Debe agregar al menos una imagen'),
});

export const schemas = [Schema1, Schema2, Schema3, Schema4, Schema5, Schema6];