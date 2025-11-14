'use client';
import { useState } from "react";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        alert("Login successful!");
        console.log("Login response:", data);
      } else {
        alert(`Login failed: ${data.error}`);
        console.error("Login error:", data);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Login
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        alert("Signup successful!");
        console.log("Signup response:", data);
      } else {
        alert(`Signup failed: ${data.error}`);
        console.error("Signup error:", data);
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* FULL NAME FIELD (Signup Only) */}
      <input
        type="text"
        name="full_name"
        placeholder="Full Name"
        onChange={handleChange}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Sign Up
      </button>
    </form>
  );
}
