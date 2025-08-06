import fotoPerfil from "../assets/Imagenes/fotoPerfilDefault.jpg"
import toast from 'react-hot-toast';

// Componentes
import { UsuarioHeader } from "../components/layout/headers/UsuarioHeader"
import { Footer } from "../components/layout/Footer"
import { ButtonSecondary } from "../components/ui/buttons/ButtonSecondary"
import { ButtonTertiary } from "../components/ui/buttons/ButtonTertiary"

// Iconos
import { MdPriorityHigh } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";

// Edicion
import { useDispatch, useSelector } from "react-redux"
import { getAuth, sendEmailVerification, updateProfile, updatePassword, reload } from "firebase/auth";
import { useEffect, useState } from "react";
import { setUser } from "../reducer/user/userSlice";
import { Link } from "react-router-dom";

const MiPerfil = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const isPasswordUser = user?.providerData.some(
        (provider) => provider.providerId === "password"
    );

    const usuario = useSelector((state: any) => state.user)
    const imagenPerfil = usuario.photoURL || user?.photoURL || fotoPerfil;
    const dispatch = useDispatch();

    useEffect(() => {
        const verificarEstadoEmail = async () => {
            if (user) {
                await reload(user);
                if (user.emailVerified && !usuario.AuthenticatedEmail) {
                    dispatch(setUser({
                        ...usuario,
                        AuthenticatedEmail: true,
                    }));
                }
            }
        };

        verificarEstadoEmail();
    }, [user, usuario.AuthenticatedEmail, dispatch]);

    const actualizarPerfil = async () => {
        if (!user) return;

        try {
            // Cambiar el nombre
            if (nombre !== usuario.fullname) {
                await updateProfile(user, {
                    displayName: nombre
                });
            }

            // Cambiar la contraseña
            if (isPasswordUser && (password || repeatPassword)) {
                if (password !== repeatPassword) {
                    return (
                        toast.error('Las contraseñas no coinciden', {
                            duration: 3000
                        })
                    )
                    return
                }

                if (password.length < 6) {
                    toast.error('La contraseña debe tener al menos 6 caracteres', {
                        duration: 3000
                    })
                    return
                }

                await updatePassword(user, repeatPassword);
                console.log("Contraseña actualizada con éxito");
            }

            dispatch(setUser({
                fullname: nombre,
                email: usuario.email,
                token: usuario.token,
                AuthenticatedEmail: usuario.AuthenticatedEmail,
                AuthenticatedDocs: usuario.AuthenticatedDocs,
            }));

            toast.success('Perfil actualizado con exito', {
                duration: 3000
            })

            setModoEdicion(false);
            setPassword('');
            setRepeatPassword('');
        } catch (error: any) {
            toast.error('Error al actualizar el perfil:' + error.message, {
                duration: 3000
            })
        }
    }

    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
    const [nombre, setNombre] = useState<string>(usuario.fullname)
    const [modalConfirmacion, setModalConfirmacion] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [repeatPassword, setRepeatPassword] = useState<string>("");

    const abrirModalConfirmacion = () => {
        setModalConfirmacion(!modalConfirmacion)
    }

    const editar = () => {
        setModoEdicion(!modoEdicion);
    }

    const enviarCodigo = async () => {
        try {
            await sendEmailVerification(user);
            console.log("Código de verificación enviado");
        } catch (error: any) {
            console.error("Error al enviar código:", error);
        }
    }

    const cambiarFotoPerfil = () => {

    }

    return (
        // Contenedor principal que ocupa toda la altura de la pantalla
        <div className="min-h-screen flex flex-col bg-secondary">
            <UsuarioHeader />

            {/* Contenido principal que se expande para ocupar el espacio disponible */}
            <div className="flex-grow flex flex-col items-center pt-20 md:flex-row md:h-auto lg:min-h-auto md:justify-evenly lg:px-20">
                <div className="flex flex-col md:mb-20">
                    <h1 className="text-4xl text-white md:mb-5">Mi Perfil</h1>
                    <div className="relative group w-35 h-35 mt-2 md:w-50 md:h-50 cursor-pointer" onClick={cambiarFotoPerfil} >
                        <img src={imagenPerfil} className="w-full h-full rounded-full object-cover border-2 border-white group-hover:brightness-75 transition-all duration-150" alt="Foto de Perfil" />
                        <input type="file" accept="image/*" className="hidden" />
                        {isPasswordUser && (
                            <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-all duration-150">
                                <p className="text-xs">Cambiar foto</p>
                            </div>
                        )}

                    </div>


                </div>

                <div className="flex flex-col items-start mt-6 gap-5 text-white mb-7 w-full max-w-3/4 md:w-90">
                    {!modoEdicion ? (
                        <>
                            <div className="border-b-1 border-b-black w-full">
                                <p className="text-xs font-light">Nombre Completo:</p>
                                <p className="text-md">{usuario.fullname}</p>
                            </div>
                            <div className="border-b-1 border-b-black w-full">
                                <p className="text-xs font-light">Correo Electronico:</p>
                                <p className="text-md">{usuario.email}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-full">
                                <label htmlFor="nombre" className="text-xs font-light">Nombre Completo:</label>
                                <input id="nombre" type="text" value={nombre}
                                    onChange={e => setNombre(e.target.value)} className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0" />
                            </div>
                            <div className="border-b-1 border-b-black w-full">
                                <p className="text-xs font-light">Correo Electronico:</p>
                                <p className="text-md">{usuario.email}</p>
                            </div>
                            {isPasswordUser && (
                                <>
                                    <div className="w-full">
                                        <label htmlFor="newPassword" className="text-xs font-light">Nueva Contraseña</label>
                                        <input id="newPassword" type="password" value={password}
                                            onChange={e => setPassword(e.target.value)} placeholder="*******"
                                            className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0" />
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="repeatNewPassword" className="text-xs font-light">Repetir Contraseña:</label>
                                        <input id="repeatNewPassword" type="password" value={repeatPassword}
                                            onChange={e => setRepeatPassword(e.target.value)} placeholder="*******"
                                            className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0" />
                                    </div>
                                </>
                            )}

                            {!isPasswordUser && (
                                <p className="text-sm text-yellow-300 mt-2">
                                    Este usuario ha iniciado sesión con Google y no puede cambiar su contraseña.
                                </p>
                            )}

                        </>
                    )}
                </div>
            </div>

            {/* Sección de alertas y botones */}
            <div className="flex flex-col items-center bg-secondary pb-10 gap-5 text-white">
                {!usuario.AuthenticatedEmail && (
                    <div className="flex items-center gap-2 bg-tertiary rounded-xl px-2 py-2 cursor-pointer w-full max-w-3/4" onClick={abrirModalConfirmacion}>
                        <MdPriorityHigh fontSize={30} color="red" />
                        <p className="text-xs">Falta Verificacion del correo</p>
                    </div>
                )}

                {!usuario.AuthenticatedDocs && (
                    <Link to={'/userVerificacion'} className="w-full max-w-3/4 m-auto">
                        <div className="flex items-center gap-2 bg-tertiary rounded-xl px-2 py-2 cursor-pointer w-full ">
                            <MdPriorityHigh fontSize={30} color="red" />
                            <p className="text-xs">Falta Verificacion de documentos</p>
                        </div>
                    </Link>

                )}

                {!modoEdicion ? (
                    <ButtonSecondary onClick={editar} text="Editar Datos" className="m-auto w-40" bgColor="bg-white" maxWidth="max-w-[240px]" fontWeight="font-medium" fontSize="text-md" height="h-8" />
                ) : (
                    <div className="flex justify-center gap-10">
                        <ButtonSecondary onClick={actualizarPerfil} text="Guardar Cambios" className="m-auto w-40" color="text-white" bgColor="bg-primary" maxWidth="max-w-[240px]" fontWeight="font-medium" fontSize="text-md" height="h-8" />
                        <ButtonSecondary onClick={editar} text="Cancelar" className="m-auto w-40" color="text-white" bgColor="bg-red-900" maxWidth="max-w-[240px]" fontWeight="font-medium" fontSize="text-md" height="h-8" />


                    </div>
                )}
            </div>

            <Footer />

            {modalConfirmacion && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-primary p-6 pt-2 rounded-lg shadow-lg max-w-md w-full mx-4 flex flex-col items-center justify-center text-center">
                        <AiOutlineClose className="self-end" onClick={abrirModalConfirmacion} fontSize={20} color="white" />
                        <h3 className="text-2xl font-medium mb-2 text-white">Verificacion de Correo Electronico</h3>
                        <p className="mb-4 text-white">Toque para recibir un correo para confirmar</p>
                        <ButtonTertiary onClick={enviarCodigo} text='Enviar Correo' maxWidth="max-w-[160px]" className="px-5 cursor-pointer" fontSize="text-md" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default MiPerfil;