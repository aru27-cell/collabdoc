
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', { name, email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">CollabDoc</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}
<input
          className="w-full border border-gray-200 p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Full name"
          value={name} onChange={e => setName(e.target.value)} />

        <input
          className="w-full border border-gray-200 p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email address" type="email"
          value={email} onChange={e => setEmail(e.target.value)} />

        <input
          className="w-full border border-gray-200 p-3 rounded-xl mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password (min 6 chars)" type="password"
          value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleRegister} disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-60 transition">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-center mt-5 text-sm text-gray-500">
          Already have account? <Link to="/" className="text-blue-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

