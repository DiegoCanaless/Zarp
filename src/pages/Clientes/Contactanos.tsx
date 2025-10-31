import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { MdEmail, MdLocationPin, MdOutlineLocalPhone } from "react-icons/md";
import { Footer } from "../../components/layout/Footer";

const schema = yup.object().shape({
    user_name: yup.string().trim().required("El nombre es requerido"),
    user_email: yup.string().trim().email("Formato de correo inválido").required("El correo es requerido"),
    message: yup.string().trim().required("El mensaje es requerido"),
});

export const Contactanos = () => {
    const SERVICE_ID = import.meta.env.VITE_SERVICEID;
    const TEMPLATE_ID = import.meta.env.VITE_TEMPLATEID;
    const PUBLIC_KEY = import.meta.env.VITE_PUBLICKEY;

    return (
        <>
            <UsuarioHeader />
            <div className="bg-secondary pt-20 px-10 md:px-40 lg:px-70 text-white min-h-screen">
                <h1 className="text-lg md:text-center">Contacta con nosotros</h1>

                <Formik
                    initialValues={{ user_name: "", user_email: "", message: "" }}
                    validationSchema={schema}
                    onSubmit={async (values, { resetForm, setSubmitting }) => {
                        try {
                            setSubmitting(true);
                            const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, values, {
                                publicKey: PUBLIC_KEY,
                            });
                            toast.success("Mensaje Enviado")
                            resetForm();
                        } catch (err) {
                            toast.error("No se pudo enviar el mensaje")
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ values, isSubmitting }) => (
                        <Form className="flex flex-col justify-center px-2 mt-5 gap-5">
                            <div>
                                <label htmlFor="user_name">Nombre Completo</label>
                                <Field type="text" name="user_name" id="user_name" placeholder="Ingrese tu nombre completo:" className="bg-tertiary px-2 py-2 mt-1 w-full rounded-md outline-none"/>
                                <ErrorMessage name="user_name" component="div" className="text-red-500 mt-2 text-md" />
                            </div>

                            <div>
                                <label htmlFor="user_email">Correo Electrónico</label>
                                <Field type="text" name="user_email" id="user_email" placeholder="Ingrese tu correo aquí" className="bg-tertiary px-2 py-2 mt-1 w-full rounded-md outline-none" />
                                <ErrorMessage name="user_email" component="div" className="text-red-500 mt-2 text-md" />
                            </div>

                            <div>
                                <label htmlFor="message">Mensaje:</label>
                                <Field as="textarea" name="message" id="message" placeholder="Ingrese tu mensaje aquí" className="bg-tertiary px-2 py-2 mt-1 w-full rounded-md outline-none field-sizing-content" />
                                <ErrorMessage name="message" component="div" className="text-red-500 mt-2 text-md" />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="bg-tertiary w-full py-2 rounded-md disabled:opacity-60" > {isSubmitting ? "Enviando..." : "Enviar"}</button>
                        </Form>
                    )}
                </Formik>
                <h3 className="mt-5 text-md font-medium">Otras maneras</h3>
                <div className="flex flex-col w-full mt-5 gap-5 pb-10">
                    <div className="flex gap-4 items-end">
                        <div className="bg-tertiary w-fit p-1 rounded-md"><MdOutlineLocalPhone color="black" size={20}/></div>
                        <p className="text-sm">+5492617688822</p>
                    </div>
                    <div className="flex gap-4 items-end">
                        <div className="bg-tertiary w-fit p-1 rounded-md"><MdEmail color="black" size={20}/></div>
                        <p className="text-sm">zarp@outlook.com</p>
                    </div>
                    
                    <div className="flex gap-4 items-end">
                        <div className="bg-tertiary w-fit p-1 rounded-md"><MdLocationPin color="black" size={20}/></div>
                        <p className="text-sm">Calle Principal 454</p>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default Contactanos;
