import { AiOutlineClose } from "react-icons/ai";
import { Field, Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import type { TipoPropiedadResponseDTO } from '../../../types/entities/tipoPropiedad/TipoPropiedadResponseDTO';
import type { TipoPropiedadDTO } from '../../../types/entities/tipoPropiedad/TipoPropiedadDTO';

type ModalTipoPropiedadProps = {
    onClose: () => void;
    onSaved?: () => void;
    tipoPropiedad?: TipoPropiedadResponseDTO;
};

const schema = yup.object({
    denominacion: yup.string().trim().required("El nombre es requerido"),
});

const ModalPropiedad = ({ onClose, onSaved, tipoPropiedad }: ModalTipoPropiedadProps) => {
    const isEdit = !!tipoPropiedad;

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
            <div className="w-120 max-w-[400px] bg-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{isEdit ? 'Editar' : 'Agregar'} Tipo de Propiedad</h3>
                    <AiOutlineClose onClick={onClose} color="white" fontSize={25} className="cursor-pointer" />
                </div>

                <Formik
                    initialValues={{
                        denominacion: isEdit ? tipoPropiedad!.denominacion : "",
                    }}
                    validationSchema={schema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            const payload: TipoPropiedadDTO = {
                                denominacion: values.denominacion.trim(),
                            };

                            let url = `${import.meta.env.VITE_APIBASE}/api/tipoPropiedades/save`;
                            let method: "POST" | "PUT" = "POST";
                            if (isEdit && tipoPropiedad) {
                                url = `${import.meta.env.VITE_APIBASE}/api/tipoPropiedades/update/${tipoPropiedad.id}`;
                                method = "PUT";
                            }

                            const resp = await fetch(url, {
                                method,
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                            });

                            if (!resp.ok) throw new Error(`Error ${method} ${resp.status}`);

                            resetForm();
                            if (typeof onSaved === 'function') onSaved();
                            else onClose();
                        } catch (err) {
                            console.error('[SUBMIT] Error:', err);
                            alert((err as Error).message || (isEdit ? "Error al editar" : "Error al crear"));
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="flex flex-col gap-3">
                            <div>
                                <label className="block mb-1">Nombre</label>
                                <Field name="denominacion" type="text" placeholder="Nombre..." className="w-full rounded px-3 py-2 bg-primary/40 outline-none" />
                                <ErrorMessage name="denominacion" component="div" className="text-red-500 text-sm mt-1" />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-red-800">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="bg-white text-black px-4 py-2 rounded disabled:opacity-60" >
                                    {isEdit ? "Guardar cambios" : "Crear"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ModalPropiedad;