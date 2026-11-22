# NOT IN USE: the live icon is brand/cosmos-icon.png (Astra's chosen artwork). This script draws an
# earlier vector version of the Cosmos galaxy, kept in case a vector is ever needed.
# Draws the Cosmos app icon: a spiral galaxy in the Cosmic Weather palette.
# Run: python3 brand/make-icon.py   (writes brand/cosmos-icon.svg and brand/cosmos-icon-square.svg)
# The square version is for phones, which round the corners themselves.
import math
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))
C = 256


def arm(rot, a, b, t0, t1, wmax, steps=160):
    """One tapered arm along a logarithmic spiral r = a * e^(b * t)."""
    outer, inner = [], []
    pitch = math.atan(b)
    for i in range(steps + 1):
        f = i / steps
        t = t0 + (t1 - t0) * f
        r = a * math.exp(b * t)
        w = wmax * math.sin(f * math.pi) ** 0.85
        th = t + rot
        x, y = C + r * math.cos(th), C + r * math.sin(th)
        nth = th - pitch  # true normal of a log spiral
        nx, ny = math.cos(nth), math.sin(nth)
        outer.append((x + nx * w / 2, y + ny * w / 2))
        inner.append((x - nx * w / 2, y - ny * w / 2))
    pts = outer + inner[::-1]
    return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + ' Z'


parts = []
N = 3
for k in range(N):
    rot = k * 2 * math.pi / N
    parts.append(f'<path d="{arm(rot, 15, 0.235, 0.9, 10.8, 32)}" fill="url(#armGrad)"/>')
    parts.append(f'<path d="{arm(rot + 1.05, 13, 0.235, 2.6, 9.9, 14)}" fill="url(#armGrad2)" opacity="0.85"/>')

random.seed(3)
stars = []
for _ in range(60):
    ang = random.uniform(0, 2 * math.pi)
    r = random.uniform(125, 232)
    x, y = C + r * math.cos(ang), C + r * math.sin(ang)
    if 36 < x < 476 and 36 < y < 476 and len(stars) < 13:
        stars.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{random.choice([3.2, 4, 5])}" fill="#EDE6FF" opacity="{random.uniform(0.65, 0.95):.2f}"/>')


def svg(rounded):
    rx = ' rx="112"' if rounded else ''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#302B74"/><stop offset="0.55" stop-color="#211C56"/><stop offset="1" stop-color="#17133F"/>
  </linearGradient>
  <radialGradient id="armGrad" cx="256" cy="256" r="232" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFF4D2"/><stop offset="0.2" stop-color="#F0D49A"/><stop offset="0.38" stop-color="#C8B6EE"/><stop offset="0.75" stop-color="#9483D2"/><stop offset="1" stop-color="#6C5FAE"/>
  </radialGradient>
  <radialGradient id="armGrad2" cx="256" cy="256" r="212" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFE9B5"/><stop offset="0.35" stop-color="#D2C2F2"/><stop offset="1" stop-color="#5F539E"/>
  </radialGradient>
  <radialGradient id="core" cx="256" cy="256" r="70" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFFAEC"/><stop offset="0.3" stop-color="#F8E2A8" stop-opacity="0.95"/><stop offset="1" stop-color="#E8C77E" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
    <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.32"/>
  </radialGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="0.6"/></filter>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<rect width="512" height="512"{rx} fill="url(#bg)"/>
<rect width="512" height="512"{rx} fill="url(#vignette)"/>
<circle cx="256" cy="256" r="140" fill="#8E7FD0" opacity="0.12" filter="url(#glow)"/>
<g transform="rotate(-25 256 256)" filter="url(#soft)">{''.join(parts)}</g>
<circle cx="256" cy="256" r="70" fill="url(#core)"/>
<circle cx="256" cy="256" r="22" fill="#FFF7E0" filter="url(#glow)"/>
<circle cx="256" cy="256" r="14" fill="#FFF9EA"/>
{''.join(stars)}
</svg>'''


with open(os.path.join(HERE, 'cosmos-icon.svg'), 'w') as f:
    f.write(svg(True))
with open(os.path.join(HERE, 'cosmos-icon-square.svg'), 'w') as f:
    f.write(svg(False))
print('wrote cosmos-icon.svg and cosmos-icon-square.svg')
