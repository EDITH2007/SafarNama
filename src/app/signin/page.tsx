"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Mail, Lock, AlertCircle, Loader } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthActions();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn("password", { email, password, flow: "signIn" });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-sand flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/" className="inline-flex items-center space-x-2">
          <Compass className="h-8 w-8 text-earth-terracotta animate-spin-slow" />
          <span className="font-serif text-3xl tracking-widest font-bold text-earth-forest uppercase">
            SafarNama
          </span>
        </Link>
        <h2 className="font-serif text-3xl font-extrabold text-earth-charcoal">
          Sign in to your account
        </h2>
        <p className="text-sm text-earth-charcoal/60 font-light">
          Or{" "}
          <Link
            href="/signup"
            className="font-semibold text-earth-terracotta hover:underline"
          >
            create a new community profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-earth-clay/10 sm:px-10 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-earth-charcoal uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-earth-clay/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 p-3 bg-earth-sand/30 border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta rounded-none font-light"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-earth-charcoal uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-earth-clay/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 p-3 bg-earth-sand/30 border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta rounded-none font-light"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-bold uppercase tracking-widest text-white bg-earth-forest hover:bg-earth-terracotta focus:outline-none transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Optional Google Auth section */}
          <div className="mt-8">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-earth-clay/10"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-earth-clay/40 uppercase tracking-widest">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-earth-clay/10"></div>
            </div>

            <div className="mt-4">
              <button
                onClick={async () => {
                  try {
                    setError(null);
                    await signIn("google");
                  } catch (err: any) {
                    setError(
                      "Google login failed. Please ensure Google Credentials are set up in your Convex Dashboard."
                    );
                  }
                }}
                className="w-full flex items-center justify-center py-3 px-4 border border-earth-clay/20 bg-earth-sand/20 text-sm font-medium text-earth-charcoal hover:bg-earth-sand/50 transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.437 0-3.555 2.882-6.437 6.437-6.437 1.483 0 2.846.504 3.937 1.346l3.144-3.144C19.162 2.203 15.937 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.207 0 11.24-5.033 11.24-11.24 0-.648-.065-1.285-.195-1.955H12.24z"
                  />
                </svg>
                <span>Google Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
