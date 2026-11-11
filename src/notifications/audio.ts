// Contexte audio PARTAGE par la sonnerie et le carillon, prepare des l'ouverture de l'app (et non a l'arrivee de la premiere notification).
// Pourquoi : les navigateurs, Safari en tete, ne laissent un contexte audio produire du son que s'il a ete « reveille » pendant un geste de la personne
// (clic, touche, toucher). Si on ne le prepare qu'au moment ou la notification arrive, aucun geste ne l'a reveille : silence, et les clics faits AVANT
// ne servent a rien. Prepare des l'ouverture, le premier clic ou la premiere touche faits n'importe ou dans la page le debloque pour toute la vie de
// la page ; un contexte que le navigateur remet en pause (onglet longtemps cache, appel telephonique...) se rearme tout seul au geste suivant.

type AudioCtor = typeof AudioContext;
export interface SharedAudio { ctx: AudioContext; master: GainNode }

let shared: SharedAudio | null = null;
let listening = false;
const GESTURES = ["pointerdown", "keydown", "touchstart"] as const;

/** Le contexte partage (cree a la demande), ou `null` sans WebAudio. Ne leve jamais d'erreur. */
export function sharedAudio(): SharedAudio | null {
  if (shared) return shared;
  if (typeof window === "undefined") return null;
  const Ctor: AudioCtor | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    shared = { ctx, master };
    // Remis en pause par le navigateur (ou jamais demarre) : on re-ecoute le prochain geste.
    ctx.addEventListener?.("statechange", () => { if (ctx.state !== "running") armGestureUnlock(ctx); });
    return shared;
  } catch {
    return null;
  }
}

function armGestureUnlock(ctx: AudioContext): void {
  if (listening || typeof window === "undefined") return;
  listening = true;
  const onGesture = () => {
    void ctx.resume().then(() => {
      if (ctx.state === "running") { for (const e of GESTURES) window.removeEventListener(e, onGesture, true); listening = false; }
    }).catch(() => undefined);
  };
  for (const e of GESTURES) window.addEventListener(e, onGesture, true);
}

/** A appeler a l'ouverture de l'app : le premier geste de la personne debloque le son pour toutes les notifications a venir. Idempotent. */
export function armAudioUnlock(): void {
  const a = sharedAudio();
  if (!a) return;
  if (a.ctx.state !== "running") {
    armGestureUnlock(a.ctx);
    void a.ctx.resume().catch(() => undefined); // reussit tout de suite si la page a deja eu une interaction (Chrome)
  }
}

/** Pour les tests : oublie le contexte partage. */
export function _resetAudioForTests(): void { shared = null; listening = false; }
