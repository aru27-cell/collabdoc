import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function VersionSidebar({ docId, onRestore, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState(null);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const vRes = await API.get(`/docs/${docId}/versions`);
        setVersions(vRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [docId]);

  const handleRestore = async (version) => {
    if (!window.confirm('Restore this version? Current content will be replaced.')) return;
    setRestoring(version._id);
    try {
      await API.patch(`/docs/${docId}`, {
        content: version.content,
        title: version.title
      });
      onRestore(version.content, version.title);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setRestoring(null);
    }
};

  const formatDate = (dateStr) => {
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
            <h2 className="text-sm font-semibold text-gray-800">Version History</h2>
            <p className="text-xs text-gray-400 mt-0.5">{versions.length} versions saved</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* List */}
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
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <p className="text-3xl mb-2">🕐</p>
              <p className="text-sm">No versions yet</p>
              <p className="text-xs mt-1 text-center px-4">
                Click 💾 Save version in top bar
              </p>
            </div>
          ) : (
            versions.map((v, index) => (
              <div
                key={v._id}
                onClick={() => setPreviewId(previewId === v._id ? null : v._id)}
                className={`px-5 py-4 border-b border-gray-50 cursor-pointer transition
                  ${previewId === v._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700">
                    {index === 0 ? 'Latest version' : `Version ${versions.length - index}`}
                  </span>
                  {index === 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{formatDate(v.createdAt)}</p>
                {v.savedBy && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: v.savedBy.color || '#3B82F6' }}
                    >
                      {v.savedBy.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-500">{v.savedBy.name}</span>
                  </div>
                )}

                {previewId === v._id && (
                  <div className="mt-3">
                    <div className="bg-white border border-gray-100 rounded-lg p-3 mb-3 max-h-24 overflow-hidden">
                      <p className="text-xs text-gray-500">
                        {typeof v.content === 'string'
                          ? v.content.replace(/<[^>]*>/g, '').slice(0, 150)
                          : 'Saved content'}
                      </p>
                    </div>
                    {index !== 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); handleRestore(v); }}
                        disabled={restoring === v._id}
                        className="w-full bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
                      >
                        {restoring === v._id ? 'Restoring...' : 'Restore this version'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
