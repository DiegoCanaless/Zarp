import React, { useState } from 'react'
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader'
import { Footer } from '../../components/layout/Footer'
import Huespedes from "../../components/layout/Administradores/ListaHuespedes"
import ListaPropiedades from '../../components/layout/Administradores/ListaPropiedades'

const Listas = () => {

    const [opcionElegida, setOpcionElegida] = useState<string>("Huespedes");

    const elegirOpcionPrincipal = (opcion: string) => {
        setOpcionElegida(opcion);
    }

    return (
        <>
            <UsuarioHeader />
            <main className="min-h-screen bg-secondary">
                <div className="flex justify-center pt-15 w-full">
                    <button onClick={() => elegirOpcionPrincipal("Huespedes")} className={`text-md font-medium border-b-2 border-r-2 w-1/2 text-center py-4 transition-colors ${opcionElegida === "Huespedes" ? "text-white border-white" : ""}`}>Huespedes</button>
                    <button onClick={() => elegirOpcionPrincipal("Propietarios")} className={`text-md font-medium border-b-2 border-l-2 w-1/2 text-center py-4 ${opcionElegida === "Propietarios" ? "text-white border-white" : ""}`}>Propietarios</button>
                </div>

                {opcionElegida === "Huespedes" ? <Huespedes/> : <ListaPropiedades/>}

                

            </main >
            <Footer />
        </>
    )
}

export default Listas