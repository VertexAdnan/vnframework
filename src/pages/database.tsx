export const title = "Database Demo";
export const description = "VN Framework veritabanı kullanım örneği";

export default function DatabaseDemo() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Database Demo</h1>
      <p className="mb-4">VN Framework ile Drizzle ORM kullanım örneği</p>

      <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
        <h2 className="text-xl font-bold mb-2">🎯 Kurulum Adımları</h2>
        <ol style={{ marginLeft: "20px" }}>
          <li><strong>1.</strong> <code>.env</code> dosyasını yapılandırın (.env.example'dan kopyalayın)</li>
          <li><strong>2.</strong> <code>src/server.tsx</code> içinde database'i başlatın</li>
          <li><strong>3.</strong> Migration'ları çalıştırın: <code>bun run db:generate</code></li>
          <li><strong>4.</strong> API endpoint'lerini test edin</li>
        </ol>
      </div>

      <div style={{ marginTop: "20px", background: "#e8f5e9", padding: "20px", borderRadius: "8px" }}>
        <h2 className="text-xl font-bold mb-2">📚 API Endpoints</h2>
        <ul style={{ marginLeft: "20px" }}>
          <li><strong>GET</strong> <code>/api/users</code> - Tüm kullanıcıları listeler</li>
          <li><strong>POST</strong> <code>/api/user-create</code> - Yeni kullanıcı oluşturur</li>
        </ul>
      </div>

      <div style={{ marginTop: "20px", background: "#fff3e0", padding: "20px", borderRadius: "8px" }}>
        <h2 className="text-xl font-bold mb-2">🔧 Desteklenen Veritabanları</h2>
        <ul style={{ marginLeft: "20px" }}>
          <li>✅ PostgreSQL</li>
          <li>✅ MySQL / MariaDB</li>
          <li>✅ SQLite</li>
          <li>✅ Çoklu veritabanı desteği</li>
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <a href="/" className="text-blue-500 underline">← Ana Sayfa</a>
      </div>
    </div>
  );
}
