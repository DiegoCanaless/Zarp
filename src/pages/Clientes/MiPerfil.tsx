import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// Componentes
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { Footer } from "../../components/layout/Footer";
import { ButtonPrimary } from "../../components/ui/buttons/ButtonPrimary";
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary";
import { ButtonTertiary } from "../../components/ui/buttons/ButtonTertiary";

// Modales externos (separados)
import PayPalModal from "../../components/ui/modals/PaypalModal";
import MPModal from "../../components/ui/modals/MPModal";

// Iconos
import { MdPriorityHigh } from "react-icons/md";

// Firebase / Redux / Helpers
import { getAuth, sendEmailVerification, updateProfile, updatePassword, reload } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../reducer/user/userSlice";
import { putCliente } from "../../helpers/putCliente";
import { uploadImageCloudinary } from "../../helpers/cloudinary";

// Types / enums
import type { ClienteDTO } from "../../types/entities/cliente/ClienteDTO";
import { AutorizacionesCliente } from "../../types/enums/AutorizacionesCliente";

const noCache = (url?: string | null) =>
  url ? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}` : "";

const MiPerfil: React.FC = () => {
  const auth = getAuth();
  const user = auth.currentUser || undefined;

  const usuario = useSelector((state: any) => state.user);
  const dispatch = useDispatch();

  // UI / form state
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombre, setNombre] = useState(usuario.fullname || "");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [revisando, setRevisando] = useState(false);
  const [saving, setSaving] = useState(false);

  // Imagen
  const [imagenPerfil, setImagenPerfil] = useState<string>(
    usuario.photoURL || user?.photoURL || ""
  );
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Modales externos
  const [isPayPalOpen, setIsPayPalOpen] = useState(false);
  const [isMPOpen, setIsMPOpen] = useState(false);

  // Verificación
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const verificandoRef = useRef(false);

  const isPasswordUser = !!user?.providerData.some((p: any) => p.providerId === "password");

  useEffect(() => {
    setNombre(usuario.fullname || "");
    setImagenPerfil(usuario.photoURL || user?.photoURL || "");
  }, [usuario.fullname, usuario.photoURL, user?.photoURL]);

  // --- pequeñas utilidades / verificación ---
  const patchVerificacionBackend = async (clienteId: number, token?: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APIBASE}/api/clientes/verificacion-correo/${clienteId}`,
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
          AuthenticatedDocs: data?.documentoVerificado ?? usuario.AuthenticatedDocs,
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

  // --- imagen ---
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

  // --- guardar perfil ---
  const actualizarPerfil = async () => {
    if (!user) return;
    try {
      setSaving(true);
      let newPhotoUrl: string | undefined = undefined;

      if (pendingFile) {
        const folder = `usuarios/${usuario?.id || user?.uid || "sin_id"}`;
        const publicId = `avatar_${usuario?.id || user?.uid}_${Date.now()}`;
        const rawUrl = await uploadImageCloudinary(pendingFile, folder, publicId);
        newPhotoUrl = rawUrl;
        setImagenPerfil(noCache(rawUrl));
      }

      // Nombre
      if (nombre && nombre !== usuario.fullname) {
        await updateProfile(user, { displayName: nombre }).catch(() => { });
      }

      // Foto en firebase (si corresponde)
      if (newPhotoUrl) {
        await updateProfile(user, { photoURL: newPhotoUrl }).catch(() => { });
        await reload(user).catch(() => { });
      }

      // Password
      if (isPasswordUser && (password || repeatPassword)) {
        if (password !== repeatPassword) {
          toast.error("Las contraseñas no coinciden");
          return;
        }
        if (password.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          return;
        }
        await updatePassword(user, repeatPassword).catch((e) => {
          throw e;
        });
      }

      // DTO para backend
      const dtoBackend: ClienteDTO = {
        uid: user.uid,
        nombreCompleto: nombre || usuario.fullname || "",
        correoElectronico: user.email || usuario.email || "",
        fotoPerfil: {
          urlImagen: newPhotoUrl ?? imagenPerfil ?? "",
        },
      };

      const token = await user.getIdToken().catch(() => undefined);

      if (!usuario?.id) throw new Error("No se encontró el id del cliente en el estado.");

      const actualizado = await putCliente(usuario.id, dtoBackend, token);

      dispatch(
        setUser({
          ...usuario,
          id: actualizado.id,
          fullname: actualizado.nombreCompleto,
          email: actualizado.correoElectronico,
          photoURL: actualizado.fotoPerfil?.urlImagen ?? (newPhotoUrl || usuario.photoURL),
          AuthenticatedEmail: actualizado.correoVerificado,
          AuthenticatedDocs: actualizado.documentoVerificado,
        })
      );

      toast.success("Perfil actualizado");
      // reset local edit state
      setModoEdicion(false);
      setPassword("");
      setRepeatPassword("");
      if (tempPreview) {
        URL.revokeObjectURL(tempPreview);
      }
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
        {/* FOTO */}
        <div className="flex flex-col md:mb-20 items-center">
          <h1 className="text-4xl text-white md:mb-5">Mi Perfil</h1>

          <label
            className={`relative group w-36 h-36 mt-2 md:w-52 md:h-52 ${isPasswordUser && modoEdicion ? "cursor-pointer" : "cursor-default"} block`}
            htmlFor={isPasswordUser && modoEdicion ? "imagenCambiar" : undefined}
          >
            <img
              key={tempPreview || imagenPerfil}
              src={tempPreview || imagenPerfil}
              className="w-full h-full rounded-full object-cover"
              alt="Foto de Perfil"
            />
            {isPasswordUser && modoEdicion && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-medium">
                  {saving ? "Guardando..." : pendingFile ? "Guardar para aplicar" : "Cambiar foto"}
                </span>
              </div>
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

        {/* DATOS */}
        <div className="flex flex-col items-start mt-6 gap-5 text-white mb-7 w-full max-w-3/4 md:w-90">
          {!modoEdicion ? (
            <>
              <div className="border-b border-b-black w-full pb-3">
                <p className="text-xs font-light">Nombre Completo:</p>
                <p className="text-md">{usuario.fullname}</p>
              </div>
              <div className="border-b border-b-black w-full pb-3">
                <p className="text-xs font-light">Correo Electrónico:</p>
                <p className="text-md">{usuario.email}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-full">
                <label htmlFor="nombre" className="text-xs font-light">Nombre Completo:</label>
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
                    <label htmlFor="newPassword" className="text-xs font-light">Nueva Contraseña</label>
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
                    <label htmlFor="repeatNewPassword" className="text-xs font-light">Repetir Contraseña:</label>
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
        {/* Verificaciones */}
        {!usuario.AuthenticatedEmail && (
          <div className="w-full max-w-3/4 m-auto flex flex-col items-center gap-3">
            <div
              className="flex items-center gap-2 bg-tertiary rounded-xl px-2 py-2 w-full cursor-pointer"
              onClick={() => setModalConfirmacion(true)}
            >
              <MdPriorityHigh fontSize={28} color="red" />
              <p className="text-xs">Falta verificación del correo</p>
            </div>

            <ButtonTertiary
              onClick={syncVerificacion}
              text={revisando ? "Revisando..." : "Revisar verificación"}
              maxWidth="max-w-[220px]"
              bgColor="bg-primary"
              className="px-5"
              fontSize="text-md"
            />
          </div>
        )}

        {!usuario.AuthenticatedDocs && (
          <Link to="/userVerificacion" className="w-full max-w-3/4 m-auto">
            <div className="flex items-center gap-2 bg-tertiary rounded-xl px-2 py-2 w-full">
              <MdPriorityHigh fontSize={28} color="red" />
              <p className="text-xs">Falta verificación de documentos</p>
            </div>
          </Link>
        )}

        {/* Acciones */}
        {!modoEdicion ? (
          <div className="flex flex-col justify-center items-center gap-4">
            <ButtonSecondary
              onClick={() => setModoEdicion(true)}
              text="Editar Datos"
              className="m-auto w-40"
              bgColor="bg-white"
              fontSize="text-md"
            />

            {usuario.rol === "PROPIETARIO" && (
              <div className="flex flex-col items-center gap-3 mt-3">
                {/* Botón Mercado Pago */}
                {(usuario.autorizaciones !== AutorizacionesCliente.AMBAS) && (usuario.autorizaciones !== AutorizacionesCliente.MERCADO_PAGO) && (
                  <button
                    onClick={() => setIsMPOpen(true)}
                    className={`cursor-pointer flex items-center justify-center gap-2 w-60 h-10 rounded-lg font-semibold text-white shadow-md transition-transform transform hover:scale-105 active:scale-95 bg-[#00aae4]`}
                  >
                    <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/6.7.2/mercadopago/logo__small.png" alt="Mercado Pago" className="w-5 h-5" />
                    Conectar con Mercado Pago
                  </button>
                )}

                {/* Botón PayPal */}
                {(usuario.autorizaciones !== AutorizacionesCliente.AMBAS) && (usuario.autorizaciones !== AutorizacionesCliente.PAYPAL) && (
                  <button
                    onClick={() => setIsPayPalOpen(true)}
                    className={`cursor-pointer flex items-center justify-center gap-2 w-60 h-10 rounded-lg font-semibold text-white shadow-md transition-transform transform hover:scale-105 active:scale-95 bg-[#0070BA]`}
                  >
                    <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-5 h-5" />
                    Conectar con PayPal
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row sm:gap-10 ">
            <ButtonSecondary
              onClick={actualizarPerfil}
              text={saving ? "Guardando..." : "Guardar Cambios"}
              className="m-auto w-40 cursor-pointer"
              bgColor="bg-primary"
              fontSize="text-md"
              color="text-white"
              maxWidth="w-[170px]"
              disabled={saving}
            />
            <ButtonSecondary
              onClick={() => {
                setModoEdicion(false);
                setNombre(usuario.fullname || "");
                setPassword("");
                setRepeatPassword("");
                if (tempPreview) URL.revokeObjectURL(tempPreview);
                setTempPreview(null);
                setPendingFile(null);
              }}
              text="Cancelar"
              className="m-auto w-40 cursor-pointer"
              bgColor="bg-red-900"
              fontSize="text-md"
              color="text-white"
            />
          </div>
        )}
      </div>

      <Footer />

      {/* Modal de confirmación simple para envío de email */}
      {modalConfirmacion && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-primary p-6 pt-2 rounded-lg shadow-lg max-w-md w-full text-center">
            <button className="ml-auto mb-2 text-white" onClick={() => setModalConfirmacion(false)}>✕</button>
            <h3 className="text-2xl font-medium mb-2 text-white">Verificación de Correo</h3>
            <p className="mb-4 text-white">Toca para recibir un correo de confirmación</p>
            <ButtonTertiary
              onClick={enviarCodigo}
              text="Enviar Correo"
              maxWidth="max-w-[160px]"
            />
          </div>
        </div>
      )}

      {/* Modales externos */}
      <PayPalModal isOpen={isPayPalOpen} onClose={() => setIsPayPalOpen(false)} usuario={usuario} />
      <MPModal isOpen={isMPOpen} onClose={() => setIsMPOpen(false)} usuario={usuario} />
    </div>
  );
};

export default MiPerfil;
