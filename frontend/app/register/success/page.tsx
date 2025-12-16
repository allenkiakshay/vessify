"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="w-full flex items-center justify-center p-8 sm:p-12">
        <div className="max-w-md w-full space-y-8">
          {/* Success Icon */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Registration Successful! 🎉
            </h1>
            
            <p className="text-lg text-gray-600 mb-4">
              Your account has been created successfully.
              {email && (
                <span className="block mt-2 font-medium text-gray-800">
                  {email}
                </span>
              )}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Check Your Email</h3>
                  <p className="text-sm text-blue-800">
                    We've sent a verification email to your inbox. Please verify your email address to activate all features of your account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Details */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Account Created</h3>
                <p className="text-sm text-gray-600">Your credentials have been securely saved</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Authentication</h3>
                <p className="text-sm text-gray-600">7-day session with JWT token security</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Ready to Use</h3>
                <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In Now
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/"
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Additional Info */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Visit our{" "}
              <a href="#" className="text-green-600 hover:text-green-500 font-medium">
                support center
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
