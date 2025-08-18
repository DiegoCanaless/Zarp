// src/pages/modals/LoginModal.tsx
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { RegisterModal } from "./RegisterModal";
import toast from "react-hot-toast";

// Firebase
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../config/firebase";

// Formik / Yup
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";

// Redux
import { useDispatch } from "react-redux";
import { setUser } from "../../reducer/user/userSlice";

// Tipos
import type { ClienteDTO } from "../../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../../types/entities/cliente/ClienteResponseDTO";


import { ensureClienteConId } from "../../helpers/ensureClienteConId";

interface LoginModalProps {
  onClose: () => void;
}

const schema = yup.object().shape({
  email: yup.string().required("El Correo es requerido").email("El email no tiene un formato válido"),
  password: yup.string().required("La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [AbrirRegistro, setAbrirRegistro] = useState(false);

  const handleBackdropClick = (e: any) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Login con Google (guarda id + uid en Redux)
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      const uid = result.user.uid;
      const nombre = result.user.displayName || "Sin nombre";
      const email = result.user.email || "";
      const foto = result.user.photoURL || "";
      const token = await result.user.getIdToken();
      const emailVerified = result.user.emailVerified;

      const dto: ClienteDTO = {
        uid,
        nombreCompleto: nombre,
        correoElectronico: email,
        fotoPerfil: { urlImagen: foto },
      };

      let resp: ClienteResponseDTO;
      try {
        resp = await ensureClienteConId(dto);
      } catch (e) {
        console.warn("[google login] No se pudo asegurar/obtener id del cliente:", e);
        toast.error("No se pudo sincronizar con el backend");
        return; // si querés igual continuar sin id, podés quitar este return
      }

      dispatch(
        setUser({
          id: resp.id,                                   // 👈 id desde el backend
          uid: resp.uid,                                 // 👈 uid desde el backend
          fullname: resp.nombreCompleto ?? nombre,
          email: resp.correoElectronico ?? email,
          token,
          photoURL: resp.fotoPerfil?.urlImagen ?? foto,
          AuthenticatedEmail: resp.correoVerificado ?? emailVerified,
          AuthenticatedDocs: resp.documentoVerificado ?? false,
          rol: resp.rol ?? "CLIENTE"
        })
      );

      const destino =
        resp.rol === 'SUPERADMIN' || resp.rol === 'EMPLEADO'
          ? '/Welcome'
          : '/Inicio'

      navigate(destino)
    } catch (error) {
      console.error("Error signing in with Google", error);
      toast.error("No se pudo iniciar sesión con Google");
    }
  };

  return (
    <>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center"
      >
        <div className="w-full max-w-md min-h-fit flex flex-col bg-primary z-50 text-white rounded-lg p-4 relative">
          <FaTimes
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 text-lg transition-colors cursor-pointer hover:text-white"
          />
          <div className="mt-6 mb-4">
            <h2 className="font-semibold text-xl">Iniciar Sesión</h2>
            <p className="text-xs mt-1">¡Vamos, iniciá sesión!</p>
          </div>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                // 1) Login Firebase
                const result = await signInWithEmailAndPassword(
                  auth,
                  values.email,
                  values.password
                );

                const uid = result.user.uid;
                const nombre = result.user.displayName || values.email.split("@")[0] || "Usuario";
                const email = result.user.email || values.email;
                const foto = result.user.photoURL || "";
                const token = await result.user.getIdToken();
                const emailVerified = result.user.emailVerified;

                // 2) Back: asegurar y obtener id
                const dto: ClienteDTO = {
                  uid,
                  nombreCompleto: nombre,
                  correoElectronico: email,
                  fotoPerfil: { urlImagen: foto },
                };

                let resp: ClienteResponseDTO;
                try {
                  resp = await ensureClienteConId(dto);
                } catch (e) {
                  console.warn("[login] No se pudo asegurar/obtener id del cliente:", e);
                  toast.error("No se pudo sincronizar con el backend");
                  return; // si querés igual continuar sin id, podés quitar este return
                }

                // 3) Guardar en Redux con id + uid

                const photoURLSafe =
                  (resp.fotoPerfil?.urlImagen && resp.fotoPerfil.urlImagen.trim()) ||
                  (foto && foto.trim()) ||
                  undefined;


                dispatch(
                  setUser({
                    id: resp.id,
                    uid: resp.uid,
                    fullname: resp.nombreCompleto ?? nombre,
                    email: resp.correoElectronico ?? email,
                    token,
                    photoURL: photoURLSafe,
                    AuthenticatedEmail: resp.correoVerificado ?? emailVerified,
                    AuthenticatedDocs: resp.documentoVerificado ?? false,
                    rol: resp.rol ?? "CLIENTE"
                  })
                );

                const destino =
                  resp.rol === 'SUPERADMIN' || resp.rol === 'EMPLEADO'
                    ? '/Welcome'
                    : '/Inicio'

                navigate(destino)

              } catch (error: any) {
                const code = error?.code || "";
                if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
                  setFieldError("password", "Email o contraseña incorrectos");
                } else if (code === "auth/user-not-found") {
                  setFieldError("email", "El usuario no existe");
                } else if (code === "auth/too-many-requests") {
                  setFieldError("password", "Demasiados intentos, intentá más tarde");
                } else {
                  setFieldError("password", "No se pudo iniciar sesión");
                  console.error("Login error:", error);
                }
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col w-full gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email">Correo</label>
                  <Field type="email" name="email" id="email" placeholder="ejemplo@gmail.com" className="border-b-tertiary border-b-2 outline-0 bg-transparent" />
                  <ErrorMessage name="email">
                    {(msg) => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="password">Contraseña</label>
                  <Field type="password" name="password" id="password" placeholder="Contraseña123" className="border-b-tertiary border-b-2 outline-0 bg-transparent" />
                  <ErrorMessage name="password">
                    {(msg) => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  <button type="submit" disabled={isSubmitting} className="h-10 rounded-lg w-full bg-secondary cursor-pointer text-lg transition-colors hover:bg-tertiary" >
                    {isSubmitting ? "CARGANDO..." : "CONTINUAR"}
                  </button>
                  <button type="button" className="h-10 rounded-lg w-full bg-white text-black flex gap-2 justify-center cursor-pointer items-center text-xs" onClick={handleGoogleSignIn} >
                    <FcGoogle /> Sign in with Google
                  </button>
                  <p onClick={() => setAbrirRegistro(true)} className="cursor-pointer text-center text-xs mt-2" > ¿No tenés cuenta? Registrate </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {AbrirRegistro && <RegisterModal onClose={() => setAbrirRegistro(false)} />}
    </>
  );
};
