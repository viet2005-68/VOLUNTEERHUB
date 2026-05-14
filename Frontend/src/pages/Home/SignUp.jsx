import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import { LOGIN_LINK } from "../../constant/constNavigate";
import {
  FiCheck,
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiUserCheck,
} from "react-icons/fi";
import signUpSchema from "../../validation/signUpSchema";
import useSignUp from "../../hook/useSignUp";
import { ROLES } from "../../constant/role";
import DropdownSelect from "../../components/Dropdown/DropdownSelect";
import "../../../src/index.css";
import { FaHeart } from "react-icons/fa";
import { Home } from "lucide-react";
import { handvoluteer } from "../../assets/Login";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputBase =
    "w-full rounded-[10px] border-2 bg-pale-canvas py-4 text-sm font-bold leading-[0.85] text-deep-forest outline-none transition placeholder:text-deep-forest/50 focus:border-foudre-pink focus:bg-pale-canvas focus:ring-4 focus:ring-foudre-pink/20";
  const textInputPadding = "pl-14 pr-4";
  const passwordInputPadding = "pl-14 pr-14";
  const invalidInput =
    "border-foudre-pink bg-pale-canvas focus:border-foudre-pink focus:ring-foudre-pink/25";
  const validInput = "border-ash-whisper";
  const labelClass = "text-sm font-bold text-deep-forest";
  const iconClass = "h-5 w-5 text-foudre-pink";
  const roleOptions = [
    { value: ROLES.USER, label: "Volunteer (User)" },
    { value: ROLES.MANAGER, label: "Organization Manager" },
    { value: ROLES.ADMIN, label: "Administrator" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      roles: ROLES.USER,
    },
  });

  const mutation = useSignUp();
  const selectedRole = watch("roles");

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <section className="min-h-screen bg-pale-canvas px-4 py-10 font-clash-grotesk text-deep-forest sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex overflow-hidden rounded-[25px] bg-deep-forest p-7 text-pale-canvas sm:p-8 lg:p-9">
          <div className="relative z-10 flex min-h-full w-full flex-col gap-7">
            <div className="space-y-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-[10px] bg-foudre-pink px-3 py-2 text-sm font-bold text-pale-canvas">
                <FaHeart className="h-4 w-4" />
                VolunteerHub
              </span>
              <div>
                <p className="mb-3 text-xl font-bold leading-[1.2] text-bubblegum-blush sm:text-2xl">
                  Community first. Action always.
                </p>
                <h1 className="max-w-[720px] font-beni text-[74px] uppercase leading-[0.7] text-foudre-pink sm:text-[104px] lg:text-[118px]">
                  Join the volunteer movement
                </h1>
              </div>
              <p className="max-w-2xl text-lg font-medium leading-[1.2] text-pale-canvas/80 sm:text-xl">
                Create your profile, discover causes that fit you, and help
                teams organize impact with a cleaner VolunteerHub experience.
              </p>
            </div>

            <div className="grid gap-4 border-y border-pale-canvas/20 py-5 sm:grid-cols-3">
              {[
                ["Tailored", "Find opportunities by cause, time, and role."],
                ["Collaborative", "Coordinate with organizations in one hub."],
                ["Measurable", "Track hours, badges, and real community impact."],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="grid grid-cols-[36px_1fr] gap-3 text-pale-canvas"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-bubblegum-blush text-deep-forest">
                    <FiCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-[0.85]">{title}</p>
                    <p className="mt-3 text-sm font-medium leading-[1.2] text-pale-canvas/70">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative hidden min-h-[280px] flex-1 overflow-hidden rounded-[20px] lg:block">
              <img
                src={handvoluteer}
                alt="Volunteers joining hands"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-5 left-5 rounded-[10px] bg-foudre-pink px-4 py-3 text-pale-canvas">
                <p className="text-sm font-bold leading-[0.85]">
                  12,000+ volunteer hours
                </p>
                <p className="mt-2 text-xs font-medium leading-[1.2]">
                  Coordinated through VolunteerHub
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative h-full rounded-[20px] border border-deep-forest/10 bg-ash-whisper p-6 sm:p-8 lg:p-10">
            <div className="space-y-4 text-center sm:text-left">
              <span className="inline-flex items-center justify-center rounded-[10px] bg-foudre-pink px-3 py-2 text-sm font-bold uppercase text-pale-canvas">
                Create account
              </span>
              <h2 className="font-beni text-[64px] uppercase leading-[0.7] text-deep-forest sm:text-[82px]">
                Start here
              </h2>
              <p className="text-base font-medium leading-[1.2] text-deep-forest/70">
                Manage events, mobilize volunteers, and make an impact faster.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className={labelClass}>Username</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiUser className={iconClass} />
                  </div>
                  <input
                    {...register("username")}
                    type="text"
                    className={`${inputBase} ${textInputPadding} ${
                      errors.username ? invalidInput : validInput
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <p className="text-sm font-bold text-foudre-pink">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiUserCheck className={iconClass} />
                  </div>
                  <input
                    {...register("name")}
                    type="text"
                    className={`${inputBase} ${textInputPadding} ${
                      errors.name ? invalidInput : validInput
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm font-bold text-foudre-pink">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiMail className={iconClass} />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className={`${inputBase} ${textInputPadding} ${
                      errors.email ? invalidInput : validInput
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm font-bold text-foudre-pink">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiLock className={iconClass} />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className={`${inputBase} ${passwordInputPadding} ${
                      errors.password ? invalidInput : validInput
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center rounded-full px-4 text-deep-forest/50 transition hover:text-foudre-pink"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm font-bold text-foudre-pink">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiLock className={iconClass} />
                  </div>
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${inputBase} ${passwordInputPadding} ${
                      errors.confirmPassword ? invalidInput : validInput
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex items-center rounded-full px-4 text-deep-forest/50 transition hover:text-foudre-pink"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm font-bold text-foudre-pink">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className={labelClass}>I want to join as</label>
                <input type="hidden" {...register("roles")} />
                <DropdownSelect
                  value={selectedRole}
                  onChange={(value) =>
                    setValue("roles", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  options={roleOptions}
                  className="w-full [&>button]:border-foudre-pink [&>button]:bg-pale-canvas [&>button]:text-deep-forest [&>button:hover]:bg-pale-canvas [&>ul]:border-foudre-pink [&>ul]:bg-pale-canvas [&>ul]:text-deep-forest [&>ul>li]:bg-pale-canvas [&>ul>li]:text-deep-forest [&>ul>li:hover]:bg-bubblegum-blush [&>ul>li:hover]:text-deep-forest [&>ul>li:first-child]:bg-ash-whisper [&>ul>li:first-child]:text-foudre-pink"
                  placeholder="Select role"
                />
                {errors.roles && (
                  <p className="text-sm font-bold text-foudre-pink">
                    {errors.roles.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className={`w-full rounded-[10px] bg-foudre-pink px-6 py-5 text-base font-bold text-pale-canvas transition focus:outline-none focus:ring-4 focus:ring-foudre-pink/25 focus:ring-offset-2 focus:ring-offset-ash-whisper ${
                  mutation.isPending
                    ? "cursor-not-allowed opacity-70"
                    : "hover:bg-deep-forest"
                }`}
              >
                {mutation.isPending ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className="h-5 w-5 animate-spin text-pale-canvas"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-30"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating your account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>

              {mutation.isError && (
                <div className="rounded-2xl border border-foudre-pink/30 bg-pale-canvas p-4 text-sm font-bold leading-[1.2] text-foudre-pink">
                  <p>{mutation.error.message}</p>
                </div>
              )}
            </form>
            <div className="mt-8 space-y-5 text-center text-sm font-medium text-deep-forest/70 sm:text-left">
              <p className="text-center leading-[1.2]">
                Already have an account?{" "}
                <a
                  href={LOGIN_LINK}
                  className="font-bold text-foudre-pink transition hover:text-deep-forest"
                >
                  Sign in here
                </a>
              </p>
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <span className="hidden text-xs font-bold uppercase text-deep-forest/50 sm:block">
                  Explore first
                </span>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-pale-canvas px-4 py-3 text-sm font-bold text-deep-forest transition hover:bg-bubblegum-blush"
                >
                  <Home className="h-4 w-4" />
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
