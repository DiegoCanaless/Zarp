import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Footer } from '../../components/layout/Footer'
import { UsuarioHeader } from '../../components/layout/headers/UsuarioHeader'
import type { PagoPendienteResponseDTO } from '../../types/entities/pagosPendientes/PagoPendienteResponseDTO'
import { ButtonPrimary } from '../../components/ui/buttons/ButtonPrimary'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux';

const TransaccionFinal = () => {

    const { id } = useParams()
    const [pago, setPago] = useState<PagoPendienteResponseDTO | undefined>()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const iniciadoRef = useRef(false)

    const usuarioFromStore = useSelector((state: any) => state.user?.user ?? state.user);
    const usuario = usuarioFromStore ?? {};

    useEffect(() => {
        const traerPago = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_APIBASE}/api/pagosPendientes/getById/${id}`, { headers: {'Authorization': `Bearer ${usuario.token}`}} )
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                setPago(data)
            } catch (error) {
                console.error('Error traerPago:', error)
                toast.error('Error al traer el pago.')
            }
        }
        traerPago()
    }, [id])

    // Si la página se abre y el pago está todavía en PENDIENTE, iniciarlo automáticamente
    useEffect(() => {
        const iniciarSiNecesario = async () => {
            if (iniciadoRef.current) return;
            if (!pago?.id) return;
            if (String(pago.estadoPagosPendientes).toUpperCase() !== 'PENDIENTE') return;

            const uidEmpleado = usuario?.uid ?? null;
            if (!uidEmpleado) {
                toast.error('UID empleado no encontrado. No se pudo iniciar el pago automáticamente.');
                console.error('Usuario desde store (TransaccionFinal):', usuario);
                return;
            }

            try {
                iniciadoRef.current = true;
                const url = `${import.meta.env.VITE_APIBASE}/api/pagosPendientes/iniciar/${pago.id}?uidEmpleado=${encodeURIComponent(uidEmpleado)}`;
                const res = await fetch(url, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${usuario.token}` }
                });
                if (!res.ok) {
                    const contentType = res.headers.get('content-type') ?? '';
                    const body = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => null);
                    console.error('Error al iniciar (auto):', res.status, body);
                    toast.error(`No se pudo iniciar el pago automáticamente (HTTP ${res.status}).`);
                    return;
                }
                const actualizado: PagoPendienteResponseDTO = await res.json();
                setPago(actualizado);
                toast.success('Pago iniciado.');
            } catch (err) {
                console.error('Error iniciando pago en TransaccionFinal:', err);
                toast.error('No se pudo iniciar el pago automaticamente.');
            }
        }

        iniciarSiNecesario();
    }, [pago, usuario]);

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
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${usuario.token}`
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
                            <p>{pago?.propietario?.nombreCompleto ?? '—'}</p>
                        </div>
                        <div className='flex flex-col items-start'>
                            <h4>Metodo de Pago:</h4>
                            <p>{pago?.formaPago ?? '—'}</p>
                        </div>
                            {pago?.formaPago === "PAYPAL" ? (
                                <div className='flex flex-col items-start'>
                                    <h4>Correo Electronico:</h4>
                                    <p>{pago?.propietario?.correoElectronico ?? '—'}</p>
                                </div>
                            ) : (
                                <div className='flex flex-col items-start'>
                                    <h4>Titular: {pago?.propietario?.credencialesMP.nombreTitular}</h4>
                                    <p>CVU: {pago?.propietario?.credencialesMP.cvu ?? '—'}</p>
                                </div>
                            )}
                                
                            
                        <div className='flex flex-col items-start'>
                            <h4>Empleado a Cargo:</h4>
                            <p>{pago?.empleado?.nombreCompleto ?? '—'}</p>
                        </div>
                        <hr />
                        <div className='flex justify-between items-center px-4'>
                            <div className='flex flex-col'>
                                <h5>Monto:</h5>
                                <p>${pago?.monto ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </main>

                <div className='flex justify-center pb-20'>
                    {pago?.estadoPagosPendientes !=  'COMPLETADO' && (
                        <ButtonPrimary
                        onClick={transferenciaCompletada}
                        className='flex justify-center mt-10 px-2 cursor-pointer hover:scale-105'
                        fontWeight='font-medium'
                        color='black'
                        maxWidth='w-[290px]'
                        fontSize='text-lg'
                        text={loading ? 'Procesando...' : 'Transferencia completada'}
                    />
                    )}
                    
                </div>

            </main>
            <Footer />
        </>
    )
}

export default TransaccionFinal
