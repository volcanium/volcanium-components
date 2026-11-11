// Sonnerie d'appel entrant, synthetisee (aucun fichier a heberger ni a charger) : « tulutu tulutu », petites notes de marimba, boucle de 3,2 s.
// Les navigateurs refusent de produire du son avant un geste de la personne : le contexte audio (partage, `audio.ts`) est prepare des l'ouverture de l'app
// et reveille au premier clic / a la premiere touche ; si la sonnerie demarre avant, elle se met a jouer des ce geste.

import { armAudioUnlock, sharedAudio } from "./audio";

const CYCLE_MS = 3200;
const STEP = 0.115;
// Deux motifs de trois notes, repetes une fois : sol-si-re puis la-do-mi.
const MOTIFS: ReadonlyArray<{ at: number; notes: readonly number[] }> = [
  { at: 0, notes: [783.99, 987.77, 1174.66] },
  { at: 0.42, notes: [783.99, 987.77, 1174.66] },
  { at: 1.0, notes: [880.0, 1046.5, 1318.51] },
  { at: 1.42, notes: [880.0, 1046.5, 1318.51] },
];

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
  const a = sharedAudio();
  if (!a) return () => undefined;
  const { ctx, master } = a;
  // Les notes passent par un gain propre a CETTE sonnerie : l'arreter la coupe net (le contexte, lui, est partage et reste ouvert).
  const out = ctx.createGain();
  out.connect(master);
  let stopped = false;
  let lastAt = -Infinity;
  const cycle = () => {
    if (stopped || ctx.state !== "running") return;
    const now = ctx.currentTime;
    if (now - lastAt < 0.5) return; // le reveil du contexte et la boucle ne doivent pas lancer deux fois le meme motif
    lastAt = now;
    const base = now + 0.05;
    for (const m of MOTIFS) m.notes.forEach((f, i) => note(ctx, out, f, base + m.at + i * STEP));
  };
  // Contexte pas encore reveille : il le sera au premier geste (`audio.ts`) ; la sonnerie demarre alors tout de suite, sans attendre la boucle suivante.
  const onState = () => { if (ctx.state === "running") cycle(); };
  ctx.addEventListener?.("statechange", onState);
  armAudioUnlock();
  cycle();
  const timer = setInterval(cycle, CYCLE_MS);
  return () => {
    stopped = true;
    clearInterval(timer);
    ctx.removeEventListener?.("statechange", onState);
    try { out.disconnect(); } catch { /* deja deconnecte */ }
  };
}
