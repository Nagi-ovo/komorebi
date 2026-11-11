import { describe, expect, test } from "bun:test";
import { buildTokens } from "../src/mapping";
import { resolve } from "../src/palette";

function luminance(color: string): number {
  let rgb: number[];
  if (color.startsWith("#")) {
    rgb = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255);
  } else {
    const [h, s, l] = color.match(/[\d.]+/g)!.map(Number);
    const saturation = s! / 100, lightness = l! / 100;
    const a = saturation * Math.min(lightness, 1 - lightness);
    rgb = [0, 8, 4].map(n => {
      const k = (n + h! / 30) % 12;
      return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    });
  }
  return rgb.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i]!, 0);
}

function contrast(fg: string, bg: string): number {
  const a = luminance(fg), b = luminance(bg);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

const adapters = [
  ["arxiv", "ef-fg", "ef-muted", "ef-bg"],
  ["bilibili", "ef-t1", "ef-t2", "ef-bg1"],
  ["chatgpt", "ef-fg", "ef-fg2", "ef-canvas"],
  ["claude", "efc-tprimary", "efc-tsec", "efc-s1"],
  ["cloudflare", "ef-fg", "ef-fg2", "ef-page"],
  ["docs", "ef-fg", "ef-fg-sec", "ef-page"],
  ["drive", "ef-fg", "ef-fg-sec", "ef-page"],
  ["gemini", "ef-on", "ef-on-var", "ef-surface"],
  ["gmail", "ef-fg", "ef-fg2", "ef-page"],
  ["google", "ef-fg", "ef-muted", "ef-bg"],
  ["grok", "eft-fg", "eft-fg2", "eft-bg"],
  ["outlook", "ef-fg1", "ef-fg2", "ef-s2"],
  ["x", "ef-fg", "ef-muted", "ef-bg"],
  ["youtube", "ef-fg1", "ef-fg2", "ef-s1"],
] as const;

describe("semantic reading contrast", () => {
  test("measures known contrast pairs correctly", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrast("#708089", "#fdf6e3")).toBeLessThan(4.5);
    expect(contrast("#5b696e", "#fdf6e3")).toBeGreaterThan(4.5);
  });

  for (const [site, primary, secondary, background] of adapters) {
    test(`${site} keeps primary and secondary reading text above 4.5 in both modes`, async () => {
      const css = await Bun.file(`${import.meta.dir}/../src/${site}.css`).text();
      const values = (token: string) => [...css.matchAll(new RegExp(`--${token}:\\s*([^;]+);`, "g"))]
        .map(m => m[1]!.trim());
      for (const index of [0, 1]) {
        const bg = values(background)[index]!;
        expect(bg).toBeDefined();
        expect(contrast(values(primary)[index]!, bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(values(secondary)[index]!, bg)).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test.each(["light", "dark"] as const)("GitHub %s text stays readable without changing upstream colors", mode => {
    const palette = resolve(mode, "medium");
    const tokens = buildTokens(palette);
    for (const role of ["--fgColor-default", "--fgColor-muted"]) {
      for (const bg of ["--bgColor-default", "--bgColor-muted"]) {
        expect(contrast(tokens[role]!, tokens[bg]!)).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(tokens["--color-ansi-white"]).toBe(palette.grey2);
    expect(palette.fg).toBe(mode === "light" ? "#5c6a72" : "#d3c6aa");
  });
});
