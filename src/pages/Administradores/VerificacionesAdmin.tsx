import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader"
import { Footer } from "../../components/layout/Footer"
import { useState } from "react"
import DocumentosVerificacion from "../../components/layout/DocumentosVerificacion";
import PropiedadesVerificacion from "../../components/layout/PropiedadesVerificacion"

const VerificacionesAdmin = () => {

  const [opcionElegida, setOpcionElegida] = useState<string>("Documentos");

  const elegirOpcionPrincipal = (opcion: string)=>{
    setOpcionElegida(opcion);
  }


  return (
    <>
      <UsuarioHeader />
      <main className="h-screen bg-secondary">
        <div className="flex justify-center pt-15 w-full">
          <button onClick={() => elegirOpcionPrincipal("Documentos")} className={`text-md font-medium border-b-1 border-r-1 w-1/2 text-center py-4 transition-colors ${opcionElegida ==="Documentos" ? "text-white border-white" : "" }`}>Documentos</button>
          <button onClick={() =>elegirOpcionPrincipal("Propiedades")} className={`text-md font-medium border-b-1 border-l-1 w-1/2 text-center py-4 ${opcionElegida ==="Propiedades" ? "text-white border-white" : "" }`}>Propiedades</button>
        </div>

        {opcionElegida === "Documentos" ? <DocumentosVerificacion/> : <PropiedadesVerificacion/>}

      </main>


      {/* <Footer/> */}
    </>
  )
}

export default VerificacionesAdmin