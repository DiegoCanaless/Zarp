import { useNavigate, useParams } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader";
import { useEffect, useMemo, useState } from "react";
import type { PropiedadResponseDTO } from "../../types/entities/propiedad/PropiedadResponseDTO";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { FaStar } from "react-icons/fa";
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary";
import { AiOutlineClose } from "react-icons/ai";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

const Propiedad = () => {
    const { id } = useParams<{ id: string }>();

    const [propiedad, setPropiedad] = useState<PropiedadResponseDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalDescripcion, setModalDescripcion] = useState<boolean>(false);
    const navigate = useNavigate();
    const usuario = useSelector((state: any) => state.user)

    useEffect(() => {
        if (!id) return;

        const fetchPropiedad = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`http://localhost:8080/api/propiedades/getById/${id}`);
                if (!res.ok) throw new Error("Error al obtener la propiedad");

                const data: PropiedadResponseDTO = await res.json();
                setPropiedad(data);
            } catch (e: any) {
                console.error(e);
                setError(e?.message ?? "Error inesperado");
            } finally {
                setLoading(false);
            }
        };

        fetchPropiedad();
    }, [id]);

    const position: [number, number] = [
        propiedad?.direccion.latitud as unknown as number,
        propiedad?.direccion.longitud as unknown as number,
    ];

    const calcularMedia = () => {
        if (!propiedad?.resenias?.length) return 0;
        const suma = propiedad.resenias.reduce((acc, r) => acc + (r.calificacion ?? r.puntuacion ?? 0), 0);
        const media = suma / propiedad.resenias.length;
        return Math.round(media * 100) / 100;
    };

    const media = useMemo(calcularMedia, [propiedad?.resenias]);
    const estrellasLlenas = Math.round(media);

    const palabras = propiedad?.descripcion?.split(" ") ?? [];
    const preview = palabras.slice(0, 20).join(" ") + (palabras.length > 20 ? "..." : "");



    // Desktop

    const imagenes = propiedad?.detalleImagenes?.map(d => d.imagen.urlImagen) ?? [];
    const mainImg = imagenes[0];
    const sideImgs = imagenes.slice(1, 5);



    const reservar = () => {
        if(usuario.rol === "PROPIETARIO"){
            navigate(`/ReservarPropiedad/${propiedad?.id}`)
        } else {
            toast.error("Tienes que tener las verificaciones aprobadas para poder reservar")
        }
    }

    return (
        <>
            <UsuarioHeader />
            <main className="min-h-screen bg-secondary pt-15 pb-15 text-white">
                {loading && <p>Cargando propiedad…</p>}
                {error && !loading && <p>{error}</p>}

                {!loading && !error && propiedad && (
                    <>
                        {/* MOBILE SLIDER */}
                        <section className="sm:hidden min-h-screen">
                            <Swiper pagination={{ clickable: true }} modules={[Pagination]} style={{ width: "100%", height: "200px" }} >
                                {propiedad.detalleImagenes.map((img, i) => (
                                    <SwiperSlide key={img.id ?? i}>
                                        <img src={img.imagen.urlImagen} alt={`Imagen ${i + 1}`} className="w-full h-[260px] object-cover rounded-lg" />
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            <h1 className="text-center mt-2 mb-2 text-lg">{propiedad.nombre}</h1>
                            <hr className="bg-white mb-2" />

                            <div className="flex justify-center gap-2 w-full px-2">
                                {propiedad.detalleAmbientes.map((ambiente, i) => (
                                    <span key={ambiente.id ?? i} className="text-xs">
                                        {ambiente.cantidad} {ambiente.ambiente.denominacion}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-around mt-5">
                                <div className="flex flex-col items-center">
                                    <p>{media.toFixed(2)}</p>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={i < estrellasLlenas ? "text-yellow-400" : "text-gray-500"}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <p className="text-xl">{propiedad?.resenias?.length ?? 0}</p>
                                    <p>evaluaciones</p>
                                </div>
                            </div>

                            <hr className="bg-white mb-2 mt-2" />

                            {/* Anfitrión */}
                            <div className="flex justify-start ml-5 gap-2 mt-5">
                                {propiedad?.propietario?.fotoPerfil?.urlImagen && (
                                    <img src={propiedad.propietario.fotoPerfil.urlImagen} className="w-12 h-12 object-cover rounded-4xl" alt="Foto del anfitrión" />
                                )}
                                <p className="text-xs font-normal"> Anfitrión: {propiedad?.propietario?.nombreCompleto} </p>
                            </div>

                            {/* Descripción + modal */}
                            <div className="bg-tertiary mb-4 w-70 m-auto flex flex-col px-2 pt-2 rounded-lg mt-4">
                                <p className="text-clip mb-3">{preview}</p>
                                {palabras.length > 20 && (
                                    <ButtonSecondary onClick={() => setModalDescripcion(true)} className="m-auto w-full" fontWeight="font-medium" text="Ver Mas" fontSize="text-md mb-2" />
                                )}

                                {modalDescripcion && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black/20 bg-opacity-50 z-50" onClick={() => setModalDescripcion(false)} >
                                        <div className="bg-tertiary w-70 px-4 py-2 pb-5 flex flex-col rounded-lg" onClick={(e) => e.stopPropagation()} >
                                            <AiOutlineClose className="self-end cursor-pointer" size={20} onClick={() => setModalDescripcion(false)} />
                                            <p>{propiedad.descripcion}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Características */}
                            <div className="flex flex-col  px-6 mb-4">
                                <h4>Características</h4>
                                <div className="flex gap-2 flex-wrap mb-4 text-xs">
                                    {propiedad.detalleTipoPersonas.map((tipoPersona, i) => (
                                        <p>{tipoPersona.tipoPersona.denominacion}: {tipoPersona.cantidad}</p>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-2 text-xs">
                                    {propiedad.detalleCaracteristicas.map((caracteristica, i) => (
                                        <div key={caracteristica.id ?? i} className="flex items-center">
                                            <img src={caracteristica.caracteristica.imagen.urlImagen} className="w-8 h-8 mr-3" alt={caracteristica.caracteristica.denominacion} />
                                            <p>{caracteristica.caracteristica.denominacion}</p>
                                        </div>
                                    ))}
                                </div>

                            </div>

                            {/* Dirección + mapa */}
                            <div className="flex flex-col mb-4 px-6">
                                <h4 className="mb-2">Dirección: </h4>
                                <p className="ml-3 text-xs">{propiedad.direccion.calle}</p>

                                <MapContainer center={position} zoom={8} scrollWheelZoom={false} style={{ width: "250px", height: "200px" }} className="rounded-md m-auto z-0" >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={position}>
                                        <Popup>Ubicación de la propiedad</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>

                            {/* Puntuación + reseñas */}
                            <div className="flex flex-col px-6">
                                <h4 className="mb-2">Puntuación: </h4>
                                <div className="flex flex-col items-center">
                                    <p className="text-2xl">{media.toFixed(2)}</p>
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar size={15} key={i} className={i < estrellasLlenas ? "text-yellow-400" : "text-gray-500"} />
                                        ))}
                                    </div>
                                </div>

                                <Swiper pagination={{ clickable: true }} modules={[Pagination]} style={{ width: "100%", maxWidth: "320px", height: "200px", margin: "auto" }} >
                                    {propiedad.resenias.length === 0 ? (
                                        <SwiperSlide>
                                            <div className="h-40 w-full bg-tertiary rounded-lg shadow-md px-4 py-6 flex flex-col items-center justify-center">
                                                <p className="text-center text-gray-300">No hay reseñas todavía.</p>
                                            </div>
                                        </SwiperSlide>
                                    ) : (
                                        propiedad.resenias.map((resenia, i) => {
                                            const estrellas = Math.max(
                                                0,
                                                Math.min(5, Number(resenia.calificacion ?? resenia.puntuacion ?? 0))
                                            );

                                            return (
                                                <SwiperSlide key={resenia.id ?? i}>
                                                    <div className="h-40 w-full bg-tertiary rounded-lg shadow-md px-4 py-4 flex flex-col">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            {resenia.usuario.fotoPerfil?.urlImagen && (
                                                                <img src={resenia.usuario.fotoPerfil.urlImagen} alt="" className="w-10 h-10 object-cover rounded-full border" />
                                                            )}
                                                            <div>
                                                                <h4 className="font-semibold text-md">{resenia.usuario.nombreCompleto}</h4>
                                                                <div className="flex gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <FaStar size={15} key={i} className={i < estrellas ? "text-yellow-400" : "text-gray-500"} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-200">{resenia.comentario}</p>
                                                    </div>
                                                </SwiperSlide>
                                            );
                                        })
                                    )}
                                </Swiper>
                            </div>
                        </section>


                        <section className="h-30 px-5 py-5 w-full bg-primary sm:hidden fixed bottom-0 left-0 z-50 flex justify-between">
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold underline">${propiedad.precioPorNoche}ARS</h3>
                                <span className="text-xs font-extralight">por noche</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <ButtonSecondary onClick={() => reservar()} text="RESERVAR" bgColor="bg-red-500" fontWeight="font-semibold" color="text-white" className="px-5 py-2" />
                            </div>
                        </section>


                        {/* DESKTOP  */}
                        <section className="hidden sm:block px-20 lg:px-40">
                            <h1 className="mt-10 text-2xl">{propiedad.nombre}</h1>
                            <div className="flex mb-2">
                                <p className="text-xs">{media.toFixed(2)} - {propiedad.resenias.length} opiniones</p>
                            </div>

                            {mainImg && (
                                <div className="grid grid-cols-8 gap-4 h-[300px] mb-5">
                                    <div className="col-span-6 row-span-3 relative overflow-hidden rounded-xl">
                                        <img src={mainImg} alt="Imagen principal de la propiedad" className="absolute inset-0 w-full h-full object-cover" />
                                    </div>

                                    {sideImgs.slice(0, 3).map((src, i) => (
                                        <div key={i} className="col-span-2 relative overflow-hidden rounded-xl" >
                                            <img src={src} alt={`Imagen ${i + 2}`} className="absolute inset-0 w-60 h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h3 className="text-lg">Descripcion:</h3>
                            <p className="text-xs mb-4">{propiedad.descripcion}</p>


                            <h3 className="text-lg">Caracteristica</h3>
                            <div className="flex gap-2 mb-2">
                                {propiedad.detalleTipoPersonas.map((tipoPersona, i) => (
                                    <p className="text-xs">{tipoPersona.tipoPersona.denominacion}: {tipoPersona.cantidad}</p>
                                ))}
                            </div>
                            <div className="flex gap-2 mb-4">
                                {propiedad.detalleCaracteristicas.map((caracteristica, i) => (
                                    <div className="flex items-center">
                                        <img className="h-5 w-5 mr-2" src={caracteristica.caracteristica.imagen.urlImagen} alt={caracteristica.caracteristica.denominacion} />
                                        <p className="text-xs">{caracteristica.caracteristica.denominacion}</p>
                                    </div>
                                ))}
                            </div>


                            <div className="flex justify-between">
                                <div>
                                    <h4 className="text-xl mb-2">{propiedad.resenias.length} Opiniones</h4>
                                    <div className="flex items-center gap-1 mb-4">
                                        <p className="text-xl mr-2">{media.toFixed(2)}</p>
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar size={15} key={i} className={i < estrellasLlenas ? "text-yellow-400" : "text-gray-500"} />
                                        ))}
                                    </div>
                                    {propiedad.resenias.map((resenia, i) => (
                                        <div className="mb-6" key={resenia.id}>
                                            <div className="flex gap-2">
                                                <img src={resenia.usuario.fotoPerfil?.urlImagen} alt="" className="w-10 h-10 object-cover rounded-2xl" />
                                                <div className="flex flex-col items-start">
                                                    <h4>{resenia.usuario.nombreCompleto}</h4>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar size={15} key={i} className={i < resenia.calificacion ? "text-yellow-400" : "text-gray-500"} />
                                                        ))}
                                                    </div>

                                                </div>
                                            </div>
                                            <p className="mt-2">{resenia.comentario}</p>
                                        </div>
                                    ))}


                                </div>

                                <div>
                                    <div className="flex flex-col mb-4 px-6">
                                        <h4 className="mb-2">Dirección: </h4>
                                        <p className="ml-3 text-xs">{propiedad.direccion.calle}</p>

                                        <MapContainer center={position} zoom={8} scrollWheelZoom={false} style={{ width: "250px", height: "200px" }} className="rounded-md m-auto z-0" >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={position}>
                                                <Popup>Ubicación de la propiedad</Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>

                                    {/* CARTEL RESERVAR – Desktop fijo abajo derecha */}
                                    <section className=" hidden sm:flex fixed bottom-6 right-6 z-50 w-[22rem] max-w-[90vw] bg-primary rounded-3xl shadow-xl px-6 py-5 gap-4 justify-between items-center">
                                        <div className="flex flex-col">
                                            <h5 className="text-xl font-semibold">${propiedad.precioPorNoche} ARS</h5>
                                            <span className="text-sm opacity-80">por noche</span>
                                        </div>

                                        <ButtonSecondary onClick={() => reservar()} text="RESERVAR" bgColor="bg-red-500" fontWeight="font-semibold" color="text-white" className="px-5 py-2 rounded-2xl cursor-pointer" />
                                    </section>
                                </div>
                            </div>
                        </section>

                    </>
                )}
            </main >
            <Footer />
        </>
    );
};

export default Propiedad;
