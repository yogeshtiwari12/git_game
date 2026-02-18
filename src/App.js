import { useState } from "react";
import axios from "axios";
import Heatmap from "./component/Heatmap3D";
import { url } from "./component/url";

export default function App() {
  const currentYear = new Date().getFullYear();

  const [username, setUsername] = useState("");
  const [year, setYear] = useState(currentYear);
  const [calendar, setCalendar] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const uname = username.trim();
    if (!uname) {
      setError("Please enter a GitHub username.");
      setCalendar(null);
      return;
    }

    setError("");

    try {
      const res = await axios.get(
        `${url}/contributions/${uname}/${year}`
      );
      setCalendar(res.data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError("Request not found or invalid. Check username and backend.");
      } else if (status === 500) {
        setError("Server error fetching contributions. Verify backend and GITHUB_TOKEN.");
      } else {
        setError("Failed to fetch contributions. Check connection and try again.");
      }
      setCalendar(null);
    }
  };

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", padding: "30px" }}>
      <h1 style={{ color: "white" }}>GitHub Contribution Heatmap</h1>

      <input
        placeholder="GitHub Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "8px", marginRight: "10px" }}
      />

      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        style={{ padding: "8px", marginRight: "10px" }}
      >
        {[2026, 2025, 2024, 2023, 2022].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <button onClick={fetchData} disabled={!username.trim()} style={{ padding: "8px" }}>
        Search
      </button>

      {error && (
        <div style={{ color: "#f85149", marginTop: "10px" }}>{error}</div>
      )}

      {calendar && <Heatmap calendar={calendar} />}
    </div>
  );
}
