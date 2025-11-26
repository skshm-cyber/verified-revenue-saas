import { Link } from "react-router-dom";

export default function Integrations() {
  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Integrations</h2>
      <ul>
        <li><Link to="/integrations/stripe">Connect Stripe</Link></li>
        <li><Link to="/integrations/razorpay">Connect Razorpay</Link></li>
        <li><Link to="/integrations/paypal">Connect PayPal</Link></li>
      </ul>
    </div>
  );
}
