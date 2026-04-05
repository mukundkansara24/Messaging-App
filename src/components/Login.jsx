import React, { useState } from "react";
import axios from 'axios';
import { useForm } from "react-hook-form";
import authService from "../appwrite/AppwriteService";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import api from "../utils/api";
import { useNavigate } from "react-router";


function Login() {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      const response = await api.post('/user/login', data);
      console.log(response.data);
      dispatch(login({userData: response.data[0]}));
      setError("");
    } catch (error) {
      console.log("Message = ", error.response);
      setError(error.response?.data.message);
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
        {error !== "" && <p className="text-red-500 text-sm">
          {error}
        </p>}
      </fieldset>
    </form>
  );
}
export default Login;
