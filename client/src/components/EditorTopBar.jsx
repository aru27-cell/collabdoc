import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShareModal from './ShareModal';

export default function EditorTopBar({
  docId,
  title,
  saveStatus,
  userRole,
  onTitleChange,
  onTitleSave
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editingTitle, setEditingTitle] = useState(false);
  const [showShare, setShowShare] = useState(false);
const handleTitleClick = () => {
    if (userRole === 'viewer') return;
    setEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    onTitleSave();
  };

  // Save status color
  const statusColor = {
    'Saving...': 'text-yellow-500',
    'Saved': 'text-green-500',
    'Error saving': 'text-red-500',
    '': 'text-transparent'
  }[saveStatus] || 'text-gray-400';

  return (
    <>
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-3 sticky top-0 z-40">

        {/* Back to dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
          title="Back to dashboard"
        >
          ←
        </button>

        {/* CollabDoc logo */}
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">C</span>
        </div>

        {/* Document title — click to edit */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              className="text-base font-medium text-gray-800 border-b-2 border-blue-500 outline-none w-full max-w-md bg-transparent"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={e => e.key === 'Enter' && handleTitleBlur()}
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1
                onClick={handleTitleClick}
                className={`text-base font-medium text-gray-800 truncate max-w-xs ${userRole !== 'viewer' ? 'cursor-pointer hover:bg-gray-100 px-2 py-0.5 rounded' : ''}`}
                title={userRole !== 'viewer' ? 'Click to rename' : ''}
              >
                {title || 'Untitled Document'}
              </h1>
              {/* Save status */}
              <span className={`text-xs ${statusColor} transition-all`}>
                {saveStatus}
              </span>
            </div>
          )}
        </div>

        {/* Role badge */}
        {userRole && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium hidden sm:block
            ${userRole === 'owner' ? 'bg-blue-50 text-blue-600' :
              userRole === 'editor' ? 'bg-green-50 text-green-600' :
              'bg-gray-100 text-gray-500'}`}>
            {userRole}
          </span>
        )}

        {/* Share button — only for owner */}
        {userRole === 'owner' && (
          <button
            onClick={() => setShowShare(true)}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex-shrink-0"
          >
            Share
          </button>
        )}

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
          style={{ backgroundColor: user?.color || '#3B82F6' }}
          title={user?.name}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
            {/* Share modal */}
      {showShare && (
        <ShareModal docId={docId} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
