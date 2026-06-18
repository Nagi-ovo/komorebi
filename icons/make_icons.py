#!/usr/bin/env python3
"""Generate the Everforest leaf icons (PNG) at the sizes the manifest needs.

Supersamples 4x and downscales with LANCZOS for clean edges. The mark is a
single leaf in dark Everforest ink on a green->aqua rounded-square gradient,
matching the popup logo.
"""
import math
from PIL import Image, ImageDraw

GREEN = (0xA7, 0xC0, 0x80)
AQUA = (0x83, 0xC0, 0x92)
INK = (0x2D, 0x35, 0x3B)
VEIN = (0x3D, 0x48, 0x4D)


def lerp(a, b, t):
    return a + (b - a) * t


def make(S: int):
    ss = 4
    N = S * ss
    img = Image.new("RGBA", (N, N), (0, 0, 0, 0))

    # vertical green -> aqua gradient
    grad = Image.new("RGBA", (N, N))
    gp = grad.load()
    for y in range(N):
        t = y / (N - 1)
        c = (round(lerp(GREEN[0], AQUA[0], t)),
             round(lerp(GREEN[1], AQUA[1], t)),
             round(lerp(GREEN[2], AQUA[2], t)), 255)
        for x in range(N):
            gp[x, y] = c

    # clip gradient to a rounded square
    mask = Image.new("L", (N, N), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, N - 1, N - 1], radius=round(N * 0.225), fill=255)
    img.paste(grad, (0, 0), mask)

    d = ImageDraw.Draw(img)

    # leaf: a curved midrib from stem (lower-left) to tip (upper-right),
    # with a sinusoidal width profile so it tapers to points at both ends.
    P0 = (N * 0.31, N * 0.73)
    C = (N * 0.40, N * 0.40)
    P1 = (N * 0.72, N * 0.29)

    def bez(t):
        u = 1 - t
        return (u * u * P0[0] + 2 * u * t * C[0] + t * t * P1[0],
                u * u * P0[1] + 2 * u * t * C[1] + t * t * P1[1])

    amp = N * 0.17
    steps = 96
    pos, neg = [], []
    for i in range(steps + 1):
        t = i / steps
        x, y = bez(t)
        ax, ay = bez(min(1, t + 1e-3))
        bx, by = bez(max(0, t - 1e-3))
        dx, dy = ax - bx, ay - by
        L = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / L, dx / L
        w = amp * (math.sin(math.pi * t) ** 0.7)
        pos.append((x + nx * w, y + ny * w))
        neg.append((x - nx * w, y - ny * w))
    d.polygon(pos + neg[::-1], fill=INK)

    # center vein
    d.line([bez(i / 48) for i in range(49)], fill=VEIN, width=max(1, round(N * 0.02)))

    img.resize((S, S), Image.LANCZOS).save(f"icons/icon-{S}.png")
    print(f"  icon-{S}.png")


if __name__ == "__main__":
    print("generating icons:")
    for S in (16, 32, 48, 128):
        make(S)
