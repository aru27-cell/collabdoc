
import { useState, useEffect, useRef } from 'react';

export default function FindReplace({ quill, onClose }) {
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [showReplace, setShowReplace] = useState(false);
  const [matchCountLabel, setMatchCountLabel] = useState('');

  const findInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  // THE KEY FIX — directly disable Quill's editable DOM element
  // This makes it 100% impossible for keystrokes to reach the document
  useEffect(() => {
    if (quill && quill.root) {
      quill.root.setAttribute('contenteditable', 'false');
      console.log('🔒 Quill editing DISABLED while find is open');
    }

    const t = setTimeout(() => {
      findInputRef.current?.focus();
      console.log('🎯 Find input focused');
    }, 100);

    // Cleanup — re-enable Quill when find bar closes
    return () => {
      clearTimeout(t);
      clearHighlights();
      if (quill && quill.root) {
        quill.root.setAttribute('contenteditable', 'true');
        console.log('🔓 Quill editing RE-ENABLED');
      }
    };
  }, [quill]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function clearHighlights() {
    if (!quill) return;
    const len = quill.getLength();
    if (len > 1) quill.formatText(0, len - 1, { background: false }, 'silent');
  }

  function runSearch() {
    const query = findInputRef.current?.value || '';
    if (!quill) return;

    clearHighlights();

    if (!query.trim()) {
      setMatches([]);
      setMatchCountLabel('');
      return;
    }

    const text = quill.getText();
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const found = [];
    let idx = 0;

    while ((idx = lowerText.indexOf(lowerQuery, idx)) !== -1) {
      found.push(idx);
      idx += query.length;
    }

    found.forEach(i => {
      quill.formatText(i, query.length, { background: '#FEF08A' }, 'silent');
    });

    setMatches(found);
    setCurrentMatch(0);
    setMatchCountLabel(found.length > 0 ? `1/${found.length}` : '0 found');

    if (found.length > 0) {
      quill.setSelection(found[0], query.length, 'silent');
    }
  }

  function goTo(dir) {
    if (matches.length === 0) return;
    const next = (currentMatch + dir + matches.length) % matches.length;
    setCurrentMatch(next);
    setMatchCountLabel(`${next+1}/${matches.length}`);
    const query = findInputRef.current?.value || '';
    quill.setSelection(matches[next], query.length, 'silent');
  }

  // Replace operations need editing ON temporarily
  function replaceCurrent() {
    if (matches.length === 0 || !quill) return;
    const query = findInputRef.current?.value || '';
    const replaceVal = replaceInputRef.current?.value || '';
    const idx = matches[currentMatch];

    quill.root.setAttribute('contenteditable', 'true'); // briefly allow edit
    quill.deleteText(idx, query.length, 'user');
    quill.insertText(idx, replaceVal, 'user');
    quill.root.setAttribute('contenteditable', 'false'); // lock again

    setTimeout(runSearch, 50);
  }

  function replaceAll() {
    if (matches.length === 0 || !quill) return;
    const query = findInputRef.current?.value || '';
    const replaceVal = replaceInputRef.current?.value || '';

    quill.root.setAttribute('contenteditable', 'true');
    [...matches].reverse().forEach(idx => {
      quill.deleteText(idx, query.length, 'user');
      quill.insertText(idx, replaceVal, 'user');
    });
    quill.root.setAttribute('contenteditable', 'false');

    clearHighlights();
    setMatches([]);
    setMatchCountLabel('');
    if (findInputRef.current) findInputRef.current.value = '';
  }

  function handleClose() {
    clearHighlights();
    onClose();
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2.5 shadow-sm relative z-30">
      <div className="flex items-center gap-2 flex-wrap">

        <span className="text-xs font-medium text-gray-500">🔍</span>

        <input
          ref={findInputRef}
          type="text"
          autoComplete="off"
          defaultValue=""
          className="border border-gray-200 px-3 py-1.5 rounded-lg text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type to search..."
          onInput={runSearch}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); goTo(1); }
          }}
        />

        <span className="text-xs text-gray-400 w-14">{matchCountLabel}</span>

        <button type="button" onClick={() => goTo(-1)}
          className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600 font-bold text-sm">↑</button>
        <button type="button" onClick={() => goTo(1)}
          className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600 font-bold text-sm">↓</button>

        <button type="button" onClick={() => setShowReplace(!showReplace)}
          className="text-xs text-blue-600 hover:underline">
          {showReplace ? 'Hide' : 'Replace'}
        </button>

        {showReplace && (
          <>
            <input
              ref={replaceInputRef}
              type="text"
              autoComplete="off"
              defaultValue=""
              className="border border-gray-200 px-3 py-1.5 rounded-lg text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Replace with..."
              onKeyDown={(e) => e.stopPropagation()}
            />
            <button type="button" onClick={replaceCurrent} disabled={matches.length === 0}
              className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">Replace</button>
            <button type="button" onClick={replaceAll} disabled={matches.length === 0}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">All</button>
          </>
        )}

        <button type="button" onClick={handleClose}
          className="ml-auto text-gray-400 hover:text-gray-600 text-lg">✕</button>
      </div>
    </div>
  );
}
