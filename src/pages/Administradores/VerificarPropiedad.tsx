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
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

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

    console.log(verificacion)
    return (
        <>
            <UsuarioHeader />
            <div className='bg-secondary px-15 min-h-screen pt-20 flex flex-col text-white'>
                <h1 className='mt-5 ml-4 text-xl  items-start'>{verificacion.nombre}</h1>
                <p className='ml-4 text-md mt-2'>{verificacion.descripcion}</p>

                {/* Ubicacion */}

                <div className='bg-tertiary rounded-lg flex flex-col w-full h-auto px-4 py-2 mt-5 mb-5'>
                    <h3 className='text-lg mb-2'>Ubicacion</h3>
                    <div className='bg-[#F3FCF0] mt-2 w-90 m-auto px-4 py-1 rounded-md text-center'>
                        <p className='text-black font-medium'>Calle: {verificacion.direccion.calle}</p>
                    </div>
                    <div className='bg-[#F3FCF0] mt-2 w-90 m-auto px-4 py-1 rounded-md text-center'>
                        <p className='text-black font-medium'>Numero: {verificacion.direccion.numero}</p>
                    </div>
                    <div className='bg-[#F3FCF0] mt-2 w-90 m-auto px-4 py-1 rounded-md text-center'>
                        <p className='text-black font-medium'>Departamento: {verificacion.direccion.departamento}</p>
                    </div>
                    <div className='bg-[#F3FCF0] mt-2 w-90 m-auto px-4 py-1 rounded-md text-center mb-4'>
                        <p className='text-black font-medium'>Codigo Postal: {verificacion.direccion.codigoPostal}</p>
                    </div>

                    <div className="w-full flex justify-center rounded-md overflow-hidden mb-5" style={{ height: 200  }}>
                        <MapContainer
                            center={position}
                            zoom={20}
                            scrollWheelZoom={false}
                            style={{ width: '350px', height: '200px' }}   // <-- prop correcto
                            className="rounded-md m-auto"
                        >
                            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}>
                                <Popup>Ubicación de la propiedad</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>

                {/*  */}

                <div className='bg-tertiary rounded-lg flex flex-col w-full h-auto px-4 py-2 mt-5 mb-5'>


                </div>

                <div className="flex justify-center gap-5 pb-10">
                    <ButtonPrimary className="cursor-pointer" maxWidth="w-[200px]" text="Insuficiente" fontWeight="font-medium" color="text-white" bgColor="bg-red-600" />
                    <ButtonSecondary className="cursor-pointer" maxWidth="w-[200px]" text="Valido" fontWeight="font-medium" />
                </div>
            </div>

            <Footer />
        </>
    )
}

export default VerificarPropiedad