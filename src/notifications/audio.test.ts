import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Faux AudioContext : « suspended » tant qu'un geste n'a pas eu lieu (comme Safari), puis « running ».
class FakeCtx {
  static all: FakeCtx[] = [];
  state: "suspended" | "running" = "suspended";
  currentTime = 0;
  oscillators = 0;
  disconnected = 0;
  destination = {};
  private listeners = new Set<() => void>();
  constructor() { FakeCtx.all.push(this); }
  /** Safari : ne reveille que pendant un geste. */
  resume(): Promise<void> { if (gestureActive) { this.state = "running"; this.listeners.forEach((l) => l()); } return Promise.resolve(); }
  addEventListener(_: string, fn: () => void) { this.listeners.add(fn); }
  removeEventListener(_: string, fn: () => void) { this.listeners.delete(fn); }
  createGain() { const ctx = this; return { gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect(n: unknown) { return n; }, disconnect() { ctx.disconnected++; } }; }
  createOscillator() { const ctx = this; ctx.oscillators++; return { type: "sine", frequency: { value: 0 }, connect(n: unknown) { return n; }, start() {}, stop() {} }; }
}
let gestureActive = false;
const win = new EventTarget() as EventTarget & { AudioContext?: unknown };
/** Un geste de la personne : les écouteurs `pointerdown` s'exécutent PENDANT le geste. */
const gesture = (type = "pointerdown") => { gestureActive = true; win.dispatchEvent(new Event(type)); gestureActive = false; };
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  FakeCtx.all = [];
  gestureActive = false;
  win.AudioContext = FakeCtx;
  vi.stubGlobal("window", win);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("audio partagé", () => {
  it("préparé à l'ouverture : un clic fait AVANT toute notification suffit à débloquer le son", async () => {
    const { armAudioUnlock, sharedAudio } = await import("./audio");
    armAudioUnlock();
    expect(sharedAudio()!.ctx.state).toBe("suspended"); // aucun geste encore
    gesture();
    await flush();
    expect(sharedAudio()!.ctx.state).toBe("running");
    expect(FakeCtx.all.length).toBe(1); // un seul contexte pour toute la page
  });

  it("le carillon joue sans nouveau geste une fois la page débloquée (c'était le bug : silence sur Safari)", async () => {
    const { armAudioUnlock } = await import("./audio");
    const { playChime } = await import("./chime");
    armAudioUnlock();
    gesture("keydown");
    await flush();
    expect(playChime("message", "high")).toBe(true);
    expect(FakeCtx.all[0]!.oscillators).toBeGreaterThan(0);
  });

  it("avant tout geste, le carillon est abandonné (jamais rejoué en retard) mais le prochain geste débloque les suivants", async () => {
    const { armAudioUnlock } = await import("./audio");
    const { playChime } = await import("./chime");
    armAudioUnlock();
    expect(playChime("mail")).toBe(false);
    expect(FakeCtx.all[0]!.oscillators).toBe(0);
    gesture("touchstart");
    await flush();
    expect(playChime("mail")).toBe(true);
  });

  it("un contexte remis en pause par le navigateur se réarme au geste suivant", async () => {
    const { armAudioUnlock, sharedAudio } = await import("./audio");
    armAudioUnlock();
    gesture();
    await flush();
    const ctx = sharedAudio()!.ctx as unknown as FakeCtx;
    ctx.state = "suspended";
    (ctx as unknown as { listeners: Set<() => void> }).listeners.forEach((l) => l()); // statechange
    gesture();
    await flush();
    expect(ctx.state).toBe("running");
  });

  it("sans WebAudio : rien ne casse", async () => {
    win.AudioContext = undefined;
    const { armAudioUnlock, sharedAudio } = await import("./audio");
    const { playChime } = await import("./chime");
    const { startRingtone } = await import("./ringtone");
    expect(() => armAudioUnlock()).not.toThrow();
    expect(sharedAudio()).toBeNull();
    expect(playChime("message")).toBe(false);
    expect(() => startRingtone()()).not.toThrow();
  });
});

describe("sonnerie", () => {
  it("page déjà débloquée : sonne tout de suite, en boucle, et l'arrêt la coupe net", async () => {
    const { armAudioUnlock } = await import("./audio");
    const { startRingtone } = await import("./ringtone");
    armAudioUnlock();
    gesture();
    await flush();
    const stop = startRingtone();
    const ctx = FakeCtx.all[0]!;
    expect(ctx.oscillators).toBeGreaterThan(0);
    const first = ctx.oscillators;
    ctx.currentTime += 3.2;
    vi.advanceTimersByTime(3200);
    expect(ctx.oscillators).toBeGreaterThan(first); // un nouveau cycle
    stop();
    expect(ctx.disconnected).toBeGreaterThan(0); // son coupé tout de suite
    const after = ctx.oscillators;
    ctx.currentTime += 3.2;
    vi.advanceTimersByTime(6400);
    expect(ctx.oscillators).toBe(after); // plus de boucle
    expect(ctx.state).toBe("running"); // le contexte partagé reste ouvert pour les carillons
  });

  it("appel arrivé AVANT tout geste : silence d'abord, puis elle démarre dès le premier geste (sans attendre 3 s)", async () => {
    const { startRingtone } = await import("./ringtone");
    const stop = startRingtone();
    const ctx = FakeCtx.all[0]!;
    expect(ctx.oscillators).toBe(0);
    gesture();
    await flush();
    expect(ctx.oscillators).toBeGreaterThan(0);
    stop();
  });

  it("deux sonneries qui se suivent ne s'empilent pas, et ne créent qu'un seul contexte", async () => {
    const { armAudioUnlock } = await import("./audio");
    const { startRingtone } = await import("./ringtone");
    armAudioUnlock(); gesture(); await flush();
    startRingtone()();
    startRingtone()();
    expect(FakeCtx.all.length).toBe(1);
  });
});
