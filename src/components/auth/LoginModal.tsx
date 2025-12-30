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
import { fetchPropiedadesByCliente } from "../../helpers/propiedades";

// Tipos
import type { ClienteDTO } from "../../types/entities/cliente/ClienteDTO";
import type { ClienteResponseDTO } from "../../types/entities/cliente/ClienteResponseDTO";
import { ensureUsuarioConIdLogin } from "../../helpers/ensureClienteConId";

interface LoginModalProps {
  onClose: () => void;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .required("El Correo es requerido")
    .email("El email no tiene un formato válido"),
  password: yup
    .string()
    .required("La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [AbrirRegistro, setAbrirRegistro] = useState(false);

  const handleBackdropClick = (e: any) => {
    if (e.target === e.currentTarget) onClose();
  };

  /** Redirección por rol */
  const redirigirPorRol = (rol?: string) => {
    const destino =
      rol === "SUPERADMIN" || rol === "EMPLEADO" ? "/WelcomeAdmin" : "/Inicio";
    navigate(destino);
  };

  /** Guardar en Redux normalizando campos */
  const setUserFromResponse = async (
    resp: ClienteResponseDTO,
    fallback: {
      nombre: string;
      email: string;
      foto?: string | null;
      token: string;
      emailVerified: boolean;
    }
  ) => {
    const photoURLSafe =
      (resp.fotoPerfil?.urlImagen && resp.fotoPerfil.urlImagen.trim()) ||
      (fallback.foto && fallback.foto.trim()) ||
      undefined;
    let propiedades: any[] = [];
    if (resp.id != null) {
      try {
        propiedades = await fetchPropiedadesByCliente(resp.id, fallback.token);
      } catch (e) {
        console.warn("No se pudieron traer las propiedades del usuario:", e);
        propiedades = [];
      }
    }

    // Opcional: log para debug del payload que mandás al redux
    console.log("payload setUser (login):", {
      id: resp.id,
      uid: resp.uid,
      fullname: resp.nombreCompleto ?? fallback.nombre,
      email: resp.correoElectronico ?? fallback.email,
      token: fallback.token,
      photoURL: photoURLSafe,
      AuthenticatedEmail: resp.correoVerificado ?? fallback.emailVerified,
      AuthenticatedDocs: resp.documentoVerificado ?? false,
      rol: resp.rol ?? "CLIENTE",
      autorizaciones: resp.autorizaciones,
      propiedades,
    });

    dispatch(
      setUser({
        id: String(resp.id), // ✅ FIX
        uid: resp.uid,
        fullname: resp.nombreCompleto ?? fallback.nombre,
        email: resp.correoElectronico ?? fallback.email,
        token: fallback.token,
        photoURL: photoURLSafe,
        AuthenticatedEmail: resp.correoVerificado ?? fallback.emailVerified,
        AuthenticatedDocs: resp.documentoVerificado ?? false,
        rol: resp.rol ?? "CLIENTE",
        autorizaciones: resp.autorizaciones,
        propiedades,
      })
    );


    redirigirPorRol(resp.rol ?? "CLIENTE");
  };

  // Login con Google (unificado cliente/empleado)
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
        resp = await ensureUsuarioConIdLogin(dto);
      } catch (e: any) {
        console.warn("[google login] No se pudo asegurar/obtener id del usuario:", e);
        // Manejo específico: cuenta bloqueada
        if (e?.name === "CuentaBloqueadaError" || e?.message === "Cuenta bloqueada") {
          toast.error("Cuenta bloqueada");
          return;
        }
        toast.error("No se pudo sincronizar con el backend");
        return;
      }

      await setUserFromResponse(resp, {
        nombre,
        email,
        foto,
        token,
        emailVerified,
      });
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
                const nombre =
                  result.user.displayName ||
                  values.email.split("@")[0] ||
                  "Usuario";
                const email = result.user.email || values.email;
                const foto = result.user.photoURL || "";
                const token = await result.user.getIdToken();
                const emailVerified = result.user.emailVerified;

                // 2) Back: asegurar/obtener usuario (cliente o empleado)
                const dto: ClienteDTO = {
                  uid,
                  nombreCompleto: nombre,
                  correoElectronico: email,
                  fotoPerfil: { urlImagen: foto },
                };

                let resp: ClienteResponseDTO;
                try {
                  resp = await ensureUsuarioConIdLogin(dto);
                } catch (e: any) {
                  console.warn("[login] No se pudo asegurar/obtener id del usuario:", e);
                  // Manejo específico: cuenta bloqueada
                  if (e?.name === "CuentaBloqueadaError" || e?.message === "Cuenta bloqueada") {
                    toast.error("Cuenta bloqueada");
                    setSubmitting(false);
                    return;
                  }
                  toast.error("No se pudo sincronizar con el backend");
                  setSubmitting(false);
                  return;
                }

                // 3) Guardar en Redux y redirigir por rol
                await setUserFromResponse(resp, {
                  nombre,
                  email,
                  foto,
                  token,
                  emailVerified,
                });
                // Desactivamos el spinner al terminar todo correctamente
                setSubmitting(false);
              } catch (error: any) {
                const code = error?.code || "";
                if (
                  code === "auth/invalid-credential" ||
                  code === "auth/wrong-password"
                ) {
                  setFieldError("password", "Email o contraseña incorrectos");
                } else if (code === "auth/user-not-found") {
                  setFieldError("email", "El usuario no existe");
                } else if (code === "auth/too-many-requests") {
                  setFieldError(
                    "password",
                    "Demasiados intentos, intentá más tarde"
                  );
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
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    placeholder="ejemplo@gmail.com"
                    className="border-b-tertiary border-b-2 outline-0 bg-transparent"
                    autoComplete="email"
                  />
                  <ErrorMessage name="email">
                    {(msg) => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="password">Contraseña</label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Contraseña123"
                    className="border-b-tertiary border-b-2 outline-0 bg-transparent"
                    autoComplete="current-password"
                  />
                  <ErrorMessage name="password">
                    {(msg) => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 rounded-lg w-full bg-secondary cursor-pointer text-lg transition-colors hover:bg-tertiary disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "CARGANDO..." : "CONTINUAR"}
                  </button>
                  <button
                    type="button"
                    className="h-10 rounded-lg w-full bg-white text-black flex gap-2 justify-center cursor-pointer items-center text-xs"
                    onClick={handleGoogleSignIn}
                  >
                    <FcGoogle /> Sign in with Google
                  </button>
                  <p
                    onClick={() => setAbrirRegistro(true)}
                    className="cursor-pointer text-center text-xs mt-2"
                  >
                    ¿No tenés cuenta? Registrate
                  </p>
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
