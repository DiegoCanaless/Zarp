import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import toast from "react-hot-toast";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { uploadImageCloudinary } from "../../helpers/cloudinary";

type Caracteristica = { id: number; denominacion: string };
type ImagenDetalle = { imgPrincipal: boolean; imagen: { urlImagen: string } };
type PropiedadDTO = {
    id: number;
    nombre: string;
    descripcion: string;
    precioPorNoche: number;
    detalleCaracteristicas: Array<{ caracteristicaID?: number; caracteristica?: { id: number; denominacion: string } }>;
    detalleImagenes: ImagenDetalle[];
    // Campos adicionales que necesita el backend
    propietarioId?: number;
    tipoPropiedadId?: number;
    direccion?: any;
    cantidadHuespedes?: number;
    detalleAmbientes?: any[];
    detalleTipoPersonas?: any[];
    detalleResenias?: any[];
};

const validationSchema = Yup.object({
    nombre: Yup.string().trim().min(3).max(80).required("El nombre es requerido"),
    precioPorNoche: Yup.number().typeError("Debe ser un número")
        .min(0, "No puede ser negativo").required("Requerido"),
    descripcion: Yup.string().trim().min(10, "Mínimo 10 caracteres").required("Requerido"),
    detalleCaracteristicas: Yup.array().min(0), // Permitir array vacío
    detalleImagenes: Yup.array().of(
        Yup.object({
            imgPrincipal: Yup.boolean().required(),
            imagen: Yup.object({
                urlImagen: Yup.string().url().required("Falta la URL de imagen")
            }).required()
        })
    )
        .length(4, "Debe tener exactamente 4 imágenes")
        .test("al-menos-una", "Necesitas al menos una imagen", (arr) => (arr ?? []).some(i => i?.imagen?.urlImagen?.trim()))
        .test("una-principal", "Debe haber exactamente 1 imagen principal", (arr) => {
            const principalCount = (arr ?? []).filter(i => i?.imgPrincipal).length;
            return principalCount === 1;
        }),
});

