import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import ShareModal from '../components/ShareModal';

export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shareDocId, setShareDocId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { fetchDocs(); }, []);

  // Safe fetch — handles both old and new API response shapes
  const fetchDocs = async () => {
    try {
      const docsRes = await API.get('/docs');
      const data = docsRes.data;

      // Safe check — works whether API returns array or { owned, shared }
      if (Array.isArray(data)) {
        // Old format — just an array
        setOwnedDocs(data);
        setSharedDocs([]);
      } else {
        // New format — { owned: [], shared: [] }
        setOwnedDocs(data.owned || []);
        setSharedDocs(data.shared || []);
      }
    } catch (err) {
      console.error('fetchDocs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDoc = async () => {
    try {
      const newDoc = await API.post('/docs', {});
      navigate(`/document/${newDoc.data._id}`);
    } catch (err) { console.error(err); }
  };
const deleteDoc = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    try {
      await API.delete(`/docs/${id}`);
      setOwnedDocs(prev => prev.filter(d => d._id !== id));
    } catch (err) { console.error(err); }
  };

  const startRename = (doc, e) => {
    e.stopPropagation();
    setRenamingId(doc._id);
    setRenameValue(doc.title);
  };
  const submitRename = async (id) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    try {
      const renamed = await API.patch(`/docs/${id}/rename`, { title: renameValue });
      setOwnedDocs(prev =>
        prev.map(d => d._id === id ? { ...d, title: renamed.data.title } : d)
      );
    } catch (err) { console.error(err); }
    finally { setRenamingId(null); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // Filter docs by search
  const filtered = ownedDocs.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase())
  );
  // Skeleton loading card
  const Skeleton = () => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
      <div className="w-10 h-12 bg-gray-100 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-100 rounded mb-2 w-3/4"></div>
      <div className="h-3 bg-gray-50 rounded w-1/2"></div>
    </div>
  );

  // Single doc card
  const DocCard = ({ doc, isOwned }) => (
    <div
      onClick={() => navigate(`/document/${doc._id}`)}
      className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer hover:shadow-md transition group relative"
    >
      <div className="w-10 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
        <span className="text-blue-500 text-xl">📄</span>
      </div>

      {renamingId === doc._id ? (
        <input
          autoFocus
          className="w-full border-b border-blue-400 text-sm font-medium outline-none pb-1 mb-1"
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={() => submitRename(doc._id)}
          onKeyDown={e => e.key === 'Enter' && submitRename(doc._id)}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <p className="font-medium text-gray-800 truncate mb-1 text-sm">
          {doc.title || 'Untitled Document'}
        </p>
      )}

      <p className="text-xs text-gray-400">
        {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ''}
      </p>
      {isOwned && (
        <div className="absolute top-3 right-3 gap-1 hidden group-hover:flex">
          <button onClick={e => startRename(doc, e)}
            className="text-gray-300 hover:text-blue-500 text-sm px-1">✏️</button>
          <button onClick={e => { e.stopPropagation(); setShareDocId(doc._id); }}
            className="text-gray-300 hover:text-green-500 text-sm px-1">🔗</button>
          <button onClick={e => deleteDoc(doc._id, e)}
            className="text-gray-300 hover:text-red-500 text-sm px-1">✕</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="font-semibold text-gray-800 text-lg">CollabDoc</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: user?.color || '#3B82F6' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-500 hidden sm:block">{user?.name}</span>
          <button onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-600 transition">Logout</button>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto p-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">My Documents</h2>
            <p className="text-sm text-gray-400 mt-1">{ownedDocs.length} document{ownedDocs.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
                          className="border border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:w-56"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button onClick={createDoc}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              + New
            </button>
          </div>
        </div>

{loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📄</p>
            <p className="text-gray-500 text-lg font-medium">
              {search ? 'No documents match your search' : 'No documents yet'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {!search && 'Click + New to create your first document'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {filtered.map(doc => (
              <DocCard key={doc._id} doc={doc} isOwned={true} />
            ))}
          </div>
)}

        {sharedDocs.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-4 mt-6">Shared with me</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sharedDocs.map(doc => (
                <DocCard key={doc._id} doc={doc} isOwned={false} />
              ))}
            </div>
          </>
        )}
      </div>

      {shareDocId && (
        <ShareModal docId={shareDocId} onClose={() => setShareDocId(null)} />
      )}
    </div>
  );
}

