
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Clientes/Landing';
import Inicio from '../pages/Clientes/Inicio';
import MiPerfil from '../pages/Clientes/MiPerfil'
import UserVerificiacion from '../pages/Clientes/UserVerificacion';
import WelcomeAdmin from '../pages/Administradores/WelcomeAdmin'
import { Toaster } from 'react-hot-toast';
import VerificacionesAdmin from '../pages/Administradores/VerificacionesAdmin';
import ErrorPage from "../pages/Clientes/Error"
import RequireRole from './Guards/RequireRole';
import VerificarDocumentos from '../components/layout/Administradores/VerificarDocumentos';
import {Contactanos} from "../pages/Clientes/Contactanos"
import Configuracion from '../pages/Administradores/Configuracion';



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
        <Route path='/Contactanos' element={
          <RequireRole allowed={["CLIENTE","PROPIETARIO"]} >
            <Contactanos />
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

        <Route path='/VerificarDocumento' element={
          <RequireRole allowed={["SUPERADMIN","ADMIN"]} >
            <VerificarDocumentos />
          </RequireRole>
          }
        />

        <Route path='/Configuracion' element={
          <RequireRole allowed={["SUPERADMIN","ADMIN"]} >
            <Configuracion />
          </RequireRole>
          }
        />

      </Routes>

      <Toaster position="bottom-right" />
    </>



      )
}

