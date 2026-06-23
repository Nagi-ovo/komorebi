# Publishing

After a one-time setup, releasing is just: **push a version tag** → GitHub
Actions builds, zips and publishes to the Chrome Web Store automatically
(`.github/workflows/publish.yml`).

## One-time setup

You do these once. They involve secrets, so they're hands-on (not scriptable
away safely).

1. **Enable the API** — in [Google Cloud Console](https://console.cloud.google.com/apis/library/chromewebstore.googleapis.com),
   enable the **Chrome Web Store API** for any project. _(Already done.)_

2. **Create an OAuth client** — APIs & Services → **Credentials** → _Create
   credentials_ → _OAuth client ID_ → application type **Desktop app**. Copy the
   **Client ID** and **Client secret**.

3. **Mint a refresh token** — run locally; it prints the token and never sends
   your secrets anywhere but Google. Point it at the JSON you downloaded when
   creating the client:

   ```sh
   bun run scripts/cws-refresh-token.ts ~/Downloads/client_secret_*.json
   ```

   Approve the consent page that opens, then copy the printed refresh token.

4. **Find the extension ID** — the 32-char id in your item's URL on the
   [Web Store dev dashboard](https://chrome.google.com/webstore/devconsole).

5. **Add four repo secrets** — GitHub → repo **Settings → Secrets and variables
   → Actions → New repository secret**:

   | Secret               | Value                       |
   | -------------------- | --------------------------- |
   | `CWS_EXTENSION_ID`   | the extension ID (step 4)   |
   | `CWS_CLIENT_ID`      | client ID (step 2)          |
   | `CWS_CLIENT_SECRET`  | client secret (step 2)      |
   | `CWS_REFRESH_TOKEN`  | refresh token (step 3)      |

## Releasing (every time after that)

```sh
# bump "version" in package.json + manifest.json, commit, then:
git tag v0.7.1
git push origin v0.7.1
```

The workflow uploads the new build and publishes it. You can also trigger it
by hand from the repo's **Actions** tab (workflow_dispatch).
