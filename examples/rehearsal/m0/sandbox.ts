import { SolariClient } from "@solarisdk/sdk"

function requireApiKey(): string {
  const apiKey = process.env.SOLARI_API_KEY
  if (!apiKey) {
    throw new Error("SOLARI_API_KEY is not set")
  }
  return apiKey
}

const client = new SolariClient({ apiKey: requireApiKey() })
const sandbox = await client.sandboxes.create({
  template: "base",
  timeoutMs: 5 * 60_000,
})

try {
  await sandbox.connect()

  const command = await sandbox.commands.run("python3", {
    args: ["-c", "print(sum(range(101)))"],
  })

  if (command.exitCode !== 0 || command.stdout.trim() !== "5050") {
    throw new Error(
      `Unexpected command result: exit=${command.exitCode}, stdout=${JSON.stringify(command.stdout)}`,
    )
  }

  const path = "/tmp/rehearsal-m0.txt"
  const expected = "rehearsal sandbox smoke test\n"
  await sandbox.files.write(path, expected)
  const actual = await sandbox.files.readText(path)

  if (actual !== expected) {
    throw new Error(`Sandbox file round-trip failed: ${JSON.stringify(actual)}`)
  }

  console.log("[sandbox] PASS")
  console.log("[sandbox] id:", sandbox.sandboxId)
  console.log("[sandbox] python result:", command.stdout.trim())
} finally {
  await sandbox.kill()
}
