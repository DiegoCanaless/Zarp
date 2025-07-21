
import type { JSX } from "react";
import { FaStar} from "react-icons/fa";


interface cardPropiedadesProps {
    titulo: string;
    habitaciones: string;
    imagen: string;
    precio: string;
    noches: string;
    puntuacion?: number;
}

export const CardPropiedadDestacada = ({
    titulo,
    habitaciones,
    imagen,
    precio,
    noches,
    puntuacion = 0,
}: cardPropiedadesProps) => {

    function calcularPuntuacion(puntuacion?: number): JSX.Element[] {
        let valor = puntuacion || 0;
        let resultado:JSX.Element[] = [];

        for (let i = 0; i < valor; i++) {
            resultado.push(<FaStar key={i} className="text-yellow-400 md:text-lg"/>);
        }

        if (resultado.length< 5){
            for (let i = resultado.length; i < 5; i++){
                resultado.push(<FaStar key={resultado.length+1} className="text-gray-500 md:text-lg"/>)
            }
        }

        return resultado
    }
{/* <FaRegStar /> */}
    return (
        <div className='relative w-full group '>
            <img src={imagen} loading="lazy" className='w-full object-cover h-45 sm:h-55 md:h-65 xl:h-80' alt={titulo} />
            <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-white flex flex-col justify-between p-2">
                <h2 className="text-md font-semibold sm:text-base md:text-lg md:px-10 md:py-10">{titulo}</h2>
                {puntuacion !== undefined && (
                    <div className="flex gap-1 items-center absolute top-14 left-2 z-20 sm:top-10 md:top-20 md:left-12">
                        {calcularPuntuacion(puntuacion)}
                    </div>
                )}
                <div className="flex justify-between items-end md:px-15 md:py-10">
                    <p className="text-xs font-light sm:text-sm">{habitaciones}</p>
                    <div className="bg-white rounded-lg text-xs text-black font-light flex flex-col items-center justify-center px-2 py-1 sm:text-sm sm::px-3 sm:py-2 sm:font-medium  sm:w-30">
                        <p>{noches}</p>
                        <p>{precio}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
