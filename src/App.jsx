import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { C, T, knop, FONT } from "./theme";
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
      .select("id, naam, rol, vestiging_id")
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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT }}>
      <div style={{ background: C.group, borderBottom: `3px solid ${C.accent}` }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "15px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div className="soma-balk-merk" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <img
              src={`${import.meta.env.BASE_URL}inlog/soma-logo-wit.png`}
              alt="SOMA Group"
              style={{ height: 22, display: "block", flexShrink: 0 }}
            />
            <div
              className="soma-balk-titel"
              style={{
                color: "rgba(255,255,255,.72)",
                fontSize: 10.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1.8,
                borderLeft: "1px solid rgba(255,255,255,.28)",
                paddingLeft: 14,
                lineHeight: 1.25,
              }}
            >
              100 dagen
              <br />
              onboarding
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="soma-balk-naam" style={{ color: "rgba(255,255,255,.8)", fontSize: 12.5, whiteSpace: "nowrap" }}>{gebruiker.naam}</span>
            <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,.35)",
              borderRadius: 3,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "7px 12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Uitloggen
            </button>
          </div>
        </div>
      </div>
      <Dashboard key={gebruiker.id} gebruiker={gebruiker} />
    </div>
  );
}

function UitloggenKnop() {
  return (
    <button
      onClick={() => supabase.auth.signOut()}
      data-knop="secundair"
      style={{ ...knop("secundair"), marginTop: 16 }}
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
        fontFamily: FONT,
        color: C.soft,
        fontSize: T.body,
      }}
    >
      {children}
    </div>
  );
}
