import React from 'react'
import right2 from '../component/right2.jpg'

function Banner() {
    return (
        <div className="max-w-screen-2xl  container mx-auto md:px-20 px-4 flex flex-col md:flex-row">
            <div className="order-2 w-full md:w-1/2 mt-14 md:mt-32 md:order-1" >

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold ">Hello Welcome to learn Something <span className="text-green-500">new Everyday</span></h1>


                    <p className="text-xl ">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea 

                    </p>


                </div>
                <div className="mt-6 md:mt-10 lg:">

                    <label class="input input-bordered flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                        <input type="text" class="grow" placeholder="Email" />
                    </label>
                    <div className="flex justify-center md:flex-none md:justify-start mb-4 md:mb-4">

                    <button class="bg-green-500 py-3 px-2 rounded-2xl mt-6 w-32 border  text-white hover:bg-green-700 ">Success</button>
                    </div>
                </div>

            </div>

            <div className="order-1 w-full md:w-1/2 ">
                <img src={right2} alt='right' className="bg-black" ></img>
            </div>
        </div>
    )
}

export default Banner
