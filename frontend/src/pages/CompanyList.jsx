import { useEffect, useState } from "react";
import { getCompanies } from "../api";

export default function CompanyList({ token }) {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const data = await getCompanies(token);
        setCompanies(data.companies);
      } catch (err) {
        setError("Failed to fetch companies: " + err.message);
      }
    }
    if (token) fetchCompanies();
  }, [token]);

  if (!token) return <div>Please login to view companies.</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Companies</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {companies.map(c => (
          <li key={c.id}>{c.name} ({c.website})</li>
        ))}
      </ul>
    </div>
  );
}