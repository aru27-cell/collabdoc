import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShareModal from './ShareModal';

export default function EditorTopBar({
  docId, title, saveStatus, userRole,
  versionCount, onTitleChange, onTitleSave,
  onShowVersions, onSaveVersion,
  onShowComments, onShowFind,
  activeUsers, onExportPDF, onToggleTheme, isDark  // ← add these
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingTitle, setEditingTitle] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleTitleBlur = () => {
    setEditingTitle(false);
    onTitleSave();
  };

  const statusColor = {
    'Saving...': 'text-yellow-500',
    'Saved': 'text-green-500',
    'Version saved!': 'text-blue-500',
    'Restored!': 'text-purple-500',
    'Error saving': 'text-red-500',
  }[saveStatus] || 'text-gray-400';

  const users = Array.isArray(activeUsers) ? activeUsers : [];

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2 sticky top-0 z-40 flex-wrap">

        <button onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 text-lg flex-shrink-0"
        >←</button>

        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">C</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {editingTitle ? (
            <input autoFocus
              className="text-sm font-medium border-b-2 border-blue-500 outline-none max-w-xs bg-transparent"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={e => e.key === 'Enter' && handleTitleBlur()}
            />
          ) : (
            <h1
              onClick={() => userRole !== 'viewer' && setEditingTitle(true)}
              className={`text-sm font-medium text-gray-800 truncate max-w-[160px]
                ${userRole !== 'viewer' ? 'cursor-pointer hover:bg-gray-100 px-1 rounded' : ''}`}
            >{title || 'Untitled'}</h1>
          )}
          <span className={`text-xs ${statusColor} hidden sm:block`}>{saveStatus}</span>
        </div>

        {/* ── ONLINE USERS ── always visible ──────────── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex -space-x-1.5">
            {users.slice(0, 4).map((u, i) => (
              <div key={u.socketId || i}
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: u.color || '#3B82F6' }}
                title={u.name}
              >{u.name?.[0]?.toUpperCase()}</div>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">{users.length} online</span>
          </div>
        </div>
        {/* ─────────────────────────────────────────── */}

        {userRole && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden md:block
            ${userRole === 'owner' ? 'bg-blue-50 text-blue-600' :
              userRole === 'editor' ? 'bg-green-50 text-green-600' :
              'bg-gray-100 text-gray-500'}`}>
            {userRole}
          </span>
        )}

        {userRole !== 'viewer' && onSaveVersion && (
          <button onClick={onSaveVersion}
            className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-50 hidden sm:block flex-shrink-0"
          >💾 Save</button>
        )}

        {onShowFind && (
          <button onClick={onShowFind}
            className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-50 flex-shrink-0"
            title="Find & Replace (Ctrl+F)"
          >🔍 Find</button>
        )}

        <button onClick={onShowVersions}
          className="relative text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-50 flex-shrink-0"
        >
          🕐 History
          {versionCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {versionCount > 9 ? '9+' : versionCount}
            </span>
          )}
        </button>

        {onShowComments && (
          <button onClick={onShowComments}
            className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-50 flex-shrink-0"
          >💬 Comments</button>
        )}

        {/* Download button */}
        <button
          onClick={onExportPDF}
          className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-50 flex-shrink-0"
          title="Download as PDF"
        >
          ⬇️ Download
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleTheme}
          className="text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 flex-shrink-0"
          title="Toggle dark mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>


        {userRole === 'owner' && (
          <button onClick={() => setShowShare(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 flex-shrink-0"
          >Share</button>
        )}

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: user?.color || '#3B82F6' }}
          title={user?.name}
        >{user?.name?.[0]?.toUpperCase()}</div>
      </div>

      {showShare && <ShareModal docId={docId} onClose={() => setShowShare(false)} />}
    </>
  );
}
