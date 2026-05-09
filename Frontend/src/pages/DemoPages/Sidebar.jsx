// src/components/Sidebar.js
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";
import { MENU_ITEMS } from "../../constant/menuConfig";

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null; // không hiển thị khi chưa login

  const visibleMenu = MENU_ITEMS.filter((item) =>
    item.allowedRoles.includes(user.role)
  );

  return (
    <aside
      style={{
        width: "220px",
        padding: "16px",
        borderRight: "1px solid #ddd",
        height: "100vh",
      }}
    >
      <h3>👋 Hi, {user.name}</h3>
      <p style={{ fontSize: 13, color: "#666" }}>Role: {user.role}</p>
      <hr />
      <nav>
        {visibleMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "block",
              padding: "8px 0",
              textDecoration: "none",
              color: isActive ? "blue" : "#333",
              fontWeight: isActive ? "bold" : "normal",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <LogoutButton />
    </aside>
  );
}
