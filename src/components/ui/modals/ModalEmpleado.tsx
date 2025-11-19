
import { AiOutlineClose } from "react-icons/ai";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";
import { initializeApp, getApps, deleteApp, type FirebaseApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import toast from "react-hot-toast";
import { firebaseConfig } from "../../../config/firebase";
import type { EmpleadoDTO } from "../../../types/entities/empleado/EmpleadoDTO";
import { useSelector } from "react-redux";

type ModalEmpleadoProps = {
    onClose: () => void;
    onSaved?: () => void;
};

const usuario = useSelector((state: any) => state.user);

const registerSchema = yup.object().shape({
    name: yup.string().required("El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    email: yup.string().required("El correo es requerido").email("Formato inválido"),
    password: yup.string().required("La contraseña es requerida").min(8, "Mínimo 8 caracteres"),
    repeatpassword: yup
        .string()
        .required("Debes repetir la contraseña")
        .oneOf([yup.ref("password")], "Las contraseñas deben coincidir"),
});

/** App secundario para no pisar la sesión actual */
function getSecondaryAuth() {
    const name = "Secondary";
    const existing = getApps().find(a => a.name === name);
    const app: FirebaseApp = existing ?? initializeApp(firebaseConfig, name);
    const auth = getAuth(app);
    return {
        auth,
        async dispose() {
            try { await deleteApp(app); } catch { }
        }
    };
}

const ModalEmpleado = ({ onClose, onSaved }: ModalEmpleadoProps) => {
    return (
        <div className="fixed inset-0 z-20 bg-black/30 flex items-center justify-center">
            <div className="w-120 max-w-[560px] bg-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Agregar Empleado</h3>
                    <AiOutlineClose onClick={onClose} color="white" fontSize={25} className="cursor-pointer" />
                </div>

                <Formik
                    initialValues={{ name: "", email: "", password: "", repeatpassword: "" }}
                    validationSchema={registerSchema}
                    onSubmit={async (values, { setSubmitting, setFieldError, resetForm }) => {
                        setSubmitting(true);
                        let createdUid: string | null = null;
                        const { auth, dispose } = getSecondaryAuth();

                        try {
                            // 1) Crear usuario Firebase (en app secundaria)
                            const cred = await createUserWithEmailAndPassword(auth, values.email, values.password);
                            await updateProfile(cred.user, { displayName: values.name });
                            await cred.user.reload();

                            createdUid = cred.user.uid;
                            const nombre = cred.user.displayName || values.name || values.email.split("@")[0];
                            const email = cred.user.email || values.email;

                            // 2) Persistir en backend como EMPLEADO (POST directo, sin services)
                            const empleado: EmpleadoDTO = {
                                uid: createdUid,
                                nombreCompleto: nombre,
                                correoElectronico: email,
                                rol: "EMPLEADO",
                            };

                            const resp = await fetch(`${import.meta.env.VITE_APIBASE}/api/empleados/save`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${usuario.token}` },
                                body: JSON.stringify(empleado),
                            });

                            if (!resp.ok) {
                                // rollback: borrar usuario firebase recién creado
                                try {
                                    if (auth.currentUser?.uid === createdUid) {
                                        await auth.currentUser.delete();
                                    }
                                    toast.error("Error al crear el empleado", { duration: 2500 });
                                } catch { /* noop */ }
                                toast.error("Error al crear el empleado", { duration: 2500 });

                            }

                            // 3) Éxito → limpiar y cerrar
                            toast.success("Empleado creado correctamente", { duration: 2500 });
                            resetForm();
                            onSaved?.();
                            onClose();
                        } catch (e: any) {
                            const msg = e?.message ?? "Error creando empleado";
                            toast.error("Error al crear el empleado", { duration: 2500 });
                            if (msg.includes("email-already-in-use")) {
                                setFieldError("email", "Este correo ya está en uso");
                            } else if (msg.includes("weak-password")) {
                                setFieldError("password", "La contraseña es demasiado débil");
                            } else {
                                setFieldError("email", msg);
                            }
                        } finally {
                            setSubmitting(false);
                            await dispose();
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="grid gap-3">
                            <label className="text-sm text-white">
                                Nombre completo
                                <Field
                                    name="name"
                                    className="mt-1 w-full rounded-md px-3 py-2 bg-secondary text-white outline-none"
                                    placeholder="Nombre y apellido"
                                />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                            </label>

                            <label className="text-sm text-white">
                                Correo
                                <Field
                                    name="email"
                                    type="email"
                                    className="mt-1 w-full rounded-md px-3 py-2 bg-secondary text-white outline-none"
                                    placeholder="empleado@empresa.com"
                                />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                            </label>

                            <label className="text-sm text-white">
                                Contraseña
                                <Field
                                    name="password"
                                    type="password"
                                    className="mt-1 w-full rounded-md px-3 py-2 bg-secondary text-white outline-none"
                                    placeholder="********"
                                />
                                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                            </label>

                            <label className="text-sm text-white">
                                Repetir contraseña
                                <Field
                                    name="repeatpassword"
                                    type="password"
                                    className="mt-1 w-full rounded-md px-3 py-2 bg-secondary text-white outline-none"
                                    placeholder="********"
                                />
                                <ErrorMessage name="repeatpassword" component="div" className="text-red-500 text-xs mt-1" />
                            </label>

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-md bg-red-700 cursor-pointer text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-md bg-white cursor-pointer text-black disabled:opacity-60"
                                >
                                    {isSubmitting ? "Guardando..." : "Crear empleado"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ModalEmpleado;
