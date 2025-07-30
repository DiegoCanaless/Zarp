import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { RegisterModal } from "./RegisterModal";


// Google
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

// Formulario
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";

// Redux
import { useDispatch } from 'react-redux';
import { setUser } from '../../reducer/user/userSlice';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Cerrar Modal
  const handleBackdropClick = (e: any) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Google login
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const nombre = result.user.displayName;
      const email = result.user.email;
      const token = await result.user.getIdToken();
      dispatch(setUser({
        fullname: nombre,
        email,
        token,
      }));
      navigate("/Inicio");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const [AbrirRegistro, setAbrirRegistro] = useState(false);

  const schema = yup.object().shape({
    email: yup.string().required("El Correo es requerido").email("El email no tiene un formato válido"),
    password: yup.string().required("La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres")
  });

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
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const result = await signInWithEmailAndPassword(auth, values.email, values.password);
                const nombre = result.user.displayName;
                const email = result.user.email;
                const token = await result.user.getIdToken();
                dispatch(setUser({
                  fullname: nombre || email?.split("@")[0] || "Usuario",
                  email,
                  token,
                }));
                navigate("/Inicio");
              } catch (error) {
                setFieldError("password", "Email o contraseña incorrectos");
                setSubmitting(false);
              }
            }}
            validationSchema={schema}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col w-full gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email">Correo</label>
                  <Field type="email" name="email" id="email" placeholder="ejemplo@gmail.com" 
                    className="border-b-tertiary border-b-2 outline-0 bg-transparent" />
                  <ErrorMessage name="email">
                    {msg => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="password">Contraseña</label>
                  <Field type="password" name="password" id="password" placeholder="Contraseña123" 
                    className="border-b-tertiary border-b-2 outline-0 bg-transparent" />
                  <ErrorMessage name="password">
                    {msg => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  <button type="submit" disabled={isSubmitting} className="h-10 rounded-lg w-full bg-secondary cursor-pointer text-lg transition-colors hover:bg-tertiary">
                    {isSubmitting ? "CARGANDO..." : "CONTINUAR"}
                  </button>
                  <button type="button" className="h-10 rounded-lg w-full bg-white text-black flex gap-2 justify-center cursor-pointer items-center text-xs" onClick={handleGoogleSignIn}><FcGoogle /> Sign in with Google </button>
                  <p onClick={() => setAbrirRegistro(true)} className="cursor-pointer text-center text-xs mt-2">¿No tenés cuenta? Registrate</p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {AbrirRegistro && <RegisterModal onClose={() => setAbrirRegistro(false)} />}
    </>
  )
}