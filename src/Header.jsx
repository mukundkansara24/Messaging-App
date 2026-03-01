import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "./appwrite/AppwriteService";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./store/authSlice";
function Header() {
    const dispatch = useDispatch();
    const authStatus = useSelector(state => state.status);
    async function logOut() {
        await authService.Logout();
        dispatch(logout());
    }
    return (
        <>
            {!authStatus && <nav>
                <NavLink to='/login'>Login</NavLink>{"  "}
                <NavLink to='/signup'>Signup</NavLink>
            </nav>}
            {authStatus &&
                <button className="fixed z-10 right-0 top-0.3 border m-0.5 p-1 rounded-md" onClick={(e) => { logOut() }}>Logout</button>}
        </>
    )
}

export default Header;