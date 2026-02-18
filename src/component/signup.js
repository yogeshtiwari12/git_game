import React from 'react'
import { Link, useNavigate,useLocation} from 'react-router-dom';
import Login from './login';
import { useForm} from "react-hook-form"
import axios from 'axios';
import toast from 'react-hot-toast';


function Signup() {
  const location = useLocation()

const navigate = useNavigate()
const from  = location.state?.from?.pathname || "/"

  console.log()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

//  important code 
const onSubmit = async (data)=>{

const userinfo = {
  fullname:data.fullname,
  email:data.email,
  password:data.password
  
}
  
  await axios.post('http://localhost:4000/users/signup',userinfo)

.then((res)=>{

  if(res.data){
    toast.success('Signup Successfull');
    navigate(from,{replace:true})
  }

localStorage.setItem("User : "+JSON.stringify(res.data))
 
}).catch((err)=>{
  if(err.response){
 console.log("error")
  alert("Error : "+err.response.data.message)
  toast.success("Error : "+err.response.data.message);

  }
})
  }

  
  
  return (
<>


   
    <div className="my_modal_ container flex justify-center align-items-center mt-44 mx-8">
      <div className="modal-box flex flex-col justify-center items-center p-8">
        <h3 className="font-bold text-lg mb-4">Signup</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              id="name"

              className="form-control mt-1 outline-none border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
              placeholder="Enter your Name"

              {...register("fullname", { required: true })}

            />
               {errors.fullname && <span className="text-red-500 text-bold my-4">This field is required</span>}


          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"

              className="form-control mt-1 outline-none border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
              placeholder="Enter your Email"
              {...register("email", { required: true })}

            />
               {errors.email && <span className="text-red-500 text-bold my-4">This field is required</span>}

          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              id="password"

              className="form-control mt-1 outline-none border border-gray-300 dark:border-gray-600 rounded-md w-full p-2"
              placeholder="Enter your Password"
              {...register("password", { required: true })}

            />
              {errors.password && <span className="text-red-500 text-bold my-4">This field is required</span>}

          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Signup
          </button>



        </form>
        <p className="mt-4">Already Have an Account ?

          <button className="text-blue-500 underline mx-2 " onClick={() => {
            document.getElementById("my_modal_2").showModal()
          }}>
            {/* yha glti hogi kyuki button bnane k baad usko call bhi krvana hoga tabhi wo component render hoga */}
            Login
          </button>
          
          <Login /> 
        


     

        </p>

        <Link to="/" className="bg-green-500 hover:bg-green-700 py-2 px-4 mt-2 text-white rounded-xl" >Close
        
        </Link>





      </div>

    </div>
    
    </>
  );
}

export default Signup
