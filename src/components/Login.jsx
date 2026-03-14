import React from "react";
import { useForm } from "react-hook-form";
import authService from "../appwrite/AppwriteService";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
function Login() {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState } = useForm();
  async function onSubmit(data) {
    const response = await authService.Login(data);
    if (response) {
      const currUser = await authService.getCurrentUser();
      console.log(currUser);
      dispatch(login({ userData: currUser }));
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend text-2xl">Login</legend>

        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          className="input"
          placeholder="Email"
          id="email"
          {...register("email", {
            required: "email is required",
            pattern: {
              value: "^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$",
              message: "Email must be in valid format",
            },
          })}
        />
        {formState.errors.email && (
          <p className="text-red-500 text-sm">
            {formState.errors.email.message}
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
            minLength: {
              value: 8,
              message: "Password must be atleast 8 characters",
            },
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
            "Login"
          )}
        </button>
      </fieldset>
    </form>
  );
}
export default Login;
