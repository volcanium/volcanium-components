// Petits sons des notifications qui ne sont pas des appels, synthetises (WebAudio, aucun fichier, aucun droit tiers). Tous durent moins de 0,5 s.
//   message : « pop » a deux notes montantes · mail : « ding » cristallin (une note + harmonique) · autre : deux notes douces descendantes.
// `priority: "high"` (mention, message direct) = un peu plus marque : volume +, courte note en plus.
// Les navigateurs refusent le son avant un geste de la personne : si c'est le cas on ne joue RIEN (un son joue en retard serait perime) ;
// le contexte (partage, `audio.ts`) est prepare des l'ouverture de l'app et reveille au premier clic / a la premiere touche.

import { armAudioUnlock, sharedAudio } from "./audio";

export type ChimeTimbre = "message" | "mail" | "other";

/** Timbre associe a un `kind` de notification. */
export function chimeTimbreFor(kind: string): ChimeTimbre {
  return kind === "message" ? "message" : kind === "mail" ? "mail" : "other";
}

/** Une note : fondamentale + partiels (`[multiplicateur, niveau, duree relative]`), attaque 8 ms puis extinction exponentielle. */
function tone(ctx: AudioContext, out: AudioNode, freq: number, when: number, life: number, level: number, partials: ReadonlyArray<readonly [number, number, number]>, type: OscillatorType = "sine"): void {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(level, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + life);
  gain.connect(out);
  for (const [mult, lv, rel] of partials) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = mult === 1 ? type : "sine";
    osc.frequency.value = freq * mult;
    g.gain.setValueAtTime(lv, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + life * rel);
    osc.connect(g).connect(gain);
    osc.start(when);
    osc.stop(when + life * rel + 0.03);
  }
}

const POP = [[1, 1, 1], [2, 0.18, 0.5]] as const;
const BELL = [[1, 1, 1], [2.76, 0.3, 0.55], [5.4, 0.1, 0.25]] as const;
const SOFT = [[1, 1, 1], [3, 0.08, 0.4]] as const;

/**
 * Joue le petit son d'une notification (< 0,5 s). Ne leve jamais d'erreur. Renvoie `true` si le son a ete lance,
 * `false` s'il est ignore (pas de WebAudio, ou aucun geste de la personne depuis l'ouverture de la page : on ne le rejoue pas plus tard).
 */
export function playChime(timbre: ChimeTimbre, priority: "normal" | "high" = "normal"): boolean {
  const a = sharedAudio();
  if (!a) return false;
  const { ctx, master } = a;
  if (ctx.state !== "running") {
    armAudioUnlock(); // pas encore debloque (aucun geste depuis l'ouverture) : ce son-ci est abandonne, le prochain geste debloquera les suivants
    return false;
  }
  try {
    const hi = priority === "high";
    const v = hi ? 1.25 : 1;
    const t0 = ctx.currentTime + 0.02;
    if (timbre === "message") {
      tone(ctx, master, 659.25, t0, 0.16, 0.2 * v, POP, "triangle");        // mi5
      tone(ctx, master, 880, t0 + 0.09, 0.2, 0.2 * v, POP, "triangle");      // la5
      if (hi) tone(ctx, master, 1174.66, t0 + 0.18, 0.22, 0.17 * v, POP, "triangle"); // re6
    } else if (timbre === "mail") {
      tone(ctx, master, 1318.51, t0, 0.45, 0.16 * v, BELL);                  // mi6 + harmoniques
      if (hi) tone(ctx, master, 1975.53, t0 + 0.11, 0.34, 0.1 * v, BELL);    // si6, discret
    } else {
      tone(ctx, master, 783.99, t0, 0.2, 0.18 * v, SOFT);                    // sol5
      tone(ctx, master, 587.33, t0 + 0.12, 0.26, 0.18 * v, SOFT);            // re5
      if (hi) tone(ctx, master, 440, t0 + 0.24, 0.24, 0.15 * v, SOFT);       // la4
    }
    return true;
  } catch {
    return false;
  }
}
