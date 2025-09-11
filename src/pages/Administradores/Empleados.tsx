import { useEffect, useState } from "react"
import { Footer } from "../../components/layout/Footer"
import { UsuarioHeader } from "../../components/layout/headers/UsuarioHeader"
import { ButtonSecondary } from "../../components/ui/buttons/ButtonSecondary"
import { EmpleadoResponseDTO } from "../../types/entities/empleado/EmpleadoResponseDTO"
import toast from "react-hot-toast";
import ModalEmpleado from "../../components/ui/modals/ModalEmpleado"


const Empleados = () => {

    let [empleados, setEmpleados] = useState<EmpleadoResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");
    const [modal, setModal] = useState<boolean>(false)

    const abrirModal = () => {
        setModal(!modal)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusqueda(e.target.value);
    };

    const filtradoEmpleados = empleados.filter(empleado =>
        empleado.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase())
    );


    const handleToggleActivo = async (id: number) => {
        try {
            const resp = await fetch(`http://localhost:8080/api/empleados/toggleActivo/${id}`, { method: "PATCH" });
            if (!resp.ok) throw new Error(`Error PATCH ${resp.status}`);
            setEmpleados(element =>
                element.map(element =>
                    element.id === id ? { ...element, activo: !element.activo } : element
                )
            );
        } catch (err) {
            toast.error("Error al activar/desactivar empleado", { duration: 2500 });
        }
    };

    const traerEmpleados = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `http://localhost:8080/api/empleados`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data: EmpleadoResponseDTO[] = await res.json();
            console.log("Empleados:", data);
            const soloEmpleados = data.filter(emp => emp.rol === "EMPLEADO");

            setEmpleados(soloEmpleados);
            setLoading(false)
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (e) {
            toast.error("Surgió un error al traer los Empleados", { duration: 2500 })
            setError((e as Error).message);
            setLoading(false)
        }
    };

    useEffect(() => {
        traerEmpleados();
    }, []);





    return (
        <>
            <UsuarioHeader />
            <main className="bg-secondary pt-20 min-h-screen ">
                <h1 className=" text-white text-2xl mb-5 text-center pb-5 border-b-2 ">Empleados</h1>

                <div className="flex justify-center gap-5 px-2">
                    <input value={busqueda} type="search" onChange={handleSearchChange} placeholder="Buscar..." className="outline-none px-5 w-140 bg-buttonSecondary rounded-lg" />
                    <ButtonSecondary className="cursor-pointer" text="Crear Empleado" fontWeight="font-medium" maxWidth="w-30" onClick={abrirModal} />
                </div>

                {loading && <p className="text-center mt-10 text-white">Cargando...</p>}
                {error && <p className="text-center mt-10 text-red-600">Surgio un error</p>}
                {empleados.length === 0 && loading === false && (
                    <p className="text-center mt-10 text-white">No hay empleados cargados aun</p>
                )}


                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:px-20 gap-6 mt-10 px-5">
                    {filtradoEmpleados.map((elemento, index) => (
                        <div key={index} className="flex flex-col bg-tertiary px-4 py-3 text-white rounded-xl shadow-md hover:shadow-lg transition-all"  >
                            <h3 className="text-lg font-semibold">{elemento.nombreCompleto}</h3>
                            <p className="text-sm text-gray-300">{elemento.correoElectronico}</p>
                            <ButtonSecondary
                                className={"self-end mt-3 text-white cursor-pointer"}
                                maxWidth="w-[100px]"
                                fontWeight="font-medium"
                                bgColor={elemento.activo ? "bg-red-700" : "bg-green-600"}
                                text={elemento.activo ? "Bloquear" : "Activar"}
                                onClick={() => handleToggleActivo(elemento.id)}
                            />
                        </div>
                    ))}
                </div>
            </main>
            <Footer />


            {modal && <ModalEmpleado onClose={() => setModal(false)} 
                                    onSaved={() => { setModal(false); 
                                    traerEmpleados(); }} />}
        </>
    )
}

export default Empleados