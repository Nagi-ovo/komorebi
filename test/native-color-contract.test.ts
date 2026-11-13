import { expect, test } from "bun:test";

const grok = await Bun.file(`${import.meta.dir}/../src/grok.css`).text();
const content = await Bun.file(`${import.meta.dir}/../src/content.ts`).text();
const drive = await Bun.file(`${import.meta.dir}/../src/drive.css`).text();

function declarations(css: string): Map<string, string> {
  return new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+)/g)]
    .map(m => [m[1]!, m[2]!.replace(/\s*!important$/, "").trim()]));
}

function resolve(value: string, tokens: Map<string, string>, depth = 0): string {
  if (depth > 12) throw new Error("Circular color token");
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    const replacement = tokens.get(name);
    if (!replacement) throw new Error(`Missing color token ${name}`);
    return resolve(replacement, tokens, depth + 1);
  });
}

test("Grok native utilities receive complete colors, including the late hydration sheet", () => {
  const constants = content.match(/const GROK_PAGE_SEL =[\s\S]*?(?=\nfunction syncGrokPageStyle)/)![0];
  const lateSheet: string = new Function(`${constants};return GROK_PAGE_CSS`)();
  for (const css of [grok, `${grok}\n${lateSheet}`]) {
    const tokens = declarations(css);
    // Native utilities use background-color/color: var(--token), without hsl().
    for (const name of ["surface-base", "surface-l1", "surface-elevated", "surface-composer", "surface-user-bubble", "fg-primary", "fg-secondary", "fg-link", "accent"]) {
      const color = resolve(tokens.get(`--${name}`)!, tokens);
      expect(color, `--${name} must be usable directly as a CSS color`).toMatch(/^(#[\da-f]{6}|hsl\([\d.]+ [\d.]+% [\d.]+%\))$/i);
    }
    // Legacy sidebar utilities still wrap their values in hsl().
    expect(resolve(tokens.get("--sidebar-background")!, tokens)).toMatch(/^[\d.]+ [\d.]+% [\d.]+%$/);
  }
});

test("Drive opacity state layers match full colors in light, dark, and system palettes", () => {
  const palettes = [...drive.matchAll(/html[^{}]+\{([^{}]+)\}/g)]
    .map(m => m[1]!).filter(block => block.includes("--ef-surface-rgb:"));
  expect(palettes).toHaveLength(3);
  for (const palette of palettes) {
    const tokens = declarations(palette);
    for (const [name, components] of tokens) {
      if (!name.endsWith("-rgb")) continue;
      const hex = tokens.get(name.slice(0, -4))!;
      const expected = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
      expect(components.split(",").map(Number), name).toEqual(expected);
    }
  }
});
