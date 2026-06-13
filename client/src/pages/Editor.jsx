import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import API from '../api/axios';
import EditorTopBar from '../components/EditorTopBar';
import VersionSidebar from '../components/VersionSidebar';

const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, false] }],
  [{ 'font': [] }, { 'size': [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'align': [] }],
  ['blockquote', 'code-block', 'link'],
  ['clean']
];
const SNAPSHOT_INTERVAL = 5 * 60 * 1000;

export default function Editor() {
  const { id } = useParams();
  const [title, setTitle] = useState('Untitled Document');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [userRole, setUserRole] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [versionCount, setVersionCount] = useState(0);
  // Refs
  const editorRef = useRef(null);   // DOM element
  const quillRef = useRef(null);    // Quill instance
  const saveTimer = useRef(null);
  const snapshotTimer = useRef(null);
  const titleRef = useRef(title);
  const roleRef = useRef(userRole);

  // Keep refs in sync with state
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { roleRef.current = userRole; }, [userRole]);
// Save content to MongoDB
  const saveDoc = useCallback(async (htmlContent, currentTitle) => {
    if (roleRef.current === 'viewer') return;
    setSaveStatus('Saving...');
    try {
      await API.patch(`/docs/${id}`, {
        title: currentTitle,
        content: htmlContent
      });
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch {
      setSaveStatus('Error saving');
    }
  }, [id]);

  // Initialize Quill editor
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

const quill = new Quill(editorRef.current, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
      placeholder: 'Start writing your document...'
    });

quillRef.current = quill;

    // Listen for text changes
    quill.on('text-change', () => {
      const html = quill.root.innerHTML;
      const text = quill.getText();

      // Update word and char count
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.trim().length);

      // Debounced auto save
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveDoc(html, titleRef.current);
      }, 2000);
    });
    return () => {
      // Cleanup Quill on unmount
      quillRef.current = null;
    };
  }, []); // runs once on mount

  // Load document after Quill is ready
  useEffect(() => {
    const loadDoc = async () => {
      try {
        const docRes = await API.get(`/docs/${id}`);
        const data = docRes.data;
        setTitle(data.title || 'Untitled Document');
        setUserRole(data.userRole || 'editor');
        roleRef.current = data.userRole || 'editor';

        // Load saved HTML content into editor
        if (quillRef.current && data.content) {
          const html = typeof data.content === 'string'
            ? data.content
: '';
          quillRef.current.root.innerHTML = html;
        }

        // Set read only for viewers
        if (data.userRole === 'viewer' && quillRef.current) {
          quillRef.current.disable();
        }

        // Load version count
        const vRes = await API.get(`/docs/${id}/versions`);
        setVersionCount(vRes.data.length);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    loadDoc();
  }, [id]);
// Auto snapshot every 5 minutes
  useEffect(() => {
    if (!userRole || userRole === 'viewer') return;
    snapshotTimer.current = setInterval(async () => {
      try {
        await API.post(`/docs/${id}/versions`);
        setVersionCount(prev => prev + 1);
      } catch (e) { console.error(e); }
    }, SNAPSHOT_INTERVAL);
    return () => clearInterval(snapshotTimer.current);
  }, [id, userRole]);

  // Manual version save
  const saveVersion = async () => {
    try {
      await API.post(`/docs/${id}/versions`);
      setVersionCount(prev => prev + 1);
      setSaveStatus('Version saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) { console.error(e); }
  };
  const handleTitleSave = () => {
    const html = quillRef.current?.root.innerHTML || '';
    saveDoc(html, title);
  };

  // Restore a version
  const handleRestore = (restoredContent, restoredTitle) => {
    if (quillRef.current) {
      quillRef.current.root.innerHTML = typeof restoredContent === 'string'
        ? restoredContent : '';
    }
    setTitle(restoredTitle || title);
    setSaveStatus('Restored!');
    setTimeout(() => setSaveStatus(''), 2000);
  };
// Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (snapshotTimer.current) clearInterval(snapshotTimer.current);
    };
  }, []);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-4xl">🔒</p>
      <p className="text-gray-600 font-medium">{error}</p>
      <button onClick={() => window.history.back()}
        className="text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      <EditorTopBar
        docId={id}
        title={title}
        saveStatus={saveStatus}
        userRole={userRole}
        versionCount={versionCount}
        onTitleChange={setTitle}
        onTitleSave={handleTitleSave}
        onShowVersions={() => setShowVersions(true)}
        onSaveVersion={saveVersion}
      />

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {/* Editor scroll area */}
      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div
          className="bg-white shadow-lg mx-auto rounded-sm"
          style={{ maxWidth: '816px', minHeight: '1056px' }}
        >
          {/* Quill mounts here */}
          <div ref={editorRef} style={{ minHeight: '1000px' }} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-100 px-6 py-2 flex items-center justify-between text-xs text-gray-400 sticky bottom-0">
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        {userRole === 'viewer' && (
          <span className="text-orange-400 font-medium">👁 View only</span>
        )}
      </div>
      {showVersions && (
        <VersionSidebar
          docId={id}
          onRestore={handleRestore}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}

