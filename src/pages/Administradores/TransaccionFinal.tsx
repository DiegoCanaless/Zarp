import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Footer } from '../../components/layout/Footer'
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader'
import type { PagoPendienteResponseDTO } from '../../types/entities/pagosPendientes/PagoPendienteResponseDTO'
import { ButtonPrimary } from '../../components/ui/buttons/ButtonPrimary'
import toast from 'react-hot-toast'

const TransaccionFinal = () => {

    const { id } = useParams()
    const [pago, setPago] = useState<PagoPendienteResponseDTO>()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const traerPago = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_APIBASE}/api/pagosPendientes/getById/${id}`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                setPago(data)
                console.log(data)
            } catch (error) {
                console.log(error)
            }
        }
        traerPago()
    }, [id])


    const transferenciaCompletada = async () => {

        if (!pago?.id) {
            toast.error('Pago no cargado aún.')
            return
        }

        setLoading(true)


        try {
            const res = await fetch(`${import.meta.env.VITE_APIBASE}/api/pagosPendientes/cambiarEstado/${pago?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (!res.ok) {
                const text = await res.text().catch(() => null)
                throw new Error(`HTTP ${res.status} ${text ?? ''}`)
            }

            const actualizado = await res.json()
            console.log('Respuesta cambiarEstado:', actualizado)

            toast.success("Transferencia completada", { duration: 2500 })
            setTimeout(() => navigate('/PagosPendientes'), 1000)
        } catch (error) {
            console.error('Error en transferenciaCompletada:', error)
            toast.error('No se pudo completar la transferencia. Revisa consola o CORS.')
        } finally {
            setLoading(false)
        }
    }



    return (
        <>
            <UsuarioHeader />
            <main className='bg-secondary pt-15 min-h-screen'>

                <div className='m-auto bg-primary px-8 py-2 mb-15  text-white'>
                    <h1 className='text-center text-xl font-medium'>Transaccion Final</h1>
                </div>

                <main className='bg-primary w-xl text-white py-4 m-auto rounded-lg'>
                    <h2 className='text-center pb-4 text-lg'>Huesped - Pago #{pago?.id}</h2>
                    <hr className='mb-4' />
                    <div className='flex flex-col px-4 gap-5 text-md'>
                        <div className='flex flex-col items-start'>
                            <h4>Nombre:</h4>
                            <p>{pago?.propietario.nombreCompleto}</p>
                        </div>
                        <div className='flex flex-col items-start'>
                            <h4>Metodo de Pago:</h4>
                            <p>{pago?.formaPago}</p>
                        </div>
                        <div className='flex flex-col items-start'>
                            <h4>Correo Electronico:</h4>
                            <p>{pago?.propietario.correoElectronico}</p>
                        </div>
                        <hr />
                        <div className='flex justify-between items-center px-4'>
                            <div className='flex flex-col'>
                                <h5>Monto:</h5>
                                <p>${pago?.monto}</p>
                            </div>
                            <p>-5%</p>
                            <div className='flex flex-col'>
                                <h5>Transferir:</h5>
                                <p>${pago?.monto * 0.95}</p>
                            </div>
                        </div>
                    </div>
                </main>

                <div className='flex justify-center pb-20'>
                    <ButtonPrimary onClick={transferenciaCompletada} className='flex justify-center mt-10 px-2 cursor-pointer hover:scale-105' fontWeight='font-medium' color='black' maxWidth='w-[290px]' fontSize='text-lg' text={loading ? 'Procesando...' : 'Transferencia completada'} />
                </div>

            </main>
            <Footer />
        </>
    )
}

export default TransaccionFinal