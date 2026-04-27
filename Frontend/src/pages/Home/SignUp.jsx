import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
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
import "../../../src/index.css";
import { FaHeart } from "react-icons/fa";
import { Home } from "lucide-react";
import { handvoluteer } from "../../assets/Login";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema),
  });

  const mutation = useSignUp();

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-indigo-50 py-16 px-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[420px] bg-gradient-to-b from-purple-100/60 to-transparent blur-3xl md:block"
        aria-hidden="true"
      />
      <div className="relative z-10 grid w-full max-w-6xl items-stretch gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div className="flex flex-col gap-15 rounded-3xl border border-white/60 bg-white/70 p-10 shadow-[0_22px_65px_-40px_rgba(76,29,149,0.55)] backdrop-blur">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-rose-500/10 px-4 py-1 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-100">
              <FaHeart className="h-4 w-4 text-rose-500" />
              VolunteerHub
            </span>
            <h3 className="text-4xl font-semibold leading-snug text-slate-900 sm:text-5xl">
              Make a difference with VolunteerHub
            </h3>
            <p className="max-w-xl text-lg text-slate-600">
              Together we can make volunteering easier and more impactful than
              ever before.
            </p>
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-200">
                  <FiCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">
                    Tailored opportunities
                  </p>
                  <p className="text-sm text-slate-600">
                    Receive matches based on causes you care about most.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-200">
                  <FiCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">
                    Collaborate effortlessly
                  </p>
                  <p className="text-sm text-slate-600">
                    Coordinate volunteers and keep every team aligned in real
                    time.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-200">
                  <FiCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">
                    Track your impact
                  </p>
                  <p className="text-sm text-slate-600">
                    Monitor volunteer hours and celebrate the progress you make
                    together.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/60 shadow-inner">
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <img
                src={handvoluteer}
                alt="Volunteers joining hands"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                  Community first
                </p>
                <p className="mt-2 text-lg font-semibold leading-snug sm:text-xl">
                  12,000+ volunteer hours coordinated through VolunteerHub
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="relative h-full rounded-3xl border border-white/60 bg-white/90 p-8 sm:p-10 shadow-[0_26px_65px_-40px_rgba(76,29,149,0.45)] backdrop-blur">
            <div className="space-y-3 text-center sm:text-left">
              <span className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 ring-1 ring-indigo-200">
                Create account
              </span>

              <p className="text-sm text-slate-500 sm:text-base">
                Manage events, mobilize volunteers, and make an impact faster.
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiUser className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register("username")}
                    type="text"
                    className={`w-full rounded-2xl border bg-white/60 px-3 py-3 pl-11 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 ${
                      errors.username
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500/70 focus:ring-indigo-500"
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && (
                  <p className="text-xs font-medium text-rose-500 sm:text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiUserCheck className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register("name")}
                    type="text"
                    className={`w-full rounded-2xl border bg-white/60 px-3 py-3 pl-11 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500/70 focus:ring-indigo-500"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs font-medium text-rose-500 sm:text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiMail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className={`w-full rounded-2xl border bg-white/60 px-3 py-3 pl-11 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500/70 focus:ring-indigo-500"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-rose-500 sm:text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiLock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className={`w-full rounded-2xl border bg-white/60 px-3 py-3 pl-11 pr-12 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500/70 focus:ring-indigo-500"
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-rose-500 sm:text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiLock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    {...register("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full rounded-2xl border bg-white/60 px-3 py-3 pl-11 pr-12 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                        : "border-slate-200 focus:border-indigo-500/70 focus:ring-indigo-500"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-rose-500 sm:text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  I want to join as
                </label>
                <select
                  {...register("roles")}
                  className={`w-full appearance-none rounded-2xl border bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 ${
                    errors.roles
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-400"
                      : "border-slate-200 focus:border-indigo-500/70 focus:ring-indigo-500"
                  }`}
                >
                  <option value={ROLES.USER}>Volunteer (User)</option>
                  <option value={ROLES.MANAGER}>Organization Manager</option>
                  <option value={ROLES.ADMIN}>Administrator</option>
                </select>
                {errors.roles && (
                  <p className="text-xs font-medium text-rose-500 sm:text-sm">
                    {errors.roles.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  mutation.isPending
                    ? "cursor-not-allowed opacity-70"
                    : "hover:scale-[1.01] hover:shadow-indigo-500/30"
                }`}
              >
                {mutation.isPending ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className="h-5 w-5 animate-spin text-white/90"
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
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-600 shadow-sm">
                  <p>{mutation.error.message}</p>
                </div>
              )}
            </form>
            <div className="mt-8 space-y-3 text-center text-sm text-slate-500 sm:text-left">
              <p className="text-center">
                Already have an account?{" "}
                <Link
                  to="http://localhost:7070/login"
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Sign in here
                </Link>
              </p>
              <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                <span className="hidden text-xs uppercase tracking-[0.35em] text-slate-400 sm:block">
                  Explore first
                </span>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
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
