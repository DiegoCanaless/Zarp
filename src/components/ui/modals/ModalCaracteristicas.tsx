import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { Field, Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import { uploadImageCloudinary } from "../../../helpers/cloudinary";
import type { CaracteristicaDTO } from "../../../types/entities/caracteristica/CaracteristicaDTO";
import type { CaracteristicaResponseDTO } from '../../../types/entities/caracteristica/CaracteristicaResponseDTO';
import { useSelector } from "react-redux";

type ModalCaracteristicaProps = {
    onClose: () => void;
    onSaved?: () => void;
    caracteristica?: CaracteristicaResponseDTO;
};

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const baseSchema = {
    name_feature: yup.string().trim().required("El nombre de la característica es requerido"),
    description: yup.string().trim().required("La descripción es requerida"),
    img_upload: yup.mixed<File>().test("fileType", "Formato no soportado", (file) => {
        if (!file) return true; // opcional en edición
        return SUPPORTED_TYPES.includes(file.type);
    }).test("fileSize", "El archivo es muy grande (máx 2MB)", (file) => {
        if (!file) return true; // opcional en edición
        return file.size <= 2 * 1024 * 1024;
    }),
};

const schemaCreate = yup.object({
    ...baseSchema,
    img_upload: yup
        .mixed<File>()
        .required("La imagen es requerida")
        .test("fileType", "Formato no soportado", (file) => !!file && SUPPORTED_TYPES.includes(file.type))
        .test("fileSize", "El archivo es muy grande (máx 2MB)", (file) => !!file && file.size <= 2 * 1024 * 1024),
});
const schemaEdit = yup.object(baseSchema);

const ModalCaracteristica = ({ onClose, onSaved, caracteristica }: ModalCaracteristicaProps) => {
    const isEdit = !!caracteristica;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [subiendo, setSubiendo] = useState(false);

    const usuario = useSelector((state: any) => state.user);

    useEffect(() => {
        if (isEdit && caracteristica?.imagen?.urlImagen) {
            setPreviewUrl(caracteristica.imagen.urlImagen);
        } else {
            setPreviewUrl(null);
        }
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, caracteristica]);

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
            <div className="w-120 max-w-[560px] bg-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{isEdit ? 'Editar' : 'Agregar'} Característica</h3>
                    <AiOutlineClose onClick={onClose} color="white" fontSize={25} className="cursor-pointer" />
                </div>

                <Formik
                    initialValues={{
                        name_feature: isEdit ? caracteristica!.denominacion : "",
                        description: isEdit ? caracteristica!.descripcion : "",
                        img_upload: undefined as File | undefined,
                    }}
                    validationSchema={isEdit ? schemaEdit : schemaCreate}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            setSubiendo(true);

                            const stamp = Date.now();
                            let finalUrl = isEdit ? (caracteristica?.imagen?.urlImagen ?? null) : null;

                            if (values.img_upload) {
                                // Asegurate que uploadImageCloudinary devuelve secure_url
                                const uploadedUrl = await uploadImageCloudinary(values.img_upload, "caracteristicas", `caract_${stamp}`);

                                // Versionamos la URL para evitar cache del CDN/navegador
                                finalUrl = uploadedUrl.includes('?') ? `${uploadedUrl}&v=${stamp}` : `${uploadedUrl}?v=${stamp}`;
                            } else if (!isEdit) {
                                throw new Error("Falta la imagen");
                            }

                            const payload: CaracteristicaDTO = {
                                denominacion: values.name_feature.trim(),
                                descripcion: values.description.trim(),
                                // Tu tipo la exige, por eso siempre mandamos una url (nueva o la existente)
                                imagen: {
                                    urlImagen: finalUrl || (caracteristica?.imagen?.urlImagen ?? ""),
                                },
                            };


                            let url = `${import.meta.env.VITE_APIBASE}/api/caracteristicas/save`;
                            let method: "POST" | "PUT" = "POST";
                            if (isEdit && caracteristica) {
                                url = `${import.meta.env.VITE_APIBASE}/api/caracteristicas/update/${caracteristica.id}`;
                                method = "PUT";

                            }

                            const resp = await fetch(url, {
                                method,
                                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${usuario.token}` },
                                body: JSON.stringify(payload),
                            });

                            const raw = await resp.clone().text();
                            if (!resp.ok) throw new Error(`Error ${method} ${resp.status}`);

                            // Verificación inmediata: traemos la entidad por id para ver qué quedó guardado
                            if (isEdit && caracteristica) {
                                const verify = await fetch(
                                    `${import.meta.env.VITE_APIBASE}/api/caracteristicas/getById/${caracteristica.id}?_=${Date.now()}`,
                                    { cache: 'no-store' }
                                );
                                const verJson = await verify.json();
                            }

                            resetForm();
                            setPreviewUrl(null);
                            if (typeof onSaved === 'function') onSaved();
                            else onClose();
                        } catch (err) {
                            console.error('[SUBMIT] Error:', err);
                            alert((err as Error).message || (isEdit ? "Error al editar la característica" : "Error al crear la característica"));
                        } finally {
                            setSubiendo(false);
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ setFieldValue, isSubmitting }) => (
                        <Form className="flex flex-col gap-3">
                            <div>
                                <label className="block mb-1">Nombre Característica</label>
                                <Field name="name_feature" type="text" placeholder="Nombre..." className="w-full rounded px-3 py-2 bg-primary/40 outline-none" />
                                <ErrorMessage name="name_feature" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block mb-1">Descripción</label>
                                <Field name="description" as="textarea" placeholder="Descripción..." className="w-full rounded px-3 py-2 bg-primary/40 outline-none" />
                                <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block mb-1">Icono / Imagen</label>
                                <input
                                    className="block w-full text-sm"
                                    name="img_upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.currentTarget.files?.[0] ?? undefined;
                                        setFieldValue("img_upload", file);
                                        if (file) {
                                            if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
                                            const blob = URL.createObjectURL(file);
                                            setPreviewUrl(blob);
                                        } else if (isEdit && caracteristica?.imagen?.urlImagen) {
                                            setPreviewUrl(caracteristica.imagen.urlImagen);
                                        } else {
                                            setPreviewUrl(null);
                                        }
                                    }}
                                />
                                <ErrorMessage name="img_upload" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            {previewUrl && (
                                <div className="mt-2">
                                    <img src={previewUrl} alt="preview" className="max-h-25 rounded border border-white/20 object-contain" />
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-2">
                                <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-red-800">Cancelar</button>
                                <button type="submit" disabled={isSubmitting || subiendo} className="bg-white text-black px-4 py-2 rounded disabled:opacity-60" >
                                    {subiendo ? "Subiendo..." : (isEdit ? "Guardar cambios" : "Crear")}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ModalCaracteristica;
