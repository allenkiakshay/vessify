"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">Vessify</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A secure multi-tenant platform with authentication powered by Auth.js and Better Auth.
            Get started by creating an account or signing in.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Sign In
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔒 Secure Authentication
              </h3>
              <p className="text-gray-600">
                Email & password authentication with bcrypt hashing and 7-day session management
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                👥 Multi-Tenancy
              </h3>
              <p className="text-gray-600">
                Organization-based user isolation with role-based access control
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ⚡ Better Auth
              </h3>
              <p className="text-gray-600">
                Modern authentication library with built-in security best practices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

