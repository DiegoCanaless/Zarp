import { useEffect, useState } from "react";
import { MdArrowForward } from "react-icons/md";
import { Link } from "react-router-dom";

const PropiedadesVerificacion = () => {
    const [verificaciones, setVerificaciones] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);

    useEffect(() => {
        fetch("http://localhost:8080/api/propiedades/aVerificar")
            .then((res) => {
                if (!res.ok) throw new Error("Error en la respuesta");
                return res.json();
            })
            .then((data) => setVerificaciones(data))
            .catch((err) => setError(err.message))
            .finally(() => setCargando(false));
    }, []);

    return (
        <div className="flex flex-col px-20 ">
            <h1 className="mt-5 text-white text-lg mb-5">Verificación de Propiedades</h1>

            {cargando && <p className="text-center">Cargando verificaciones...</p>}
            {error && <p className="text-center text-red-600">Error: {error}</p>}
            {!cargando && !error && verificaciones.length === 0 && (
                <p className="text-center">No hay verificaciones</p>
            )}

            {verificaciones
                .filter((element) => element.activo === true)
                .map((element) => {
                    // Buscar la imagen principal; si no hay, tomar la primera; si no hay ninguna, null
                    const principal =
                        element?.detalleImagenes?.find((d: any) => d?.imgPrincipal)?.imagen?.urlImagen ??
                        element?.detalleImagenes?.[0]?.imagen?.urlImagen ??
                        null;

                    return (
                        <Link
                            to="/VerificarPropiedad"
                            state={{ verificacion: element }}
                            key={element.id}
                            className="mb-5 w-full flex items-start gap-5 rounded-lg text-white bg-tertiary p-5"
                        >
                            <div className="flex flex-col flex-1">
                                <h3 className="text-lg">Verificación de: {element?.propietario?.nombreCompleto}</h3>
                                <p className="opacity-90">Descripción: {element?.descripcion}</p>
                            </div>

                            {principal ? (
                                <img src={principal} alt={element?.nombre ?? "Propiedad"} className="w-40 h-28 object-cover rounded-md shrink-0" loading="lazy"/>
                            ) : (
                                <div className="w-40 h-28 bg-gray-700/40 rounded-md grid place-items-center shrink-0">
                                    <span className="text-sm opacity-70">Sin imagen</span>
                                </div>
                            )}

                        </Link>
                    );
                })}
        </div>
    );
};

export default PropiedadesVerificacion;
