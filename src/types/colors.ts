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

export const TEXTURES: Record<TextureCode, string> = {
  "diagonal-stripes": "texture-diagonal-stripes",
  "polka-dots": "texture-polka-dots",
  "square-net": "texture-square-net",
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
