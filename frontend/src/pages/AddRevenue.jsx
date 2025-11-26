import { useState } from "react";
import { addRevenue } from "../api";

export default function AddRevenue({ token }) {
  const [companyId, setCompanyId] = useState("");
  const [mrr, setMrr] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      await addRevenue(token, companyId, mrr);
      setSuccess(true);
    } catch (err) {
      setError("Failed to add revenue: " + err.message);
    }
  }

  if (!token) return <div>Please login to add revenue.</div>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "40px auto" }}>
      <h2>Add Revenue</h2>
      <input
        type="text"
        placeholder="Company ID"
        value={companyId}
        onChange={e => setCompanyId(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        placeholder="MRR"
        value={mrr}
        onChange={e => setMrr(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button type="submit" style={{ width: "100%" }}>Add Revenue</button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: 8 }}>Revenue added!</div>}
    </form>
  );
}