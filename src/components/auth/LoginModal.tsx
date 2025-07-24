import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { RegisterModal } from "./RegisterModal";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const navigate = useNavigate();

  // Cerrar Modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Inicio de Sesion con Google
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const nombre = result.user.displayName;
      navigate("/Inicio", { state: { nombre } });
      console.log(result.user);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  // Abrir registro
  const [AbrirRegistro, setAbrirRegistro] = useState<boolean>(false);

  function abrirModal() {
    setAbrirRegistro(true)
  }

  function cerrarModal() {
    setAbrirRegistro(false);
  }

  const schema = yup.object().shape({
    email: yup.string().required("El Correo es requerido").email("El email no tiene un formato válido"),
    password: yup.string().required("La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres")
  })

  return (
    <>
      <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center">
        <div className="w-full max-w-md min-h-fit flex flex-col bg-primary z-50 text-white rounded-lg p-4 relative">
          <FaTimes onClick={onClose} className="absolute top-4 right-4 text-gray-400 text-lg transition-colors cursor-pointer hover:text-white" />
          
          <div className="mt-6 mb-4">
            <h2 className="font-semibold text-xl">Iniciar Sesion</h2>
            <p className="text-xs mt-1">Vamos inicia sesion!</p>
          </div>

          <Formik 
            initialValues={{ email: "", password: "" }}
            onSubmit={(values) => {
              console.log("Formulario enviado", values)
            }}
            validationSchema={schema}
          >
            {({ values, errors, touched }) => (
              <Form className="flex flex-col w-full gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email">Correo</label>
                  <Field type="email" name="email" id="email" placeholder="JAAJAJAJAJ@gmail.com" 
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent ${
                      errors.email && touched.email ? "border-red-500" : ""
                    }`}
                  />
                  <ErrorMessage name="email">
                    {msg => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password">Contraseña</label>
                  <Field type="password" name="password" id="password" placeholder="Contraseña123" 
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent ${
                      errors.password && touched.password ? "border-red-500" : ""
                    }`}
                  />
                  <ErrorMessage name="password">
                    {msg => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <button type="submit" className="h-10 rounded-lg w-full md:w-3/5 mx-auto bg-secondary cursor-pointer text-lg transition-colors hover:bg-tertiary">CONTINUAR</button>
                  <button type="button" className="h-10 rounded-lg w-full md:w-3/5 mx-auto bg-white text-black flex gap-2 justify-center cursor-pointer items-center text-xs" onClick={handleGoogleSignIn}><FcGoogle /> Sign in with Google </button>
                  <p onClick={abrirModal} className="cursor-pointer text-center text-xs mt-2">¿No tenés cuenta? Registrate</p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Modal de registro */}
      {AbrirRegistro && (
        <RegisterModal onClose={cerrarModal} />
      )}
    </>
  )
}