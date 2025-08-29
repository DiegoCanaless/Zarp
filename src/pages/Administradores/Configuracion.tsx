import { Footer } from "../../components/layout/Footer"
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader"
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary"
import  Caracteristicas  from "../../components/layout/Administradores/Caracteristicas"
import Ambientes from "../../components/layout/Administradores/Ambientes"
import Personas from "../../components/layout/Administradores/Personas"
import Propiedades from "../../components/layout/Administradores/Propiedades"
import { useState } from "react"


const Configuracion = () => {
    let [OpcionElegida, setOpcionElegida] = useState<string>("Caracteristicas")

    const elegirOpcionPrincipal = (opcion: string) => {
        console.log("Opción elegida:", opcion)
        setOpcionElegida(opcion)
    }

    const links = [
        {title: "Caracteristicas"},
        {title: "Ambientes"},
        {title: "Personas"},
        {title: "Propiedades", },
    ]
    return (
        <>
            <UsuarioHeader/>
            <div className="bg-secondary min-h-screen w-full ">
                <div className="flex pt-20  border-b-1 pb-5 justify-center gap-10">
                    {links.map((link: any) => (
                        <ButtonSecondary className="cursor-pointer" key={link.title} text={link.title} maxWidth="w-[140px]" fontWeight="font-medium" onClick={() => elegirOpcionPrincipal(link.title)}/>
                    ))}
                </div>
                
                <div className="pt-10 px-20 text-white pb-10">
                    {OpcionElegida === "Caracteristicas" && <Caracteristicas />}
                    {OpcionElegida === "Ambientes" && <Ambientes />}
                    {OpcionElegida === "Personas" && <Personas />}
                    {OpcionElegida === "Propiedades" && <Propiedades />}
                </div>

            </div>
            <Footer/>
        </>
    )
}

export default Configuracion