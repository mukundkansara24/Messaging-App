import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  groupId: "",
  groupUsername: "",
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload.userData;
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      state.groupId = "";
      state.groupUsername = "";
    },
    setReceiver: (state, action) => {
      state.groupId = action.payload.groupId;
      state.groupUsername = action.payload.groupUsername;
    },
  },
});

export const { login, logout, setReceiver } = authSlice.actions;
export const authReducer = authSlice.reducer;
