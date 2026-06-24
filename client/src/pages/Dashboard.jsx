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

  const fetchDocs = async () => {
    try {
      const res = await API.get('/docs');
      setOwnedDocs(Array.isArray(res.data) ? res.data : (res.data.owned || []));
      setSharedDocs(Array.isArray(res.data) ? [] : (res.data.shared || []));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const createDoc = async () => {
    try {
      const res = await API.post('/docs', {});
      navigate(`/document/${res.data._id}`);
    } catch (e) { console.error(e); }
  };

  const deleteDoc = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    try {
      await API.delete(`/docs/${id}`);
      setOwnedDocs(p => p.filter(d => d._id !== id));
    } catch (e) { console.error(e); }
  };

  const startRename = (doc, e) => {
    e.stopPropagation();
    setRenamingId(doc._id);
    setRenameValue(doc.title);
  };

  const submitRename = async (id) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    try {
      const res = await API.patch(`/docs/${id}/rename`, { title: renameValue });
      setOwnedDocs(p => p.map(d => d._id === id ? { ...d, title: res.data.title } : d));
    } catch (e) { console.error(e); }
    finally { setRenamingId(null); }
  };

  const filtered = ownedDocs.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase())
  );

  const Skeleton = () => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="w-10 h-12 shimmer rounded-lg mb-4"></div>
      <div className="h-4 shimmer rounded mb-2 w-3/4"></div>
      <div className="h-3 shimmer rounded w-1/2"></div>
    </div>
  );

  const DocCard = ({ doc, isOwned }) => (
    <div
      onClick={() => navigate(`/document/${doc._id}`)}
      className="doc-card bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer group relative fade-in"
    >
      <div className="w-10 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition">
        <span className="text-blue-500 text-2xl">📄</span>
      </div>

      {renamingId === doc._id ? (
        <input autoFocus
          className="w-full border-b border-blue-400 text-sm font-medium outline-none pb-1 mb-1 bg-transparent"
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={() => submitRename(doc._id)}
          onKeyDown={e => e.key === 'Enter' && submitRename(doc._id)}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <p className="font-medium text-gray-800 truncate text-sm mb-1">
          {doc.title || 'Untitled Document'}
        </p>
      )}

      <p className="text-xs text-gray-400">
        {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        }) : ''}
      </p>

      {isOwned && (
        <div className="absolute top-3 right-3 gap-1 hidden group-hover:flex">
          <button onClick={e => startRename(doc, e)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition text-sm"
            title="Rename">✏️</button>
          <button onClick={e => { e.stopPropagation(); setShareDocId(doc._id); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-500 transition text-sm"
            title="Share">🔗</button>
          <button onClick={e => deleteDoc(doc._id, e)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition text-sm"
            title="Delete">✕</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="font-semibold text-gray-800 text-lg tracking-tight">CollabDoc</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm cursor-default"
            style={{ backgroundColor: user?.color || '#3B82F6' }}
            title={user?.name}
          >{user?.name?.[0]?.toUpperCase()}</div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="text-sm text-red-400 hover:text-red-600 transition font-medium"
          >Logout</button>
        </div>
      </div>

      {/* Hero bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-8">
        <h2 className="text-white text-2xl font-semibold mb-1">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-blue-100 text-sm">{ownedDocs.length} document{ownedDocs.length !== 1 ? 's' : ''} in your workspace</p>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">My Documents</h3>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              className="border border-gray-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:w-56 bg-white"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button onClick={createDoc}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
            >+ New</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 fade-in">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-500 text-lg font-medium">
              {search ? 'No documents match your search' : 'No documents yet'}
            </p>
            {!search && (
              <button onClick={createDoc}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >Create your first document</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {filtered.map(doc => <DocCard key={doc._id} doc={doc} isOwned={true} />)}
          </div>
        )}

        {sharedDocs.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-4">Shared with me</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sharedDocs.map(doc => <DocCard key={doc._id} doc={doc} isOwned={false} />)}
            </div>
          </>
        )}
      </div>

      {shareDocId && <ShareModal docId={shareDocId} onClose={() => setShareDocId(null)} />}
    </div>
  );
}
