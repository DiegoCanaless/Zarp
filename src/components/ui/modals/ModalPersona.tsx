import { AiOutlineClose } from "react-icons/ai";
import { Field, Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import type { TipoPersonaResponseDTO } from '../../../types/entities/tipoPersona/TipoPersonaResponseDTO';
import type { TipoPersonaDTO } from '../../../types/entities/tipoPersona/TipoPersonaDTO';

type ModalTipoPersonaProps = {
    onClose: () => void;
    onSaved?: () => void;
    tipoPersona?: TipoPersonaResponseDTO;
};

const schema = yup.object({
    denominacion: yup.string().trim().required("El nombre es requerido"),
    descripcion: yup.string().trim().required("La descripción es requerida"),
});

const ModalTipoPersona = ({ onClose, onSaved, tipoPersona }: ModalTipoPersonaProps) => {
    const isEdit = !!tipoPersona;

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
            <div className="w-120 max-w-[480px] bg-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{isEdit ? 'Editar' : 'Agregar'} Tipo de Persona</h3>
                    <AiOutlineClose onClick={onClose} color="white" fontSize={25} className="cursor-pointer" />
                </div>

                <Formik
                    initialValues={{
                        denominacion: isEdit ? tipoPersona!.denominacion : "",
                        descripcion: isEdit ? tipoPersona!.descripcion : "",
                    }}
                    validationSchema={schema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            const payload: TipoPersonaDTO = {
                                denominacion: values.denominacion.trim(),
                                descripcion: values.descripcion.trim(),
                            };

                            let url = "http://localhost:8080/api/tipoPersona/save";
                            let method: "POST" | "PUT" = "POST";
                            if (isEdit && tipoPersona) {
                                url = `http://localhost:8080/api/tipoPersona/update/${tipoPersona.id}`;
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
                            <div>
                                <label className="block mb-1">Descripción</label>
                                <Field name="descripcion" as="textarea" placeholder="Descripción..." className="w-full rounded px-3 py-2 bg-primary/40 outline-none" />
                                <ErrorMessage name="descripcion" component="div" className="text-red-500 text-sm mt-1" />
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

export default ModalTipoPersona;