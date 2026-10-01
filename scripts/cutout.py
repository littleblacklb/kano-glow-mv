"""Cut the character out of cover.jpeg into public/kano.png (RGBA).

The background is one flat red. A flood fill from the image border marks it,
which leaves the same-red scarf/shoes intact because line art encloses them.
Only the right half is kept so the "one 鹿乃" lettering is dropped.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "cover.jpeg"
OUT = ROOT / "public" / "kano.png"
TOLERANCE = 40  # summed RGB distance; JPEG noise stays well under this
TEXT_RIGHT_EDGE = 850  # lettering ends before this x
PAD = 8

im = np.array(Image.open(SRC).convert("RGB")).astype(int)
bg = im[10, 10]
near = np.abs(im - bg).sum(2) < TOLERANCE
labels, _ = ndimage.label(near)
border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
bgmask = np.isin(labels, border[border != 0])

alpha = (~bgmask).astype(np.uint8) * 255
alpha[:, :TEXT_RIGHT_EDGE] = 0
# Soften the 1px JPEG fringe so edges don't show a red halo on other colors.
alpha = np.array(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6)))

ys, xs = np.where(alpha > 0)
x0, x1 = xs.min() - PAD, xs.max() + PAD
y0, y1 = ys.min() - PAD, ys.max() + PAD
rgba = np.dstack([im.astype(np.uint8), alpha])[y0:y1, x0:x1]
Image.fromarray(rgba, "RGBA").save(OUT)
print(f"bg={tuple(bg)} bbox=({x0},{y0})-({x1},{y1}) size={rgba.shape[1]}x{rgba.shape[0]} -> {OUT}")
