"""Deterministic local paint-over of the original keyed close-hand illustration.

Run through key-characters.py close-hand. Preserve canvas, alpha and line art;
remove the hanging ink drop, restore cream below the pigment, then glaze broad
peach dusk light across fingers/palm/cuff (not five painted fingertip caps).
Coordinates refer to the original 812 x 762 keyed crop.
"""
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage


def retouch_hand(rgba):
    if rgba.shape != (762, 812, 4):
        raise ValueError("close-hand crop changed; review retouch coordinates first")
    out = rgba.astype(float).copy()
    rgb = out[..., :3]
    y, x = np.mgrid[:762, :812]

    # The drop is outside the finger's outline; leave that outline untouched.
    cut = Image.new("L", (812, 762))
    ImageDraw.Draw(cut).polygon(
        [(790, 108), (811, 108), (811, 175), (771, 175), (771, 156), (783, 126)], fill=255
    )
    out[..., 3][np.asarray(cut) > 0] = 0

    pigment = (rgb[..., 0] - rgb[..., 1] > 12) & (rgb[..., 0] - rgb[..., 2] > 20) & (rgb[..., 0] > 60)
    pigment &= out[..., 3] > 0
    cream = (rgb[..., 0] > 225) & (rgb[..., 1] > 210) & (rgb[..., 2] > 175) & (out[..., 3] > 250)
    nearest = ndimage.distance_transform_edt(~cream, return_distances=False, return_indices=True)
    backing = ndimage.gaussian_filter(rgb[tuple(nearest)], sigma=(3, 3, 0))
    # Keep the dark antialiasing of the original outer pen stroke.
    ink = np.clip(rgb[..., 0] / 155, 0, 1)
    rgb[pigment] = (backing * ink[..., None])[pigment]

    # One continuous light field, fading down the palm into the sleeve.
    light = np.exp(-(((x - 600) / 360) ** 2 + ((y - 50) / 245) ** 2) / 2)
    light += 0.16 * np.exp(-(((x - 420) / 360) ** 2 + ((y - 360) / 160) ** 2) / 2)
    strength = np.clip(light * 0.43, 0, 0.48)
    # Multiply rather than replace so the paper texture and black ink survive.
    glaze = np.array([1.0, 0.69, 0.59])
    out[..., :3] = rgb * (1 - strength[..., None] * (1 - glaze))
    out[out[..., 3] == 0, :3] = 0
    return out.round().clip(0, 255).astype(np.uint8)
