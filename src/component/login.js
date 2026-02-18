import React from 'react';
import { Link } from 'react-router-dom';
import {  useForm } from "react-hook-form";
import axios from 'axios';
import toast from'react-hot-toast';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
 

  const onSubmit = async (data) => {
    const userinfo = {
      email: data.email,
      password: data.password
    };

    try {
      
      const res = await axios.post('http://localhost:4000/users/login', userinfo);
      if (res.data) {

        toast.success('Login Success');
        document.getElementById("my_modal_2").close();
        setTimeout(() => {
          window.location.reload();
          localStorage.setItem("User", JSON.stringify(res.data));
          
        },1000);
      }
    } catch (err) {
      if (err.response) {
        toast.error("Error: " + err.response.data.message);
        setTimeout(() => {

        },3000);
      }
    }
  };

  return (
    <dialog id="my_modal_2" className="modal open">
      <div className="modal-box flex flex-col justify-center items-center p-8">
        <h3 className="font-bold text-lg mb-4">Login</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <Link
            to="/"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => document.getElementById("my_modal_2").close()}
          >
            ✕
          </Link>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-control mt-1 outline-none border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
              placeholder="Enter your email"
              {...register("email", { required: true })}
            />
            {errors.email && <span className="text-red-500 text-bold my-4">This field is required</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control mt-1 outline-none border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
              placeholder="Enter your password"
              {...register("password", { required: true })}
            />
            {errors.password && <span className="text-red-500 text-bold my-4">This field is required</span>}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>

        <div className="flex justify-between mt-6">
          <p className="text-sm text-gray-700 dark:text-gray-500">
            Don't have an account?
            <Link to="/signup" className="text-green-500 hover:text-green-700">
              Sign Up Here
            </Link>
          </p>
        </div>
      </div>
    </dialog>
  );
}

export default Login;
