import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

type TInstituteDetails = {
  id: number;
  institute_name: string;
  institute_address: string;
  institute_email: string;
  institute_contact: string;
};

type TAuthUser = {
  name: string;
  email: string;
  mobile: string;
  status: string;
  institute: TInstituteDetails;
};

type TAuthState = {
  user: null | TAuthUser;
};

const initialState: TAuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user } = action.payload;
      state.user = user;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;

export const useCurrentUser = (state: RootState) => state.auth.user;
