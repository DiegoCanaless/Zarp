import { useEffect, useState } from 'react'
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader'
import { Footer } from '../../components/layout/Footer'
import { PropiedadResponseDTO } from '../../types/entities/propiedad/PropiedadResponseDTO'
import { useSelector } from 'react-redux'
import { ButtonSecondary } from '../../components/ui/buttons/ButtonSecondary'
import { MdAdd } from 'react-icons/md'

const MisPropiedades = () => {
    const [opcion, setOpcion] = useState<boolean>(true)
    const [cargando, setCargando] = useState<boolean>(true)
    const [error, setError] = useState<string>("")
    const [propiedades, setPropiedades] = useState<PropiedadResponseDTO[]>([])




    const usuario = useSelector((state: any) => state.user);



    useEffect(() => {
        const obtenerPropiedades = async () => {
            try {
                setError(false)

                const response = await fetch(`http://localhost:8080/api/propiedades/cliente/${usuario.id}`)

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()
                console.log(data)
                setPropiedades(data)
            } catch (err) {
                console.error('Error al obtener propiedades:', err)
                setError('No se pudieron cargar las propiedades. Intenta nuevamente.')
            } finally {
                setCargando(false)
            }
        }
        obtenerPropiedades()
    }, [])


    return (
        <>
            <UsuarioHeader />
            <main className='bg-secondary min-h-screen px-5 pt-25 text-white '>
                <div className='flex flex-col justify-center mb-5'>
                    <div className='flex items-center justify-between mb-10'>
                        <h1 className='text-xl font-medium mb-2'>Propiedades</h1>
                        <MdAdd className="text-black bg-white px-2 py-2 rounded-full" />
                    </div>
                    <button className={`px-2 py-2 rounded-2xl mb-2 ${opcion ? "bg-primary" : "bg-gray-700 cursor-pointer"}`} onClick={() => setOpcion(true)}>Activas</button>
                    <button className={`px-2 py-2 rounded-2xl ${opcion ? "bg-gray-700 cursor-pointer" : "bg-primary"}`} onClick={() => setOpcion(false)}>Inactivas</button>
                </div>



                {cargando && "Cargando Propiedades"}
                {error}

            </main>

            <Footer />
        </>
    )
}

export default MisPropiedades