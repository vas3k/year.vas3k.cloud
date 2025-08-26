export type ColorCode = "red" | "yellow" | "green" | "teal" | "blue" | "purple" | "magenta" | "pink"

export type TextureCode = "diagonal-stripes" | "polka-dots" | "square-net"

export type ColorTextureCode = ColorCode | TextureCode

export interface ColorTextureSelection {
  colorCode?: ColorCode
  textureCode?: TextureCode
}

export const COLORS: Record<ColorCode, string> = {
  red: "oklch(0.847 0.2 0)",
  yellow: "oklch(0.847 0.2 60)",
  green: "oklch(0.847 0.2 120)",
  teal: "oklch(0.847 0.2 180)",
  blue: "oklch(0.847 0.2 240)",
  purple: "oklch(0.847 0.2 270)",
  magenta: "oklch(0.847 0.2 300)",
  pink: "oklch(0.847 0.2 330)",
}

export const WEEKEND_COLOR = "oklch(0.98 0.02 60)"

export const TEXTURES: Record<TextureCode, string> = {
  "diagonal-stripes": "repeating-linear-gradient(45deg, #ccc, #ccc 5px, transparent 5px, transparent 10px)",
  "polka-dots": "radial-gradient(circle at 1.5px 1.5px, #ccc 1.5px, transparent 1.5px)",
  "square-net": "linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)",
}

export const TEXTURE_BACKGROUND_SIZES: Record<TextureCode, string> = {
  "diagonal-stripes": "auto",
  "polka-dots": "6px 6px",
  "square-net": "6px 6px",
}

export const ALL_COLOR_TEXTURE_CODES: ColorTextureCode[] = [
  "red",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
  "magenta",
  "pink",
  "diagonal-stripes",
  "polka-dots",
  "square-net",
]
