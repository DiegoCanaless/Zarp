// src/pages/CrearPropiedad.tsx
import { Footer } from "../../components/layout/Footer"
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader"
import { Formik, Form, Field, ErrorMessage, getIn } from 'formik';
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary";
import Select from "react-select";

// Iconos
import { MdAdd, MdOutlineRemove } from "react-icons/md";
import { FaTimes } from "react-icons/fa";


// Mapa
import 'leaflet/dist/leaflet.css';
import MapaSelector from "../../components/ui/MapaSelector";

// Interfaces
import type { TipoPropiedadResponseDTO } from "../../types/entities/tipoPropiedad/TipoPropiedadResponseDTO";
import type { TipoPersonaResponseDTO } from "../../types/entities/tipoPersona/TipoPersonaResponseDTO";
import type { AmbienteResponseDTO } from "../../types/entities/ambiente/AmbienteResponseDTO";
import type { CaracteristicaResponseDTO } from "../../types/entities/caracteristica/CaracteristicaResponseDTO";

// Schemas e initial values importados
import { propiedadInitialValues, schemas } from '../../schemas/schemasPropiedad';
import { Provincia } from "../../types/enums/Provincia";

const CrearPropiedad = () => {
    const [paso, setPaso] = useState<number>(1);
    const [tipoPropiedades, setTipoPropiedades] = useState<TipoPropiedad[]>([]);
    const [tipoPersonas, setTipoPersonas] = useState<TipoPersonaResponseDTO>();
    const [ambientes, setAmbientes] = useState<AmbienteResponseDTO>();
    const [caracteristicas, setCaracteristicas] = useState<CaracteristicaResponseDTO>();
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const usuario = useSelector((state: any) => state.user);


    const [numeroElegido, setNumeroElegido] = useState<number>(1);

    function avanzarPaso() {
        if (paso !== 6) {
            setPaso(paso + 1);
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propiedadesRes, personasRes, ambientesRes, caracteristicasRes] = await Promise.all([
                    fetch('http://localhost:8080/api/tipoPropiedades'),
                    fetch('http://localhost:8080/api/tipoPersona'),
                    fetch('http://localhost:8080/api/ambientes'),
                    fetch('http://localhost:8080/api/caracteristicas')
                ]);

                const tipoPropiedadesres: TipoPropiedad[] = await propiedadesRes.json();
                const tipoPersonasres: TipoPersonaResponseDTO = await personasRes.json();
                const Ambientesres: AmbienteResponseDTO = await ambientesRes.json();
                const caracteristicasres: CaracteristicaResponseDTO = await caracteristicasRes.json();

                setTipoPropiedades(tipoPropiedadesres);
                setTipoPersonas(tipoPersonasres);
                setAmbientes(Ambientesres);
                setCaracteristicas(caracteristicasres);

            } catch (error) {
                setError('Error al cargar los datos');
            }
        };

        fetchData();
    }, []);


    const camposPorPaso = [
        ['nombre', 'precioPorNoche', 'descripcion'],
        ["direccion.calle", "direccion.numero", "direccion.localidad", "direccion.codigoPostal", "direccion.provincia", "direccion.latitud",],
        ["tipoPropiedadId", "detalleTipoPersonas", "detalleCaracteristicas", "detalleAmbientes"],
    ];

    const provinciaOptions = Object.entries(Provincia).map(([key, value]) => ({
        value,
        label: key.replace(/_/g, " "), // Ej: "BUENOS_AIRES" -> "BUENOS AIRES"
    }));

    type TipoPropiedad = { id: number; denominacion: string }

    const tipoPropiedadesOptions = useMemo(
        () => (tipoPropiedades ? tipoPropiedades.map(op => ({
            value: op.id,
            label: op.denominacion
        })) : []),
        [tipoPropiedades]
    );




    return (
        <>
            <UsuarioHeader />
            <main className="bg-secondary min-h-screen pt-20 px-5 text-white">
                <h1 className="text-center font-medium text-lg mb-5">Creacion de Propiedad</h1>

                <span className="text-white/80 text-xs">Paso {paso} de 4</span>
                <div className="h-2 w-full bg-gray-500 rounded-full" >
                    <div className="h-2 rounded-full bg-blue-400 transition-all duration-300"
                        style={{ width: `${(paso / 4) * 100}%` }} />
                </div>

                <Formik
                    initialValues={propiedadInitialValues}
                    validationSchema={schemas[paso - 1]}
                    validateOnMount
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                >
                    {({ validateForm, setTouched, setFieldValue, values, isValid }) => (
                        <>
                            <Form className="mt-10">
                                {paso === 1 && (
                                    <>
                                        <div className="flex w-full flex-col gap-4">
                                            <div className="flex w-full flex-col">
                                                <label htmlFor="nombre" className="text-xs text-white/80 mb-1">Nombre de la Propiedad</label>
                                                <Field placeholder="Cabaña Lago Azul" type="text" name="nombre" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="nombre" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label htmlFor="precioPorNoche" className="text-xs text-white/80 mb-1">Precio por Noche (ARS)</label>
                                                <Field placeholder="1000" type="number" name="precioPorNoche" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="precioPorNoche" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label htmlFor="descripcion" className="text-xs text-white/80 mb-1">Descripción de la propiedad</label>
                                                <Field placeholder="Gran Casa de Campo" as="textarea" name="descripcion" id="descripcion" className="bg-tertiary px-2 py-2 mt-1 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 border border-black/50 focus:border-transparent transition-all duration-200 active:bg-white/15   field-sizing-content min-h-20" />
                                                <ErrorMessage name="descripcion" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {paso === 2 && (
                                    <div className="flex w-full flex-col gap-4">
                                        <div className="mb-2">
                                            <label className="text-xs text-white/80 mb-1">Ubicación en el mapa:</label>
                                            <MapaSelector
                                                value={
                                                    values.direccion.latitud !== 0 && values.direccion.longitud !== 0
                                                        ? { lat: values.direccion.latitud, lng: values.direccion.longitud }
                                                        : null
                                                }
                                                onChange={pos => {
                                                    setFieldValue("direccion.latitud", pos.lat);
                                                    setFieldValue("direccion.longitud", pos.lng);
                                                    console.log('Marcador:', pos); // Debug
                                                }}
                                            />
                                            <div className="text-xs mt-1 text-white/60">Haz click en el mapa para marcar la ubicación.</div>
                                            <ErrorMessage name="direccion.latitud" component="div" className="text-red-500 text-sm mt-1" />
                                            <ErrorMessage name="direccion.longitud" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Provincia (react-select) */}
                                        <div className="flex w-full flex-col">
                                            <label className="text-xs text-white/80 mb-1">Provincia:</label>
                                            <Select
                                                options={provinciaOptions}
                                                value={
                                                    provinciaOptions.find(o => o.value === values.direccion.provincia) || null
                                                }
                                                onChange={opt => setFieldValue('direccion.provincia', opt?.value ?? '')}
                                                placeholder="Seleccioná una provincia…"
                                                styles={{
                                                    menu: (provided) => ({ ...provided, maxHeight: 190, overflowY: 'auto' }),
                                                }}
                                                className="text-black"
                                            />
                                            <ErrorMessage name="direccion.provincia" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Localidad */}
                                        <div className="flex w-full flex-col">
                                            <label className="text-xs text-white/80 mb-1">Localidad:</label>
                                            <Field placeholder="Godoy Cruz" type="text" name="direccion.localidad" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                            <ErrorMessage name="direccion.localidad" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Código Postal */}
                                        <div className="flex w-full flex-col">
                                            <label className="text-xs text-white/80 mb-1">Código Postal:</label>
                                            <Field placeholder="5501" type="text" name="direccion.codigoPostal" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                            <ErrorMessage name="direccion.codigoPostal" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Calle */}
                                        <div className="flex w-full flex-col">
                                            <label className="text-xs text-white/80 mb-1">Calle de la Propiedad</label>
                                            <Field placeholder="Av. Falsa" type="text" name="direccion.calle" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                            <ErrorMessage name="direccion.calle" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Número */}
                                        <div className="flex w-full flex-col">
                                            <label className="text-xs text-white/80 mb-1">Número de la Propiedad</label>
                                            <Field placeholder="555" type="number" name="direccion.numero" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                            <ErrorMessage name="direccion.numero" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                    </div>
                                )}

                                {paso === 3 && (
                                    <div className="flex w-full flex-col gap-4">
                                        <div className="mb-2">
                                            <label htmlFor="tipoPropiedadId" className="text-xs text-white/80 mb-1">Tipo de Propiedad:</label>
                                            <Select options={tipoPropiedadesOptions} value={tipoPropiedadesOptions.find(o => o.value === values.tipoPropiedadId) || null} onChange={opt => setFieldValue('tipoPropiedadId', opt?.value ?? '')} placeholder="Seleccioná el tipo de propiedad"
                                                styles={{
                                                    menu: (provided) => ({ ...provided, maxHeight: 190, overflowY: 'auto' }),
                                                }}
                                                className="text-black"
                                            />
                                            <ErrorMessage name="tipoPropiedadId" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div className="mb-2">
                                            <label htmlFor="detalleTipoPersonas" className="text-xs text-white/80 mb-1">Huéspedes:</label>
                                            {tipoPersonas && tipoPersonas.map((tipoPersona: any, idx: number) => {
                                                const personaFormik = values.detalleTipoPersonas.find((p: any) => p.tipoPersonaId === tipoPersona.id);
                                                const cantidad = personaFormik ? personaFormik.cantidad : 0;

                                                const setCantidad = (nuevaCantidad: number) => {
                                                    if (personaFormik) {
                                                        const nuevoArray = values.detalleTipoPersonas.map((p: any) =>
                                                            p.tipoPersonaId === tipoPersona.id ? { ...p, cantidad: nuevaCantidad } : p
                                                        );
                                                        setFieldValue('detalleTipoPersonas', nuevoArray);
                                                    } else {
                                                        setFieldValue('detalleTipoPersonas', [...values.detalleTipoPersonas, { tipoPersonaId: tipoPersona.id, cantidad: nuevaCantidad }]);
                                                    }
                                                };

                                                return (
                                                    <div key={tipoPersona.id} className="flex w-full items-center px-3 py-3 rounded mb-4 justify-between w-full bg-tertiary">
                                                        <MdOutlineRemove size={30} className="cursor-pointer" onClick={() => setCantidad(Math.max(cantidad - 1, 0))} />
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-lg">{cantidad}</p>
                                                            <p>{tipoPersona.denominacion}</p>
                                                        </div>
                                                        <MdAdd size={30} className="cursor-pointer" onClick={() => setCantidad(cantidad + 1)} />
                                                    </div>
                                                );
                                            })}
                                            <ErrorMessage name="detalleTipoPersonas" component="div" className="text-red-500 text-sm mt-1"
                                            />
                                        </div>




                                        <div className="mb-2">
                                            <label htmlFor="detalleAmbientes" className="text-xs text-white/80 mb-1">Ambientes:</label>
                                            {ambientes && ambientes.map((ambiente: any) => {
                                                // Busca si ya existe en el array de Formik
                                                const ambienteFormik = values.detalleAmbientes.find((a: any) => a.ambienteId === ambiente.id);
                                                const cantidad = ambienteFormik ? ambienteFormik.cantidad : 0;

                                                // Función para actualizar la cantidad en Formik
                                                const setCantidad = (nuevaCantidad: number) => {
                                                    if (ambienteFormik) {
                                                        const nuevoArray = values.detalleAmbientes.map((a: any) =>
                                                            a.ambienteId === ambiente.id ? { ...a, cantidad: nuevaCantidad } : a
                                                        );
                                                        setFieldValue('detalleAmbientes', nuevoArray);
                                                    } else {
                                                        setFieldValue('detalleAmbientes', [...values.detalleAmbientes, { ambienteId: ambiente.id, cantidad: nuevaCantidad }]);
                                                    }
                                                };

                                                return (
                                                    <div key={ambiente.id} className="flex w-full items-center px-3 py-3 rounded mb-4 justify-between w-full bg-tertiary">
                                                        <MdOutlineRemove size={30} className="cursor-pointer" onClick={() => setCantidad(Math.max(cantidad - 1, 0))} />
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-lg">{cantidad}</p>
                                                            <p>{ambiente.denominacion}</p>
                                                        </div>
                                                        <MdAdd size={30} className="cursor-pointer" onClick={() => setCantidad(cantidad + 1)} />
                                                    </div>
                                                );
                                            })}
                                            <ErrorMessage name="detalleAmbientes" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div className="mb-2">
                                            <label htmlFor="detalleCaracteristicas" className="text-xs text-white/80 mb-1">
                                                Características:
                                            </label>
                                            <Select
                                                isMulti
                                                options={
                                                    caracteristicas
                                                        ? caracteristicas.map((c: any) => ({
                                                            value: c.id,
                                                            label: c.denominacion,
                                                        }))
                                                        : []
                                                }
                                                value={
                                                    caracteristicas
                                                        ? values.detalleCaracteristicas
                                                            .map((c: any) => {
                                                                const carac = caracteristicas.find((x: any) => x.id === c.caracteristicaID);
                                                                return carac
                                                                    ? { value: carac.id, label: carac.denominacion }
                                                                    : null;
                                                            })
                                                            .filter(Boolean)
                                                        : []
                                                }
                                                onChange={(selectedOptions: any) => {
                                                    // Actualiza el array en Formik
                                                    setFieldValue(
                                                        "detalleCaracteristicas",
                                                        selectedOptions.map((opt: any) => ({
                                                            caracteristicaID: opt.value,
                                                        }))
                                                    );
                                                }}
                                                placeholder="Seleccioná características..."
                                                styles={{
                                                    menu: (provided) => ({
                                                        ...provided,
                                                        maxHeight: 190,
                                                        overflowY: "auto",
                                                    }),
                                                }}
                                                className="text-black"
                                            />

                                            {/* Listado debajo del select con la opción de eliminar */}
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {values.detalleCaracteristicas.map((c: any, idx: number) => {
                                                    const carac =
                                                        caracteristicas && caracteristicas.find((x: any) => x.id === c.caracteristicaID);
                                                    return (
                                                        carac && (
                                                            <div
                                                                key={carac.id}
                                                                className="bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-2"
                                                            >
                                                                {carac.denominacion}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFieldValue(
                                                                            "detalleCaracteristicas",
                                                                            values.detalleCaracteristicas.filter(
                                                                                (item: any) => item.caracteristicaID !== carac.id
                                                                            )
                                                                        );
                                                                    }}
                                                                    className="ml-1 text-red-500 hover:text-red-700"
                                                                    aria-label="Eliminar característica"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        )
                                                    );
                                                })}
                                            </div>
                                            <ErrorMessage
                                                name="detalleCaracteristicas"
                                                component="div"
                                                className="text-red-500 text-sm mt-1"
                                            />
                                        </div>







                                    </div>
                                )}



                            </Form>

                            {/* Botones dentro del render de Formik */}
                            <div className="flex w-full justify-evenly mt-5 pb-10">
                                <ButtonSecondary text="Anterior" color="text-white" className="border" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-transparent" maxWidth="w-[90px]" onClick={() => paso !== 1 && setPaso(paso - 1)} />
                                <ButtonSecondary text="Siguiente" color="text-white" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-blue-500" maxWidth="w-[90px]"
                                    onClick={async () => {
                                        const errors = await validateForm();
                                        const fields = camposPorPaso[paso - 1];

                                        const stepHasErrors = fields.some((f) => !!getIn(errors, f));

                                        if (stepHasErrors) {
                                            await setTouched(
                                                Object.fromEntries(fields.map((f) => [f, true]))
                                            );
                                            return;
                                        }
                                        avanzarPaso();
                                    }}
                                />
                            </div>
                        </>
                    )}
                </Formik>

            </main>
            <Footer />
        </>
    );
}

export default CrearPropiedad;