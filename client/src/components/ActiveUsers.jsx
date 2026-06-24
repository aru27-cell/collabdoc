export default function ActiveUsers({ users }) {
  if (!users || users.length === 0) return null;

  // Show max 5 avatars — then +X more
  const visible = users.slice(0, 5);
  const extra = users.length - 5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {visible.map((u, i) => (
          <div
            key={u.socketId || i}
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: u.color || '#3B82F6' }}
            title={u.name}
          >
            {u.name?.[0]?.toUpperCase()}
          </div>
        ))}
        {extra > 0 && (
          <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
            +{extra}
          </div>
        )}
      </div>
      {/* Online dot */}
      <div className="flex items-center gap-1 ml-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-400 hidden sm:block">
          {users.length} online
        </span>
      </div>
    </div>
  );
}
