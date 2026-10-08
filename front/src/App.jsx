import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("/api/hello")
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch(() => setMessage("Không kết nối được backend"));
  }, []);

  return (
    <div>
      <h1>Java DevOps Demo</h1>
      <p>Backend trả về:</p>
      <p>{message}</p>
    </div>
  );
}

export default App;