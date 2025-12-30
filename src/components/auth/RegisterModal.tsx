// src/pages/modals/RegisterModal.tsx
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

// Formulario
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";

// Redux
import { useDispatch } from "react-redux";
import { setUser } from "../../reducer/user/userSlice";
import fotoPerfil from "../../assets/Imagenes/fotoPerfilDefault.jpg";

// Firebase
import { auth } from "../../config/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

// Tipos
import type { ClienteDTO } from "../../types/entities/cliente/ClienteDTO";

// Helper (usa /existe-uid y /save del backend que ya tenés)
import { ensureClienteStrict } from "../../helpers/clientes";
import { fetchPropiedadesByCliente } from "../../helpers/propiedades";

interface RegisterModalProps {
  onClose: () => void;
}

const registerSchema = yup.object().shape({
  name: yup.string().required("El nombre es requerido").min(3, "Mínimo 3 caracteres"),
  email: yup.string().required("El correo es requerido").email("Formato inválido"),
  password: yup.string().required("La contraseña es requerida").min(8, "Mínimo 8 caracteres"),
  repeatpassword: yup
    .string()
    .required("Debes repetir la contraseña")
    .oneOf([yup.ref("password")], "Las contraseñas deben coincidir"),
});

export const RegisterModal = ({ onClose }: RegisterModalProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleBackdropClick = (e: any) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Google
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      const uid = result.user.uid;
      const nombre = result.user.displayName || "Sin nombre";
      const email = result.user.email || "";
      const foto = result.user.photoURL || fotoPerfil;
      const token = await result.user.getIdToken();
      const emailVerified = result.user.emailVerified;

      const cliente: ClienteDTO = {
        uid,
        nombreCompleto: nombre,
        correoElectronico: email,
        fotoPerfil: { urlImagen: foto },
      };

      const clienteResp = await ensureClienteStrict(cliente);

      // Opcional: logueá el payload para debug (borralo en prod)
      console.log("payload setUser (google register):", {
        id: clienteResp.id ?? null,
        uid: clienteResp.uid ?? uid,
        fullname: clienteResp.nombreCompleto ?? nombre,
        email: clienteResp.correoElectronico ?? email,
        token,
        photoURL: clienteResp.fotoPerfil?.urlImagen ?? foto,
        AuthenticatedEmail: clienteResp.correoVerificado ?? emailVerified,
        AuthenticatedDocs: clienteResp.documentoVerificado ?? false,
        rol: clienteResp.rol ?? "CLIENTE",
        autorizaciones: clienteResp.autorizaciones, // <-- importante
      });

      dispatch(
        setUser({
          id: clienteResp.id != null ? String(clienteResp.id) : "",
          uid: clienteResp.uid ?? uid,
          fullname: clienteResp.nombreCompleto ?? nombre,
          email: clienteResp.correoElectronico ?? email,
          token,
          photoURL: clienteResp.fotoPerfil?.urlImagen ?? foto,
          AuthenticatedEmail: clienteResp.correoVerificado ?? emailVerified,
          AuthenticatedDocs: clienteResp.documentoVerificado ?? false,
          rol: clienteResp.rol ?? "CLIENTE",
          autorizaciones: clienteResp.autorizaciones,
        })
      );


      toast.success("Usuario registrado con éxito", { position: "bottom-center" });

      // Redirección opcional por rol:
      const destino =
        (clienteResp.rol ?? "CLIENTE") === "SUPERADMIN" || (clienteResp.rol ?? "CLIENTE") === "EMPLEADO"
          ? "/Welcome"
          : "/Inicio";
      navigate(destino);

    } catch (error) {
      console.error("Error logueándose con Google", error);
      toast.error("No se pudo continuar con Google");
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-primary text-white rounded-lg relative overflow-hidden">
        {/* Cabecera */}
        <div className="sticky top-0 z-10 bg-primary p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-xl">Crear Cuenta</h2>
              <p className="text-xs mt-1">¡Vamos a crear una cuenta!</p>
            </div>
            <FaTimes
              onClick={onClose}
              className="text-gray-400 text-lg transition-colors cursor-pointer hover:text-white"
            />
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 px-4 py-2">
          <Formik
            initialValues={{ name: "", email: "", password: "", repeatpassword: "" }}
            validationSchema={registerSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const cred = await createUserWithEmailAndPassword(
                  auth,
                  values.email,
                  values.password
                );

                await updateProfile(cred.user, { displayName: values.name });
                await cred.user.reload();

                const uid = cred.user.uid;
                const nombre =
                  cred.user.displayName || values.name || values.email.split("@")[0];
                const email = cred.user.email || values.email;
                const foto = cred.user.photoURL || fotoPerfil;
                const token = await cred.user.getIdToken();
                const emailVerified = cred.user.emailVerified;

                const cliente: ClienteDTO = {
                  uid,
                  nombreCompleto: nombre,
                  correoElectronico: email,
                  fotoPerfil: { urlImagen: foto },
                };

                const clienteResp = await ensureClienteStrict(cliente);
                const photoURLSafe =
                  (clienteResp.fotoPerfil?.urlImagen && clienteResp.fotoPerfil.urlImagen.trim()) ||
                  (foto && foto.trim()) ||
                  undefined;


                let propiedades: any[] = [];
                if (clienteResp.id != null) {
                  try {
                    propiedades = await fetchPropiedadesByCliente(clienteResp.id, token);
                  } catch (e) {
                    console.warn("No se pudieron traer las propiedades del usuario:", e);
                    propiedades = [];
                  }
                }

                // Opcional: log para debug del payload que mandás al redux
                console.log("payload setUser (email register):", {
                  id: clienteResp.id ?? null,
                  uid: clienteResp.uid ?? uid,
                  fullname: clienteResp.nombreCompleto ?? nombre,
                  email: clienteResp.correoElectronico ?? email,
                  token,
                  photoURL: photoURLSafe,
                  AuthenticatedEmail: clienteResp.correoVerificado ?? emailVerified,
                  AuthenticatedDocs: clienteResp.documentoVerificado ?? false,
                  rol: clienteResp.rol ?? "CLIENTE",
                  autorizaciones: clienteResp.autorizaciones, // <-- importante
                  propiedades,
                });

                dispatch(
                  setUser({
                    id: clienteResp.id != null ? String(clienteResp.id) : "",
                    uid: clienteResp.uid ?? uid,
                    fullname: clienteResp.nombreCompleto ?? nombre,
                    email: clienteResp.correoElectronico ?? email,
                    token,
                    photoURL: photoURLSafe,
                    AuthenticatedEmail: clienteResp.correoVerificado ?? emailVerified,
                    AuthenticatedDocs: clienteResp.documentoVerificado ?? false,
                    rol: clienteResp.rol ?? "CLIENTE",
                    autorizaciones: clienteResp.autorizaciones,
                    propiedades,
                  })
                );


                toast.success("Usuario registrado con éxito", { position: "bottom-center" });

                // Redirección opcional por rol:
                const destino =
                  (clienteResp.rol ?? "CLIENTE") === "SUPERADMIN" || (clienteResp.rol ?? "CLIENTE") === "EMPLEADO"
                    ? "/Welcome"
                    : "/Inicio";
                navigate(destino);

              } catch (error: any) {
                if (error?.code === "auth/email-already-in-use") {
                  setFieldError("email", "El correo ya está registrado");
                } else {
                  setFieldError("email", error?.message || "Error al registrar");
                }
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="flex flex-col w-full gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name">Nombre Completo</label>
                  <Field type="text" name="name" id="name" placeholder="Martín Martín"
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent p-2 rounded ${errors.name && touched.name ? "border-red-500" : ""
                      }`}
                  />
                  <ErrorMessage name="name">
                    {(msg) => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email">Correo Electrónico</label>
                  <Field type="email" name="email" id="email" placeholder="ejemplo@correo.com"
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent p-2 rounded ${errors.email && touched.email ? "border-red-500" : ""
                      }`}
                  />
                  <ErrorMessage name="email">
                    {(msg) => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password">Contraseña</label>
                  <Field type="password" name="password" id="password" placeholder="Mínimo 8 caracteres"
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent p-2 rounded ${errors.password && touched.password ? "border-red-500" : ""
                      }`}
                  />
                  <ErrorMessage name="password">
                    {(msg) => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="repeatpassword">Repetir Contraseña</label>
                  <Field type="password" name="repeatpassword" id="repeatpassword" placeholder="Repite tu contraseña"
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent p-2 rounded ${errors.repeatpassword && touched.repeatpassword ? "border-red-500" : ""
                      }`}
                  />
                  <ErrorMessage name="repeatpassword">
                    {(msg) => <p className="text-red-500 text-xs mt-1">{msg}</p>}
                  </ErrorMessage>
                </div>

                <div className="mt-4 flex flex-col gap-4 pb-4">
                  <button type="submit" disabled={isSubmitting} className="h-12 rounded-lg w-full bg-secondary cursor-pointer text-lg transition-colors hover:bg-tertiary disabled:opacity-50" >
                    {isSubmitting ? "CREANDO CUENTA..." : "CREAR CUENTA"}
                  </button>

                  <div className="relative flex items-center justify-center my-2">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="flex-shrink mx-4 text-xs text-gray-400">o</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                  </div>

                  <button type="button" className="h-12 rounded-lg w-full bg-white text-black flex gap-2 justify-center cursor-pointer items-center text-sm" onClick={handleGoogleSignIn} >
                    <FcGoogle className="text-xl" /> Continuar con Google
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
