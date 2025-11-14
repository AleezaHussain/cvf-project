'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white shadow-lg p-8 rounded-xl w-full max-w-md">
        
        {/* Tabs */}
        <div className="flex mb-6 border-b border-blue-200">
          <button
            onClick={() => setActiveTab("login")}
            className={`w-1/2 py-2 text-center font-semibold ${
              activeTab === "login"
                ? "text-blue-600 border-b-4 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setActiveTab("signup")}
            className={`w-1/2 py-2 text-center font-semibold ${
              activeTab === "signup"
                ? "text-blue-600 border-b-4 border-blue-600"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === "login" && <LoginForm />}

        {/* SIGNUP FORM */}
        {activeTab === "signup" && <SignupForm />}

      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* LOGIN FORM COMPONENT */
/* ------------------------------------------------ */
function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          ...form,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log("Login response:", data);
        setToast({ type: "success", message: "Login successful. Redirecting..." });
        const role = data?.data?.role;
        if (role === "government") {
          router.push("/government-dashboard");
        } else {
          router.push("/user-dashboard");
        }
      } else {
        console.error("Login error:", data);
        setToast({ type: "error", message: data?.error || "Login failed" });
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setToast({ type: "error", message: "Unexpected error during login" });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        disabled={loading}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-black"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        disabled={loading}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-black"
      />

      <button
        type="submit"
        className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

    </form>
  );
}

/* ------------------------------------------------ */
/* SIGNUP FORM COMPONENT */
/* ------------------------------------------------ */
function SignupForm() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "signup",
          ...form,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log("Signup response:", data);
        setToast({ type: "success", message: "Signup successful" });
      } else {
        console.error("Signup error:", data);
        setToast({ type: "error", message: data?.error || "Signup failed" });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setToast({ type: "error", message: "Unexpected error during signup" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* FULL NAME FIELD (Signup Only) */}
      <input
        type="text"
        name="full_name"
        placeholder="Full Name"
        onChange={handleChange}
        disabled={loading}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-black"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        disabled={loading}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-black"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        disabled={loading}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-black"
      />

      <button
        type="submit"
        className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
