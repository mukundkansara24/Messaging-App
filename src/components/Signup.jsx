import React from "react";
import { useForm } from 'react-hook-form';
import authService from "../appwrite/AppwriteService";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
function Signup() {
    const { register, handleSubmit, formState } = useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    async function onSubmit(data) {
        console.log(data);
        const response = await authService.createUser(data);
        if (response) {
            const currUser = await authService.getCurrentUser();
            console.log(currUser);
            dispatch(login({userData: currUser}));
        }
    }
    return (
        <div className="p-8 border rounded-lg shadow-md">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 rounded-lg p-2 justify-around items-center">
                <h2 className="w-full text-center text-xl">Signup</h2>
                <div className="flex flex-col gap-2">
                    <div>
                        <label htmlFor="username">Username</label>
                        <input className="m-3 p-1 border-2 rounded-md" id="username" {...register('username', { required: "username is required" })} />
                        {formState.errors.username && <p className="text-red-500 text-sm">{formState.errors.username.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="mr-8">Email</label>
                        <input className="m-3 p-1 border-2 rounded-md" id="email" {...register('email', { required: "Email is required" })} />
                        {formState.errors.username && <p className="text-red-500 text-sm">{formState.errors.username.message}</p>}
                    </div>
                    <div>
                        <label className="mr-1" htmlFor="password">Password</label>
                        <input type="password" className="m-3 p-1 border-2 rounded-md" id="password" {...register('password', { required: "Password is required" })} />
                        {formState.errors.password && <p className="text-red-500 text-sm">{formState.errors.password.message}</p>}
                    </div>
                </div>
                <button className="border w-1/3 rounded-lg">Submit</button>
                <div>Already have account: <NavLink to="/login">Login Here</NavLink></div>
            </form>
        </div>
    )
}
export default Signup;
