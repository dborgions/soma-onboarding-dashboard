import { useState } from "react";
import { supabase } from "./supabaseClient";

const BASE = import.meta.env.BASE_URL;
const FOTO = `${BASE}inlog/lasser.jpg`;
const LOGO = `${BASE}inlog/soma-logo-wit.png`;

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
    <div className="inlog-wrap">
      <style>{`
        .inlog-wrap {
          position: fixed; inset: 0; overflow-y: auto; overflow-x: hidden;
          background: #11142e url('${FOTO}') 62% center / cover no-repeat;
          font-family: 'Mozilla Text','Segoe UI',system-ui,-apple-system,sans-serif;
        }
        .inlog-overlay {
          min-height: 100%; box-sizing: border-box;
          display: flex; align-items: center; padding: 48px 7vw;
          background: linear-gradient(100deg,
            rgba(23,26,64,.97) 0%,
            rgba(23,26,64,.93) 30%,
            rgba(20,23,56,.62) 60%,
            rgba(20,23,56,.30) 100%);
        }
        .inlog-grid {
          width: 100%; max-width: 1240px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 390px; gap: 72px; align-items: center;
        }
        .inlog-kop { display: flex; align-items: center; gap: 14px; margin-bottom: 42px; flex-wrap: wrap; }
        .inlog-logo { height: 30px; display: block; }
        .inlog-kicker {
          color: #f18825; font-size: 12px; font-weight: 700;
          letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px;
        }
        .inlog-titel {
          color: #fff; font-weight: 700; text-transform: uppercase;
          font-size: 62px; line-height: .96; letter-spacing: -.5px; margin: 0;
        }
        .inlog-titel span { display: block; color: rgba(255,255,255,.55); }
        .inlog-quote {
          margin-top: 34px; padding-left: 18px; border-left: 3px solid #f18825;
          color: #fff; font-size: 17px; line-height: 1.5; max-width: 470px; font-weight: 300;
        }
        .inlog-quote b { font-weight: 700; }
        .inlog-kaart {
          background: #fff; border-radius: 4px; padding: 34px 32px 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,.42); position: relative;
        }
        .inlog-kaart::before {
          content: ''; position: absolute; top: 0; right: 0;
          border-width: 0 26px 26px 0; border-style: solid;
          border-color: transparent #f18825 transparent transparent;
        }
        .inlog-kaart h2 {
          margin: 0 0 4px; font-size: 20px; font-weight: 700;
          color: #2c2f7b; text-transform: uppercase; letter-spacing: .4px;
        }
        .inlog-kaart p.sub { margin: 0 0 24px; font-size: 13px; color: #6b7280; font-weight: 300; }
        .inlog-label {
          display: block; font-size: 11px; font-weight: 700; color: #2c2f7b;
          text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 6px;
        }
        .inlog-veld {
          width: 100%; box-sizing: border-box; padding: 12px 13px; font-size: 16px;
          border: 1px solid #d8dde8; border-radius: 3px; background: #fbfcfe;
          margin-bottom: 18px; font-family: inherit; color: #22263a; outline: none;
        }
        .inlog-veld:focus { border-color: #3b73ad; background: #fff; }
        .inlog-knop {
          width: 100%; padding: 14px 0; border: none; border-radius: 3px;
          background: #f18825; color: #fff; font-size: 15px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.2px; cursor: pointer;
          font-family: inherit; transition: background .15s;
        }
        .inlog-knop:hover:enabled { background: #d9741a; }
        .inlog-knop:disabled { opacity: .65; cursor: default; }
        .inlog-fout { color: #c0392b; font-size: 13px; margin: 0 0 14px; }
        .inlog-voet {
          margin-top: 20px; padding-top: 16px; border-top: 1px solid #eceff5;
          font-size: 12px; color: #8a90a2; line-height: 1.6; font-weight: 300;
        }
        .inlog-credit {
          position: fixed; right: 14px; bottom: 10px;
          color: rgba(255,255,255,.45); font-size: 10px; letter-spacing: .6px;
        }
        @media (max-width: 980px) {
          .inlog-overlay {
            padding: 36px 24px;
            background: linear-gradient(170deg, rgba(23,26,64,.86) 0%, rgba(20,23,56,.72) 45%, rgba(20,23,56,.88) 100%);
          }
          .inlog-grid { grid-template-columns: 1fr; gap: 28px; max-width: 100%; }
          .inlog-titel { font-size: 38px; }
          .inlog-logo { height: 24px; }
          .inlog-kop { margin-bottom: 28px; }
          .inlog-quote { font-size: 15px; margin-top: 24px; }
        }
      `}</style>

      <div className="inlog-overlay">
        <div className="inlog-grid">
          <div>
            <div className="inlog-kop">
              <img className="inlog-logo" src={LOGO} alt="SOMA Group" />
            </div>
            <div className="inlog-kicker">De weg naar succes</div>
            <h1 className="inlog-titel">100 dagen<span>onboarding</span></h1>
            <div className="inlog-quote">
              De enige die verantwoordelijk is voor jouw succes, <b>ben jij zelf</b>.
              Elke dag eentje meer, kort op de bal, en bellen.
            </div>
          </div>

          <form className="inlog-kaart" onSubmit={inloggen}>
            <h2>Inloggen</h2>
            <p className="sub">Jouw scorebord voor de eerste 100 dagen.</p>

            <label className="inlog-label" htmlFor="inlog-mail">Mailadres</label>
            <input
              id="inlog-mail"
              className="inlog-veld"
              type="email"
              required
              autoComplete="username"
              placeholder="voornaam@somaworks.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="inlog-label" htmlFor="inlog-ww">Wachtwoord</label>
            <input
              id="inlog-ww"
              className="inlog-veld"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
            />

            {fout && <p className="inlog-fout">{fout}</p>}

            <button className="inlog-knop" type="submit" disabled={bezig}>
              {bezig ? "Bezig..." : "Inloggen"}
            </button>

            <div className="inlog-voet">
              Nog geen toegang of wachtwoord kwijt? Neem contact op met Dave.
            </div>
          </form>
        </div>
      </div>
      <div className="inlog-credit">Foto: Stan Keulen</div>
    </div>
  );
}
