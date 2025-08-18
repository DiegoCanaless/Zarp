
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Inicio from '../pages/Inicio';
import MiPerfil from '../pages/MiPerfil'
import UserVerificiacion from '../pages/UserVerificacion';
import Welcome from '../pages/Welcome'
import { Toaster } from 'react-hot-toast';



export default function AppRoutes() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/Inicio' element={<Inicio />} />
        <Route path='/Perfil' element={<MiPerfil />} />
        <Route path='/userVerificacion' element={<UserVerificiacion />} />


        {/* Aca irian los SuperAdmin y Empleados */}
        <Route path="Welcome" element={<Welcome/>} />
      </Routes>

      <Toaster position="bottom-right" />
    </>



  )
}

