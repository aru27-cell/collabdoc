import { useState } from 'react';
import API from '../api/axios';

export default function ShareModal({ docId, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const shareRes = await API.post(`/docs/${docId}/share`, { email, role });
      setMessage(shareRes.data.message);
      setIsError(false);
      setEmail('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Share failed');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">
          Share Document
        </h2>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>
      </div>

      {/* Email input */}
      <label className="block text-sm text-gray-600 mb-1">
        Email address
      </label>

      <input
        className="w-full border border-gray-200 p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="friend@example.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Role selector */}
      <label className="block text-sm text-gray-600 mb-1">
        Permission
      </label>

      <select
        className="w-full border border-gray-200 p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="editor">
          Editor — can read and write
        </option>
        <option value="viewer">
          Viewer — can only read
        </option>
      </select>

      {/* Result message */}
      {message && (
        <div
          className={`text-sm p-3 rounded-lg mb-4 ${
            isError
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 p-3 rounded-xl text-sm hover:bg-gray-50 transition"
        >
          Close
        </button>

        <button
          onClick={handleShare}
          disabled={loading || !email.trim()}
          className="flex-1 bg-blue-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {loading ? "Sharing..." : "Share"}
        </button>
      </div>

    </div>
  </div>
);
}