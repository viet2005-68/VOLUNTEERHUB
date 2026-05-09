import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaHeart } from "react-icons/fa6";
import { bannerlogin } from "../../assets/Login/index";
import { useState } from "react";
import FormLogin from "./FormLogin";
import FormRegister from "./FormRegister";
function Login() {
  const [status, setIsLogin] = useState("login");

  const getStatus = () => {
    if (status === "login") {
      return <FormLogin />;
    } else {
      return <FormRegister />;
    }
  };
  return (
    <div className="bg-linear-to-br from-pink-100 via-white to-amber-50 flex flex-row items-center justify-center min-h-dvh max-md:flex-col relative">
      <div className="flex flex-row items-end justify-center gap-auto max-md:flex-col w-[100%] max-w-5xl max-md:items-center max-md:w-full min-w-[80%] mx-5">
        <div className="flex flex-col items-center justify-center gap-6 flex-2 p-6">
          <FaHeart className="text-red-300 min-h-20 text-7xl max-md:4xl animate-bounce" />
          <div className="text-center text-2xl font-serif flex flex-col justify-center max-md:text-xl gap-3">
            <p>Wellcome to VolunteerHub</p>
            <p>Connecting Hearts - Spreading Kindness</p>
          </div>
          <div className="w-full max-w-[700px] overflow-hidden rounded-2xl max-md:hidden">
            <img
              src={bannerlogin}
              alt="voluteer teams"
              className="rounded-2xl object-cover w-full h-auto"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center flex-1 p-8  w-full bg-white/70 backdrop-blur-md rounded-3xl shadow-lg max-md:bg-white/30 max-md:backdrop-blur-xl max-md:shadow-sm max-md:border max-md:border-white/30">
          {getStatus()}
        </div>
      </div>
    </div>
  );
}

export default Login;
