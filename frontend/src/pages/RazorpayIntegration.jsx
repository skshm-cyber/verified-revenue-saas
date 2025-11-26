import { useState } from "react";
import { connectRazorpay } from "../api";
import { useNavigate } from "react-router-dom";

export default function RazorpayIntegration() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("authToken") || "";
  const navigate = useNavigate();

  async function handleConnect(e) {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      await connectRazorpay(token, apiKey, apiSecret);
      setStatus("Razorpay keys saved & connection tested!");
      setTimeout(() => navigate("/integrations"), 1200);
    } catch (err) {
      setError("Razorpay connection failed: " + err.message);
    }
  }

  return (
    <form onSubmit={handleConnect} style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Connect Razorpay</h2>
      <input
        type="text"
        placeholder="Paste Razorpay API Key"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Paste Razorpay API Secret"
        value={apiSecret}
        onChange={e => setApiSecret(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button type="submit" style={{ width: "100%" }}>Save & Test Connection</button>
      {status && <div style={{ color: "green", marginTop: 8 }}>{status}</div>}
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}
