#!/usr/bin/env python3
"""Compose a 4:3 glow cover from existing MV art; never alters source assets.

Requires the local Pillow, numpy and fontTools (with WOFF2 support) environment.
Run: python3 scripts/make_cover.py
"""
from io import BytesIO
from pathlib import Path

import numpy as np
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WIDTH, HEIGHT = 1600, 1200
CREAM = (255, 246, 220)


def font(name, size, text):
    """Decode the project's own font subset in memory, including glyph checks."""
    face = TTFont(ROOT / "public/fonts" / name)
    cmap = face.getBestCmap()
    assert all(ord(c) in cmap for c in text if not c.isspace()), text
    face.flavor = None
    data = BytesIO()
    face.save(data)
    face.close()
    data.seek(0)
    return ImageFont.truetype(data, size)


def make_cover():
    y, x = np.mgrid[:HEIGHT, :WIDTH].astype(np.float32)
    v = (y / HEIGHT)[..., None]
    upper = np.array([45, 43, 66], dtype=np.float32)
    lower = np.array([147, 99, 105], dtype=np.float32)
    sky = upper * (1 - v) + lower * v

    # A broad cloud-filtered warmth, not a sun disk or an emissive stripe.
    warmth = np.exp(-(((x - 730) / 850) ** 2 + ((y - 760) / 470) ** 2))
    warmth *= 0.43 + 0.05 * np.sin(x / 155 + y / 250)
    sky = sky * (1 - warmth[..., None]) + np.array([237, 176, 140]) * warmth[..., None]
    edge = np.clip(((x - 800) / 1200) ** 2 + ((y - 580) / 1300) ** 2, 0, 1)
    sky *= 1 - edge[..., None] * 0.18
    image = Image.fromarray(np.clip(sky, 0, 255).astype(np.uint8)).convert("RGBA")

    # Quiet distant contour; the portrait stays in the foreground.
    landscape = Image.new("RGBA", image.size)
    draw = ImageDraw.Draw(landscape)
    points = [(i, int(1090 + 23 * np.sin(i / 290) + 8 * np.sin(i / 115))) for i in range(-10, WIDTH + 11, 4)]
    draw.polygon(points + [(WIDTH + 10, HEIGHT), (-10, HEIGHT)], fill=(43, 33, 47, 90))
    draw.line(points, fill=(230, 196, 163, 65), width=2)
    image = Image.alpha_composite(image, landscape.filter(ImageFilter.GaussianBlur(3)))

    figure = Image.open(ROOT / "public/characters/cling.png").convert("RGBA")
    pixels = np.array(figure)
    pixels[..., :3] = np.clip(pixels[..., :3].astype(np.float32) * [1, 0.95, 0.90], 0, 255).astype(np.uint8)
    figure = Image.fromarray(pixels)
    figure_height = 1650
    figure = figure.resize((round(figure.width * figure_height / figure.height), figure_height), Image.Resampling.LANCZOS)
    image.alpha_composite(figure, (905, 110))

    # The original paper texture ties lettering, sky and illustration together.
    grain = Image.open(ROOT / "public/grain.jpg").crop((200, 120, 200 + WIDTH, 120 + HEIGHT))
    texture = (np.asarray(grain, dtype=np.float32) - 128) * 0.14
    pixels = np.array(image)
    pixels[..., :3] = np.clip(pixels[..., :3].astype(np.float32) + texture[..., None], 0, 255).astype(np.uint8)
    image = Image.fromarray(pixels)

    title = font("klee-one-400.woff2", 280, "glow")
    artist = font("klee-one-400.woff2", 78, "鹿乃")
    detail = font("klee-one-400.woff2", 35, "acoustic cover")
    draw = ImageDraw.Draw(image)
    draw.text((128, 354), "glow", font=title, fill=CREAM, anchor="lt", stroke_width=1)
    draw.text((152, 651), "鹿乃", font=artist, fill=CREAM, anchor="lt")
    draw.text((154, 772), "acoustic cover", font=detail, fill=(237, 218, 201), anchor="lt")

    # Keep the large title away from the portrait, and all text inside safe margins.
    title_box = draw.textbbox((128, 354), "glow", font=title, anchor="lt", stroke_width=1)
    assert title_box[0] >= 100 and title_box[2] < 880
    assert image.size == (WIDTH, HEIGHT) and WIDTH * 3 == HEIGHT * 4
    return image.convert("RGB")


def main():
    output = ROOT / "out"
    output.mkdir(exist_ok=True)
    image = make_cover()
    image.save(output / "glow-bilibili-cover-4x3.png", optimize=True)
    image.save(output / "glow-bilibili-cover-4x3.jpg", quality=95, subsampling=0, optimize=True)
    image.resize((320, 240), Image.Resampling.LANCZOS).save(output / "glow-bilibili-cover-thumbnail.png")
    print("Cover: out/glow-bilibili-cover-4x3.jpg / .png (1600×1200, 4:3)")


if __name__ == "__main__":
    main()
