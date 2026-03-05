import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <header style={{ padding: "1rem", background: "#333", color: "white" }}>
        <nav>
          <a href="/" style={{ color: "white", marginRight: "15px" }}>Ana Sayfa</a>
          <a href="/about" style={{ color: "white", marginRight: "15px" }}>Hakkımızda</a>
          <a href="/database" style={{ color: "white" }}>Database Demo</a>
        </nav>
      </header>

      <main style={{ flex: 1, padding: "2rem" }}>
        {children}
      </main>

      <footer style={{ padding: "1rem", background: "#f4f4f4", textAlign: "center" }}>
        <p>© 2024 Benim Framework'üm - Bun ile Güçlendirildi</p>
      </footer>
    </div>
  );
}