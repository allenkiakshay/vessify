"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface OrganizationSelectorProps {
  onOrganizationChange?: (org: Organization | null) => void;
}

export function OrganizationSelector({ onOrganizationChange }: OrganizationSelectorProps) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      loadOrganizations();
    }
  }, [session]);

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/organizations/my-organizations', {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Loaded organizations:", data); // Debug log
        setOrganizations(data);
        
        // Set first org as default if available
        if (data.length > 0 && !currentOrg) {
          setCurrentOrg(data[0]);
          onOrganizationChange?.(data[0]);
        }
      } else {
        const errorText = await res.text();
        console.error("Failed to load organizations:", res.status, errorText);
        setError(`Failed to load organizations: ${res.statusText}`);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
      setError("Failed to load organizations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (orgId: string) => {
    const selectedOrg = organizations.find(org => org.id === orgId) || null;
    setCurrentOrg(selectedOrg);
    onOrganizationChange?.(selectedOrg);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm text-blue-700">Loading organizations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
        <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="text-sm text-red-700">{error}</span>
        <button
          onClick={loadOrganizations}
          className="ml-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm text-yellow-700">No organizations found. Please create one first.</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <select
        id="org-selector"
        value={currentOrg?.id || ""}
        onChange={(e) => handleOrgChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
      >
        <option value="">Select Organization</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name} ({org.role})
          </option>
        ))}
      </select>
      {currentOrg && (
        <p className="mt-2 text-xs text-gray-500">
          Currently selected: <span className="font-medium">{currentOrg.name}</span>
        </p>
      )}
    </div>
  );
}
