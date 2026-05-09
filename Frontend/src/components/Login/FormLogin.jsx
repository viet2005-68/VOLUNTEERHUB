import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaHome } from "react-icons/fa";
import { FaBackward } from "react-icons/fa6";
import { pandaclosed, pandaopen } from "../../assets/Login";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
function FormLogin() {
  const [isPasswordFocus, setIsPasswordFocused] = useState(false);
  return (
    <div>
      <div
        className="flex flex-col justify-around gap-4 font-semibold max-md:text-lg w-[100%] m-auto mr-20 p-4
        "
      >
        <div className="flex flex-col gap-0 justify-center items-center relative">
          <div className="text-2xl font-bold -mt-[10%] absolute top-0 ">
            Login
          </div>
          <div className="size-32">
            <AnimatePresence>
              {isPasswordFocus ? (
                <motion.img
                  key="closed"
                  src={pandaclosed}
                  alt="Panda closed eyes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 left-0 w-full h-full object-contain"
                />
              ) : (
                <motion.img
                  key="open"
                  src={pandaopen}
                  alt="Panda open eyes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 left-0 w-full h-full object-contain"
                />
              )}
            </AnimatePresence>
          </div>
        </div>
        <form>
          <div>
            <div className="flex flex-col gap-2 max-md:flex-col align-middle justify-start">
              <label>Email</label>
              <input
                type="text"
                id="email"
                name="email"
                className="border-2 border-gray-300 rounded-md p-1 focus:outline-none focus:border-red-300 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2 max-md:flex-col">
              <label className="">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="border-2 border-gray-300 rounded-md p-1 focus:outline-none focus:border-red-300 focus:ring-blue-500"
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
            </div>
            <div className="flex flex-row gap-2 justify-between items-center mt-3">
              <div className="flex flex-row gap-2 items-center justify-center align-middle">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <div>
                <a href="#" className="text-red-400">
                  Forgot password?
                </a>
              </div>
            </div>
            <input
              type="submit"
              value="Login"
              className="bg-red-400 text-white p-2 rounded-md min-w-full cursor-pointer hover:bg-red-450 transition-all duration-200 ease-in-out mt-4"
            />
          </div>
          <div className="text-center">
            <div>Or login with</div>
          </div>
          <div className="flex flex-row gap-5 justify-between items-center mt-2">
            <div className="basis-1/2 border-gray-300 border-1 flex justify-center items-center p-2 shadow-2xs rounded-xl cursor-pointer">
              <FcGoogle className="text-2xl" />
            </div>
            <div className="basis-1/2 border-gray-300 border-1 flex justify-center items-center p-2 shadow-2xs rounded-xl cursor-pointer">
              <FaFacebook className="text-blue-500 text-2xl" />
            </div>
          </div>
          <div className="flex flex-col max-md:flex-col justify-center items-center gap-2">
            <div className="flex flex-row gap-2">
              <div>Don't have an account?</div>
              <div>
                <a href="#" className="text-indigo-500">
                  Register
                </a>
              </div>
            </div>
            <div className="flex flex-rows justify-center items-center gap-2 mt-4 cursor-pointer">
              <FaHome />
              <button>Back to home</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormLogin;
