#!/usr/bin/env python3
"""Write a 1024×1024 dark FIB-4 mark into assets/."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)

BG = (14, 16, 18, 255)
FG = (238, 240, 236, 255)
ACCENT = (125, 158, 150, 255)


def load_font(size: int) -> ImageFont.ImageFont:
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    img = Image.new("RGBA", (1024, 1024), BG)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((88, 88, 936, 936), radius=220, outline=ACCENT, width=28)
    font = load_font(420)
    text = "4"
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((1024 - w) / 2 - bbox[0], (1024 - h) / 2 - bbox[1] - 20), text, font=font, fill=FG)
    img.save(ASSETS / "icon.png")
    img.save(ASSETS / "adaptive-icon.png")
    splash = Image.new("RGBA", (1284, 2778), BG)
    mark = img.resize((512, 512))
    splash.paste(mark, ((1284 - 512) // 2, (2778 - 512) // 2), mark)
    splash.save(ASSETS / "splash-icon.png")
    img.resize((48, 48)).save(ASSETS / "favicon.png")
    print("wrote", ASSETS)


if __name__ == "__main__":
    main()
