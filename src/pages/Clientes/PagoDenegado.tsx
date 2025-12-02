import { MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";

export default function PagoDenegado() {
    return (
        <main className="min-h-screen bg-secondary flex flex-col items-center justify-center px-6 text-center">
            {/* Ícono */}
            <MdCancel
                size={110}
                className="text-red-500 animate-[pop_0.4s_ease-out]"
            />

            {/* Títulos */}
            <h1 className="text-3xl font-semibold text-white mt-4">
                Pago denegado
            </h1>

            <p className="text-white/70 max-w-md mt-2">
                No pudimos procesar tu pago. Puede deberse a un error con la tarjeta,
                fondos insuficientes o un bloqueo del banco.
            </p>

            {/* Botón */}
            <Link
                to="/inicio"
                className="
          mt-8 px-6 py-3 rounded-xl text-black
          bg-[#E2DBBE] hover:bg-[#d4cfae]
          transition font-medium
        "
            >
                Volver al inicio
            </Link>

            {/* Animación Tailwind custom */}
            <style>
                {`
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
            </style>
        </main>
    );
}
