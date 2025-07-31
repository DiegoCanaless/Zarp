import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../reducer/user/userSlice'; // Importar la acción, no el default
import { useNavigate } from 'react-router-dom';
import { UsuarioHeader } from "../components/layout/headers/UsuarioHeader"

export default function Inicio() {
  const { fullname } = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout()); // Ejecutar la acción de logout
    navigate('/'); // Redirigir a la página principal o login
  };

  return (
    <>
      <UsuarioHeader/>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">¡Bienvenido {fullname || "Usuario"}!</h1>
        <p>Ya ingresaste correctamente.</p>
        <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"> Logout
        </button>
      </div>
    </>

  );
}