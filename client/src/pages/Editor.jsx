import { useParams } from 'react-router-dom';

export default function Editor() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Document Editor</h1>
      <p className="text-gray-500">ID: {id}</p>
    </div>
  );
}