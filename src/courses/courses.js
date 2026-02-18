import React from 'react'
import Navbar from '../component/navbar'
import Footer from '../component/footer'
import Course from '../component/course'

function Courses() {
  return (
    <div>
      <Navbar/>
     <div className="min-h-screen">
        <Course/>
     </div>
      <Footer/>
    </div>
  )
}

export default Courses
