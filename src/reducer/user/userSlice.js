// reducer/user/userSlice.js
import { createSlice } from '@reduxjs/toolkit'

const userFromStorage = JSON.parse(localStorage.getItem('user')) || {
  id: null,
  uid: '',
  fullname: '',
  email: '',
  token: '',
  photoURL: '',
  AuthenticatedEmail: false,
  AuthenticatedDocs: false,
  rol: "CLIENTE",
  propiedades: [],
}

const isPropiedadVisible = (prop) => {
  const status = String(
    prop?.verificacionPropiedad ?? prop?.verificacion ?? prop?.estado ?? ''
  ).toUpperCase();

  return status !== 'RECHAZADA' && status !== 'PENDIENTE';
};

const sanitizeProps = (props = []) => props.filter(isPropiedadVisible);

const userStorage = {
  ...userFromStorage,
  propiedades: sanitizeProps(userFromStorage.propiedades)
};

export const userSlice = createSlice({
  name: 'user',
  initialState: userFromStorage,
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
      localStorage.removeItem('user')
    }
  }
})




export const { setUser, logout, addPropiedad, removePropiedad } = userSlice.actions


export const selectUser = (state) => state.user
export const selectUserRol = (state) => state.user?.rol || 'CLIENTE'
export const selectIsAuthenticated = (state) => Boolean(state.user?.token);
export const selectUserPropiedades = (state) => state.user?.propiedades || []

export default userSlice.reducer
