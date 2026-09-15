import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { C } from "./theme";
import LoginScreen from "./LoginScreen.jsx";
import Dashboard from "./Dashboard.jsx";

export default function App() {
  const [sessie, setSessie] = useState(undefined); // undefined = nog aan het laden
  const [gebruiker, setGebruiker] = useState(null);
  const [foutGebruiker, setFoutGebruiker] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessie(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessie(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessie) {
      setGebruiker(null);
      return;
    }
    let actief = true;
    supabase
      .from("gebruikers")
      .select("naam, rol, vestiging_id")
      .eq("id", sessie.user.id)
      .single()
      .then(({ data, error }) => {
        if (!actief) return;
        if (error) {
          setFoutGebruiker(
            "Je account bestaat in Supabase Auth, maar er is geen bijbehorende rij in de tabel 'gebruikers'. Vraag de beheerder dit aan te maken."
          );
        } else {
          setGebruiker(data);
        }
      });
    return () => {
      actief = false;
    };
  }, [sessie]);

  if (sessie === undefined) {
    return <VolledigScherm>Laden...</VolledigScherm>;
  }

  if (!sessie) {
    return <LoginScreen />;
  }

  if (foutGebruiker) {
    return (
      <VolledigScherm>
        <div style={{ maxWidth: 320, textAlign: "center" }}>
          <p style={{ color: C.error }}>{foutGebruiker}</p>
          <UitloggenKnop />
        </div>
      </VolledigScherm>
    );
  }

  if (!gebruiker) {
    return <VolledigScherm>Laden...</VolledigScherm>;
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "12px 16px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: C.group, fontWeight: 700 }}>SOMA</span>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: C.soft, fontSize: 13, cursor: "pointer" }}>
          Uitloggen ({gebruiker.naam})
        </button>
      </div>
      <Dashboard gebruiker={gebruiker} />
    </div>
  );
}

function UitloggenKnop() {
  return (
    <button
      onClick={() => supabase.auth.signOut()}
      style={{
        marginTop: 16,
        padding: "10px 20px",
        borderRadius: 10,
        border: `1px solid ${C.line}`,
        background: "#fff",
        color: C.soft,
        cursor: "pointer",
      }}
    >
      Uitloggen
    </button>
  );
}

function VolledigScherm({ children }) {
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
      {children}
    </div>
  );
}
