
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Inicio from '../pages/Inicio';
import MiPerfil from '../pages/MiPerfil'



export default function AppRoutes(){
  return (

    <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/Inicio' element={<Inicio/>} />
        <Route path='/Perfil' element={<MiPerfil/>} />
    </Routes>

  )
}

