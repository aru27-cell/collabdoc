import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    const res = await axios.get('http://localhost:5000/api/docs', { headers });
    setDocs(res.data);
  };
  const createDoc = async () => {
    const res = await axios.post('http://localhost:5000/api/docs', {}, { headers });
    navigate(`/document/${res.data._id}`);
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (


   <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-blue-600">CollabDoc</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{user.name}</span>
          <button onClick={logout} className="text-sm text-red-500">Logout</button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">My Documents</h2>
          <button onClick={createDoc} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ New Document</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {docs.map(doc => (
            <div key={doc._id} onClick={() => navigate(`/document/${doc._id}`)}
              className="bg-white border rounded-xl p-5 cursor-pointer hover:shadow-md transition">
              <div className="text-3xl mb-3">📄</div>
              <p className="font-medium text-gray-800">{doc.title}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(doc.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
        {docs.length === 0 && <p className="text-center text-gray-400 mt-20">No documents yet. Click + New Document</p>}
      </div>
    </div>
  );
}
        
