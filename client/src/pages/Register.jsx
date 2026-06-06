import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Register failed');
    }
  };

return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Create Account</h1>
        <input className="w-full border p-3 rounded-lg mb-3" placeholder="Full Name"
          value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full border p-3 rounded-lg mb-3" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full border p-3 rounded-lg mb-5" type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleRegister} className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700">
          Create Account
        </button>
        <p className="text-center mt-4 text-sm text-gray-600">Have account? <Link to="/" className="text-blue-600">Login</Link></p>
      </div>
    </div>
  );
}
