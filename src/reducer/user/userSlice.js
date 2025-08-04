import { createSlice } from '@reduxjs/toolkit'

const userFromStorage = JSON.parse(localStorage.getItem('user')) || {
  fullname: "",
  email: "",
  token: "",
  AuthenticatedEmail: false,
  AuthenticatedDocs: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState: userFromStorage,
  reducers: {
    setUser: (state, action) => {
      state.fullname = action.payload.fullname;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.AuthenticatedEmail = action.payload.AuthenticatedEmail ?? state.AuthenticatedEmail;
      state.AuthenticatedDocs = false;
      localStorage.setItem('user', JSON.stringify(state));
    },
    logout: (state) => {
      state.fullname = "";
      state.email = "";
      state.token = "";
      state.AuthenticatedEmail = false;
      state.AuthenticatedDocs = false;
      localStorage.removeItem('user');
    }
  }
})

export const { setUser, logout } = userSlice.actions
export default userSlice.reducer