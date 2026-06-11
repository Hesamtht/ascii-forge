"""ASCII conversion helpers for text (art library) and images (Pillow)."""

from art import text2art, FONT_NAMES
from PIL import Image

# Curated subset of art-library fonts that render well in a terminal UI.
CURATED_FONTS = [
    "standard",
    "block",
    "banner3-D",
    "doom",
    "big",
    "small",
    "slant",
    "3-d",
    "alpha",
    "doh",
    "epic",
    "isometric1",
    "letters",
    "ogre",
    "rounded",
    "speed",
    "starwars",
    "sub-zero",
    "swampland",
    "varsity",
]

# Character ramps from darkest to lightest.
CHARSETS = {
    "detailed": "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
    "standard": "@%#*+=-:. ",
    "blocks": "█▓▒░ ",
    "minimal": "#+. ",
}

# Terminal character cells are roughly twice as tall as they are wide,
# so the image height is squashed by this factor to keep proportions.
CHAR_ASPECT = 0.5


def available_fonts():
    return [f for f in CURATED_FONTS if f in FONT_NAMES]


def text_to_ascii(text, font="standard"):
    if font not in FONT_NAMES:
        raise ValueError(f"Unknown font: {font}")
    return text2art(text, font=font)


def image_to_ascii(file_obj, width=100, charset="standard", invert=False):
    width = max(20, min(int(width), 300))
    ramp = CHARSETS.get(charset, CHARSETS["standard"])
    if invert:
        ramp = ramp[::-1]

    img = Image.open(file_obj)
    img = img.convert("L")

    height = max(1, int(img.height / img.width * width * CHAR_ASPECT))
    img = img.resize((width, height))

    pixels = img.getdata()
    scale = (len(ramp) - 1) / 255
    chars = [ramp[int(p * scale)] for p in pixels]

    lines = [
        "".join(chars[i : i + width]) for i in range(0, len(chars), width)
    ]
    return "\n".join(lines)
