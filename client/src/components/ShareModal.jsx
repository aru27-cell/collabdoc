import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function ShareModal({ docId, onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [doc, setDoc] = useState(null);
  const [isPublic, setIsPublic] = useState(false);

  const { user } = useAuth();
// load doc details when modal opens
  useEffect(() => {
    const loadDoc = async () => {
      try {
        const docRes = await API.get(`/docs/${docId}`);
        setDoc(docRes.data);
        setIsPublic(docRes.data.isPublic);
      } catch (err) {
        console.error(err);
      }
    };

    loadDoc();
  }, [docId]);
   //share with a new person 
  const handleShare = async () => {
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const shareRes = await API.post(`/docs/${docId}/share`, {
        email,
        role
      });

      setMessage(shareRes.data.message);
      setIsError(false);
      setEmail('');
      // Refresh doc details to show new collaborator
      const refreshed = await API.get(`/docs/${docId}`);
      setDoc(refreshed.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Share failed');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };
//remove a collaborator
  const handleRemove = async (userId) => {
    try {
      await API.delete(`/docs/${docId}/share/${userId}`);

      setDoc((prev) => ({
        ...prev,
        collaborators: prev.collaborators.filter(
          (c) => c.user._id !== userId
        )
      }));
    } catch (err) {
      console.error(err);
    }
  };
//toggle public /private access
  const handlePublicToggle = async () => {
    try {
      const toggleRes = await API.patch(`/docs/${docId}/public`);
      setIsPublic(toggleRes.data.isPublic);
    } catch (err) {
      console.error(err);
    }
  };

  const isOwner =
    doc?.owner?._id === user?.id ||
    doc?.owner?.toString() === user?.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
       {/*header*/}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Share Document
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {isOwner && (
          <>
           {/*email input*/}
            <label className="block text-sm text-gray-600 mb-1">
              Invite by email
            </label>

            <input
              className="w-full border border-gray-200 p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="friend@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
         { /*Role selector */ }
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

            {message && (
              <div
                className={`text-sm p-3 rounded-lg mb-3 ${
                  isError
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleShare}
              disabled={loading || !email.trim()}
              className="w-full bg-blue-600 text-white p-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition mb-5"
            >
              {loading ? 'Sharing...' : 'Send Invite'}
            </button>
            {/* Public toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-5">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Public link
                </p>

                <p className="text-xs text-gray-400">
                  {isPublic
                    ? 'Anyone with the link can view'
                    : 'Only invited people can access'}
                </p>
              </div>
             {/* Toggle switch */}
              <div
                onClick={handlePublicToggle}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  isPublic ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </div>
          </>
        )}
         {/* List of collaborators */ }
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            People with access ({(doc?.collaborators?.length || 0) + 1})
          </p>

        {/* Owner row */ }
          {doc?.owner && (
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{
                  backgroundColor: doc.owner.color || '#3B82F6'
                }}
              >
                {doc.owner.name?.[0]?.toUpperCase()}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {doc.owner.name}
                </p>

                <p className="text-xs text-gray-400">
                  {doc.owner.email}
                </p>
              </div>

              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                Owner
              </span>
            </div>
          )}
      {/* Collaborators rows */ }
          {doc?.collaborators?.map((c) => (
            <div
              key={c.user._id}
              className="flex items-center gap-3 mb-3"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{
                  backgroundColor: c.user.color || '#6B7280'
                }}
              >
                {c.user.name?.[0]?.toUpperCase()}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {c.user.name}
                </p>

                <p className="text-xs text-gray-400">
                  {c.user.email}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  c.role === 'editor'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {c.role}
              </span>

              {isOwner && (
                <button
                  onClick={() => handleRemove(c.user._id)}
                  className="text-gray-300 hover:text-red-500 transition text-lg ml-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {doc?.collaborators?.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">
              No collaborators yet. Invite someone above.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 border border-gray-200 text-gray-600 p-3 rounded-xl text-sm hover:bg-gray-50 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
