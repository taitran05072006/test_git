import { useEffect, useState } from "react";

const emptyForm = { name: "", email: "" };

function App() {
  const [message, setMessage] = useState("Đang tải...");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function loadUsers() {
    const response = await fetch("/users");
    if (!response.ok) throw new Error("Không tải được danh sách user");
    setUsers(await response.json());
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/hello").then((response) => response.text()),
      loadUsers(),
    ])
      .then(([hello]) => setMessage(hello))
      .catch((loadError) => setError(loadError.message));
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const url = editingId ? `/users/${editingId}` : "/users";
    const method = editingId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      setError("Không lưu được user");
      return;
    }
    setForm(emptyForm);
    setEditingId(null);
    await loadUsers();
  }

  function editUser(user) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email });
  }

  async function deleteUser(id) {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    const response = await fetch(`/users/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Không xóa được user");
      return;
    }
    await loadUsers();
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">Spring Boot + React + MySQL</p>
        <h1>User CRUD Dashboard</h1>
        <p className="message">{message}</p>
      </header>

      <section className="card">
        <h2>{editingId ? "Sửa user" : "Tạo user mới"}</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Tên" required />
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
          <button type="submit">{editingId ? "Cập nhật" : "Thêm user"}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
              Hủy
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Danh sách users</h2>
          <span>{users.length} user</span>
        </div>
        {error && <p className="error">{error}</p>}
        {users.length === 0 ? (
          <p>Chưa có user. Hãy tạo user đầu tiên.</p>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <article className="user-row" key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <div className="actions">
                  <button className="secondary" onClick={() => editUser(user)}>Sửa</button>
                  <button className="danger" onClick={() => deleteUser(user.id)}>Xóa</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
