import asyncio
import os
from pathlib import Path

from solari_desktop import DesktopClient

BASE_URL = "https://api.getsolari.com"


def require_api_key() -> str:
    api_key = os.environ.get("SOLARI_API_KEY")
    if not api_key:
        raise RuntimeError("SOLARI_API_KEY is not set")
    return api_key


async def main() -> None:
    async with DesktopClient(api_key=require_api_key(), base_url=BASE_URL) as client:
        desktop = await client.create(
            template="default",
            resolution="1280x720",
            timeout_ms=10 * 60_000,
        )

        try:
            await desktop.connect()

            for _ in range(30):
                health = await desktop.health()
                if getattr(health, "ready", False):
                    break
                await asyncio.sleep(1)
            else:
                raise RuntimeError("Desktop did not become ready within 30 seconds")

            pid = await desktop.open("mousepad")
            await asyncio.sleep(3)
            await desktop.mouse.click(320, 300, humanize=True)
            await desktop.keyboard.type("rehearsal m0 desktop smoke test")
            await asyncio.sleep(1)

            shot = await desktop.screenshot(format="png")
            if not shot:
                raise RuntimeError("Desktop screenshot was empty")

            output = Path("desktop-smoke.png")
            output.write_bytes(shot)

            print("[desktop] PASS")
            print("[desktop] session:", desktop.sessionId)
            print("[desktop] pid:", pid)
            print("[desktop] stream:", desktop.streamUrl)
            print("[desktop] screenshot:", output)
        finally:
            await desktop.close()
            await client.destroy(desktop.sessionId)


if __name__ == "__main__":
    asyncio.run(main())
