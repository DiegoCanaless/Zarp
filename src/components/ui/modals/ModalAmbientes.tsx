import { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { Field, Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";
import type { AmbienteResponseDTO } from '../../../types/entities/ambiente/AmbienteResponseDTO';
import type { AmbienteDTO } from '../../../types/entities/ambiente/AmbienteDTO';

type ModalAmbienteProps = {
    onClose: () => void;
    onSaved?: () => void;
    ambiente?: AmbienteResponseDTO;
};

const schema = yup.object({
    denominacion: yup.string().trim().required("El nombre del ambiente es requerido"),
});

const ModalAmbiente = ({ onClose, onSaved, ambiente }: ModalAmbienteProps) => {
    const isEdit = !!ambiente;

    useEffect(() => {
        // Opcional: efectos secundarios
        return () => { };
    }, [isEdit, ambiente]);

    return (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
            <div className="w-120 max-w-[400px] bg-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{isEdit ? 'Editar' : 'Agregar'} Ambiente</h3>
                    <AiOutlineClose onClick={onClose} color="white" fontSize={25} className="cursor-pointer" />
                </div>

                <Formik
                    initialValues={{
                        denominacion: isEdit ? ambiente!.denominacion : "",
                    }}
                    validationSchema={schema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            const payload: AmbienteDTO = {
                                denominacion: values.denominacion.trim(),
                            };

                            let url = `${import.meta.env.VITE_APIBASE}/api/ambientes/save`;
                            let method: "POST" | "PUT" = "POST";
                            if (isEdit && ambiente) {
                                url = `${import.meta.env.VITE_APIBASE}/api/ambientes/update/${ambiente.id}`;
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
                            alert((err as Error).message || (isEdit ? "Error al editar el ambiente" : "Error al crear el ambiente"));
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="flex flex-col gap-3">
                            <div>
                                <label className="block mb-1">Nombre Ambiente</label>
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

export default ModalAmbiente;