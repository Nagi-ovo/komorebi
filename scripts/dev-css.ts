/**
 * Prints a compact `:root { … !important }` override block for one
 * (mode, contrast) pair — used to preview color choices on a live github.com
 * tab via adoptedStyleSheets (which bypasses GitHub's CSP). Dev-only.
 *
 *   bun run scripts/dev-css.ts dark hard
 */
import { resolve, type Mode, type Contrast } from "../src/palette";
import { buildTokens } from "../src/mapping";

const mode = (process.argv[2] ?? "light") as Mode;
const contrast = (process.argv[3] ?? "medium") as Contrast;

const tokens = buildTokens(resolve(mode, contrast));
const body = Object.entries(tokens).map(([k, v]) => `${k}:${v}!important`).join(";");
process.stdout.write(`:root{color-scheme:${mode};${body}}`);
