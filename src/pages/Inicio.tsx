import { useLocation } from "react-router-dom";

export default function Inicio() {
  const location = useLocation();
  const nombre = location.state?.nombre || "Usuario";

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">¡Bienvenido {nombre}!</h1>
      <p>Ya ingresaste correctamente.</p>
    </div>
  );
}