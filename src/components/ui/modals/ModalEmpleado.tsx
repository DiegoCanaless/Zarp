import { AiOutlineClose } from "react-icons/ai"

type ModalEmpleadoProps = {
    onClose: () => void;
    onSaved?: () => void;
};


const ModalEmpleado = ({onClose, onSaved}: ModalEmpleadoProps) => {
    return (
        <>
            <div className='fixed inset-0 z-20 bg-black/30 flex items-center justify-center'>
                <div className="w-120 max-w-[560px] h-50 bg-tertiary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">Agregar Empleado</h3>
                        <AiOutlineClose onClick={onClose} color="white" fontSize={25} className="cursor-pointer" />
                    </div>
                </div>

            </div>
        </>
    )
}

export default ModalEmpleado