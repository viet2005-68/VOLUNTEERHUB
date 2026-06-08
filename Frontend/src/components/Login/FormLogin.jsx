import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaHome } from "react-icons/fa";
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
                className="rounded-[10px] border-2 border-ash-whisper bg-pale-canvas p-2 text-deep-forest outline-none transition placeholder:text-deep-forest/50 focus:border-foudre-pink focus:ring-4 focus:ring-foudre-pink/20"
              />
            </div>
            <div className="flex flex-col gap-2 max-md:flex-col">
              <label className="">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="rounded-[10px] border-2 border-ash-whisper bg-pale-canvas p-2 text-deep-forest outline-none transition placeholder:text-deep-forest/50 focus:border-foudre-pink focus:ring-4 focus:ring-foudre-pink/20"
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
                <a href="#" className="font-bold text-foudre-pink transition hover:text-deep-forest">
                  Forgot password?
                </a>
              </div>
            </div>
            <input
              type="submit"
              value="Login"
              className="mt-4 min-w-full cursor-pointer rounded-[10px] bg-foudre-pink p-3 font-bold text-pale-canvas transition-all duration-200 ease-in-out hover:bg-deep-forest"
            />
          </div>
          <div className="text-center">
            <div>Or login with</div>
          </div>
          <div className="flex flex-row gap-5 justify-between items-center mt-2">
            <div className="flex basis-1/2 cursor-pointer items-center justify-center rounded-[10px] border-2 border-ash-whisper bg-pale-canvas p-2 text-deep-forest shadow-2xs transition hover:border-foudre-pink">
              <FcGoogle className="text-2xl" />
            </div>
            <div className="flex basis-1/2 cursor-pointer items-center justify-center rounded-[10px] border-2 border-ash-whisper bg-pale-canvas p-2 text-deep-forest shadow-2xs transition hover:border-foudre-pink">
              <FaFacebook className="text-2xl text-foudre-pink" />
            </div>
          </div>
          <div className="flex flex-col max-md:flex-col justify-center items-center gap-2">
            <div className="flex flex-row gap-2">
              <div>Don't have an account?</div>
              <div>
                <a href="#" className="font-bold text-foudre-pink transition hover:text-deep-forest">
                  Register
                </a>
              </div>
            </div>
            <div className="mt-4 flex cursor-pointer flex-rows items-center justify-center gap-2 text-deep-forest/70 transition hover:text-deep-forest">
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
