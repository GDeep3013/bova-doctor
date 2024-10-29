import React from 'react'

export default function page() {
  return (
    <div className='login-outer'>
    <div className="container mx-auto max-w-full p-0">
    <div className="flex flex-wrap bg-white rounded-lg shadow-lg min-h-screen">
      <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-customBg">
      <div className='max-w-[524px] text-center logincircle'>
        <img src="/images/logo.png" alt="Logo" className="w-24 mb-6 m-auto" />
        <h2 className="text-xl font-bold text-center mb-2 max-w-[450px] text-customText">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</h2>
      </div>
      </div>

      <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center">
        <div className="text-center mb-6 w-full max-w-screen-sm">
          <h2 className="text-2xl font-bold">Sign In to your Account</h2>
          <p className="text-gray-600">Welcome back! Please enter your details.</p>
        </div>
        <form className="space-y-4 py-5 w-full max-w-screen-sm">
          <div className="relative">
            <img src="/images/email.svg" alt="Email icon" className="absolute left-3 top-3 w-4 h-4" />
            <input type="email" placeholder="Email" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
          </div>
          <div className="relative">
            <img src="/images/lock.svg" alt="Password icon" className="absolute left-3 top-3 w-4 h-4" />
            <input type="password" placeholder="Password" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
            <img src="/images/eye.svg" alt="Toggle visibility" className="absolute right-3 top-3 w-5 h-5 cursor-pointer" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Remember me</span>
            </label>
            <a href="/forget-password" className="text-blue-600 text-sm">Forgot Password?</a>
          </div>
          <button type="submit" className="w-full py-2 bg-customBg text-white font-bold rounded hover:bg-customText focus:outline-none">Sign In</button>
        </form>
      </div>
    </div>
  </div>
  </div>
  )
}
