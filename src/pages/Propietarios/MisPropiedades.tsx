
import { useEffect, useMemo, useState } from 'react'
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader'
import { Footer } from '../../components/layout/Footer'
import { PropiedadResponseDTO } from '../../types/entities/propiedad/PropiedadResponseDTO'
import { useSelector } from 'react-redux'
import { ButtonSecondary } from '../../components/ui/buttons/ButtonSecondary'
import { MdAdd } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { ButtonTertiary } from '../../components/ui/buttons/ButtonTertiary'
import toast from "react-hot-toast";

const MisPropiedades = () => {
    const [opcion, setOpcion] = useState<boolean>(true) // true = mostrar activas
    const [cargando, setCargando] = useState<boolean>(true)
    const [error, setError] = useState<string>("")
    const [propiedades, setPropiedades] = useState<PropiedadResponseDTO[]>([])

    const navigate = useNavigate()
    const usuario = useSelector((state: any) => state.user)

    useEffect(() => {
        const obtenerPropiedades = async () => {
            try {
                setError("")
                setCargando(true)

                const response = await fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades/cliente/${usuario.id}`)
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`)

                const data: PropiedadResponseDTO[] = await response.json()

                const aceptadas = data.filter(
                    (p) => String(p.verificacionPropiedad).toUpperCase() === "APROBADA"
                )

                setPropiedades(aceptadas)
            } catch (err: any) {
                console.error('Error al obtener propiedades:', err)
                setError('No se pudieron cargar las propiedades. Intenta nuevamente.')
            } finally {
                setCargando(false)
            }
        }

        if (usuario?.id) obtenerPropiedades()
    }, [usuario?.id])

    const propiedadesFiltradas = useMemo(() => {
        return propiedades.filter((p) => (opcion ? p.activo : !p.activo))
    }, [propiedades, opcion])

    const toggleActivo = async (id: number) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_APIBASE}/api/propiedades/toggleActivo/${id}`, {
                method: "PATCH"
            })
            if (!response.ok) throw new Error("Error al cambiar estado")

            setPropiedades((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, activo: !p.activo } : p
                )

            )
            toast.success("Estado cambiado correctamente", { duration: 2500 });
        } catch (err) {
            console.error("Error al actualizar estado:", err)
            toast.success("No se pudo actualizar el estado de la propiedad", { duration: 2500 });

        }
    }

    return (
        <>
            <UsuarioHeader />

            <main className='bg-secondary min-h-screen px-5 pt-25 pb-15 text-white md:px-20'>
                <div className='flex flex-col justify-center mb-5 '>
                    <div className='flex items-center justify-between mb-10'>
                        <h1 className='text-xl font-medium mb-2 md:text-3xl'>Propiedades</h1>
                        <MdAdd onClick={() => navigate("/CrearPropiedad")} color='black' className='bg-white rounded-full cursor-pointer' size={30} title='Crear propiedad' />
                    </div>

                    <div className='flex gap-2'>
                        <button className={`px-3 py-2 rounded-2xl ${opcion ? "bg-primary" : "bg-gray-700 hover:bg-gray-600"} transition`} onClick={() => setOpcion(true)} > Activas </button>
                        <button className={`px-3 py-2 rounded-2xl ${!opcion ? "bg-primary" : "bg-gray-700 hover:bg-gray-600"} transition`} onClick={() => setOpcion(false)} > Inactivas</button>
                    </div>
                </div>

                {cargando && <p className='px-5'>Cargando propiedades…</p>}
                {error && <p className='px-5 text-red-400'>{error}</p>}
                {!cargando && !error && propiedadesFiltradas.length === 0 && (
                    <p className='px-5 text-gray-300'>No hay propiedades {opcion ? "activas" : "inactivas"} con verificación aceptada.</p>
                )}

                <div className="px-5 mt-5 grid gap-6 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                    {propiedadesFiltradas.map((propiedad) => {
                        const primeraImagen = propiedad?.detalleImagenes?.[0]?.imagen?.urlImagen;

                        return (
                            <div key={propiedad.id} className="flex flex-col rounded-xl bg-tertiary shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                                <img className="w-full h-40 object-cover" src={primeraImagen} alt={propiedad.nombre || "Propiedad"} />
                                <div className="flex flex-col p-4 flex-grow">
                                    <h1 className="text-lg font-semibold mb-2 truncate">{propiedad.nombre}</h1>
                                    <p className="text-sm text-gray-300 line-clamp-2 flex-grow">{propiedad.descripcion}</p>
                                    <div className="flex flex-col items-start gap-2 mt-4">
                                        <ButtonTertiary className="cursor-pointer" text="Reservas" maxWidth="w-[140px]" color="text-white" fontSize="text-sm" onClick={() => navigate(`/ReservacionesPropiedad/${propiedad.id}`)} />

                                        <ButtonTertiary className="cursor-pointer" text="Ver Propiedad" maxWidth="w-[140px]" color="text-white" fontSize="text-sm" onClick={() => navigate(`/Propiedad/${propiedad.id}`)} />
                                        <ButtonTertiary className="cursor-pointer" text="Editar" maxWidth="w-[140px]" color="text-white" fontSize="text-sm" onClick={() => navigate(`/EditarPropiedad/${propiedad.id}`)} />
                                        <ButtonSecondary className="cursor-pointer" text={propiedad.activo ? "Desactivar" : "Activar"} maxWidth="w-[140px]" bgColor={propiedad.activo ? "bg-red-500" : "bg-green-500"} color="text-white" fontSize="text-sm" onClick={() => toggleActivo(propiedad.id)} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </main>

            <Footer />
        </>
    )
}

export default MisPropiedades
