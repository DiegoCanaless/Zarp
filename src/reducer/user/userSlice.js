// reducer/user/userSlice.js
import { createSlice } from '@reduxjs/toolkit'
import { AutorizacionesCliente } from '../../types/enums/AutorizacionesCliente' // ajustá ruta si corresponde

// helper: derivar enum desde booleans antiguos (migración)
const deriveAutorizacionesFromBooleans = (credMP, credPP) => {
  if (credMP && credPP) return AutorizacionesCliente.AMBAS
  if (credMP) return AutorizacionesCliente.MERCADO_PAGO
  if (credPP) return AutorizacionesCliente.PAYPAL
  return AutorizacionesCliente.NINGUNA
}

// leer user y migrar si vienen claves antiguas
const rawStored = JSON.parse(localStorage.getItem('user')) || {}

const userFromStorage = {
  id: rawStored.id ?? null,
  uid: rawStored.uid ?? '',
  fullname: rawStored.fullname ?? '',
  email: rawStored.email ?? '',
  token: rawStored.token ?? '',
  photoURL: rawStored.photoURL ?? '',
  AuthenticatedEmail: rawStored.AuthenticatedEmail ?? false,
  AuthenticatedDocs: rawStored.AuthenticatedDocs ?? false,
  rol: rawStored.rol ?? 'CLIENTE',
  propiedades: rawStored.propiedades ?? [],
  // --- solo mantenemos autorizaciones (migramos si estaban los booleans)
  autorizaciones:
    rawStored.autorizaciones ??
    deriveAutorizacionesFromBooleans(rawStored.CredencialesMP, rawStored.CredencialesPP) ??
    AutorizacionesCliente.NINGUNA,
}

const isPropiedadVisible = (prop) => {
  const status = String(
    prop?.verificacionPropiedad ?? prop?.verificacion ?? prop?.estado ?? ''
  ).toUpperCase();

  return status !== 'RECHAZADA' && status !== 'PENDIENTE';
};

const sanitizeProps = (props = []) => props.filter(isPropiedadVisible);

const initialState = {
  ...userFromStorage,
  propiedades: sanitizeProps(userFromStorage.propiedades),
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const p = action.payload
      if (p.id !== undefined) state.id = p.id
      if (p.uid !== undefined) state.uid = p.uid
      if (p.fullname !== undefined) state.fullname = p.fullname
      if (p.email !== undefined) state.email = p.email
      if (p.token !== undefined) state.token = p.token
      if (p.photoURL !== undefined) state.photoURL = p.photoURL
      if (p.propiedades !== undefined) state.propiedades = sanitizeProps(p.propiedades);

      state.AuthenticatedEmail = p.AuthenticatedEmail ?? state.AuthenticatedEmail
      state.AuthenticatedDocs = p.AuthenticatedDocs ?? state.AuthenticatedDocs

      state.rol = p.rol ?? state.rol ?? 'CLIENTE'

      // ahora guardamos SOLO 'autorizaciones' (el enum del backend)
      if (p.autorizaciones !== undefined) {
        state.autorizaciones = p.autorizaciones
      } else {
        // si viene explícitamente como campo booleano por alguna razón, migramos
        if (p.CredencialesMP !== undefined || p.CredencialesPP !== undefined) {
          state.autorizaciones = deriveAutorizacionesFromBooleans(
            p.CredencialesMP ?? false,
            p.CredencialesPP ?? false
          )
        }
      }

      localStorage.setItem('user', JSON.stringify(state))
    },

    addPropiedad: (state, action) => {
      const nueva = action.payload;
      if (isPropiedadVisible(nueva)) {
        state.propiedades.push(nueva);
        localStorage.setItem('user', JSON.stringify(state));
      }
    },
    removePropiedad: (state, action) => {
      state.propiedades = state.propiedades.filter(
        (prop) => prop.id !== action.payload
      )
      localStorage.setItem('user', JSON.stringify(state))
    },

    logout: (state) => {
      state.id = ""
      state.uid = ''
      state.fullname = ''
      state.email = ''
      state.token = ''
      state.photoURL = ''
      state.AuthenticatedEmail = false
      state.AuthenticatedDocs = false
      state.rol = ''
      state.propiedades = []
      state.autorizaciones = AutorizacionesCliente.NINGUNA
      localStorage.removeItem('user')
    }
  }
})

export const { setUser, logout, addPropiedad, removePropiedad } = userSlice.actions

export const selectUser = (state) => state.user
export const selectUserRol = (state) => state.user?.rol || 'CLIENTE'
export const selectIsAuthenticated = (state) => Boolean(state.user?.token);
export const selectUserPropiedades = (state) => state.user?.propiedades || []

// nuevo: selector y helpers para autorizaciones
export const selectAutorizaciones = (state) => state.user?.autorizaciones ?? AutorizacionesCliente.NINGUNA
export const hasMercadoPago = (state) => {
  const a = selectAutorizaciones(state)
  return a === AutorizacionesCliente.MERCADO_PAGO || a === AutorizacionesCliente.AMBAS
}
export const hasPayPal = (state) => {
  const a = selectAutorizaciones(state)
  return a === AutorizacionesCliente.PAYPAL || a === AutorizacionesCliente.AMBAS
}

export default userSlice.reducer
