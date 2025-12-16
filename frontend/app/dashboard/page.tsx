"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { OrganizationManager } from "@/components/organization-manager";
import Link from "next/link";
import DashboardNavbar from "@/components/dashboard-navbar";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "organizations">("profile");

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("organizations")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "organizations"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Organizations
              </button>
            </nav>
          </div>

          {activeTab === "profile" ? (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Your account details
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {session.user?.name || "N/A"}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {session.user?.email}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {session.user?.id}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Email Verified
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {session.user?.emailVerified
                          ? new Date(session.user.emailVerified).toLocaleDateString()
                          : "Not verified"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Session Details
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Your current session information
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <p className="text-sm text-gray-600">
                    Session Duration: 7 days
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Your session is secured with Auth.js (NextAuth) and Better Auth backend.
                    The JWT token will automatically expire after 7 days.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <OrganizationManager />
          )}
        </div>
      </main>
    </div>
  );
}
