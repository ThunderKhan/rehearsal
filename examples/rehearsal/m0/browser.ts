import { Solari } from "@solarisdk/browser"

function requireApiKey(): string {
  const apiKey = process.env.SOLARI_API_KEY
  if (!apiKey) {
    throw new Error("SOLARI_API_KEY is not set")
  }
  return apiKey
}

const solari = new Solari({ apiKey: requireApiKey() })

const browser = await solari.launch()
try {
  const page = await browser.newPage()
  await page.goto("https://example.com", { waitUntil: "domcontentloaded" })

  const title = await page.title()
  const heading = await page.locator("h1").innerText()

  if (title !== "Example Domain" || heading !== "Example Domain") {
    throw new Error(
      `Unexpected page contents: title=${JSON.stringify(title)}, h1=${JSON.stringify(heading)}`,
    )
  }

  console.log("[browser] PASS")
  console.log("[browser] session:", browser.id)
  console.log("[browser] title:", title)
} finally {
  await browser.close()
  await solari.close()
}
