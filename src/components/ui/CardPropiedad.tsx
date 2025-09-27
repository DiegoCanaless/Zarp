
import { useNavigate } from "react-router-dom";
import type { PropiedadResponseDTO } from "../../types/entities/propiedad/PropiedadResponseDTO";

interface CardPropiedadProps {
    propiedad: PropiedadResponseDTO;
    provincia: string;
    onVerMas?: (id: number | string) => void;
}


export function CardPropiedad({ propiedad, provincia, onVerMas }: CardPropiedadProps) {
    const navigate = useNavigate();


    return (
        <article className="min-w-[260px] max-w-[260px] rounded-t-xl  flex-shrink-0 bg-white rounded-2xl shadow-md snap-startoverflow-hidden">
            <div className="w-full h-40 bg-gray-200 rounded-t-xl">
                <img src={propiedad?.detalleImagenes[0].imagen.urlImagen || "/placeholder.jpg"} alt={propiedad?.nombre || "Propiedad"} className="w-full h-full object-cover rounded-t-xl" loading="lazy" />
            </div>

            <div className="p-3 bg-tertiary text-white rounded-b-xl">
                <div className="flex justify-between">
                    <div>
                        <h3 className="font-semibold  line-clamp-1">
                            {propiedad?.nombre ?? "Propiedad sin título"}
                        </h3>
                        <p className="text-xs  line-clamp-1">Propietario: {propiedad.propietario.nombreCompleto}</p>
                    </div>
                    <div>
                        <p className="text-lg font-medium">${propiedad.precioPorNoche}</p>
                        <p className="text-xs">por noche</p>
                    </div>
                </div>


                <button className="mt-3 w-full py-2 rounded-xl transition-colors cursor-pointer hover:bg-primary hover:text-white bg-white text-black text-sm hover:opacity-90 transition"  onClick={() => navigate(`/Propiedad/${propiedad.id}`)}> Ver más </button>
            </div>
        </article>
    );
}
