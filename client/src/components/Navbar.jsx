import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title = 'CollabDoc' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-50">

      {/* Left — logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">C</span>
        </div>
        <span className="font-semibold text-gray-800 text-lg">{title}</span>
      </div>

      {/* Right — user info + logout */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>

        {/* Avatar circle with user's color */}
        <div
           className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer"
          style={{ backgroundColor: user?.color || '#3B82F6' }}
          title={user?.name}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-500 transition font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
