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
}

export const userSlice = createSlice({
  name: 'user',
  initialState: userFromStorage,
  reducers: {
    setUser: (state, action) => {
      const p = action.payload
      if(p.id !== undefined) state.id = p.id
      if (p.uid !== undefined) state.uid = p.uid
      if (p.fullname !== undefined) state.fullname = p.fullname
      if (p.email !== undefined) state.email = p.email
      if (p.token !== undefined) state.token = p.token
      if (p.photoURL !== undefined) state.photoURL = p.photoURL

      state.AuthenticatedEmail = p.AuthenticatedEmail ?? state.AuthenticatedEmail
      state.AuthenticatedDocs = p.AuthenticatedDocs ?? state.AuthenticatedDocs

      state.rol = p.rol ?? state.rol ?? 'CLIENTE'
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
      localStorage.removeItem('user')
    }
  }
})

export const { setUser, logout } = userSlice.actions

export const selectUser = (state) => state.user
export const selectUserRol = (state) => state.user?.rol || 'CLIENTE'
export const selectIsAuthenticated = (state) => Boolean(state.user?.token);

export default userSlice.reducer
