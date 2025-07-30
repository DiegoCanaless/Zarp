import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";


// Formulario
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as yup from "yup";

// Redux
import { useDispatch } from 'react-redux';
import { setUser } from '../../reducer/user/userSlice';

// Google
import { auth } from "../../config/firebase";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";


export const RegisterModal = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleBackdropClick = (e) => {
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

  const registerSchema = yup.object().shape({
    name: yup.string().required("El nombre es requerido").min(3, "El nombre debe tener al menos 3 caracteres"),
    email: yup.string().required("El correo es requerido").email("El correo no tiene un formato válido"),
    password: yup.string().required("La contraseña es requerida").min(8, "La contraseña debe tener al menos 8 caracteres"),
    repeatpassword: yup.string().required("Debes repetir la contraseña").oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
  });

  return (
    <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-primary text-white rounded-lg relative overflow-hidden">
        {/* Cabecera fija */}
        <div className="sticky top-0 z-10 bg-primary p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-xl">Crear Cuenta</h2>
              <p className="text-xs mt-1">Vamos a crear una cuenta!</p>
            </div>
            <FaTimes onClick={onClose} className="text-gray-400 text-lg transition-colors cursor-pointer hover:text-white" />
          </div>
        </div>
        {/* Contenido desplazable */}
        <div className="overflow-y-auto flex-1 px-4 py-2">
          <Formik 
            initialValues={{ name: "", email: "", password: "", repeatpassword: "" }}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const result = await createUserWithEmailAndPassword(auth, values.email, values.password);
                // Set displayName for the user
                await updateProfile(result.user, { displayName: values.name });
                const nombre = result.user.displayName || values.name;
                const email = result.user.email;
                const token = await result.user.getIdToken();
                dispatch(setUser({
                  fullname: nombre,
                  email,
                  token,
                }));
                navigate("/Inicio");
              } catch (error) {
                if (error.code === "auth/email-already-in-use") {
                  setFieldError("email", "El correo ya está registrado");
                } else {
                  setFieldError("email", error.message);
                }
                setSubmitting(false);
              }
            }}
            validationSchema={registerSchema}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="flex flex-col w-full gap-4 py-2">
                {/* Nombre completo */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name">Nombre Completo</label>
                  <Field type="text" name="name" id="name" placeholder="Martin Martin"
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent p-2 rounded ${errors.name && touched.name ? "border-red-500" : ""}`} />
                  <ErrorMessage name="name">{msg => <p className="text-red-500 text-xs mt-1">{msg}</p>}</ErrorMessage>
                </div>
                {/* Correo electrónico */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email">Correo Electrónico</label>
                  <Field type="email" name="email" id="email" placeholder="ejemplo@correo.com"
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent p-2 rounded ${errors.email && touched.email ? "border-red-500" : ""}`} />
                  <ErrorMessage name="email">{msg => <p className="text-red-500 text-xs mt-1">{msg}</p>}</ErrorMessage>
                </div>
                {/* Contraseña */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="password">Contraseña</label>
                  <Field type="password" name="password" id="password" placeholder="Mínimo 8 caracteres"
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent p-2 rounded ${errors.password && touched.password ? "border-red-500" : ""}`} />
                  <ErrorMessage name="password">{msg => <p className="text-red-500 text-xs mt-1">{msg}</p>}</ErrorMessage>
                </div>
                {/* Repetir Contraseña */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="repeatpassword">Repetir Contraseña</label>
                  <Field type="password" name="repeatpassword" id="repeatpassword" placeholder="Repite tu contraseña"
                    className={`border-b-tertiary border-b-2 outline-0 bg-transparent p-2 rounded ${errors.repeatpassword && touched.repeatpassword ? "border-red-500" : ""}`} />
                  <ErrorMessage name="repeatpassword">{msg => <p className="text-red-500 text-xs mt-1">{msg}</p>}</ErrorMessage>
                </div>
                <div className="mt-4 flex flex-col gap-4 pb-4">
                  <button type="submit" disabled={isSubmitting}
                    className="h-12 rounded-lg w-full bg-secondary cursor-pointer text-lg transition-colors hover:bg-tertiary disabled:opacity-50">
                    {isSubmitting ? "CREANDO CUENTA..." : "CREAR CUENTA"}
                  </button>
                  <div className="relative flex items-center justify-center my-2">
                    <div className="flex-grow border-t border-gray-400"></div>
                    <span className="flex-shrink mx-4 text-xs text-gray-400">o</span>
                    <div className="flex-grow border-t border-gray-400"></div>
                  </div>
                  <button type="button"
                    className="h-12 rounded-lg w-full bg-white text-black flex gap-2 justify-center cursor-pointer items-center text-sm"
                    onClick={handleGoogleSignIn}>
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