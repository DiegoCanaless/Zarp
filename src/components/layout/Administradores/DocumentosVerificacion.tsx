import { useEffect, useState } from "react";
import { MdArrowForward } from "react-icons/md";
import { VerificacionClienteResponseDTO } from "../../../types/entities/verificacionCliente/VerificacionClienteResponseDTO";
import { Link } from "react-router-dom";

const DocumentosVerificacion = () => {

  const [verificaciones, setVerificaciones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState<boolean>(true)
  useEffect(() => {
    fetch(`${import.meta.env.VITE_APIBASE}/api/verificacionClientes`).then((res) => {
      if (!res.ok) throw new Error("Error en la respuesta");
      return res.json();
    })
      .then((data: VerificacionClienteResponseDTO[]) => {
        setVerificaciones(data);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setCargando(false);
      })
  }, []);


  return (
    <>

      <div className="flex flex-col px-20 min-h-screen">
        <h1 className="mt-5 text-white text-lg mb-5">Verificacion de Documentos</h1>

        {cargando && <p className="text-center">Cargando Verificaciones...</p>}
        {error && <p className="text-center text-red-600">Error: {error}</p>}
        {!cargando && !error && verificaciones.length === 0 && (
          <p className="text-center">No hay verificaciones</p>
        )}

        {verificaciones
        .filter((elemento) => elemento.activo === true)
        .map((elemento) => (
          <Link to="/VerificarDocumento" state={{ verificacion: elemento }} key={elemento.id} className="mb-5 w-full flex justify-between items-center h-12 rounded-lg text-white bg-tertiary">
            <p className="ml-10">Verificacion de: {elemento.cliente.nombreCompleto}</p>
            <MdArrowForward className="mr-10" size={22} />
          </Link>
        ))}

      </div>

    </>
  )
}

export default DocumentosVerificacion