import React from "react";
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
    <div className="relative flex min-h-dvh flex-row items-center justify-center bg-pale-canvas text-deep-forest max-md:flex-col">
      <div className="flex flex-row items-end justify-center gap-auto max-md:flex-col w-[100%] max-w-5xl max-md:items-center max-md:w-full min-w-[80%] mx-5">
        <div className="flex flex-col items-center justify-center gap-6 flex-2 p-6">
          <FaHeart className="min-h-20 animate-bounce text-7xl text-foudre-pink max-md:4xl" />
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
        <div className="flex w-full flex-1 flex-col items-center justify-center rounded-[20px] border border-deep-forest/10 bg-ash-whisper p-8 shadow-lg backdrop-blur-md max-md:border-ash-whisper max-md:bg-ash-whisper/80 max-md:shadow-sm max-md:backdrop-blur-xl">
          {getStatus()}
        </div>
      </div>
    </div>
  );
}

export default Login;
