import { useSelector } from "react-redux";
import { ButtonPrimary } from "../components/ui/buttons/ButtonPrimary";
import { Footer } from "../components/layout/Footer";
import fotoDefault from "../assets/Imagenes/fotoPerfilDefault.jpg"
import { Link, Links } from "react-router-dom";



const Welcome = () => {

    const usuario = useSelector((state: any) => state.user);

    const links =[
        {text:"Verificaciones", url:"#" },
        {text:"Listas", url:"#" },
        {text:"Administradores", url:"#" },
    ]

    return (
        <>
            <div className="h-screen bg-secondary flex flex-col justify-center items-center gap-10">
                <h1 className="text-white text-3xl font-semibold ">Bienvenido {usuario.fullname} </h1>
                <img src={usuario.photoURL ? usuario.photoURL : fotoDefault} alt="" className="w-25 mb-10 rounded-full " />
                <div className="flex justify-evenly w-3xl ">
                    {links.map((item, index) =>(
                        <Link to={item.url} key={index}>
                            <ButtonPrimary text={item.text}  className="w-100 font-medium" />
                        </Link>
                    ))}

                </div>

                {usuario.rol === "SUPERADMIN" ?(
                    <ButtonPrimary text="Configuracion" className="w-100 font-medium" />
                ): null}

            </div>
            <Footer />
        </>

    )
}

export default Welcome