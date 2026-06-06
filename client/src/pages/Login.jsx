import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign in to CollabDoc</h1>
        <input className="w-full border p-3 rounded-lg mb-3" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-3 rounded-lg mb-5" type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700">
          Sign In
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">No account? <Link to="/register" className="text-blue-600">Register</Link></p>
      </div>
    </div>
  );
}
