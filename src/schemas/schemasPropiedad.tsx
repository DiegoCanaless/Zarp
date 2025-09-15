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
    detalleTipoPersonas: [] as { tipoPersonaId: number; cantidad: number }[],
    detalleCaracteristicas: [] as { caracteristicaID: number }[],
    detalleImagenes: [
        { imgPrincipal: true, imagen: { urlImagen: "" } },
        { imgPrincipal: false, imagen: { urlImagen: "" } },
        { imgPrincipal: false, imagen: { urlImagen: "" } },
        { imgPrincipal: false, imagen: { urlImagen: "" } },
    ],
    detalleAmbientes: [] as { ambienteId: number; cantidad: number }[],
};

export const Schema1 = Yup.object().shape({
    nombre: Yup.string().required('El nombre es obligatorio'),
    descripcion: Yup.string().required('La descripción es obligatoria'),
    precioPorNoche: Yup.number()
        .min(1, 'El precio debe ser mayor a 0')
        .required('El precio es obligatorio'),
});

const provinciasEnumValues = Object.values(Provincia).filter(v => typeof v === 'string') as Provincia[];

export const Schema2 = Yup.object().shape({
    direccion: Yup.object().shape({
        calle: Yup.string().required('La calle es obligatoria'),
        numero: Yup.string().required('El número es obligatorio'),
        piso: Yup.string().required('El piso es obligatorio'),
        departamento: Yup.string().required('El departamento es obligatorio'),
        localidad: Yup.string().required('La localidad es obligatoria'),
        provincia: Yup.mixed<Provincia>()
            .oneOf(provinciasEnumValues, 'Seleccioná una provincia válida')
            .required('La provincia es obligatoria'),
        codigoPostal: Yup.string().required('El código postal es obligatorio'),
        latitud: Yup.number().notOneOf([0], 'Debes marcar la ubicación en el mapa').required(),
        longitud: Yup.number().notOneOf([0], 'Debes marcar la ubicación en el mapa').required(),
    }),
});


export const Schema3 = Yup.object().shape({
    tipoPropiedadId: Yup.number()
        .min(1, 'Debe seleccionar un tipo de propiedad')
        .required('El tipo de propiedad es obligatorio'),

    detalleTipoPersonas: Yup.array()
        .of(
            Yup.object().shape({
                cantidad: Yup.number().min(0, 'La cantidad debe ser al menos 0'),
                tipoPersonaId: Yup.number().min(1, 'Debe seleccionar un tipo de persona'),
            })
        )
        .test(
            'at-least-one-person',
            'Debe haber al menos un huésped',
            (arr) => !!arr && arr.some((p: any) => (p?.cantidad ?? 0) > 0)
        ),

    detalleAmbientes: Yup.array()
        .of(
            Yup.object().shape({
                cantidad: Yup.number().min(1, 'La cantidad debe ser al menos 1'),
                ambienteId: Yup.number().min(1, 'Debe seleccionar un ambiente'),
            })
        )
        .test(
            'at-least-one-room',
            'Debe haber al menos un ambiente',
            (arr) => !!arr && arr.some((a: any) => (a?.cantidad ?? 0) > 0)
        )
        .min(1, 'Debe agregar al menos un ambiente'),

    detalleCaracteristicas: Yup.array()
        .of(
            Yup.object().shape({
                caracteristicaID: Yup.number()
            })
        )
});

export const Schema4 = Yup.object().shape({
    detalleImagenes: Yup.array()
        .of(
            Yup.object().shape({
                imagen: Yup.object().shape({
                    urlImagen: Yup.string().trim().url('URL inválida').nullable().default("").optional(),
                }),
                imgPrincipal: Yup.boolean().required(),
            })
        )
        .length(4, 'Deben ser exactamente 4 imágenes (slots)')
        .test('one-principal', 'Debes elegir exactamente una imagen principal', (arr: any[]) => {
            if (!arr) return false;
            const count = arr.filter((x) => !!x?.imgPrincipal).length;
            return count === 1;
        })
        .test('at-least-one-url', 'Debes subir al menos una imagen', (arr: any[]) => {
            if (!arr) return false;
            return arr.some((x) => !!x?.imagen?.urlImagen && x.imagen.urlImagen.trim() !== "");
        }),
});

export const schemas = [Schema1, Schema2, Schema3, Schema4];
