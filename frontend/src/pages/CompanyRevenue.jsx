import { useState } from "react";
import { getCompanyMRR } from "../api";

export default function CompanyRevenue() {
  const [companyId, setCompanyId] = useState("");
  const [mrrHistory, setMrrHistory] = useState([]);
  const [error, setError] = useState("");

  async function handleFetch() {
    setError("");
    setMrrHistory([]);
    try {
      const data = await getCompanyMRR("", companyId); // token optional for now
      setMrrHistory(data.mrr_history || []);
    } catch (err) {
      setError("Failed to fetch MRR: " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Company Revenue (MRR)</h2>
      <input
        type="text"
        placeholder="Company ID"
        value={companyId}
        onChange={e => setCompanyId(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={handleFetch} style={{ width: "100%", marginBottom: 16 }}>
        Fetch Revenue History
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {mrrHistory.length > 0 && (
        <ul>
          {mrrHistory.map((r, i) => (
            <li key={i}>
              {r.date}: <strong>${r.mrr}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}