import { useSelector } from 'react-redux';

export default function Inicio() {
  const { fullname } = useSelector(state => state.user);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">¡Bienvenido {fullname || "Usuario"}!</h1>
      <p>Ya ingresaste correctamente.</p>
    </div>
  );
}