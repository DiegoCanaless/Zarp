import React from 'react'
import type { PropiedadResponseDTO } from '../../types/entities/propiedad/PropiedadResponseDTO';
import { useLocation, useNavigate } from 'react-router-dom';
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader';
import { Footer } from '../../components/layout/Footer';
import { ButtonSecondary } from '../../components/ui/buttons/ButtonSecondary';
import { ButtonPrimary } from '../../components/ui/buttons/ButtonPrimary';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from "react-hot-toast";
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
import { Contador } from '../../components/ui/Contador';
import type { DetalleTipoPersonaResponseDTO } from '../../types/entities/detalleTipoPersona/DetalleTipoPersonaResponseDTO';
import type { DetalleAmbienteResponseDTO } from '../../types/entities/detalleAmbiente/DetalleAmbienteResponseDTO';
import type { DetalleCaracteristicaResponseDTO } from '../../types/entities/detalleCaracteristica/DetalleCaracteristicaResponseDTO';
import type { DetalleImagenResponseDTO } from '../../types/entities/detalleImagen/DetalleImagenResponseDTO';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: marker2x,
    iconUrl: marker,
    shadowUrl: shadow,
});

const VerificarPropiedad = () => {
    const location = useLocation();
    const { verificacion } = location.state as { verificacion: PropiedadResponseDTO };
    const navigate = useNavigate();

    const position: [number, number] = [verificacion.direccion.latitud, verificacion.direccion.longitud]

    let ubicacion = [
        { opcion: "Calle", valor: verificacion.direccion.calle },
        { opcion: "Numero", valor: verificacion.direccion.numero },
        { opcion: "Departamento", valor: verificacion.direccion.departamento },
        { opcion: "Codigo Postal", valor: verificacion.direccion.codigoPostal }
    ]


    const handleValido = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_APIBASE}/api/propiedades/activar/${verificacion.id}?activar=true`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            toast.success("Cliente verificado correctamente", { duration: 2500 });
            navigate(-1);
        } catch (e) {
            toast.error("Surgió un error al verificar cliente", { duration: 2500 });

        }
    };

    const handleInvalido = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_APIBASE}/api/propiedades/activar/${verificacion.id}?activar=false`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            toast.success("Cliente marcado como NO verificado", { duration: 2500 });
            navigate(-1);
        } catch (e) {
            toast.error("Surgió un error al NO verificar cliente", { duration: 2500 });
        }
    };
    return (
        <>
            <UsuarioHeader />
            <div className='bg-secondary px-15 min-h-screen pt-20 flex flex-col text-white'>
                <h1 className='mt-5 ml-4 text-xl  items-start'>{verificacion.nombre}</h1>
                <p className='ml-4 text-md mt-2'>{verificacion.descripcion}</p>

                {/* Ubicacion */}
                <div className='bg-tertiary rounded-lg flex flex-col w-full h-auto px-4 py-2 mt-5 mb-5'>
                    <h3 className='text-lg mb-2'>Ubicacion</h3>

                    {ubicacion.map((item: any) => (
                        <div key={item.opcion} className='bg-[#F3FCF0] mt-2 w-90 m-auto px-4 py-1 rounded-md text-center'>
                            <p className='text-black font-medium'>{item.opcion} : {item.valor}</p>
                        </div>
                    ))}

                    <div className="z-10 mt-5 w-full flex justify-center rounded-md overflow-hidden mb-5" style={{ height: 200 }}>
                        <MapContainer
                            center={position}
                            zoom={20}
                            scrollWheelZoom={false}
                            style={{ width: '350px', height: '200px' }}
                            className="rounded-md m-auto"
                        >
                            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}>
                                <Popup>Ubicación de la propiedad</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>

                {/* Capacidad */}
                <div className='bg-tertiary rounded-lg flex flex-col w-full h-auto px-4 py-2 mt-5 mb-5'>
                    <h3 className='text-lg mb-2'>Capacidad</h3>

                    {verificacion.detalleTipoPersonas.map((item: DetalleTipoPersonaResponseDTO) => (
                        <Contador key={item.tipoPersona.id} text={item.tipoPersona.denominacion} numero={item.cantidad}></Contador>
                    ))}
                </div>

                {/* Capacidad */}
                <div className='bg-tertiary rounded-lg flex flex-col w-full h-auto px-4 py-2 mt-5 mb-5'>
                    <h3 className='text-lg mb-2'>Ambientes</h3>
                    {verificacion.detalleAmbientes.map((item: DetalleAmbienteResponseDTO) => (
                        <Contador key={item.id} text={item.ambiente.denominacion} numero={item.cantidad}></Contador>
                    ))}
                </div>

                {/* Caracteristicas */}
                <div className='bg-tertiary rounded-lg flex flex-col w-full h-auto px-4 py-2 mt-5 mb-5'>
                    <h3 className='text-lg mb-2'>Caracteristicas</h3>
                    {verificacion.detalleCaracteristicas.map((item: DetalleCaracteristicaResponseDTO) => (
                        <div key={item.id} className='mb-5 flex justify-center gap-5 items-center bg-[#F3FCF0] py-3 w-50 m-auto rounded-lg px-5'>
                            <img src={item.caracteristica.imagen.urlImagen} alt="" className='w-8' />
                            <p className='text-lg text-black'>{item.caracteristica.denominacion}</p>
                        </div>
                    ))}
                </div>

                {/* Precio */}

                <div className='bg-tertiary rounded-lg flex flex-col w-full h-auto px-4 py-2 mt-5 mb-5'>
                    <h3 className='text-lg mb-2'>Precio</h3>
                    <div className='bg-[#F3FCF0] mt-2 w-90 mb-5 m-auto px-4 py-1 rounded-md text-center'>
                        <p className='text-black font-medium'>{verificacion.precioPorNoche}</p>
                    </div>
                </div>


                {/* Imagenes */}
                <div className='bg-tertiary rounded-lg flex flex-col w-full h-auto px-4 py-2 mt-5 mb-5'>
                    <h3 className='text-lg mb-2'>Imagenes</h3>
                    <img src={verificacion.detalleImagenes.find(item => item.imgPrincipal)?.imagen.urlImagen} alt="" className='mb-5 m-auto rounded-sm w-130 h-50 object-cover' />
                    <div className='flex items-center justify-around px-2'>
                            {verificacion.detalleImagenes.filter(item => !item.imgPrincipal).map((item: DetalleImagenResponseDTO) => (
                            <img key={item.id} src={item.imagen.urlImagen} alt={`Imagen de la propiedad ${item.id}`} className='w-60 rounded mb-2'></img>
                        ))}
                    </div>
                </div>


                <div className="flex justify-center gap-5 pb-10 mt-5">
                    <ButtonPrimary onClick={handleInvalido} className="cursor-pointer" maxWidth="w-[200px]" text="Insuficiente" fontWeight="font-medium" color="text-white" bgColor="bg-red-600" />
                    <ButtonSecondary onClick={handleValido} className="cursor-pointer" maxWidth="w-[200px]" text="Valido" fontWeight="font-medium" />
                </div>
            </div>

            <Footer />
        </>
    )
}

export default VerificarPropiedad