const EditarPropiedad = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const usuario = useSelector((s: any) => s.user);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>([]);
    const [propiedad, setPropiedad] = useState<PropiedadDTO | null>(null);
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

    // Traer datos
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setCargando(true);
                const [propRes, caracRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades/getById/${id}`),
                    fetch(`${import.meta.env.VITE_APIBASE}/api/caracteristicas`),
                ]);

                if (!propRes.ok) throw new Error("No se pudo cargar la propiedad");
                if (!caracRes.ok) throw new Error("No se pudieron cargar características");

                const propJson: PropiedadDTO = await propRes.json();
                const caracJson: Caracteristica[] = await caracRes.json();
                const detalleCarac = (propJson.detalleCaracteristicas ?? []).map(dc => ({
                    caracteristicaID: dc.caracteristicaID ?? dc.caracteristica?.id,
                })).filter(x => !!x.caracteristicaID);

                const detalleImagenesFixed = Array.from({ length: 4 }, (_, i) => {
                    const prev = propJson.detalleImagenes?.[i];
                    if (prev?.imagen?.urlImagen) return prev;
                    return {
                        imgPrincipal: false,
                        imagen: { urlImagen: "" },
                    } as ImagenDetalle;
                });

                if (!detalleImagenesFixed.some(i => i.imgPrincipal)) {
                    const idxPrimeraConUrl = detalleImagenesFixed.findIndex(i => i.imagen.urlImagen);
                    if (idxPrimeraConUrl >= 0) detalleImagenesFixed[idxPrimeraConUrl].imgPrincipal = true;
                    else detalleImagenesFixed[0].imgPrincipal = true; // si están vacías
                }

                setPropiedad({
                    ...propJson,
                    detalleCaracteristicas: detalleCarac,
                    detalleImagenes: detalleImagenesFixed,
                });
                setCaracteristicas(caracJson || []);
            } catch (e: any) {
                toast.error(e?.message || "Error cargando datos");
                navigate("/MisPropiedades");
            } finally {
                setCargando(false);
            }
        };

        if (id) fetchAll();
    }, [id, navigate]);

    const caracteristicasOptions = useMemo(
        () => (caracteristicas || []).map(c => ({ value: c.id, label: c.denominacion })),
        [caracteristicas]
    );

    const setPrincipalByIndex = (values: any, setFieldValue: any, index: number) => {
        const next = (values.detalleImagenes ?? []).map((img: ImagenDetalle, i: number) => ({
            ...img,
            imgPrincipal: i === index,
        }));
        setFieldValue("detalleImagenes", next);
    };

    const uploadAtIndex = async (values: any, setFieldValue: any, file: File, idx: number) => {
        if (!file) return;
        try {
            setUploadingIdx(idx);
            const folder = `propiedades/${usuario?.id ?? "anon"}`;
            const url = await uploadImageCloudinary(file, folder);

            const fixed: ImagenDetalle[] = [...values.detalleImagenes];
            const prev = fixed[idx] ?? { imgPrincipal: idx === 0, imagen: { urlImagen: "" } };
            fixed[idx] = { ...prev, imagen: { urlImagen: url } };

            if (!fixed.some(x => x.imgPrincipal)) fixed[idx].imgPrincipal = true;

            setFieldValue("detalleImagenes", fixed);
        } catch (e) {
            toast.error("Error al subir la imagen");
        } finally {
            setUploadingIdx(null);
        }
    };

    if (cargando || !propiedad) {
        return (
            <>
                <UsuarioHeader />
                <main className="bg-secondary min-h-screen pt-20 px-5 text-white">
                    <p>Cargando…</p>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <UsuarioHeader />
            <main className="bg-secondary min-h-screen pt-20 px-5 text-white md:px-30">
                <h1 className="text-center font-medium text-lg mb-5">Editar Propiedad</h1>

                <Formik
                    initialValues={{
                        nombre: propiedad.nombre ?? "",
                        precioPorNoche: propiedad.precioPorNoche ?? 0,
                        descripcion: propiedad.descripcion ?? "",
                        detalleCaracteristicas: propiedad.detalleCaracteristicas ?? [],
                        detalleImagenes: propiedad.detalleImagenes ?? [],
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values) => {
                        const payload = {
                            ...propiedad, 

                            nombre: values.nombre,
                            precioPorNoche: values.precioPorNoche,
                            descripcion: values.descripcion,

                            detalleCaracteristicas: (values.detalleCaracteristicas ?? []).map((c: any) => ({
                                caracteristicaId: c.caracteristicaID,
                                propiedadId: propiedad.id,
                            })),
                            detalleImagenes: (values.detalleImagenes ?? []).map((d: ImagenDetalle) => ({
                                imgPrincipal: !!d.imgPrincipal,
                                imagen: {
                                    urlImagen: d.imagen.urlImagen || ""
                                },
                                propiedadId: propiedad.id,
                            })),
                            detalleAmbientes: (propiedad as any).detalleAmbientes?.map((ambiente: any) => ({
                                ...ambiente,
                                propiedadId: propiedad.id,
                                ambienteId: ambiente.ambienteId || ambiente.ambiente?.id,
                            })) || [],
                            detalleTipoPersonas: (propiedad as any).detalleTipoPersonas?.map((tipo: any) => ({
                                ...tipo,
                                propiedadId: propiedad.id,
                                tipoPersonaId: tipo.tipoPersonaId || tipo.tipoPersona?.id,
                            })) || [],
                            propietarioId: propiedad.propietarioId || (propiedad as any).propietario?.id || usuario?.id,
                            tipoPropiedadId: propiedad.tipoPropiedadId || (propiedad as any).tipoPropiedad?.id,
                        };

                        try {
                            setGuardando(true);

                            const res = await fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades/update/${id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json",  'Authorization': `Bearer ${usuario.token}` },
                                body: JSON.stringify(payload),
                            });

                            if (!res.ok) {
                                const txt = await res.text().catch(() => "");
                                throw new Error(`Error ${res.status}. ${txt || "No se pudo actualizar la propiedad"}`);
                            }

                            toast.success("Propiedad actualizada");
                            navigate("/MisPropiedades");
                        } catch (e: any) {
                            console.error(e);
                            toast.error(e?.message || "Error al actualizar");
                        } finally {
                            setGuardando(false);
                        }
                    }}
                >
                    {({ values, setFieldValue, handleSubmit }) => (
                        <Form className="mt-6 space-y-6">
                            {/* Nombre */}
                            <div className="flex w-full flex-col">
                                <label className="text-xs text-white/80 mb-1">Nombre</label>
                                <Field name="nombre" type="text" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                <ErrorMessage name="nombre" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Precio */}
                            <div className="flex w-full flex-col">
                                <label className="text-xs text-white/80 mb-1">Precio por Noche (ARS)</label>
                                <Field name="precioPorNoche" type="number" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                <ErrorMessage name="precioPorNoche" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Descripción */}
                            <div className="flex w-full flex-col">
                                <label className="text-xs text-white/80 mb-1">Descripción</label>
                                <Field as="textarea" name="descripcion" className="bg-tertiary px-2 py-2 mt-1 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 border border-black/50 focus:border-transparent transition-all duration-200 min-h-24" />
                                <ErrorMessage name="descripcion" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Características */}
                            <div className="flex w-full flex-col">
                                <label className="text-xs text-white/80 mb-1">Características</label>
                                <Select
                                    isMulti
                                    options={caracteristicasOptions}
                                    value={(values.detalleCaracteristicas ?? [])
                                        .map((c: any) => {
                                            const found = caracteristicas.find(x => x.id === c.caracteristicaID);
                                            return found ? { value: found.id, label: found.denominacion } : null;
                                        })
                                        .filter(Boolean) as any}
                                    onChange={(opts: any) =>
                                        setFieldValue(
                                            "detalleCaracteristicas",
                                            (opts || []).map((o: any) => ({ caracteristicaID: o.value }))
                                        )
                                    }
                                    placeholder="Seleccioná características…"
                                    className="text-black"
                                    styles={{ menu: (p) => ({ ...p, maxHeight: 190, overflowY: "auto" }) }}
                                />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(values.detalleCaracteristicas ?? []).map((c: any) => {
                                        const carac = caracteristicas.find((x) => x.id === c.caracteristicaID);
                                        return carac ? (
                                            <div key={carac.id} className="bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-2">
                                                {carac.denominacion}
                                                <button type="button" className="ml-1 text-red-500 hover:text-red-700"
                                                    onClick={() =>
                                                        setFieldValue(
                                                            "detalleCaracteristicas",
                                                            (values.detalleCaracteristicas ?? []).filter((i: any) => i.caracteristicaID !== carac.id)
                                                        )
                                                    }
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                                <ErrorMessage name="detalleCaracteristicas" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {/* Imágenes (exactamente 4) */}
                            <div className="bg-tertiary/80 rounded-2xl p-4 border border-black/40">
                                <h3 className="text-white text-sm sm:text-base font-semibold mb-3">Imágenes (exactamente 4)</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(values.detalleImagenes ?? []).map((item: ImagenDetalle, idx: number) => {
                                        const url = item?.imagen?.urlImagen ?? "";
                                        const isUploading = uploadingIdx === idx;

                                        return (
                                            <div key={idx} className="rounded-xl p-3 bg-[#2F5E68] border border-black/30">
                                                <div className="grid place-items-center">
                                                    <label className="w-[180px] sm:w-[220px] aspect-video rounded-lg border-2 border-dashed border-white/40 grid place-items-center cursor-pointer hover:bg-white/5 transition">
                                                        {!url ? (
                                                            <div className="flex flex-col items-center gap-2 py-4 text-white/90">
                                                                <MdOutlineAddPhotoAlternate size={38} />
                                                                <span className="text-[11px]">Subir imagen</span>
                                                            </div>
                                                        ) : (
                                                            <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                                                        )}
                                                        <input type="file" accept="image/*" className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) uploadAtIndex(values, setFieldValue, file, idx);
                                                                e.currentTarget.value = "";
                                                            }}
                                                        />
                                                    </label>
                                                    {isUploading && <p className="text-[11px] mt-1 text-white/70">Subiendo…</p>}
                                                </div>

                                                <div className="mt-2">
                                                    <input type="text" readOnly value={url} placeholder={`Slot ${idx + 1} - Sin imagen`} className="w-full text-xs px-2 py-1 rounded bg-black/20 border border-white/20 text-white placeholder:text-white/40" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <ErrorMessage name="detalleImagenes" component="div" className="text-red-500 text-sm mt-2" />
                            </div>

                            <div className="flex gap-3 justify-end pb-10">
                                <ButtonSecondary text="Cancelar" color="text-white" className="cursor-pointer" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-gray-600" maxWidth="w-[120px]" onClick={() => navigate("/MisPropiedades")} type="button" />
                                <ButtonSecondary text={guardando ? "Guardando..." : "Guardar cambios"} color="text-white" className="cursor-pointer" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-green-600" maxWidth="w-[160px]" onClick={() => handleSubmit()} type="button" />
                            </div>
                        </Form>
                    )}
                </Formik>
            </main>
            <Footer />
        </>
    );
};

export default EditarPropiedad;