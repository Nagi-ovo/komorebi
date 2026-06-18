#!/usr/bin/env python3
"""Everforest for GitHub — "Contrast Ridges" toolbar icons (PNG) for the manifest.

A layered forest horizon — three ridges for soft / medium / hard contrast — under
a warm sun, on Everforest cream, in a rounded square. 4x supersampled, LANCZOS
down. Imported from the Claude Design "Contrast Ridges" concept.
"""
from PIL import Image, ImageDraw

BG = (0xFD, 0xF6, 0xE3)
SUN = (0xDB, 0xBC, 0x7F)
RIDGES = [
    ([(0, 60), (22, 42), (40, 56), (58, 40), (78, 54), (100, 38), (100, 100), (0, 100)], (0xCF, 0xE0, 0xB0)),
    ([(0, 72), (20, 56), (40, 70), (60, 53), (80, 68), (100, 52), (100, 100), (0, 100)], (0xA7, 0xC0, 0x80)),
    ([(0, 84), (20, 71), (41, 82), (60, 69), (80, 81), (100, 67), (100, 100), (0, 100)], (0x6F, 0x9A, 0x5D)),
]


def make(S: int):
    ss = 4
    N = S * ss
    k = N / 100
    content = Image.new("RGBA", (N, N), BG + (255,))
    d = ImageDraw.Draw(content)
    # sun
    cx, cy, r = 70 * k, 30 * k, 11 * k
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=SUN)
    # ridges, back to front
    for pts, col in RIDGES:
        d.polygon([(x * k, y * k) for x, y in pts], fill=col)
    # clip to a rounded square
    mask = Image.new("L", (N, N), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, N - 1, N - 1], radius=round(N * 0.22), fill=255)
    out = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    out.paste(content, (0, 0), mask)
    out.resize((S, S), Image.LANCZOS).save(f"icons/icon-{S}.png")
    print(f"  icon-{S}.png")


if __name__ == "__main__":
    print("generating Contrast Ridges icons:")
    for S in (16, 32, 48, 128):
        make(S)
