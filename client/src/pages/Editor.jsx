import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import API from '../api/axios';
import socket from '../socket';
import EditorTopBar from '../components/EditorTopBar';
import VersionSidebar from '../components/VersionSidebar';
import CommentSidebar from '../components/CommentSidebar';
import FindReplace from '../components/FindReplace';
import html2pdf from 'html2pdf.js';


const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }, { size: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block', 'link'],
  ['clean']
];

export default function Editor() {
  const { id } = useParams();

  // State
  const [title, setTitle] = useState('Untitled Document');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [userRole, setUserRole] = useState('');
  const [versionCount, setVersionCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFind, setShowFind] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });



  // Refs
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const saveTimer = useRef(null);
  const snapshotTimer = useRef(null);
  const titleRef = useRef('Untitled Document');
  const roleRef = useRef('');

  useEffect(() => { titleRef.current = title; }, [title]);

  // ── SAVE DOC ──────────────────────────────────────
  const saveDoc = useCallback(async (html, t) => {
    if (roleRef.current === 'viewer') return;
    setSaveStatus('Saving...');
    try {
      await API.patch(`/docs/${id}`, { title: t, content: html });
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch { setSaveStatus('Error saving'); }
  }, [id]);

  // ── INIT QUILL ────────────────────────────────────
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;
    const q = new Quill(editorRef.current, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR },
      placeholder: 'Start writing...'
    });
    quillRef.current = q;

    q.on('text-change', (delta, old, source) => {
      if (source !== 'user') return;
      const html = q.root.innerHTML;
      const text = q.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.trim().length);
      socket.emit('content-change', { docId: id, html });
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveDoc(html, titleRef.current), 2000);
    });

    return () => { quillRef.current = null; };
  }, []);


  // Save theme preference whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);


  // ── LOAD DOC ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/docs/${id}`);
        const d = res.data;
        setTitle(d.title || 'Untitled Document');
        titleRef.current = d.title || 'Untitled Document';
        setUserRole(d.userRole || 'editor');
        roleRef.current = d.userRole || 'editor';
        if (quillRef.current && d.content) {
          quillRef.current.root.innerHTML =
            typeof d.content === 'string' ? d.content : '';
        }
        if (d.userRole === 'viewer' && quillRef.current) {
          quillRef.current.disable();
        }
        const vRes = await API.get(`/docs/${id}/versions`);
        setVersionCount(vRes.data.length);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load');
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  // ── SOCKET SETUP ──────────────────────────────────
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('❌ No user in localStorage');
      return;
    }
    const user = JSON.parse(userStr);
    console.log('👤 Current user for socket:', user);

    function doJoin() {
      console.log('📤 Emitting join-document for doc:', id, 'user:', user.name);
      socket.emit('join-document', { docId: id, user });
    }

    function onConnect() {
      console.log('✅ socket connect event fired:', socket.id);
      doJoin();
    }

    function onActiveUsers(users) {
      console.log('👥 RECEIVED active-users:', users);
      setActiveUsers(Array.isArray(users) ? [...users] : []);
    }

    function onContentUpdate(html) {
      if (!quillRef.current) return;
      const sel = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = html;
      if (sel) quillRef.current.setSelection(sel);
    }

    function onTitleUpdate(t) {
      setTitle(t);
      titleRef.current = t;
    }

    // register listeners BEFORE connecting
    socket.on('connect', onConnect);
    socket.on('active-users', onActiveUsers);
    socket.on('content-update', onContentUpdate);
    socket.on('title-update', onTitleUpdate);

    console.log('🔄 Calling socket.connect() — currently connected?', socket.connected);
    socket.connect();

    // edge case — socket was already connected from a previous mount
    if (socket.connected) {
      console.log('⚡ Already connected — joining immediately');
      doJoin();
    }

    return () => {
      console.log('🧹 Cleaning up socket listeners for doc:', id);
      socket.off('connect', onConnect);
      socket.off('active-users', onActiveUsers);
      socket.off('content-update', onContentUpdate);
      socket.off('title-update', onTitleUpdate);
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (!userRole || userRole === 'viewer') return;
    snapshotTimer.current = setInterval(async () => {
      try {
        await API.post(`/docs/${id}/versions`);
        setVersionCount(p => p + 1);
      } catch (e) { console.error(e); }
    }, 5 * 60 * 1000);
    return () => clearInterval(snapshotTimer.current);
  }, [id, userRole]);

  // ── CTRL+F ────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFind(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── CLEANUP ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (snapshotTimer.current) clearInterval(snapshotTimer.current);
    };
  }, []);

  const saveVersion = async () => {
    try {
      await API.post(`/docs/${id}/versions`);
      setVersionCount(p => p + 1);
      setSaveStatus('Version saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) { console.error(e); }
  };

  // Export current document as PDF
  const exportPDF = () => {
  if (!quillRef.current) return;

  // Clone the content into a clean container — strips editor-specific styling
  const content = quillRef.current.root.innerHTML;
  const cleanDiv = document.createElement('div');
  cleanDiv.innerHTML = content;
  cleanDiv.style.padding = '40px';
  cleanDiv.style.fontFamily = 'Georgia, serif';
  cleanDiv.style.fontSize = '14px';
  cleanDiv.style.lineHeight = '1.6';
  cleanDiv.style.width = '700px';

  const opt = {
    margin: 0.5,
    filename: `${title || 'document'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, windowWidth: 700 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(cleanDiv).save();
};



  const handleTitleSave = () => {
    const html = quillRef.current?.root.innerHTML || '';
    saveDoc(html, title);
    socket.emit('title-change', { docId: id, title });
  };

  const handleRestore = (content, t) => {
    if (quillRef.current) {
      quillRef.current.root.innerHTML =
        typeof content === 'string' ? content : '';
    }
    setTitle(t || title);
    setSaveStatus('Restored!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-4xl">🔒</p>
      <p className="text-gray-600">{error}</p>
      <button onClick={() => window.history.back()}
        className="text-blue-600 text-sm hover:underline">Go back</button>
    </div>
  );

  return (

    // NEW — add conditional dark class:
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark-bg' : 'bg-gray-100'}`}>

      <EditorTopBar
        docId={id}
        title={title}
        saveStatus={saveStatus}
        userRole={userRole}
        versionCount={versionCount}
        activeUsers={activeUsers}
        onTitleChange={setTitle}
        onTitleSave={handleTitleSave}
        onShowVersions={() => setShowVersions(true)}
        onSaveVersion={saveVersion}
        onShowComments={() => setShowComments(true)}
        onShowFind={() => setShowFind(true)}
        onExportPDF={exportPDF}
        onToggleTheme={() => setIsDark(!isDark)}
        isDark={isDark}

      />

      {loading && (
        <div className="flex justify-center py-3">
          <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {showFind && (
        <FindReplace
          quill={quillRef.current}
          onClose={() => setShowFind(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className={`mx-auto rounded-sm ${isDark ? 'dark-page' : 'bg-white shadow-lg'}`}
          style={{ maxWidth: '816px', minHeight: '1056px' }}>
          <div ref={editorRef}
            className={isDark ? 'dark-editor' : ''}
            style={{ minHeight: '1000px' }} />
        </div>

      </div>

      <div className="bg-white border-t border-gray-100 px-6 py-1.5 flex items-center justify-between text-xs text-gray-400 sticky bottom-0">
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
        {userRole === 'viewer' && <span className="text-orange-400">👁 View only</span>}
      </div>

      {showVersions && (
        <VersionSidebar docId={id} onRestore={handleRestore} onClose={() => setShowVersions(false)} />
      )}
      {showComments && (
        <CommentSidebar docId={id} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
}