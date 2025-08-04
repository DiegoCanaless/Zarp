import { Link, useNavigate } from "react-router-dom"
import logoZarp from '../../../assets/Logo/logoZarp.png'
import { ImUser } from "react-icons/im";
import { ButtonPrimary  } from '../../ui/buttons/ButtonPrimary'
import { useState } from "react";

//Icons

import { AiOutlineClose } from "react-icons/ai";
import { FaHouseChimney, FaXTwitter, FaInstagram } from "react-icons/fa6";
import { MdEmail, MdAddHomeWork, MdOutlineMail, MdLogout   } from "react-icons/md";
import { CiFacebook } from "react-icons/ci";


import { useDispatch } from 'react-redux';
import { logout } from '../../../reducer/user/userSlice';

export const UsuarioHeader = () => {

    // Logout
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const Logout = () => {
        dispatch(logout()); // Ejecutar la acción de logout
        navigate('/'); // Redirigir a la página principal o login
    };



    // AbrirModal
    const [navOpen, setNavOpen] = useState<boolean>(false)

    const abrirNav = () => {
        setNavOpen(!navOpen);
    }


    return (
        <>
            <header className='bg-primary h-15 w-full px-2 flex justify-between items-center fixed top-0 left-0 z-20 md:px-5'>
                <Link to={"/"}><img src={logoZarp} alt="Logo de Zarp" className='h-30 w-20 object-contain md:h-35 md:w-30 cursor-pointer' /></Link>

                <div className="flex gap-2 items-center md:px-5">
                    <ButtonPrimary text="Convertirse en Propietario" maxWidth="max-w-[190px]" className="px-2" />
                    <ImUser onClick={abrirNav} color="white" fontSize={25} className="cursor-pointer" />
                </div>

                {navOpen && (
                    <div className="absolute h-screen top-0 right-0 z-50 bg-primary text-white shadow-lg  p-4 w-60">
                        <AiOutlineClose onClick={abrirNav} color="white" fontSize={30} className="cursor-pointer mb-5 mt-2" />
                        <hr className="w-full bg-white mb-5"/>
                        <ul className="flex flex-col gap-8">
                            <li className="flex items-center ">
                                <Link to="/Perfil"><ImUser color="white" fontSize={25} className="cursor-pointer mr-5" /></Link>
                                <Link to="/Perfil" className="text-lg font-medium hover:text-secondary">Mi Perfil</Link>
                            </li>
                            <li className="flex items-center ">
                                <Link to="/catalogo"><MdAddHomeWork color="white" fontSize={25} className="cursor-pointer mr-5" /></Link>
                                <Link to="/catalogo" className=" text-lg font-medium hover:text-secondary">Catalogo</Link>
                            </li>
                            <li className="flex items-center ">
                                <Link to="/mensajes"><MdEmail color="white" fontSize={25} className="cursor-pointer mr-5" /></Link>
                                <Link to="/mensajes" className=" text-lg font-medium hover:text-secondary">Mensajes</Link>
                            </li>
                            <li className="flex items-center ">
                                <Link to="/reservas"><FaHouseChimney color="white" fontSize={25} className="cursor-pointer mr-5" /></Link>
                                <Link to="/reservas" className=" text-lg font-medium hover:text-secondary">Reservas</Link>
                            </li>
                            <li className="flex items-center ">
                                <Link to="/contactanos" ><MdOutlineMail color="white" fontSize={25} className="cursor-pointer mr-5" /></Link>
                                <Link to="/contactanos" className=" text-lg font-medium hover:text-secondary">Contactanos</Link>
                            </li>
                            <li className="flex items-center ">
                                <Link to="/" ><MdLogout onClick={Logout} color="white" fontSize={25} className="cursor-pointer mr-5" /></Link>
                                <Link to="/"onClick={Logout} className=" text-lg font-medium hover:text-secondary">Cerrar Sesion</Link>
                            </li>
                        </ul>
                        <div className="flex justify-center items-center gap-4 mt-15">
                            <FaXTwitter fontSize={20} className="hover:text-secondary cursor-pointer"/>
                            <FaInstagram fontSize={20} className="hover:text-secondary cursor-pointer" />
                            <CiFacebook fontSize={20} className="hover:text-secondary cursor-pointer" />
                        </div>
                    </div>
                )}

            </header>
        </>
    )
}


