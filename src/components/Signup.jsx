import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { login } from "../store/authSlice";
import api from "../utils/api";

function Signup() {
  const dispatch = useDispatch();
  const { register, handleSubmit, formState } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(data) {
    console.log(data);
    try {
      const response = await api.post('/user/signup', data);
      if (response) {
        alert("User successfully created, You will be redirect to login");
        navigate('/login');
      }
    }
    catch (error) {
      console.log("Message = ", error.response);
      setError(error.response?.data.message);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    try {
      const response = await api.post('/user/google-auth', {
        credential: credentialResponse.credential,
      });
      dispatch(login({ userData: response.data[0] }));
      setError("");
    } catch (error) {
      console.log("Google Auth Error = ", error.response);
      setError(error.response?.data?.message || "Google sign-up failed");
    }
  }

  function handleGoogleFailure() {
    setError("Google sign-in was unsuccessful. Please try again.");
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

        <div className="divider my-2">OR</div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </div>

        {error !== "" && <p className="text-red-500 text-sm mt-2">
          {error}
        </p>}
      </fieldset>
    </form>
  );
}
export default Signup;
