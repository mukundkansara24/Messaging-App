import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "./appwrite/AppwriteService";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./store/authSlice";
import api from "./utils/api";
function Header() {
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.status);
  async function logOut() {
    try {
      const response = await api.post('/user/logout');
      if (response) {
        dispatch(logout());
      }
    }
    catch (error) {
      console.log("error = ", error.response);
    }
  }
  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          {!authStatus && (
            <div>
              <NavLink to="/login" className="btn btn-ghost text-lg">
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn-ghost text-lg">
                Signup
              </NavLink>
            </div>
          )}
        </div>
        {authStatus && (
          <div className="flex-none">
            <button
              className="btn btn-ghost text-lg"
              onClick={(e) => {
                logOut();
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Header;

/*
            {!authStatus && <nav>
                <NavLink to='/login'>Login</NavLink>{"  "}
                <NavLink to='/signup'>Signup</NavLink>
            </nav>}
            {authStatus &&
                <button className="fixed z-10 right-0 top-0.3 border m-0.5 p-1 rounded-md" onClick={(e) => { logOut() }}>Logout</button>}
*/
