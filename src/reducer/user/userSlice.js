import { createSlice } from '@reduxjs/toolkit'

const userFromStorage = JSON.parse(localStorage.getItem('user')) || {
  fullname: "",
  email: "",
  token: "",
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState: userFromStorage,
  reducers: {
    setUser: (state, action) => {
      state.fullname = action.payload.fullname;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(state));
    },
    logout: (state) => {
      state.fullname = "";
      state.email = "";
      state.token = "";
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    }
  }
})

export const { setUser, logout } = userSlice.actions
export default userSlice.reducer