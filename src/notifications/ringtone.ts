// Sonnerie d'appel entrant, synthetisee (aucun fichier a heberger ni a charger) : « tulutu tulutu », petites notes de marimba, boucle de 3,2 s.
// Les navigateurs refusent de produire du son avant un geste de la personne : tant que c'est le cas, on attend le premier clic / la premiere touche.

const CYCLE_MS = 3200;
const STEP = 0.115;
// Deux motifs de trois notes, repetes une fois : sol-si-re puis la-do-mi.
const MOTIFS: ReadonlyArray<{ at: number; notes: readonly number[] }> = [
  { at: 0, notes: [783.99, 987.77, 1174.66] },
  { at: 0.42, notes: [783.99, 987.77, 1174.66] },
  { at: 1.0, notes: [880.0, 1046.5, 1318.51] },
  { at: 1.42, notes: [880.0, 1046.5, 1318.51] },
];

type AudioCtor = typeof AudioContext;

function note(ctx: AudioContext, out: AudioNode, freq: number, when: number): void {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.22, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.38);
  gain.connect(out);
  // Fondamentale + quatrieme partiel qui s'eteint vite : le « toc » du bois d'un marimba.
  for (const [mult, level, life] of [[1, 1, 0.4], [4, 0.28, 0.08]] as const) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    g.gain.setValueAtTime(level, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + life);
    osc.connect(g).connect(gain);
    osc.start(when);
    osc.stop(when + life + 0.05);
  }
}

/** Lance la sonnerie en boucle ; renvoie la fonction qui l'arrete. Ne leve jamais d'erreur (navigateur sans WebAudio = silence). */
export function startRingtone(): () => void {
  const Ctor: AudioCtor | undefined = typeof window === "undefined" ? undefined : window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
  if (!Ctor) return () => undefined;
  let ctx: AudioContext;
  let master: GainNode;
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  } catch {
    return () => undefined;
  }
  let stopped = false;
  const cycle = () => {
    if (stopped || ctx.state !== "running") return;
    const base = ctx.currentTime + 0.05;
    for (const m of MOTIFS) m.notes.forEach((f, i) => note(ctx, master, f, base + m.at + i * STEP));
  };
  const resume = () => { void ctx.resume().then(() => { if (!stopped && ctx.state === "running") unlock(); }).catch(() => undefined); };
  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const unlock = () => { for (const e of events) window.removeEventListener(e, onGesture, true); };
  let started = false;
  const onGesture = () => { resume(); if (!started && !stopped) { started = true; setTimeout(cycle, 120); } };
  for (const e of events) window.addEventListener(e, onGesture, true);
  void ctx.resume().then(() => { if (!stopped && ctx.state === "running") { started = true; cycle(); } }).catch(() => undefined);
  const timer = setInterval(cycle, CYCLE_MS);
  return () => {
    stopped = true;
    clearInterval(timer);
    unlock();
    void ctx.close().catch(() => undefined);
  };
}
