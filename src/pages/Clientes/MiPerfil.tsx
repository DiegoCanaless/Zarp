import toast from "react-hot-toast";

// Componentes
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary";
import { ButtonTertiary } from "../../components/ui/buttons/ButtonTertiary";

// Iconos
import { MdPriorityHigh } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";

// React/Redux/Firebase
import { useDispatch, useSelector } from "react-redux";
import { getAuth, sendEmailVerification, updateProfile, updatePassword, reload } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { setUser } from "../../reducer/user/userSlice";
import { Link } from "react-router-dom";

// types
import type { ClienteDTO } from "../../types/entities/cliente/ClienteDTO";
import { putCliente } from "../../helpers/putCliente";

// ✅ Nuevo helper de Cloudinary desacoplado
import { uploadImageCloudinary } from "../../helpers/cloudinary";

// Función opcional para cache-busting visual (por si acaso)
const noCache = (url?: string | null) =>
  url ? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}` : "";

const MiPerfil = () => {
  const auth = getAuth();
  const user = auth.currentUser || undefined;

  const usuario = useSelector((state: any) => state.user);
  const dispatch = useDispatch();

  const isPasswordUser = !!user?.providerData.some((p) => p.providerId === "password");

  // UI state
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState(usuario.fullname || "");
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [revisando, setRevisando] = useState(false);
  const verificandoRef = useRef(false);

  // imagen persistida actual
  const [imagenPerfil, setImagenPerfil] = useState(
    usuario.photoURL || user?.photoURL || ""
  );
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // --- Helpers de verificación ---
  const patchVerificacionBackend = async (clienteId: number, token?: string) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/clientes/verificacion-correo/${clienteId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) return false;
      const data = await res.json();
      dispatch(
        setUser({
          ...usuario,
          AuthenticatedEmail: !!data?.correoVerificado,
          AuthenticatedDocs:
            data?.documentoVerificado ?? usuario.AuthenticatedDocs,
        })
      );
      return !!data?.correoVerificado;
    } catch {
      return false;
    }
  };

  const syncVerificacion = async () => {
    if (!user || verificandoRef.current) return;
    verificandoRef.current = true;
    setRevisando(true);

    try {
      await reload(user);
      if (user.emailVerified && !usuario.AuthenticatedEmail) {
        dispatch(setUser({ ...usuario, AuthenticatedEmail: true }));
        const token = await user.getIdToken().catch(() => undefined);
        if (usuario.id) {
          const ok = await patchVerificacionBackend(usuario.id, token);
          if (ok) toast.success("Email verificado correctamente", { duration: 2500 });
        }
      }
    } finally {
      setRevisando(false);
      verificandoRef.current = false;
    }
  };

  useEffect(() => {
    if (user && !usuario.AuthenticatedEmail) syncVerificacion();
  }, [user, usuario.AuthenticatedEmail, usuario.id]);

  const enviarCodigo = async () => {
    if (!user) return toast.error("No hay usuario autenticado.");
    try {
      await sendEmailVerification(user);
      toast.success("Correo de verificación enviado", { duration: 2500 });
      setModalConfirmacion(false);
    } catch (e: any) {
      toast.error("No se pudo enviar el correo: " + (e?.message || "Error"));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Subí una imagen válida");
      return;
    }

    if (tempPreview) URL.revokeObjectURL(tempPreview);

    setPendingFile(file);
    setTempPreview(URL.createObjectURL(file));
    toast("Nueva foto lista para guardar", { icon: "🖼️" });
  };

  const actualizarPerfil = async () => {
    if (!user) return;

    try {
      setSaving(true);

      let newPhotoUrl: string | undefined;

      // ✅ Subida a Cloudinary usando el helper reutilizable
      if (pendingFile) {
        const folder = `usuarios/${usuario?.id || user?.uid || "sin_id"}`;
        const publicId = `avatar_${usuario?.id || user?.uid}_${Date.now()}`;

        const rawUrl = await uploadImageCloudinary(pendingFile, folder, publicId);
        const viewUrl = noCache(rawUrl);

        newPhotoUrl = rawUrl;
        setImagenPerfil(viewUrl);
      }

      // Nombre
      if (nombre && nombre !== usuario.fullname) {
        await updateProfile(user, { displayName: nombre });
      }

      // Foto
      if (newPhotoUrl) {
        await updateProfile(user, { photoURL: newPhotoUrl }).catch(() => {});
        await reload(user);
      }

      // Password
      if (isPasswordUser && (password || repeatPassword)) {
        if (password !== repeatPassword) {
          toast.error("Las contraseñas no coinciden");
          setSaving(false);
          return;
        }
        if (password.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          setSaving(false);
          return;
        }
        await updatePassword(user, repeatPassword);
      }

      // Actualizar backend
      const dtoBackend: ClienteDTO = {
        uid: user.uid,
        nombreCompleto: nombre || usuario.fullname || "",
        correoElectronico: user.email || usuario.email || "",
        fotoPerfil: {
          urlImagen: newPhotoUrl ?? imagenPerfil ?? "",
        },
      };

      const token = await user.getIdToken().catch(() => undefined);

      if (!usuario?.id) {
        throw new Error("No se encontró el id del cliente en el estado.");
      }

      const actualizado = await putCliente(usuario.id, dtoBackend, token);

      dispatch(
        setUser({
          ...usuario,
          id: actualizado.id,
          fullname: actualizado.nombreCompleto,
          email: actualizado.correoElectronico,
          photoURL:
            actualizado.fotoPerfil?.urlImagen ??
            (newPhotoUrl || usuario.photoURL),
          AuthenticatedEmail: actualizado.correoVerificado,
          AuthenticatedDocs: actualizado.documentoVerificado,
        })
      );

      toast.success("Perfil actualizado");

      setModoEdicion(false);
      setPassword("");
      setRepeatPassword("");
      if (tempPreview) URL.revokeObjectURL(tempPreview);
      setTempPreview(null);
      setPendingFile(null);
    } catch (e: any) {
      toast.error("Error al actualizar: " + (e?.message || "Desconocido"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <UsuarioHeader />

      <div className="flex-grow flex flex-col items-center pt-20 md:flex-row md:justify-evenly lg:px-20">
        <div className="flex flex-col md:mb-20">
          <h1 className="text-4xl text-white md:mb-5">Mi Perfil</h1>

          <label
            className={`relative group w-35 h-35 mt-2 md:w-50 md:h-50 ${
              isPasswordUser && modoEdicion
                ? "cursor-pointer"
                : "cursor-default"
            } block`}
            htmlFor={isPasswordUser && modoEdicion ? "imagenCambiar" : undefined}
          >
            {isPasswordUser && modoEdicion ? (
              <>
                <img
                  key={tempPreview || imagenPerfil}
                  src={tempPreview || imagenPerfil}
                  className="w-full h-full rounded-full object-cover brightness-50"
                  alt="Foto de Perfil"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {saving
                      ? "Guardando..."
                      : pendingFile
                      ? "Guardar para aplicar"
                      : "Cambiar foto"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <img
                  key={tempPreview || imagenPerfil}
                  src={tempPreview || imagenPerfil}
                  className="w-full h-full rounded-full object-cover"
                  alt="Foto de Perfil"
                />
                {!isPasswordUser && modoEdicion && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs px-2 py-1 rounded bg-black/60 text-white">
                      Foto vinculada a Google
                    </span>
                  </div>
                )}
              </>
            )}
          </label>

          <input
            type="file"
            name="imagenCambiar"
            id="imagenCambiar"
            className="hidden"
            onChange={handleImageChange}
            accept="image/*"
            disabled={!isPasswordUser || !modoEdicion}
          />
        </div>

        <div className="flex flex-col items-start mt-6 gap-5 text-white mb-7 w-full max-w-3/4 md:w-90">
          {!modoEdicion ? (
            <>
              <div className="border-b-1 border-b-black w-full">
                <p className="text-xs font-light">Nombre Completo:</p>
                <p className="text-md">{usuario.fullname}</p>
              </div>
              <div className="border-b-1 border-b-black w-full">
                <p className="text-xs font-light">Correo Electrónico:</p>
                <p className="text-md">{usuario.email}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-full">
                <label htmlFor="nombre" className="text-xs font-light">
                  Nombre Completo:
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0"
                />
              </div>

              {isPasswordUser ? (
                <>
                  <div className="w-full">
                    <label htmlFor="newPassword" className="text-xs font-light">
                      Nueva Contraseña
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="*******"
                      className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0"
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="repeatNewPassword" className="text-xs font-light">
                      Repetir Contraseña:
                    </label>
                    <input
                      id="repeatNewPassword"
                      type="password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      placeholder="*******"
                      className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-yellow-300 mt-2">
                  Este usuario inició sesión con Google y no puede cambiar su contraseña.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center bg-secondary pb-10 gap-5 text-white">
        {!usuario.AuthenticatedEmail && (
          <>
            <div
              className="flex items-center gap-2 bg-tertiary rounded-xl px-2 py-2 w-full max-w-3/4"
              onClick={() => setModalConfirmacion(true)}
            >
              <MdPriorityHigh fontSize={30} color="red" />
              <p className="text-xs">Falta verificación del correo</p>
            </div>

            <ButtonTertiary
              onClick={syncVerificacion}
              text={revisando ? "Revisando..." : "Revisar verificación"}
              maxWidth="max-w-[220px]"
              bgColor="bg-primary"
              className="px-5 cursor-pointer"
              fontSize="text-md"
            />
          </>
        )}

        {!usuario.AuthenticatedDocs && (
          <Link to="/userVerificacion" className="w-full max-w-3/4 m-auto">
            <div className="flex items-center gap-2 bg-tertiary rounded-xl px-2 py-2 w-full">
              <MdPriorityHigh fontSize={30} color="red" />
              <p className="text-xs">Falta verificación de documentos</p>
            </div>
          </Link>
        )}

        {!modoEdicion ? (
          <ButtonSecondary
            text="Editar Datos"
            className="m-auto w-40"
            bgColor="bg-white"
            maxWidth="max-w-[240px]"
            fontWeight="font-medium"
            fontSize="text-md"
            height="h-8"
            onClick={() => setModoEdicion(true)}
          />
        ) : (
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row sm:gap-10 ">
            <ButtonSecondary
              onClick={actualizarPerfil}
              text={saving ? "Guardando..." : "Guardar Cambios"}
              className="m-auto w-40"
              color="text-white"
              bgColor="bg-primary"
              maxWidth="max-w-[240px]"
              fontWeight="font-medium"
              fontSize="text-md"
              height="h-8"
              disabled={saving}
            />
            <ButtonSecondary
              text="Cancelar"
              className="m-auto w-40"
              color="text-white"
              bgColor="bg-red-900"
              maxWidth="max-w-[240px]"
              fontWeight="font-medium"
              fontSize="text-md"
              height="h-8"
              onClick={() => {
                setModoEdicion(false);
                setNombre(usuario.fullname || "");
                setPassword("");
                setRepeatPassword("");
                if (tempPreview) URL.revokeObjectURL(tempPreview);
                setTempPreview(null);
                setPendingFile(null);
              }}
            />
          </div>
        )}
      </div>

      <Footer />

      {modalConfirmacion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-primary p-6 pt-2 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
            <AiOutlineClose
              className="ml-auto cursor-pointer"
              onClick={() => setModalConfirmacion(false)}
              fontSize={20}
              color="white"
            />
            <h3 className="text-2xl font-medium mb-2 text-white">Verificación de Correo</h3>
            <p className="mb-4 text-white">Toca para recibir un correo de confirmación</p>
            <ButtonTertiary
              onClick={enviarCodigo}
              text="Enviar Correo"
              maxWidth="max-w-[160px]"
              className="px-5 cursor-pointer"
              fontSize="text-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MiPerfil;
