import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import axios from "axios";

export default function App() {
  const [user, setUser] = useState(() => {
    // ✅ Load user from localStorage on refresh
    const storedUser = localStorage.getItem("user");
    return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  });

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // ✅ Fetch Notes from MongoDB
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:8080/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  return (
    <Router>
      <div className="app">
      {user && <Navbar user={user} setUser={setUser} />}
        <Routes>
          <Route path="/" element={user ? <Home notes={notes} setNotes={setNotes} /> : <Navigate to="/login" />} />
          <Route path="/favorites" element={user ? <Favorites notes={notes} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}
