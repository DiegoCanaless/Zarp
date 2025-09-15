import { Footer } from "../../components/layout/Footer";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Formik, Form, Field, ErrorMessage, getIn } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary";
import Select from "react-select";
import toast from "react-hot-toast";
// Iconos
import { MdAdd, MdOutlineRemove, MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FaTimes } from "react-icons/fa";

// Mapa
import "leaflet/dist/leaflet.css";
import MapaSelector from "../../components/ui/MapaSelector";

// Schemas e initial values importados
import { propiedadInitialValues, schemas } from "../../schemas/schemasPropiedad";
import { Provincia } from "../../types/enums/Provincia";
import { uploadImageCloudinary } from "../../helpers/cloudinary";
import { useNavigate } from "react-router-dom";

// Tipos locales
type TipoPropiedad = { id: number; denominacion: string };

const CrearPropiedad = () => {
    const [paso, setPaso] = useState<number>(1);
    const [tipoPropiedades, setTipoPropiedades] = useState<TipoPropiedad[]>([]);
    const [tipoPersonas, setTipoPersonas] = useState<any[]>([]);
    const [ambientes, setAmbientes] = useState<any[]>([]);
    const [caracteristicas, setCaracteristicas] = useState<any[]>([]);
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);

    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const navigate = useNavigate();
    const usuario = useSelector((state: any) => state.user);

    function avanzarPaso() {
        if (paso !== 4) setPaso(paso + 1);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [propiedadesRes, personasRes, ambientesRes, caracteristicasRes] = await Promise.all([
                    fetch("http://localhost:8080/api/tipoPropiedades"),
                    fetch("http://localhost:8080/api/tipoPersona"),
                    fetch("http://localhost:8080/api/ambientes"),
                    fetch("http://localhost:8080/api/caracteristicas"),
                ]);

                const tipoPropiedadesres: TipoPropiedad[] = await propiedadesRes.json();
                const tipoPersonasres: any[] = await personasRes.json();
                const Ambientesres: any[] = await ambientesRes.json();
                const caracteristicasres: any[] = await caracteristicasRes.json();

                setTipoPropiedades(tipoPropiedadesres || []);
                setTipoPersonas(tipoPersonasres || []);
                setAmbientes(Ambientesres || []);
                setCaracteristicas(caracteristicasres || []);
            } catch (e) {
                setError("Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const camposPorPaso = [
        ["nombre", "precioPorNoche", "descripcion"],
        ["direccion.calle", "direccion.numero", "direccion.localidad", "direccion.codigoPostal", "direccion.provincia", "direccion.latitud", "direccion.longitud",],
        ["tipoPropiedadId", "detalleTipoPersonas", "detalleCaracteristicas", "detalleAmbientes"],
        ["detalleImagenes"],
    ];

    const provinciaOptions = Object.entries(Provincia).map(([key, value]) => ({
        value,
        label: key.replace(/_/g, " "),
    }));

    const tipoPropiedadesOptions = useMemo(
        () =>
            (tipoPropiedades || []).map((op) => ({
                value: op.id,
                label: op.denominacion,
            })),
        [tipoPropiedades]
    );

    const crearPropiedad = async (values: any) => {
        const propiedadIdPlaceholder = 1;
        const detalleTipoPersonas = (values.detalleTipoPersonas ?? []).map((p: any) => ({
            cantidad: p.cantidad,
            tipoPersonaId: p.tipoPersonaId,
            propiedadId: propiedadIdPlaceholder,
        }));

        const detalleCaracteristicas = (values.detalleCaracteristicas ?? []).map((c: any) => ({
            caracteristicaId: c.caracteristicaID,
            propiedadId: propiedadIdPlaceholder,
        }));


        const detalleImagenes = (values.detalleImagenes ?? [])
            .filter((d: any) => d?.imagen?.urlImagen && d.imagen.urlImagen.trim() !== "")
            .map((d: any) => ({
                imgPrincipal: !!d.imgPrincipal,
                imagen: { urlImagen: d.imagen.urlImagen },
                propiedadId: propiedadIdPlaceholder,
            }));

        const detalleAmbientes = (values.detalleAmbientes ?? []).map((a: any) => ({
            cantidad: a.cantidad,
            ambienteId: a.ambienteId,
            propiedadId: propiedadIdPlaceholder,
        }));

        const payload = {
            nombre: values.nombre,
            descripcion: values.descripcion,
            precioPorNoche: values.precioPorNoche,
            propietarioId: values.propietarioId || (usuario?.id ?? 0),
            direccion: {
                calle: values.direccion?.calle ?? "",
                numero: values.direccion?.numero ?? "",
                piso: values.direccion?.piso ?? "",
                departamento: values.direccion?.departamento ?? "",
                codigoPostal: values.direccion?.codigoPostal ?? "",
                localidad: values.direccion?.localidad ?? "",
                provincia: values.direccion?.provincia ?? "",
                latitud: values.direccion?.latitud ?? 0,
                longitud: values.direccion?.longitud ?? 0,
            },
            tipoPropiedadId: values.tipoPropiedadId,
            detalleTipoPersonas,
            detalleCaracteristicas,
            detalleImagenes,
            detalleAmbientes,
        };

        try {
            setCreating(true);
            const res = await fetch("http://localhost:8080/api/propiedades/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`Error ${res.status}. ${txt || "No se pudo crear la propiedad"}`);
            }

            const data = await res.json().catch(() => ({}));
            toast.success("Propiedad creada exitosamente", { duration: 2500 });
            setTimeout(() => navigate('/Inicio'), 3000);
        } catch (e: any) {
            console.error(e);
            toast.error("Error al crear la propiedad", { duration: 2500 });
            setTimeout(() => navigate('/Inicio'), 3000);
        } finally {
            setCreating(false);
        }
    };


    return (
        <>
            <UsuarioHeader />
            <main className="bg-secondary min-h-screen pt-20 px-5 text-white md:px-30">
                <h1 className="text-center font-medium text-lg mb-5">Creación de Propiedad</h1>

                <span className="text-white/80 text-xs">Paso {paso} de 4</span>
                <div className="h-2 w-full bg-gray-500 rounded-full">
                    <div className="h-2 rounded-full bg-blue-400 transition-all duration-300" style={{ width: `${(paso / 4) * 100}%` }} />
                </div>

                <Formik
                    initialValues={propiedadInitialValues}
                    validationSchema={schemas[paso - 1]}
                    validateOnMount
                    onSubmit={() => { }}
                >
                    {({ validateForm, setTouched, setFieldValue, values }) => {
                        const detalleTipoPersonasForm = values.detalleTipoPersonas ?? [];
                        const detalleAmbientesForm = values.detalleAmbientes ?? [];
                        const detalleCaracteristicasForm = values.detalleCaracteristicas ?? [];
                        const detalleImagenesForm = values.detalleImagenes ?? [];

                        const ensureFourSlots = () => {
                            const next = Array.from({ length: 4 }, (_, i) => {
                                const prev = detalleImagenesForm[i];
                                return (
                                    prev ?? {
                                        imgPrincipal: i === 0,
                                        imagen: { urlImagen: "" },
                                    }
                                );
                            });

                            if (detalleImagenesForm.length !== 4) {
                                setFieldValue("detalleImagenes", next);
                                return next;
                            }
                            return detalleImagenesForm;
                        };

                        const setPrincipalByIndex = (index: number) => {
                            const fixed = ensureFourSlots();
                            const next = fixed.map((img: any, i: number) => ({
                                ...img,
                                imgPrincipal: i === index,
                            }));
                            setFieldValue("detalleImagenes", next);
                        };

                        const uploadAtIndex = async (file: File, idx: number) => {
                            if (!file) return;
                            const folder = `propiedades/${usuario?.id ?? "anon"}`;
                            try {
                                setUploadingIdx(idx);
                                const url = await uploadImageCloudinary(file, folder);
                                const fixed = ensureFourSlots();
                                const prev = fixed[idx] ?? { imgPrincipal: idx === 0, imagen: { urlImagen: "" } };
                                fixed[idx] = {
                                    ...prev,
                                    imagen: { ...(prev?.imagen || {}), urlImagen: url },
                                };
                                if (!fixed.some((x: any) => x.imgPrincipal)) fixed[idx].imgPrincipal = true;
                                setFieldValue("detalleImagenes", fixed);
                            } catch (e: any) {
                                toast.error("Error al subir la imagen a Cloudinary", { duration: 2500 });
                            } finally {
                                setUploadingIdx(null);
                            }
                        };

                        return (
                            <>
                                <Form className="mt-10">
                                    {paso === 1 && (
                                        <div className="flex w-full flex-col gap-4">
                                            <div className="flex w-full flex-col">
                                                <label htmlFor="nombre" className="text-xs text-white/80 mb-1">Nombre de la Propiedad</label>
                                                <Field placeholder="Cabaña Lago Azul" type="text" name="nombre" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="nombre" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label htmlFor="precioPorNoche" className="text-xs text-white/80 mb-1"> Precio por Noche (ARS) </label>
                                                <Field placeholder="1000" type="number" name="precioPorNoche" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="precioPorNoche" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label htmlFor="descripcion" className="text-xs text-white/80 mb-1">Descripción de la propiedad</label>
                                                <Field placeholder="Gran Casa de Campo" as="textarea" name="descripcion" id="descripcion" className="bg-tertiary px-2 py-2 mt-1 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 border border-black/50 focus:border-transparent transition-all duration-200 active:bg-white/15 field-sizing-content min-h-20" />
                                                <ErrorMessage name="descripcion" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Paso 2 */}
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
                                                    onChange={(pos) => {
                                                        setFieldValue("direccion.latitud", pos.lat);
                                                        setFieldValue("direccion.longitud", pos.lng);
                                                    }}
                                                />
                                                <div className="text-xs mt-1 text-white/60">Haz click en el mapa para marcar la ubicación.</div>
                                                <ErrorMessage name="direccion.latitud" component="div" className="text-red-500 text-sm mt-1" />
                                                <ErrorMessage name="direccion.longitud" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label className="text-xs text-white/80 mb-1">Provincia:</label>
                                                <Select options={provinciaOptions} value={provinciaOptions.find((o) => o.value === values.direccion.provincia) || null} onChange={(opt) => setFieldValue("direccion.provincia", opt?.value ?? "")} placeholder="Seleccioná una provincia…" styles={{ menu: (p) => ({ ...p, maxHeight: 190, overflowY: "auto" }) }} className="text-black" />
                                                <ErrorMessage name="direccion.provincia" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label className="text-xs text-white/80 mb-1">Localidad:</label>
                                                <Field placeholder="Godoy Cruz" type="text" name="direccion.localidad" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="direccion.localidad" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label className="text-xs text-white/80 mb-1">Código Postal:</label>
                                                <Field placeholder="5501" type="text" name="direccion.codigoPostal" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="direccion.codigoPostal" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label className="text-xs text-white/80 mb-1">Calle de la Propiedad</label>
                                                <Field placeholder="Av. Falsa" type="text" name="direccion.calle" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="direccion.calle" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="flex w-full flex-col">
                                                <label className="text-xs text-white/80 mb-1">Número de la Propiedad</label>
                                                <Field placeholder="555" type="number" name="direccion.numero" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="direccion.numero" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            {/* Piso */}
                                            <div className="flex w-full flex-col">
                                                <label className="text-xs text-white/80 mb-1">Piso</label>
                                                <Field placeholder="1" type="text" name="direccion.piso" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="direccion.piso" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            {/* Departamento */}
                                            <div className="flex w-full flex-col">
                                                <label className="text-xs text-white/80 mb-1">Departamento</label>
                                                <Field placeholder="Departamento" type="text" name="direccion.departamento" className="focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 active:bg-white/15 border border-black/50 h-8 outline-none px-2 bg-tertiary w-full rounded-sm" />
                                                <ErrorMessage name="direccion.departamento" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                        </div>

                                    )}

                                    {/* Paso 3 */}
                                    {paso === 3 && (
                                        <div className="flex w-full flex-col gap-4">
                                            <div className="mb-2">
                                                <label htmlFor="tipoPropiedadId" className="text-xs text-white/80 mb-1">Tipo de Propiedad:</label>
                                                <Select options={tipoPropiedadesOptions} value={tipoPropiedadesOptions.find((o) => o.value === values.tipoPropiedadId) || null} onChange={(opt) => setFieldValue("tipoPropiedadId", opt?.value ?? 0)} placeholder="Seleccioná el tipo de propiedad" styles={{ menu: (p) => ({ ...p, maxHeight: 190, overflowY: "auto" }) }} className="text-black" />
                                                <ErrorMessage name="tipoPropiedadId" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="mb-2">
                                                <label className="text-xs text-white/80 mb-1">Huéspedes:</label>
                                                {tipoPersonas.map((tipoPersona: any) => {
                                                    const idx = detalleTipoPersonasForm.findIndex((p: any) => p.tipoPersonaId === tipoPersona.id);
                                                    const personaFormik = idx >= 0 ? detalleTipoPersonasForm[idx] : undefined;
                                                    const cantidad = personaFormik ? personaFormik.cantidad : 0;

                                                    const setCantidad = (n: number) => {
                                                        const safe = Math.max(n, 0);
                                                        const next = [...detalleTipoPersonasForm];
                                                        if (safe === 0) {
                                                            if (idx >= 0) {
                                                                next.splice(idx, 1);
                                                                setFieldValue("detalleTipoPersonas", next);
                                                            }
                                                            return;
                                                        }
                                                        if (idx >= 0) next[idx] = { ...next[idx], cantidad: safe };
                                                        else next.push({ tipoPersonaId: tipoPersona.id, cantidad: safe });
                                                        setFieldValue("detalleTipoPersonas", next);
                                                    };

                                                    return (
                                                        <div key={tipoPersona.id} className="flex w-full items-center px-3 py-3 rounded mb-4 justify-between bg-tertiary">
                                                            <MdOutlineRemove size={30} className="cursor-pointer" onClick={() => setCantidad(cantidad - 1)} />
                                                            <div className="flex flex-col items-center">
                                                                <p className="text-lg">{cantidad}</p>
                                                                <p>{tipoPersona.denominacion}</p>
                                                            </div>
                                                            <MdAdd size={30} className="cursor-pointer" onClick={() => setCantidad(cantidad + 1)} />
                                                        </div>
                                                    );
                                                })}
                                                <ErrorMessage name="detalleTipoPersonas" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            {/* Ambientes */}
                                            <div className="mb-2">
                                                <label className="text-xs text-white/80 mb-1">Ambientes:</label>
                                                {ambientes.map((amb: any) => {
                                                    const idx = detalleAmbientesForm.findIndex((a: any) => a.ambienteId === amb.id);
                                                    const ambFormik = idx >= 0 ? detalleAmbientesForm[idx] : undefined;
                                                    const cantidad = ambFormik ? ambFormik.cantidad : 0;

                                                    const setCantidad = (n: number) => {
                                                        const safe = Math.max(n, 0);
                                                        const next = [...detalleAmbientesForm];
                                                        if (safe === 0) {
                                                            if (idx >= 0) {
                                                                next.splice(idx, 1);
                                                                setFieldValue("detalleAmbientes", next);
                                                            }
                                                            return;
                                                        }
                                                        if (idx >= 0) next[idx] = { ...next[idx], cantidad: safe };
                                                        else next.push({ ambienteId: amb.id, cantidad: safe });
                                                        setFieldValue("detalleAmbientes", next);
                                                    };

                                                    return (
                                                        <div key={amb.id} className="flex w-full items-center px-3 py-3 rounded mb-4 justify-between bg-tertiary">
                                                            <MdOutlineRemove size={30} className="cursor-pointer" onClick={() => setCantidad(cantidad - 1)} />
                                                            <div className="flex flex-col items-center">
                                                                <p className="text-lg">{cantidad}</p>
                                                                <p>{amb.denominacion}</p>
                                                            </div>
                                                            <MdAdd size={30} className="cursor-pointer" onClick={() => setCantidad(cantidad + 1)} />
                                                        </div>
                                                    );
                                                })}
                                                <ErrorMessage name="detalleAmbientes" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            {/* Características */}
                                            <div className="mb-2">
                                                <label className="text-xs text-white/80 mb-1">Características:</label>
                                                <Select isMulti
                                                    options={caracteristicas.map((c: any) => ({ value: c.id, label: c.denominacion }))}
                                                    value={detalleCaracteristicasForm
                                                        .map((c: any) => {
                                                            const carac = caracteristicas.find((x: any) => x.id === c.caracteristicaID);
                                                            return carac ? { value: carac.id, label: carac.denominacion } : null;
                                                        })
                                                        .filter(Boolean) as any}
                                                    onChange={(opts: any) =>
                                                        setFieldValue(
                                                            "detalleCaracteristicas",
                                                            (opts || []).map((o: any) => ({ caracteristicaID: o.value }))
                                                        )
                                                    }
                                                    placeholder="Seleccioná características..." styles={{ menu: (p) => ({ ...p, maxHeight: 190, overflowY: "auto" }) }} className="text-black"
                                                />
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {detalleCaracteristicasForm.map((c: any) => {
                                                        const carac = caracteristicas.find((x: any) => x.id === c.caracteristicaID);
                                                        return carac ? (
                                                            <div key={carac.id} className="bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-2">
                                                                {carac.denominacion}
                                                                <button type="button" className="ml-1 text-red-500 hover:text-red-700"
                                                                    onClick={() =>
                                                                        setFieldValue(
                                                                            "detalleCaracteristicas",
                                                                            detalleCaracteristicasForm.filter((i: any) => i.caracteristicaID !== carac.id)
                                                                        )
                                                                    }>
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                                <ErrorMessage name="detalleCaracteristicas" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                        </div>
                                    )}
                                    {paso === 4 && (
                                        <div className="bg-tertiary/80 rounded-2xl p-4 sm:p-6 border border-black/40">
                                            <h3 className="text-white text-sm sm:text-base font-semibold mb-3">Imágenes (máximo 4):</h3>

                                            {ensureFourSlots() && null}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {values.detalleImagenes.map((item: any, idx: number) => {
                                                    const url = item?.imagen?.urlImagen ?? "";
                                                    const isUploading = uploadingIdx === idx;

                                                    return (
                                                        <div key={idx} className="rounded-xl p-3 bg-[#2F5E68] border border-black/30">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="flex items-center gap-2 text-xs">
                                                                    <input type="radio" name="imgPrincipal" checked={!!item.imgPrincipal} onChange={() => setPrincipalByIndex(idx)} />Principal
                                                                </label>
                                                            </div>

                                                            <div className="grid place-items-center">
                                                                <label className="w-[180px] sm:w-[220px] aspect-video rounded-lg border-2 border-dashed border-white/40 grid place-items-center cursor-pointer hover:bg-white/5 transition">
                                                                    {!url ? (
                                                                        <div className="flex flex-col items-center gap-2 py-4 text-white/90">
                                                                            <MdOutlineAddPhotoAlternate size={38} />
                                                                            <span className="text-[11px]">Subir imagen</span>
                                                                        </div>
                                                                    ) : (
                                                                        <img src={url} className="w-full h-full object-cover rounded-lg" />
                                                                    )}
                                                                    <input type="file" accept="image/*" className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) uploadAtIndex(file, idx);
                                                                            e.currentTarget.value = "";
                                                                        }}
                                                                    />
                                                                </label>
                                                                {isUploading && <p className="text-[11px] mt-1 text-white/70">Subiendo…</p>}
                                                            </div>

                                                            <div className="mt-2">
                                                                <input type="text" readOnly value={url} placeholder="Sin imagen" className="w-full text-xs px-2 py-1 rounded bg-black/20 border border-white/20 text-white placeholder:text-white/40" />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <ErrorMessage name="detalleImagenes" component="div" className="text-red-500 text-sm mt-2" />
                                        </div>
                                    )}
                                </Form>

                                {/* Botonera */}
                                <div className="flex w-full justify-evenly mt-5 pb-10">
                                    <ButtonSecondary text="Anterior" color="text-white" className="border cursor-pointer" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-transparent" maxWidth="w-[90px]" onClick={() => paso !== 1 && setPaso(paso - 1)} />

                                    {paso < 4 ? (
                                        <ButtonSecondary text="Siguiente" color="text-white" className="cursor-pointer" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-blue-500" maxWidth="w-[110px]"
                                            onClick={async () => {
                                                const errors = await validateForm();
                                                const fields = camposPorPaso[paso - 1];
                                                const stepHasErrors = fields.some((f) => !!getIn(errors, f));
                                                if (stepHasErrors) {
                                                    await setTouched(Object.fromEntries(fields.map((f) => [f, true])));
                                                    return;
                                                }
                                                avanzarPaso();
                                            }}
                                        />
                                    ) : (
                                        <ButtonSecondary text={creating ? "Creando..." : "Crear propiedad"} color="text-white" className="cursor-pointer" borderRadius="rounded-sm" fontSize="text-md" bgColor="bg-green-600" maxWidth="w-[160px]"
                                            onClick={async () => {
                                                const errors = await validateForm();
                                                const fields = camposPorPaso[3]; // Paso 4
                                                const stepHasErrors = fields.some((f) => !!getIn(errors, f));
                                                if (stepHasErrors) {
                                                    await setTouched(Object.fromEntries(fields.map((f) => [f, true])));
                                                    return;
                                                }
                                                await crearPropiedad(values);
                                            }}
                                        />
                                    )}
                                </div>
                            </>
                        );
                    }}
                </Formik>
            </main>
            <Footer />
        </>
    );
};

export default CrearPropiedad;
