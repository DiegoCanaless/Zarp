import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { Field, Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import { uploadImageCloudinary } from "../../../helpers/cloudinary"
import type { CaracteristicaDTO } from "../../../types/entities/caracteristica/CaracteristicaDTO";

type ModalCaracteristicaProps = {
    onClose: () => void;
    onSaved?: () => void;
};

const schema = yup.object({
    name_feature: yup.string().trim().required("El nombre de la característica es requerido"),
    description: yup.string().trim().required("La descripción es requerida"),
    img_upload: yup
        .mixed<File>()
        .required("La imagen es requerida")
        .test("fileType", "Formato no soportado", (file) => {
            if (!file) return false;
            return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type);
        })
        .test("fileSize", "El archivo es muy grande (máx 2MB)", (file) => {
            if (!file) return false;
            return file.size <= 2 * 1024 * 1024;
        }),
});

const ModalCaracteristica = ({ onClose, onSaved }: ModalCaracteristicaProps) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [subiendo, setSubiendo] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
            <div className="w-120 max-w-[560px] bg-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Agregar Característica</h3>
                    <AiOutlineClose onClick={onClose} color="white" fontSize={25} className="cursor-pointer" />
                </div>
                <Formik
                    initialValues={{ name_feature: "", description: "", img_upload: null as File | null }}
                    validationSchema={schema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            setSubiendo(true);
                            if (!values.img_upload) throw new Error("Falta la imagen");
                            const url = await uploadImageCloudinary(values.img_upload, "caracteristicas", `caract_${Date.now()}`);

                            const payload : CaracteristicaDTO = {
                                denominacion: values.name_feature.trim(),
                                descripcion: values.description.trim(),
                                imagen: {
                                    urlImagen: url,
                                },
                            };

                            console.log("Payload a backend:", payload);
                            await fetch("http://localhost:8080/api/caracteristicas/save", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(payload)
                            });

                            resetForm();
                            setPreviewUrl(null);
                            if (typeof onSaved === 'function') {
                                onSaved();
                            } else {
                                onClose();
                            }
                        } catch (err) {
                            console.error(err);
                            alert((err as Error).message || "Error al crear la característica");
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
                                <input className="block w-full text-sm" name="img_upload" type="file" accept="image/*" onChange={(e) => {
                                        const file = e.currentTarget.files?.[0] ?? null;
                                        setFieldValue("img_upload", file);
                                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                                        setPreviewUrl(file ? URL.createObjectURL(file) : null);
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
                                    {subiendo ? "Subiendo..." : "Enviar"}
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