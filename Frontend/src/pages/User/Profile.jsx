import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  User, Mail, Shield, Edit3, Save, X, UserCircle2,
  Loader2, GraduationCap, BookOpen, Trash2, AlertTriangle
} from "lucide-react";
import BACK_URL from "../../api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const token = localStorage.getItem("token");

  // Fetch profile from backend
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${BACK_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
        setForm({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          role: res.data.user.role || "student",
        });
      })
      .catch((err) => {
        console.error("Error fetching profile:", err.response?.data || err.message);
      });
  }, [token]);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save updates to backend
  const handleSave = () => {
    axios
      .put(`${BACK_URL}/api/auth/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.updatedUser);
        // console.log(res.data.updatedUser)
        setEditMode(false);
      })
      .catch((err) => {
        console.error("Error updating profile:", err.response?.data || err.message);
      });
  };

  // Delete account
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") {
      alert("Please type 'DELETE' to confirm account deletion");
      return;
    }
    axios
      .delete(`${BACK_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        localStorage.removeItem("token");
        alert("Account deleted successfully");
        window.location.href = "/"; // redirect home or login
      })
      .catch((err) => {
        console.error("Error deleting account:", err.response?.data || err.message);
      });
  };

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <UserCircle2 className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">My Profile</h2>
                <p className="text-blue-100 mt-1">Manage your account information</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {editMode ? (
              // Edit Mode Form
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  Edit Information
                </h3>

                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <div className="relative">
                    {form.role === "student" ? (
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    ) : (
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                    </select>
                  </div>
                </div>

                {/* Save/Cancel */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    <Save className="w-5 h-5 inline" /> Save
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5 inline" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div className="space-y-6">
                {/* Info cards */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="text-lg font-semibold">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-semibold">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {user.role === "student" ? (
                      <GraduationCap className="w-6 h-6 text-purple-600" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-lg font-semibold capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg"
                >
                  <Edit3 className="w-5 h-5 inline" /> Edit Profile
                </button>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                  <h4 className="font-semibold text-red-800 mb-2">Danger Zone</h4>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Account</h3>
              <p className="mb-4 text-gray-600">
                This action <strong>cannot be undone</strong>. Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                placeholder="Type DELETE"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE"}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:bg-gray-300"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
