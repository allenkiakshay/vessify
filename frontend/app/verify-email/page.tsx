"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not configured');
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email?token=${token}`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.message || "Email verification failed. The link may be invalid or expired.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while verifying your email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full flex items-center justify-center p-8 sm:p-12">
        <div className="max-w-md w-full space-y-8">
          {status === "loading" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
                <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Verifying Your Email...
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg animate-bounce">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Email Verified! ✅
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                {message}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-left">
                      <h3 className="font-semibold text-green-900">Account Activated</h3>
                      <p className="text-sm text-green-800">All features are now available</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Redirecting to login page in 3 seconds...
                </p>
                
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In Now
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Verification Failed
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                {message}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="text-left space-y-2">
                  <h3 className="font-semibold text-red-900">Common Issues:</h3>
                  <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                    <li>The verification link may have expired (24 hours)</li>
                    <li>The link may have already been used</li>
                    <li>The link may be incomplete or corrupted</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/register"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Try Registering Again
                </Link>

                <Link
                  href="/login"
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <div className="w-full flex items-center justify-center p-8 sm:p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
