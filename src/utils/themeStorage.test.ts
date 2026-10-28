import { describe, expect, it } from "vitest";
import { parseThemeCookie, serializeThemeCookie, themeCookieDomain } from "./themeStorage";

describe("themeStorage", () => {
  it("domaine du cookie : le domaine parent, rien en local", () => {
    expect(themeCookieDomain("compte.volcanium.eu")).toBe(".volcanium.eu");
    expect(themeCookieDomain("api.entreprise.volcanium.eu")).toBe(".volcanium.eu");
    expect(themeCookieDomain("volcanium.eu")).toBe(".volcanium.eu");
    expect(themeCookieDomain("volcanium-studio.com")).toBe(".volcanium-studio.com");
    expect(themeCookieDomain("localhost")).toBeUndefined();
    expect(themeCookieDomain("127.0.0.1")).toBeUndefined();
    expect(themeCookieDomain("::1")).toBeUndefined();
  });

  it("lit le cookie parmi d'autres, ignore une valeur inconnue", () => {
    expect(parseThemeCookie("a=1; volcanium-theme=light; b=2")).toBe("light");
    expect(parseThemeCookie("volcanium-theme=dark")).toBe("dark");
    expect(parseThemeCookie("volcanium-theme=blue")).toBeUndefined();
    expect(parseThemeCookie("autre=light")).toBeUndefined();
    expect(parseThemeCookie("")).toBeUndefined();
  });

  it("ecrit un cookie partage entre sous-domaines, Secure en https seulement", () => {
    const prod = serializeThemeCookie("light", { hostname: "mail.volcanium.eu", protocol: "https:" });
    expect(prod).toBe("volcanium-theme=light; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.volcanium.eu; Secure");
    const dev = serializeThemeCookie("dark", { hostname: "localhost", protocol: "http:" });
    expect(dev).toBe("volcanium-theme=dark; Path=/; Max-Age=31536000; SameSite=Lax");
    expect(serializeThemeCookie("dark", { hostname: "mail.volcanium.eu", protocol: "https:" }, undefined, false)).not.toContain("Domain");
  });
});
