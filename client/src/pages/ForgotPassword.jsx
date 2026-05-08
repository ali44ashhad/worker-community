import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getApiBase } from "../utils/apiBase";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const API_URL = useMemo(() => getApiBase() || "http://localhost:3001", []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const rawText = await res.text();
      const data = rawText
        ? (() => {
            try {
              return JSON.parse(rawText);
            } catch {
              return null;
            }
          })()
        : null;

      if (!res.ok) {
        throw new Error(data?.message || `Failed (${res.status}).`);
      }

      toast.success(
        data?.message || "If this email exists, we have sent a password reset link."
      );
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex mt-20 items-center justify-center p-6 bg-gray-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter your registered email. We’ll send a reset link if it exists.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder:text-gray-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-all duration-300 shadow-lg"
          >
            {loading ? "Please wait..." : "Send reset link"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

