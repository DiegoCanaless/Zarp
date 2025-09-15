
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
import VerificarDocumentos from '../pages/Administradores/VerificarDocumentos';
import {Contactanos} from "../pages/Clientes/Contactanos"
import Configuracion from '../pages/Administradores/Configuracion';
import VerificarPropiedad from '../pages/Administradores/VerificarPropiedad';
import Listas from '../pages/Administradores/Listas';
import Empleados from '../pages/Administradores/Empleados';
import CrearPropiedad from '../pages/Propietarios/CrearPropiedad';
import MisPropiedades from '../pages/Propietarios/MisPropiedades';



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

        <Route path='/crearPropiedad' element={
          <RequireRole allowed={["PROPIETARIO"]} >
            <CrearPropiedad />
          </RequireRole>
          }
        />

        <Route path='/misPropiedades' element={
          <RequireRole allowed={["PROPIETARIO"]} >
            <MisPropiedades />
          </RequireRole>
          }
        />



        {/* Paginas Empleados */}

        <Route path='/WelcomeAdmin' element={
          <RequireRole allowed={["SUPERADMIN","EMPLEADO"]} >
            <WelcomeAdmin />
          </RequireRole>
          }
        />

        <Route path='/VerificacionesAdmin' element={
          <RequireRole allowed={["SUPERADMIN","EMPLEADO"]} >
            <VerificacionesAdmin />
          </RequireRole>
          }
        />

        <Route path='/VerificarDocumento' element={
          <RequireRole allowed={["SUPERADMIN","EMPLEADO"]} >
            <VerificarDocumentos />
          </RequireRole>
          }
        />

        <Route path='/VerificarPropiedad' element={
          <RequireRole allowed={["SUPERADMIN","EMPLEADO"]} >
            <VerificarPropiedad />
          </RequireRole>
          }
        />


        <Route path='/Listas' element={
          <RequireRole allowed={["SUPERADMIN","EMPLEADO"]} >
            <Listas/>
          </RequireRole>
          }
        />


        {/* Paginas exclusivas del SuperAdmin */}

        <Route path='/Configuracion' element={
          <RequireRole allowed={["SUPERADMIN"]} >
            <Configuracion />
          </RequireRole>
          }
        />

        <Route path='/Empleados' element={
          <RequireRole allowed={["SUPERADMIN"]} >
            <Empleados/>
          </RequireRole>
          }
        />
      </Routes>

      <Toaster position="bottom-right" />
    </>



      )
}

