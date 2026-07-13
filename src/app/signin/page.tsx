"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Mail, Lock, AlertCircle, Loader, ChevronRight } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

// Helper function to enforce a timeout on asynchronous operations (like auth calls)
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const { signIn } = useAuthActions();
  const router = useRouter();

  const handleOAuthSignIn = async () => {
    try {
      setError(null);
      setOauthLoading(true);
      await withTimeout(
        signIn("google", { redirectTo: "/dashboard" }),
        15000,
        "Google Sign-In is taking longer than expected. Please verify your connection or try again."
      );
    } catch (err: any) {
      console.error(err);
      setError(
        err.message && err.message.includes("taking longer")
          ? err.message
          : "Google Sign-In failed. If you are running locally, please verify your redirect URIs or use Gmail Credentials below."
      );
    } finally {
      setOauthLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      setError("Please enter a valid Gmail address (ending in @gmail.com).");
      return;
    }

    setLoading(true);

    try {
      await withTimeout(
        signIn("password", { email: email.trim().toLowerCase(), password, flow: "signIn" }),
        15000,
        "Sign-in is taking longer than expected. Please verify your connection or try again."
      );
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("taking longer")) {
        setError(err.message);
      } else if (err.message?.includes("InvalidAccountId") || err.message?.includes("invalid_credentials") || err.message?.includes("Incorrect password")) {
        setError("Invalid Gmail or password. If you do not have an account yet, please create a profile first.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-sand flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-earth-saffron/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-earth-terracotta/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4 relative z-10">
        <Link href="/" className="inline-flex items-center space-x-2 group">
          <Compass className="h-8 w-8 text-earth-terracotta group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-serif text-3xl tracking-widest font-bold text-earth-forest uppercase">
            SafarNama
          </span>
        </Link>
        <h2 className="font-serif text-3xl font-extrabold text-earth-charcoal tracking-tight">
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/85 backdrop-blur-md py-8 px-4 border border-earth-clay/10 sm:px-10 shadow-2xl rounded-2xl transition-all duration-300">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 flex items-start space-x-2 text-sm rounded-xl">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Section */}
          <div className="space-y-4">
            <button
              onClick={handleOAuthSignIn}
              disabled={oauthLoading || loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-earth-clay/20 bg-white hover:bg-earth-sand/30 shadow-sm text-sm font-semibold text-earth-charcoal hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {oauthLoading ? (
                <Loader className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>Continue with Google (OAuth)</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-earth-clay/10"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-earth-clay/40 uppercase tracking-widest">
                Or Use Gmail
              </span>
              <div className="flex-grow border-t border-earth-clay/10"></div>
            </div>
          </div>

          {/* Credentials Sign In Form */}
          <form onSubmit={handleCredentialsSignIn} className="space-y-5 mt-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-earth-charcoal uppercase tracking-wider">
                Gmail Address
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
                  placeholder="username@gmail.com"
                  className="w-full pl-10 p-3 bg-earth-sand/30 border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta focus:bg-white rounded-xl font-light transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-earth-charcoal uppercase tracking-wider">
                Password
              </label>
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
                  className="w-full pl-10 p-3 bg-earth-sand/30 border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta focus:bg-white rounded-xl font-light transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || oauthLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent shadow-lg text-xs font-bold uppercase tracking-widest text-white bg-earth-forest hover:bg-earth-terracotta hover:scale-[1.01] active:scale-[0.99] focus:outline-none transition-all duration-200 cursor-pointer disabled:opacity-50 rounded-xl"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Sign In with Gmail</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
