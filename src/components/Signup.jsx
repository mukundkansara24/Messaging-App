import React, { useState } from "react";
import { useForm } from "react-hook-form";
import authService from "../appwrite/AppwriteService";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import api from "../utils/api";
function Signup() {
  const { register, handleSubmit, formState } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  async function onSubmit(data) {
    console.log(data);
    try {
      const response = await api.post('/user/signup', data);
      // console.log(response);
      if(response) {
        alert("User successfully created, You will be redirect to login");
        navigate('/login');
      }
    }
    catch (error) {
      console.log("Message = ", error.response);
      setError(error.response?.data.message);
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend text-2xl">Signup</legend>

        <label className="label" htmlFor="first_name">
          First Name
        </label>
        <input
          type="text"
          className="input"
          placeholder="first_name"
          id="first_name"
          {...register("first_name", { required: "First Name is required" })}
        />
        {formState.errors.first_name && (
          <p className="text-red-500 text-sm">
            {formState.errors.first_name.message}
          </p>
        )}

        <label className="label" htmlFor="last_name">
          Last Name
        </label>
        <input
          type="text"
          className="input"
          placeholder="last_name"
          id="last_name"
          {...register("last_name", { required: "Last Name is required" })}
        />
        {formState.errors.last_name && (
          <p className="text-red-500 text-sm">
            {formState.errors.last_name.message}
          </p>
        )}

        <label className="label" htmlFor="username">
          Username
        </label>
        <input
          type="text"
          className="input"
          placeholder="Username"
          id="username"
          {...register("username", { required: "username is required" })}
        />
        {formState.errors.username && (
          <p className="text-red-500 text-sm">
            {formState.errors.username.message}
          </p>
        )}

        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          className="input"
          placeholder="Email"
          id="email"
          {...register("email", { required: "email is required" })}
        />
        {formState.errors.username && (
          <p className="text-red-500 text-sm">
            {formState.errors.username.message}
          </p>
        )}

        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          className="input"
          placeholder="Password"
          id="password"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Must be atleast 8 characters" },
          })}
        />
        {formState.errors.password && (
          <p className="text-red-500 text-sm">
            {formState.errors.password.message}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-neutral mt-4"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <span className="loading loading-bars loading-md"></span>
          ) : (
            "Signup"
          )}
        </button>
        {error !== "" && <p className="text-red-500 text-sm">
          {error}
        </p>}
      </fieldset>
    </form>
  );
}
export default Signup;

/*

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
*/
