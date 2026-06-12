import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public — anyone can visit */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — only logged in users */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/document/:id" element={<Editor />} />

         </Routes> 
  
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
