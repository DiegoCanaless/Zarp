import { createSlice } from '@reduxjs/toolkit'
import { act } from 'react';


const initialState = {
    fullname: "",
    email: "",
    token: "",
    isAuthenticated: false,

}

export const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setUser : (state, action) => {
        state.fullname = action.payload.fullname;
        state.email = action.payload.email;
        state.token = action.payload.token;
    },

    logout: (state) => {
        state.fullname = "";
        state.email = "";
        state.token = "";
    }
  }
})

// Action creators are generated for each case reducer function
export const { setUser, logout } = userSlice.actions

export default userSlice.reducer