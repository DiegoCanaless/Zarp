import { useLocation, useNavigate } from "react-router-dom";
import { VerificacionClienteResponseDTO } from "../../../types/entities/verificacionCliente/VerificacionClienteResponseDTO";
import { UsuarioHeader } from "../headers/UsuarioHeader";
import { Footer } from "../Footer";
import { ButtonPrimary } from "../../ui/buttons/ButtonPrimary";
import { ButtonSecondary } from "../../ui/buttons/ButtonSecondary";
import toast from "react-hot-toast";

const VerificarDocumentos = () => {
    const location = useLocation();
    const { verificacion } = location.state as { verificacion: VerificacionClienteResponseDTO };
    const navigate = useNavigate();


    // en VerificarDocumentos.tsx
    const handleValido = async () => {
        try {
            const res = await fetch(
                `http://localhost:8080/api/clientes/verificacion-documento/${verificacion.cliente.id}?verificado=true`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            toast.success("Cliente verificado correctamente", { duration: 2500 });
            navigate(-1);
        } catch (e) {
            console.error(e);
            toast.error("Surgió un error al verificar cliente", { duration: 2500 });
            
        }
    };

    const handleInvalido = async () => {
        try {
            const res = await fetch(
                `http://localhost:8080/api/clientes/verificacion-documento/${verificacion.cliente.id}?verificado=false`,
                { method: "PATCH", headers: { "Content-Type": "application/json" } }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            toast.success("Cliente marcado como NO verificado", { duration: 2500 });
            navigate(-1);
        } catch (e) {
            console.error(e);
            toast.error("Surgió un error al NO verificar cliente", { duration: 2500 });
        }
    };




    return (
        <>
            <UsuarioHeader />
            <main className="bg-secondary pt-20">
                <div className="flex flex-col justify-center px-20 gap-5 pb-10">
                    <h1 className="mt-5 text-white text-lg mb-5 items-start">Verificacion de: {verificacion.cliente.nombreCompleto}</h1>


                    <div className="bg-tertiary w-full items- bg-center px-5 py-4 rounded-2xl">
                        <p className="text-white text-md mb-3">Foto Frontal:</p>
                        <img src={verificacion.fotoFrontal.urlImagen} alt="" className="w-60 m-auto" />
                    </div>


                    <div className="bg-tertiary w-full items- bg-center px-5 py-4 rounded-2xl">
                        <p className="text-white text-md mb-3">Foto de la parte frontal del Documento Nacional de Identificacion:</p>
                        <img src={verificacion.fotoDocumentoFrontal.urlImagen} alt="" className="w-60 m-auto" />
                    </div>

                    <div className="bg-tertiary w-full items- bg-center px-5 py-4 rounded-2xl">
                        <p className="text-white text-md mb-3">Foto de la parte trasera del Documento Nacional de Identificacion</p>
                        <img src={verificacion.fotoDocumentoTrasero.urlImagen} alt="" className="w-60 m-auto" />
                    </div>
                </div>

                <div className="flex justify-center gap-5 pb-10">
                    <ButtonPrimary className="cursor-pointer" maxWidth="w-[200px]" text="Insuficiente" fontWeight="font-medium" color="text-white" bgColor="bg-red-600" onClick={handleInvalido} />
                    <ButtonSecondary className="cursor-pointer" maxWidth="w-[200px]" text="Valido" fontWeight="font-medium" onClick={handleValido} />
                </div>
            </main>

            <Footer />
        </>
    );
};

export default VerificarDocumentos;
