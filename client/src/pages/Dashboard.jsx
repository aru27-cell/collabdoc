import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocs();
  }, []);
// GET all documents — owned and shared
  const fetchDocs = async () => {
    try {
      const docsRes = await API.get('/docs');  // different name: docsRes
      setOwnedDocs(docsRes.data.owned);
      setSharedDocs(docsRes.data.shared);
    } catch (err) {
      console.error('Failed to fetch docs', err);
    } finally {
      setLoading(false);
    }
  };
// DELETE a document
  const deleteDoc = async (id, e) => {
    e.stopPropagation(); // prevent opening doc when clicking delete
    if (!window.confirm('Delete this document?')) return;
    try {
      await API.delete(`/docs/${id}`);
      setOwnedDocs(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };
// LOGOUT
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Reusable doc card component
  const DocCard = ({ doc, showDelete }) => (
    <div
      onClick={() => navigate(`/document/${doc._id}`)}
      className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition group relative"
    >
      {/* Document icon */}
      <div className="w-10 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
        <span className="text-blue-500 text-xl">📄</span>
      </div>
      {/* Title */}
      <p className="font-medium text-gray-800 truncate mb-1">{doc.title}</p>

      {/* Last edited date */}
      <p className="text-xs text-gray-400">
        Edited {new Date(doc.updatedAt).toLocaleDateString()}
      </p>

      {/* Delete button — only for owned docs */}
      {showDelete && (
        <button
          onClick={(e) => deleteDoc(doc._id, e)}
          className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-lg"
        >
          ✕
        </button>
      )}
    </div>
  );
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top navbar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">CollabDoc</h1>
        <div className="flex items-center gap-4">
          {/* User avatar circle */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: user?.color || '#3B82F6' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-8">
        {/* My Documents section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">My Documents</h2>
          <button
            onClick={createDoc}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            + New Document
          </button>
        </div>

        {ownedDocs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p>No documents yet. Click + New Document to start.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {ownedDocs.map(doc => (
              <DocCard key={doc._id} doc={doc} showDelete={true} />
            ))}
          </div>
        )}

        {/* Shared with me section */}
        {sharedDocs.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Shared with me</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sharedDocs.map(doc => (
                <DocCard key={doc._id} doc={doc} showDelete={false} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
