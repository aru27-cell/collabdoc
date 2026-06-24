
import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CommentSidebar({ docId, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();

  useEffect(() => { loadComments(); }, [docId]);

  const loadComments = async () => {
    try {
      const res = await API.get(`/comments/${docId}`);
      setComments(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const addComment = async () => {
    if (!newText.trim()) return;
    setAdding(true);
    try {
      const res = await API.post(`/comments/${docId}`, { text: newText });
      setComments(prev => [res.data, ...prev]);
      setNewText('');
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  const resolveComment = async (commentId) => {
    try {
      const res = await API.patch(`/comments/${commentId}/resolve`);
      setComments(prev =>
        prev.map(c => c._id === commentId ? res.data : c)
      );
    } catch (e) { console.error(e); }
  };

  const deleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (e) { console.error(e); }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="flex-1 bg-black bg-opacity-20" onClick={onClose} />
      <div className="w-80 bg-white shadow-2xl flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Comments</h2>
            <p className="text-xs text-gray-400 mt-0.5">{comments.length} comments</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Add comment box */}
        <div className="px-4 py-3 border-b border-gray-100">
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add a comment..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
          />
          <button
            onClick={addComment}
            disabled={adding || !newText.trim()}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {adding ? 'Adding...' : 'Add Comment'}
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Add one above</p>
            </div>
          ) : (
            comments.map(c => (
              <div
                key={c._id}
                className={`px-4 py-4 border-b border-gray-50 ${c.resolved ? 'opacity-50' : ''}`}
              >
                {/* Author row */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: c.author?.color || '#3B82F6' }}
                  >
                    {c.author?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">{c.author?.name}</p>
                    <p className="text-xs text-gray-400">{formatTime(c.createdAt)}</p>
                  </div>
                  {c.resolved && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Resolved</span>
                  )}
                </div>

                {/* Comment text */}
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{c.text}</p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {!c.resolved && (
                    <button
                      onClick={() => resolveComment(c._id)}
                      className="text-xs text-green-600 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition"
                    >
                      ✓ Resolve
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(c._id)}
                    className="text-xs text-red-400 border border-red-100 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
