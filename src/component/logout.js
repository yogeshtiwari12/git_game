import React from 'react'
import { useAuth } from '../authuser'
import toast from 'react-hot-toast'
function Logout() {
  const [authuser, setautheruser] = useAuth()
  function handlelogout() {
    try {
      setautheruser({
        ...authuser,
        user: null
      })
      localStorage.removeItem("User")
      toast.success("Logout Successfully")

      setTimeout(() => {
        window.location.reload();

      }, 2000);
    } catch (error) {
      toast.error("Error" + error.message)
      setTimeout(() => {

      }, 3000);
    }
  }
  return (
    <div className="px-4 py-2 bg-red-500 text-white rounded-xl">
      <button onClick={handlelogout}>logout</button>
    </div>
  )
}

export default Logout
