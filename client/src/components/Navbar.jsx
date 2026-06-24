import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ search, onSearch, onCreate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <nav
      style={{
        height: "64px",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "0 24px",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate("/dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "#1a73e8",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          D
        </div>

        <span
          style={{
            fontSize: "22px",
            fontWeight: "500",
            color: "#202124",
          }}
        >
          Docs
        </span>
      </div>

      {/* Search */}
      {onSearch && (
        <div
          style={{
            flex: 1,
            maxWidth: "700px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#f1f3f4",
            borderRadius: "8px",
            padding: "0 14px",
          }}
        >
          <span>🔍</span>

          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search documents"
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "14px",
              color: "#202124",
              flex: 1,
              padding: "12px 0",
            }}
          />

          {search && (
            <button
              onClick={() => onSearch("")}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#5f6368",
                fontSize: "18px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      )}

      <div style={{ marginLeft: "auto", display: "flex", gap: "12px" }}>
        {/* New Document Button */}
        {onCreate && (
          <button
            onClick={onCreate}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              background: "#1a73e8",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            + New
          </button>
        )}

        {/* Avatar */}
        <div
          title={user?.name}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#673ab7",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {initials(user?.name || "?")}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            border: "1px solid #dadce0",
            background: "#fff",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}