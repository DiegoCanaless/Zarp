import { Link, useNavigate } from "react-router-dom";
import logoZarp from '../../../assets/Logo/logoZarp.png'
import { ImUser } from "react-icons/im";
import { ButtonPrimary } from '../../ui/buttons/ButtonPrimary'
import { useState, type JSX } from "react";

// Icons
import { AiOutlineClose } from "react-icons/ai";
import { FaHouseChimney, FaXTwitter, FaInstagram } from "react-icons/fa6";
import { MdEmail, MdAddHomeWork, MdOutlineMail, MdLogout, MdHolidayVillage, MdOutlineContactMail, MdListAlt, MdGroup, MdOutlineSettings } from "react-icons/md";
import { CiFacebook } from "react-icons/ci";

import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuthenticated, selectUserRol } from '../../../reducer/user/userSlice';
import { getRoleHome } from "../../../helpers/getRoleHome";

type NavItem = {
    title: string;
    icon: JSX.Element;
    url?: string;
    onClick?: () => void;
};

export const UsuarioHeader = () => {
    const usuario = useSelector((state: any) => state.user);

    // Router/Redux
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Nav lateral
    const [navOpen, setNavOpen] = useState<boolean>(false);
    const abrirNav = () => setNavOpen(v => !v);

    // Go Home
    const isAuth = useSelector(selectIsAuthenticated);
    const role = useSelector(selectUserRol);
    const handleGoHome = () => {
        const target = getRoleHome(role, isAuth);
        navigate(target, { replace: true });
    };

    // Logout centralizado (cierra nav + navega)
    const handleLogout = () => {
        dispatch(logout());
        setNavOpen(false);
        navigate('/', { replace: true });
    };

    // Items por rol
    const linksCliente: NavItem[] = [
        { title: "Mi Perfil", url: "/Perfil", icon: <ImUser color="white" fontSize={25} className="cursor-pointer mr-5" /> },
        { title: "Catalogo", url: "/Inicio", icon: <MdAddHomeWork color="white" fontSize={25} className="cursor-pointer mr-5" /> },
        { title: "Contactanos", url: "/Contactanos", icon: <MdOutlineMail color="white" fontSize={25} className="cursor-pointer mr-5" /> },
        { title: "Cerrar Sesion", onClick: handleLogout, icon: <MdLogout color="white" fontSize={25} className="cursor-pointer mr-5" /> },
    ];

    const linksAdmin: NavItem[] = [
        { title: "Verificaciones", url: "/VerificacionesAdmin", icon: <MdOutlineContactMail color="white" fontSize={25} className="cursor-pointer mr-5" /> },
        { title: "Listas", url: "/Listas", icon: <MdListAlt color="white" fontSize={25} className="cursor-pointer mr-5" /> },
        { title: "Cerrar Sesion", onClick: handleLogout, icon: <MdLogout color="white" fontSize={25} className="cursor-pointer mr-5" /> },
    ];

    const navbarLinksByRole: Record<string, NavItem[]> = {
        CLIENTE: linksCliente,
        PROPIETARIO: [
            { title: "Mensajes", url: "#", icon: <MdEmail color="white" fontSize={25} className="cursor-pointer mr-5" /> },
            { title: "Reservas", url: "#", icon: <FaHouseChimney color="white" fontSize={25} className="cursor-pointer mr-5" /> },
            { title: "Mis Propiedades", url: "#", icon: <MdHolidayVillage color="white" fontSize={25} className="cursor-pointer mr-5" /> },
            ...linksCliente,
        ],
        EMPLEADO: linksAdmin,
        SUPERADMIN: [
            { title: "Configuracion", url: "/Configuracion", icon: <MdOutlineSettings color="white" fontSize={25} className="cursor-pointer mr-5" /> },
            { title: "Administradores", url: "#", icon: <MdGroup color="white" fontSize={25} className="cursor-pointer mr-5" /> },
            ...linksAdmin,
        ]
    };

    const navLinks = navbarLinksByRole[role] || [];

    const redes = [
        { icon: <FaXTwitter fontSize={20} className="hover:text-secondary cursor-pointer" />, url: "#", title: "Twitter" },
        { icon: <FaInstagram fontSize={20} className="hover:text-secondary cursor-pointer" />, url: "#", title: "Instagram" },
        { icon: <CiFacebook fontSize={20} className="hover:text-secondary cursor-pointer" />, url: "#", title: "Facebook" },
    ];

    return (
        <>
            <header className='bg-primary h-15 w-full px-2 flex justify-between items-center fixed top-0 left-0 z-20 md:px-5'>
                <img onClick={handleGoHome} src={logoZarp} alt="Logo de Zarp" className='h-30 w-20 object-contain md:h-35 md:w-30 cursor-pointer' />

                <div className="flex gap-2 items-center md:px-5">
                    {usuario.rol === "CLIENTE" ? (
                        <ButtonPrimary text="Convertirse en Propietario" maxWidth="max-w-[190px]" className="px-2" />
                    ) : null}

                    <ImUser onClick={abrirNav} color="white" fontSize={25} className="cursor-pointer" />
                </div>

                {navOpen && (
                    <div className="absolute h-screen top-0 right-0 z-50 bg-primary text-white shadow-lg p-4 w-60">
                        <AiOutlineClose onClick={abrirNav} color="white" fontSize={30} className="cursor-pointer mb-5 mt-2" />
                        <hr className="w-full bg-white mb-5" />
                        <ul className="flex flex-col gap-8">
                            {navLinks.map((link: any) => (
                                <li key={link.title} className="flex items-center">
                                    {link.onClick ? (
                                        <button type="button" onClick={link.onClick} className="cursor-pointer flex items-center w-full text-left" >
                                            {link.icon}
                                            <span className="text-lg font-medium hover:text-secondary">{link.title}</span>
                                        </button>
                                    ) : (
                                        // Navegación normal
                                        <Link to={link.url!} className="flex items-center" onClick={() => setNavOpen(false)} >
                                            {link.icon}
                                            <span className="text-lg font-medium hover:text-secondary">{link.title}</span>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-center items-center gap-4 mt-15">
                            {redes.map((redes) => (
                                <Link to={redes.url} key={redes.title}>
                                    {redes.icon}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};
