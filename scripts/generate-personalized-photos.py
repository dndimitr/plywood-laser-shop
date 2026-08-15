#!/usr/bin/env python3
"""Generate 1024×1024 birch-plywood product mock photos for evergreen personalized SKUs."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "products" / "photos"
SIZE = 1024

# Soft studio background (matches existing catalog lighting)
BG = (248, 246, 242)
WOOD_LIGHT = (214, 184, 140)
WOOD_MID = (196, 160, 112)
WOOD_DARK = (140, 98, 58)
ENGRAVE = (78, 52, 32)
EDGE = (92, 62, 36)
SHADOW = (40, 30, 22)


PRODUCTS = [
    {
        "slug": "personal-semeina-tabela-vhod",
        "shape": "plaque",
        "lines": ["Семейство Иванови", "от 2019"],
        "motif": "leaves",
    },
    {
        "slug": "personal-koordinati",
        "shape": "square",
        "lines": ["42.6977° N", "23.3219° E", "София"],
        "motif": "pin",
    },
    {
        "slug": "personal-karta-zapoznahme",
        "shape": "map",
        "lines": ["София", "14.06.2018"],
        "motif": "map",
    },
    {
        "slug": "personal-plaket-pesen",
        "shape": "square",
        "lines": ["♪ Нашата песен", "М + А"],
        "motif": "qr",
    },
    {
        "slug": "personal-ramka-spomen",
        "shape": "frame",
        "lines": ["Нашият дом", "2024"],
        "motif": "frame",
    },
    {
        "slug": "personal-komplekt-otvori",
        "shape": "boxes",
        "lines": ["Отвори когато…"],
        "motif": "boxes",
    },
    {
        "slug": "personal-pazel-sarce",
        "shape": "hearts",
        "lines": ["М", "А"],
        "motif": "heart",
    },
    {
        "slug": "personal-liniya-zhivot",
        "shape": "bar",
        "lines": ["2016", "2019", "2022"],
        "motif": "timeline",
    },
    {
        "slug": "personal-tabela-detsa",
        "shape": "plaque",
        "lines": ["Иванови", "Ема · Никола"],
        "motif": "leaves",
    },
    {
        "slug": "personal-kalendar-vazhni",
        "shape": "calendar",
        "lines": ["Важните дати"],
        "motif": "calendar",
    },
    {
        "slug": "personal-nastolna-ime",
        "shape": "desk",
        "lines": ["Мария Петрова", "Дизайнер"],
        "motif": "desk",
    },
    {
        "slug": "personal-medalion-qr",
        "shape": "medallion",
        "lines": ["Рекс"],
        "motif": "qr",
    },
    {
        "slug": "personal-tabela-hranilka",
        "shape": "tag",
        "lines": ["Храната на Мими"],
        "motif": "paw",
    },
    {
        "slug": "personal-ramka-osinovyavane",
        "shape": "frame",
        "lines": ["Осиновихме", "03.05.2023"],
        "motif": "paw",
    },
    {
        "slug": "personal-zvezdna-karta",
        "shape": "circle",
        "lines": ["15.08.2020", "София"],
        "motif": "stars",
    },
    {
        "slug": "personal-kutiya-spomeni",
        "shape": "box",
        "lines": ["Нашите спомени"],
        "motif": "box",
    },
    {
        "slug": "personal-lampa-ime",
        "shape": "lamp",
        "lines": ["Ема"],
        "motif": "lamp",
    },
    {
        "slug": "personal-tabela-staya",
        "shape": "plaque",
        "lines": ["Стаята на Никола"],
        "motif": "door",
    },
    {
        "slug": "personal-stoika-monogram",
        "shape": "stand",
        "lines": ["ДП"],
        "motif": "phone",
    },
    {
        "slug": "personal-klyucharnitsa",
        "shape": "hooks",
        "lines": ["Ключовете", "на Иванови"],
        "motif": "hooks",
    },
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def wood_fill(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], rng: random.Random) -> None:
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(box, radius=18, fill=WOOD_MID, outline=EDGE, width=3)
    for _ in range(80):
        y = rng.randint(y0 + 8, y1 - 8)
        x_a = rng.randint(x0 + 10, x1 - 40)
        x_b = min(x1 - 10, x_a + rng.randint(40, 160))
        tone = rng.choice([WOOD_LIGHT, WOOD_DARK, (180, 145, 100)])
        draw.line((x_a, y, x_b, y + rng.randint(-2, 2)), fill=tone, width=1)


def draw_shadow(base: Image.Image, box: tuple[int, int, int, int]) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    x0, y0, x1, y1 = box
    d.ellipse((x0 + 30, y1 - 10, x1 - 10, y1 + 55), fill=(*SHADOW, 55))
    blurred = overlay.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(blurred)


def centered_text(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    lines: list[str],
    sizes: list[int],
) -> None:
    total_h = sum(sizes) + 10 * (len(lines) - 1)
    y = cy - total_h // 2
    for line, size in zip(lines, sizes):
        f = font(size, bold=True)
        bbox = draw.textbbox((0, 0), line, font=f)
        w = bbox[2] - bbox[0]
        draw.text((cx - w // 2, y), line, font=f, fill=ENGRAVE)
        y += size + 10


def motif_extras(draw: ImageDraw.ImageDraw, motif: str, box: tuple[int, int, int, int], rng: random.Random) -> None:
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    if motif == "qr":
        q = 70
        qx, qy = cx - q // 2, y1 - q - 36
        draw.rectangle((qx, qy, qx + q, qy + q), outline=ENGRAVE, width=3)
        for i in range(5):
            for j in range(5):
                if (i + j + rng.randint(0, 1)) % 2 == 0:
                    draw.rectangle(
                        (qx + 8 + i * 12, qy + 8 + j * 12, qx + 16 + i * 12, qy + 16 + j * 12),
                        fill=ENGRAVE,
                    )
    elif motif == "stars":
        for _ in range(40):
            x = rng.randint(x0 + 40, x1 - 40)
            y = rng.randint(y0 + 40, y1 - 80)
            r = rng.randint(1, 3)
            draw.ellipse((x - r, y - r, x + r, y + r), fill=ENGRAVE)
    elif motif == "pin":
        draw.ellipse((cx - 10, cy - 70, cx + 10, cy - 50), fill=ENGRAVE)
        draw.polygon([(cx, cy - 20), (cx - 12, cy - 48), (cx + 12, cy - 48)], fill=ENGRAVE)
    elif motif == "leaves":
        for dx in (-180, 180):
            draw.arc((cx + dx - 40, y0 + 20, cx + dx + 40, y0 + 120), 200, 340, fill=ENGRAVE, width=3)
    elif motif == "timeline":
        draw.line((x0 + 60, cy + 40, x1 - 60, cy + 40), fill=ENGRAVE, width=3)
        for i in range(3):
            x = x0 + 120 + i * 140
            draw.ellipse((x - 8, cy + 32, x + 8, cy + 48), fill=ENGRAVE)
    elif motif == "paw":
        draw.ellipse((cx - 18, cy - 90, cx + 18, cy - 54), outline=ENGRAVE, width=3)
        for ox in (-28, -10, 10, 28):
            draw.ellipse((cx + ox - 8, cy - 110, cx + ox + 8, cy - 94), outline=ENGRAVE, width=2)
    elif motif == "hooks":
        for i in range(4):
            x = x0 + 90 + i * 90
            draw.arc((x - 14, y1 - 70, x + 14, y1 - 42), 0, 180, fill=ENGRAVE, width=4)


def render(product: dict) -> Image.Image:
    rng = random.Random(sum(ord(c) for c in product["slug"]))
    img = Image.new("RGBA", (SIZE, SIZE), (*BG, 255))
    draw = ImageDraw.Draw(img)
    shape = product["shape"]
    lines: list[str] = product["lines"]

    if shape == "plaque":
        box = (160, 340, 864, 640)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        centered_text(draw, 512, 490, lines, [42 if i == 0 else 30 for i in range(len(lines))])
        motif_extras(draw, product["motif"], box, rng)
    elif shape == "square":
        box = (260, 260, 764, 764)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        centered_text(draw, 512, 470, lines, [36] * len(lines))
        motif_extras(draw, product["motif"], box, rng)
    elif shape == "circle":
        box = (220, 220, 804, 804)
        draw_shadow(img, box)
        draw.ellipse(box, fill=WOOD_MID, outline=EDGE, width=4)
        for _ in range(60):
            ang = rng.random() * math.tau
            r = rng.uniform(40, 250)
            x = int(512 + math.cos(ang) * r)
            y = int(512 + math.sin(ang) * r)
            draw.point((x, y), fill=WOOD_DARK)
        motif_extras(draw, "stars", box, rng)
        centered_text(draw, 512, 560, lines, [34, 28])
    elif shape == "bar":
        box = (80, 420, 944, 620)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        centered_text(draw, 512, 490, [" · ".join(lines)], [34])
        motif_extras(draw, "timeline", box, rng)
    elif shape == "frame":
        outer = (220, 200, 804, 820)
        draw_shadow(img, outer)
        wood_fill(draw, outer, rng)
        draw.rounded_rectangle((300, 280, 724, 620), radius=8, fill=(236, 232, 224), outline=EDGE, width=2)
        centered_text(draw, 512, 700, lines, [32, 28])
        motif_extras(draw, product["motif"], outer, rng)
    elif shape == "hearts":
        for i, (ox, label) in enumerate([(-120, lines[0]), (120, lines[1] if len(lines) > 1 else "")]):
            box = (320 + ox, 340, 520 + ox, 640)
            draw_shadow(img, box)
            wood_fill(draw, box, rng)
            # heart cut hint
            draw.polygon(
                [
                    (420 + ox, 420),
                    (380 + ox, 390),
                    (360 + ox, 430),
                    (420 + ox, 520),
                    (480 + ox, 430),
                    (460 + ox, 390),
                ],
                outline=ENGRAVE,
                width=3,
            )
            centered_text(draw, 420 + ox, 560, [label], [40])
    elif shape == "boxes":
        for i in range(3):
            for j in range(2):
                x0 = 170 + i * 230
                y0 = 300 + j * 230
                box = (x0, y0, x0 + 180, y0 + 160)
                draw_shadow(img, box)
                wood_fill(draw, box, rng)
                centered_text(draw, x0 + 90, y0 + 80, ["Отвори", "когато…"], [18, 18])
    elif shape == "map":
        box = (180, 240, 844, 780)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        # abstract city outline
        pts = [(220, 500), (300, 420), (380, 460), (460, 380), (560, 430), (650, 360), (760, 450), (800, 520), (220, 520)]
        draw.line(pts, fill=ENGRAVE, width=3)
        draw.ellipse((480, 430, 510, 460), fill=ENGRAVE)
        centered_text(draw, 512, 650, lines, [36, 28])
    elif shape == "calendar":
        box = (240, 200, 784, 820)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        for r in range(4):
            for c in range(3):
                x = 300 + c * 140
                y = 320 + r * 100
                draw.rounded_rectangle((x, y, x + 100, y + 70), radius=6, outline=ENGRAVE, width=2)
        centered_text(draw, 512, 250, lines, [34])
    elif shape == "desk":
        box = (180, 380, 844, 620)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        # base
        draw.polygon([(300, 620), (724, 620), (780, 700), (244, 700)], fill=WOOD_DARK)
        centered_text(draw, 512, 490, lines, [36, 28])
    elif shape == "medallion":
        box = (320, 260, 704, 740)
        draw_shadow(img, box)
        draw.ellipse(box, fill=WOOD_MID, outline=EDGE, width=4)
        draw.ellipse((490, 210, 534, 254), outline=EDGE, width=4)
        centered_text(draw, 512, 460, lines, [44])
        motif_extras(draw, "qr", (360, 360, 664, 700), rng)
    elif shape == "tag":
        box = (240, 380, 784, 620)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        draw.ellipse((250, 470, 290, 510), outline=ENGRAVE, width=3)
        centered_text(draw, 540, 500, lines, [32])
        motif_extras(draw, "paw", box, rng)
    elif shape == "box":
        box = (220, 280, 804, 760)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        draw.line((220, 420, 804, 420), fill=EDGE, width=3)
        draw.line((512, 420, 512, 760), fill=EDGE, width=2)
        centered_text(draw, 512, 350, lines, [34])
    elif shape == "lamp":
        box = (300, 260, 724, 780)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        # glow
        glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.ellipse((340, 320, 684, 680), fill=(255, 230, 170, 70))
        img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(20)))
        draw = ImageDraw.Draw(img)
        centered_text(draw, 512, 500, lines, [64])
    elif shape == "stand":
        box = (340, 300, 684, 760)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        draw.polygon([(360, 720), (664, 720), (620, 800), (404, 800)], fill=WOOD_DARK)
        centered_text(draw, 512, 480, lines, [72])
    elif shape == "hooks":
        box = (160, 300, 864, 680)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        centered_text(draw, 512, 420, lines, [36, 30])
        motif_extras(draw, "hooks", box, rng)
    else:
        box = (220, 280, 804, 740)
        draw_shadow(img, box)
        wood_fill(draw, box, rng)
        centered_text(draw, 512, 500, lines, [36] * len(lines))

    return img.convert("RGB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for product in PRODUCTS:
        img = render(product)
        path = OUT / f"{product['slug']}.png"
        img.save(path, "PNG", optimize=True)
        print("wrote", path.name)


if __name__ == "__main__":
    main()
