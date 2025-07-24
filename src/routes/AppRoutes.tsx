
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Inicio from '../pages/Inicio';



export default function AppRoutes(){
  return (

    <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/Inicio' element={<Inicio/>} />
    </Routes>

  )
}

