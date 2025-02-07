import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-gray-100 shadow-md p-4 flex justify-between items-center rounded-lg">
      <h1 className="text-xl font-bold text-red-700">
        { user?.name ? `${user.name}` : "Notes"}
      </h1>
      <h1 className="text-xl font-bold text-gray-700">
        Notes
      </h1>

      <div className="flex gap-4">
        {location.pathname === "/" ? (
          <Link to="/favorites" className="text-blue-500 hover:underline">
            Favorites
          </Link>
        ) : (
          <Link to="/" className="text-blue-500 hover:underline">
            Home
          </Link>
        )}
        <button onClick={handleLogout} className="text-red-500 hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
}
