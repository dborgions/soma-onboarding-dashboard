// Klein feestgeluidje, opgebouwd met de Web Audio API — geen audiobestand nodig.
export function speelFeestGeluid() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const noten = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    noten.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Geluid is leuk maar niet essentieel; stil falen als de browser het niet toestaat.
  }
}
