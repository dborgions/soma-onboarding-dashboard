import { useState } from "react";
import { supabase } from "./supabaseClient";
import { C } from "./theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  async function inloggen(e) {
    e.preventDefault();
    setFout("");
    setBezig(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    });
    setBezig(false);
    if (error) {
      setFout("Inloggen mislukt: e-mail of wachtwoord klopt niet.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <form
        onSubmit={inloggen}
        style={{
          width: "100%",
          maxWidth: 360,
          background: C.card,
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ color: C.group, fontWeight: 700, fontSize: 22 }}>SOMA</div>
          <div style={{ color: C.soft, fontSize: 14 }}>Onboarding dashboard</div>
        </div>

        <label style={{ display: "block", fontSize: 13, color: C.soft, marginBottom: 4 }}>
          E-mailadres
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: "block", fontSize: 13, color: C.soft, margin: "16px 0 4px" }}>
          Wachtwoord
        </label>
        <input
          type="password"
          required
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          style={inputStyle}
        />

        {fout && (
          <div style={{ color: C.error, fontSize: 13, marginTop: 12 }}>{fout}</div>
        )}

        <button
          type="submit"
          disabled={bezig}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background: C.works,
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            cursor: bezig ? "default" : "pointer",
            opacity: bezig ? 0.7 : 1,
          }}
        >
          {bezig ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #e3e7ee",
  fontSize: 16,
};
