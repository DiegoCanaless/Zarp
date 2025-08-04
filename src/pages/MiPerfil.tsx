
import fotoPerfil from "../assets/Imagenes/FotoPeruano.jpg"

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
import { getAuth, reload, sendEmailVerification, updateProfile, updatePassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { setUser } from "../reducer/user/userSlice";


const MiPerfil = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const usuario = useSelector((state: any) => state.user)
    const dispatch = useDispatch();

    useEffect(() => {
        const verificarEstadoEmail = async () => {
            if (user) {
                await reload(user);
                if (user.emailVerified && !usuario.AuthenticatedEmail) {
                    // Actualizar el estado en Redux si el email ya está verificado
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
            if (password || repeatPassword) {
                if (password !== repeatPassword) {
                    return alert("Las contraseñas no coinciden");
                }
                if (password.length < 6) {
                    return alert("La contraseña debe tener al menos 6 caracteres");
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

            console.log("Perfil actualizado con éxito");
            setModoEdicion(false);
            setPassword('');
            setRepeatPassword('');
        } catch (error: any) {
            console.log("Error al actualizar el perfil:", error.message);
            alert("Error: " + error.message);
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


    return (
        <>
            <UsuarioHeader />
            <div className="w-full flex flex-col items-center pb-10 bg-secondary pt-20">
                <h1 className="text-4xl text-white">Mi Perfil</h1>
                <img src={fotoPerfil} className="w-35 h-35 mt-2 rounded-full" alt="Foto de Perfil" />

                <div className="flex flex-col items-start mt-6 w-60 gap-5 text-white mb-7">
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
                            <div className="  w-full">
                                <p className="text-xs font-light">Nombre Completo:</p>
                                <input type="text" value={nombre}
                                    onChange={e => setNombre(e.target.value)} className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0" />
                            </div>
                            <div className="border-b-1 border-b-black w-full">
                                <p className="text-xs font-light">Correo Electronico:</p>
                                <p className="text-md">{usuario.email}</p>
                            </div>
                            <div className="  w-full">
                                <p className="text-xs font-light">Nueva Contraseña:</p>
                                <input type="password" value={password}
                                    onChange={e => setPassword(e.target.value)} placeholder="*******" className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0" />
                            </div>
                            <div className="  w-full">
                                <p className="text-xs font-light">Nombre Completo:</p>
                                <input type="password" value={repeatPassword}
                                    onChange={e => setRepeatPassword(e.target.value)} placeholder="*******" className="bg-tertiary w-full rounded-3xl h-8 pl-3 text-md outline-0" />
                            </div>

                        </>

                    )}



                    {!usuario.AuthenticatedEmail && (
                        <div className="flex items-center gap-2 bg-tertiary rounded-xl px-2 py-2 cursor-pointer" onClick={abrirModalConfirmacion}>
                            <MdPriorityHigh fontSize={30} color="red" />
                            <p className="text-xs">Falta Verificacion del correo</p>
                        </div>
                    )}

                    {!usuario.AuthenticatedDocs && (
                        <div className="flex items-center gap-2 bg-tertiary rounded-xl px-2 py-2 cursor-pointer">
                            <MdPriorityHigh fontSize={30} color="red" />
                            <p className="text-xs">Falta Verificacion de documentos</p>
                        </div>
                    )}
                </div>

                {!modoEdicion ? (
                    <ButtonSecondary onClick={editar} text="Editar Datos" className="m-auto w-40" bgColor="bg-white" maxWidth="max-w-[240px]" fontWeight="font-medium" fontSize="text-md" height="h-8" />
                ) : (
                    <ButtonSecondary onClick={actualizarPerfil} text="Guardar Cambios" className="m-auto w-40" color="text-white" bgColor="bg-primary" maxWidth="max-w-[240px]" fontWeight="font-medium" fontSize="text-md" height="h-8" />

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

        </>

    )
}

export default MiPerfil