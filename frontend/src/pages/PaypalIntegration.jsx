import { useState } from "react";
import { connectPaypal } from "../api";
import { useNavigate } from "react-router-dom";

export default function PaypalIntegration() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("authToken") || "";
  const navigate = useNavigate();

  async function handleConnect(e) {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      await connectPaypal(token, clientId, clientSecret);
      setStatus("PayPal keys saved & connection tested!");
      setTimeout(() => navigate("/integrations"), 1200);
    } catch (err) {
      setError("PayPal connection failed: " + err.message);
    }
  }

  return (
    <form onSubmit={handleConnect} style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Connect PayPal</h2>
      <input
        type="text"
        placeholder="Paste PayPal Client ID"
        value={clientId}
        onChange={e => setClientId(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Paste PayPal Client Secret"
        value={clientSecret}
        onChange={e => setClientSecret(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button type="submit" style={{ width: "100%" }}>Save & Test Connection</button>
      {status && <div style={{ color: "green", marginTop: 8 }}>{status}</div>}
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}
