"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function OrganizationManager() {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
  });

  useEffect(() => {
    if (session?.user) {
      loadOrganizations();
    }
  }, [session]);

  const loadOrganizations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/proxy/organizations/my-organizations`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const data = await res.json();
        setOrganizations(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to load organizations");
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
      setError("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (orgId: string) => {
    try {
      const res = await fetch(
        `/api/proxy/organizations/${orgId}/members`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to load members:", error);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/proxy/organizations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        setSuccess("Organization created successfully!");
        setShowCreateModal(false);
        setFormData({ name: "", slug: "", description: "", logo: "" });
        await loadOrganizations();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to create organization");
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
      setError("Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/proxy/organizations/${selectedOrg.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        setSuccess("Organization updated successfully!");
        setShowEditModal(false);
        setSelectedOrg(null);
        setFormData({ name: "", slug: "", description: "", logo: "" });
        await loadOrganizations();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to update organization");
      }
    } catch (error) {
      console.error("Failed to update organization:", error);
      setError("Failed to update organization");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/proxy/organizations/${selectedOrg.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.ok) {
        setSuccess("Organization deleted successfully!");
        setShowDeleteModal(false);
        setSelectedOrg(null);
        await loadOrganizations();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to delete organization");
      }
    } catch (error) {
      console.error("Failed to delete organization:", error);
      setError("Failed to delete organization");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", slug: "", description: "", logo: "" });
    setError("");
    setSuccess("");
    setShowCreateModal(true);
  };

  const openEditModal = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      description: org.description || "",
      logo: org.logo || "",
    });
    setError("");
    setSuccess("");
    setShowEditModal(true);
  };

  const openDeleteModal = (org: Organization) => {
    setSelectedOrg(org);
    setError("");
    setSuccess("");
    setShowDeleteModal(true);
  };

  const openDetailsModal = async (org: Organization) => {
    setSelectedOrg(org);
    setError("");
    setSuccess("");
    setShowDetailsModal(true);
    await loadMembers(org.id);
  };

  const canEditOrDelete = (org: Organization) => {
    return org.role === "owner" || org.role === "admin";
  };

  const canDelete = (org: Organization) => {
    return org.role === "owner";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your organizations and teams
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Organization
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError("")}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-red-500">&times;</span>
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-green-500">&times;</span>
          </button>
        </div>
      )}

      {/* Organizations List */}
      {loading && organizations.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading organizations...</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No organizations
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new organization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {org.logo && (
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="h-12 w-12 rounded-lg mb-3 object-cover"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {org.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">@{org.slug}</p>
                  {org.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {org.description}
                    </p>
                  )}
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {org.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openDetailsModal(org)}
                  className="flex-1 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Details
                </button>
                {canEditOrDelete(org) && (
                  <button
                    onClick={() => openEditModal(org)}
                    className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Edit
                  </button>
                )}
                {canDelete(org) && (
                  <button
                    onClick={() => openDeleteModal(org)}
                    className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Create Organization
              </h3>
              <form onSubmit={handleCreateOrg}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="organization-slug"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly identifier
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) =>
                        setFormData({ ...formData, logo: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditModal && selectedOrg && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Edit Organization
              </h3>
              <form onSubmit={handleUpdateOrg}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={formData.logo}
                      onChange={(e) =>
                        setFormData({ ...formData, logo: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrg && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4 text-center">
                Delete Organization
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 text-center">
                  Are you sure you want to delete <strong>{selectedOrg.name}</strong>?
                  This action cannot be undone and all data will be permanently
                  removed.
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleDeleteOrg}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Details Modal */}
      {showDetailsModal && selectedOrg && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-2xl max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {selectedOrg.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">@{selectedOrg.slug}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedOrg.logo && (
                <img
                  src={selectedOrg.logo}
                  alt={selectedOrg.name}
                  className="h-16 w-16 rounded-lg mb-4 object-cover"
                />
              )}

              {selectedOrg.description && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{selectedOrg.description}</p>
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Your Role</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {selectedOrg.role}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Members ({members.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">{member.user.email}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
