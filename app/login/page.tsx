"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Contact,
  Sparkles,
} from "lucide-react";
import { forgotPasswordApi, loginApi, saveAuthSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fillDemoCredentials = (empId: string, pass: string) => {
    setEmployeeId(empId);
    setPassword(pass);
    setErrorMessage(null);
  };

  const handleForgotPassword = async () => {
    if (!employeeId.trim()) {
      setErrorMessage("Enter your Employee ID to request a password reset.");
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await forgotPasswordApi({ employeeId: employeeId.trim() });
      setSuccessMessage(response.message);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not process password reset."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setErrorMessage("Please enter your Employee ID");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your password");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await loginApi(employeeId.trim(), password);
      saveAuthSession(response.token, response.user);
      router.push("/");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans">
      {/* Left Column: Prominent Visual Brand Hero (50% on desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 overflow-hidden">
        {/* Pharmacy Interior Background Image - Prominent & Clearly Visible */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-100 transition-transform duration-700"
          style={{
            backgroundImage: "url('/pharmacy-interior.jpg')",
            backgroundPosition: "center 35%",
          }}
          role="img"
          aria-label="Modern clinical pharmacy interior with medicine shelves and reception"
        />

        {/* Tailored Medical Teal / Deep Blue Gradient Tint for Text Legibility & Visual Clarity */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00344d]/90 via-[#004766]/75 to-[#002233]/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-950/25" />

        {/* Top Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="h-21 w-21 rounded-xl bg-white p-1 shadow-lg border border-white/30 flex items-center justify-center shrink-0">
            <img
              src="/logo.jpg"
              alt="Gammo Pharmacy Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-xl font-bold text-white tracking-tight drop-shadow-xs">
            Gammo Pharmacy
          </span>
        </div>

        {/* Middle Value Proposition Headline */}
        <div className="relative z-10 max-w-lg space-y-4 my-auto py-12">
          <h1 className="text-4xl xl:text-[46px] font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-sm">
            Pharmacy Management <br />
            System
          </h1>
          <p className="text-base xl:text-lg text-sky-100/95 font-normal leading-relaxed max-w-md drop-shadow-xs">
            Securely manage your pharmacy operations, inventory, and daily sales.
          </p>
        </div>

        {/* Bottom Security Trust Badge */}
        <div className="relative z-10 flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-sky-200/95 drop-shadow-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>SECURE • RELIABLE • BUILT FOR PHARMACY OPERATIONS</span>
        </div>
      </div>

      {/* Right Column: Clean Authentication Form (50% on desktop, 100% on mobile) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile Header Branding */}
          <div className="flex lg:hidden items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="Gammo Pharmacy Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                Gammo Pharmacy
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Clinical Management</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Sign in to your pharmacy workspace
            </p>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="p-3.5 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Demo Accounts (Click to Autofill):</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoCredentials("EMP-001", "Pharmacy@123")}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 rounded-lg hover:bg-sky-100 dark:hover:bg-slate-700 font-medium transition-colors cursor-pointer"
              >
                🔑 Admin: <span className="font-mono">EMP-001</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials("EMP-002", "Pharmacy@123")}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 rounded-lg hover:bg-sky-100 dark:hover:bg-slate-700 font-medium transition-colors cursor-pointer"
              >
                💊 Pharmacist: <span className="font-mono">EMP-002</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium animate-in fade-in duration-200">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl font-medium animate-in fade-in duration-200">
              {successMessage}
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="employeeId"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Employee ID
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Contact className="h-4 w-4" />
                </div>
                <input
                  id="employeeId"
                  type="text"
                  required
                  placeholder="Enter your employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-2xs focus:bg-white dark:focus:bg-slate-800 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 py-3 pl-10 pr-11 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-2xs focus:bg-white dark:focus:bg-slate-800 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs font-medium pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#006699] focus:ring-sky-500 accent-[#006699]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#006699] dark:text-sky-400 hover:text-[#004e71] dark:hover:text-sky-300 font-semibold hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#005f59] hover:bg-[#004c47] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Notice */}
          <div className="pt-2 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Your account and pharmacy data are protected.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
