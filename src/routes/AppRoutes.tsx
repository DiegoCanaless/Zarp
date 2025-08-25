
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Inicio from '../pages/Inicio';
import MiPerfil from '../pages/MiPerfil'
import UserVerificiacion from '../pages/UserVerificacion';
import WelcomeAdmin from '../pages/WelcomeAdmin'
import { Toaster } from 'react-hot-toast';
import VerificacionesAdmin from '../pages/VerificacionesAdmin';
import ErrorPage from "../pages/Error"
import RequireRole from './Guards/RequireRole';
import VerificarDocumentos from '../components/layout/VerificarDocumentos';



export default function AppRoutes() {

  return (
    <>
      <Routes>

        {/* Paginas Publicas */}
        <Route path='/' element={<Landing />} />
        <Route path="*" element={<ErrorPage />} />


        {/* Paginas Clientes y Propietarios*/}
        <Route path='/Inicio' element={
          <RequireRole allowed={["CLIENTE","PROPIETARIO"]} >
            <Inicio />
          </RequireRole>
          }
        />
        <Route path='/Perfil' element={
          <RequireRole allowed={["CLIENTE","PROPIETARIO"]} >
            <MiPerfil />
          </RequireRole>
          }
        />
        <Route path='/userVerificacion' element={
          <RequireRole allowed={["CLIENTE","PROPIETARIO"]} >
            <UserVerificiacion />
          </RequireRole>
          }
        />
        



        

        {/* Pagina Propietarios  */}



        {/* Aca irian los SuperAdmin y Empleados */}

        <Route path='/WelcomeAdmin' element={
          <RequireRole allowed={["SUPERADMIN","ADMIN"]} >
            <WelcomeAdmin />
          </RequireRole>
          }
        />

        <Route path='/VerificacionesAdmin' element={
          <RequireRole allowed={["SUPERADMIN","ADMIN"]} >
            <VerificacionesAdmin />
          </RequireRole>
          }
        />

        <Route path='/verificarDocumento' element={
          <RequireRole allowed={["SUPERADMIN","ADMIN"]} >
            <VerificarDocumentos />
          </RequireRole>
          }
        />

      </Routes>

      <Toaster position="bottom-right" />
    </>



      )
}

