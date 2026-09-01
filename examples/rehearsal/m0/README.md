# Rehearsal M0 — Solari Surface Validation

M0 proves that Rehearsal can reach all three Solari execution surfaces with the same `SOLARI_API_KEY`:

- **Browser** — launch a real cloud browser, navigate, inspect the page, and release the session.
- **Sandbox** — create an isolated microVM, run code, round-trip a file, and destroy the VM.
- **Desktop** — create a GUI VM, open Mousepad, click/type, take a screenshot, and destroy the session.

These smoke tests intentionally do not contain any Rehearsal safety logic yet. Their only job is to validate the execution substrate before M1 starts.

## 1. Configure the API key

Use the same Solari key for every surface.

macOS/Linux:

```bash
export SOLARI_API_KEY=slr_live_...
```

PowerShell:

```powershell
$env:SOLARI_API_KEY="slr_live_..."
```

Do not commit a real API key. `.env.example` contains only a placeholder.

## 2. Browser smoke test

```bash
cd examples/rehearsal/m0
npm install
npm run browser
```

Expected result includes:

```text
[browser] PASS
[browser] title: Example Domain
```

The script releases the browser in `finally` and also closes the Solari client so Node exits cleanly.

## 3. Sandbox smoke test

From the same directory:

```bash
npm run sandbox
```

Expected result includes:

```text
[sandbox] PASS
[sandbox] python result: 5050
```

The test executes Python inside the remote VM, writes `/tmp/rehearsal-m0.txt`, reads it back, and destroys the sandbox in `finally`.

## 4. Desktop smoke test

Create/activate a Python virtual environment if desired, then:

```bash
pip install -r requirements.txt
python desktop.py
```

Expected result includes:

```text
[desktop] PASS
```

The script waits for the desktop to become healthy, opens Mousepad, types a short message, saves a screenshot locally as `desktop-smoke.png`, then destroys the remote desktop session.

## Exit criteria

M0 is runtime-complete only after all three commands pass against a real Solari account:

```text
Browser  PASS
Sandbox  PASS
Desktop  PASS
```

If one surface fails, record the exact SDK/runtime behavior before changing the Rehearsal architecture. M1 should begin only after the substrate is known to work.
