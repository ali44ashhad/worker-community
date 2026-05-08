import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { getApiBase } from "../utils/apiBase";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const API_URL = useMemo(() => getApiBase() || "http://localhost:3001", []);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password should be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const rawText = await res.text();
      const data = rawText ? (() => { try { return JSON.parse(rawText); } catch { return null; } })() : null;
      if (!res.ok) {
        throw new Error(data?.message || `Failed (${res.status}).`);
      }
      toast.success(data?.message || "Password reset successfully. Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex mt-20 items-center justify-center p-6 bg-gray-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Set a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          <input
            type={show ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-all duration-300 shadow-lg"
          >
            {loading ? "Please wait..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

