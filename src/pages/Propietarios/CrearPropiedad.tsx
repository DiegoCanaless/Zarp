// src/pages/CrearPropiedad.tsx
import { Footer } from "../../components/layout/Footer"
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary";
import Select from "react-select";

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
    const [tipoPropiedades, setTipoPropiedades] = useState<TipoPropiedadResponseDTO>();
    const [tipoPersonas, setTipoPersonas] = useState<TipoPersonaResponseDTO>();
    const [ambientes, setAmbientes] = useState<AmbienteResponseDTO>();
    const [caracteristicas, setCaracteristicas] = useState<CaracteristicaResponseDTO>();
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const usuario = useSelector((state: any) => state.user);

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

                const tipoPropiedadesres: TipoPropiedadResponseDTO = await propiedadesRes.json();
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
        ["calle", "numeroCalle", "Localidad", "codigoPostal", "Provincia"]
        // etc.
    ];

    const provinciaOptions = Object.entries(Provincia).map(([key, value]) => ({
        value,
        label: key.replace(/_/g, " "), // Ej: "BUENOS_AIRES" -> "BUENOS AIRES"
    }));

    return (
        <>
            <UsuarioHeader />
            <main className="bg-secondary min-h-screen pt-20 px-5 text-white">
                <h1 className="text-center font-medium text-lg mb-5">Creacion de Propiedad</h1>

                <span className="text-white/80 text-xs">Paso {paso} de 6</span>
                <div className="h-2 w-full bg-gray-500 rounded-full" >
                    <div className="h-2 rounded-full bg-blue-400 transition-all duration-300"
                        style={{ width: `${(paso / 6) * 100}%` }} />
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
                                    <>
                                        <div className="flex w-full flex-col gap-4">
                                            <div className="flex w-full flex-col">
                                                <label htmlFor="calle" className="text-xs text-white/80 mb-1">Calle de la Propiedad</label>
                                                <Field placeholder="Av.Falsa" type="text" name="calle" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label htmlFor="numeroCalle" className="text-xs text-white/80 mb-1">Numero de la Propiedad</label>
                                                <Field placeholder="555" type="number" name="numeroCalle" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label htmlFor="Localidad" className="text-xs text-white/80 mb-1">Localidad:</label>
                                                <Field placeholder="Godoy Cruz" type="text" name="Localidad" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="Localidad" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label htmlFor="codigoPostal" className="text-xs text-white/80 mb-1">Codigo Postal:</label>
                                                <Field placeholder="2451" type="number" name="codigoPostal" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="codigoPostal" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>


                                            <div className="flex w-full flex-col">
                                                <label htmlFor="Provincia" className="text-xs text-white/80 mb-1">Localidad:</label>
                                                <Field name="Provincia" as="select" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm">
                                                    
                                                </Field>
                                                <ErrorMessage name="Provincia" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>







                                        </div>
                                    </>
                                )}
                            </Form>

                            {/* Botones dentro del render de Formik */}
                            <div className="flex w-full justify-evenly mt-5 pb-10">
                                <ButtonSecondary text="Anterior" color="text-white" className="border" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-transparent" maxWidth="w-[90px]" onClick={() => paso !== 1 && setPaso(paso - 1)} />
                                <ButtonSecondary text="Siguiente" color="text-white" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-blue-500" maxWidth="w-[90px]" disabled={!isValid}
                                    onClick={async () => {
                                        if (isValid) {
                                            avanzarPaso();
                                        } else {
                                            await setTouched(
                                                Object.fromEntries(camposPorPaso[paso - 1].map((campo) => [campo, true]))
                                            );
                                        }
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