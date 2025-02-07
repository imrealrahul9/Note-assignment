import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/login", form);

      localStorage.setItem("user", JSON.stringify({ name: res.data.name }));
      localStorage.setItem("token", res.data.token);
      setUser({ name: res.data.name });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-700">Login</h2>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
            Login
          </button>
        </form>
        <p className="text-sm text-center mt-3">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
