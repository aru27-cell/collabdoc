const COLORS = [
  "#DB4437","#0F9D58","#F4B400","#9C27B0",
  "#00ACC1","#FF6D00","#E91E63","#795548"
];

function colorFor(name) {
  var n = name || "";
  return COLORS[(n.charCodeAt(0) || 0) % COLORS.length];
}

export default function CollabCursors({ cursors }) {
  var safeCursors = cursors || {};
  var entries = Object.entries(safeCursors);
  if (!entries.length) return null;

  return (
    <div style={{
      position: "absolute", top: 0, left: 0,
      width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 20
    }}>
      {entries.map(function(entry) {
        var socketId = entry[0];
        var data = entry[1];
        if (!data) return null;
        var position = data.position;
        var user = data.user;
        if (!position || !user) return null;
        var color = colorFor(user.name);
        return (
          <div key={socketId} style={{
            position: "absolute",
            top: position.top || 0,
            left: position.left || 0,
            pointerEvents: "none",
          }}>
            <div style={{
              width: 2, height: 20, background: color,
              position: "absolute", top: 0, left: 0,
            }} />
            <div style={{
              position: "absolute", top: -22, left: 0,
              background: color, color: "#fff",
              fontSize: 11, fontWeight: 500,
              padding: "1px 6px", borderRadius: "3px 3px 3px 0",
              whiteSpace: "nowrap", lineHeight: 1.6
            }}>
              {user.name || "Anonymous"}
            </div>
          </div>
        );
      })}
    </div>
  );
}