import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    status: false,
    userData: null,
    senderId: ''
}
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) =>  {
            state.status = true
            state.userData = action.payload.userData
        },
        logout: (state) => {
            state.status = false
            state.userData = null
            state.senderId = ''
        },
        setReceiver: (state, action) => {
            state.senderId = action.payload.senderId
        }
    }
})

export const { login, logout, setReceiver} = authSlice.actions;
export const authReducer =  authSlice.reducer;