import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../reducer/user/userSlice'

export default configureStore({
  reducer: {
    user: userReducer
  }
})