export type ColorCode = "red" | "orange" | "green" | "blue" | "yellow" | "purple" | "teal" | "pink"

export type TextureCode = "diagonal-stripes" | "polka-dots" | "square-net"

export type ColorTextureCode = ColorCode | TextureCode

export interface ColorTextureSelection {
  colorCode?: ColorCode
  textureCode?: TextureCode
}

export const COLORS: Record<ColorCode, string> = {
  red: "oklch(0.7003 0.2051 17.87)",
  orange: "oklch(0.847 0.2 60)",
  green: "oklch(0.782 0.1998 151.28)",
  blue: "oklch(0.847 0.2 240)",
  yellow: "oklch(0.8751 0.1875 97.28)",
  purple: "oklch(0.847 0.2 270)",
  teal: "oklch(0.8205 0.1603 195.75)",
  pink: "oklch(0.847 0.2 330)",
}

export const WEEKEND_COLOR = "oklch(0.9779 0.0074 199.59)"

export const TEXTURES: Record<TextureCode, string> = {
  "diagonal-stripes":
    "url(\"data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='diagonal' patternUnits='userSpaceOnUse' width='6' height='6'%3E%3Cpath d='M 0 0 L 6 6' stroke='%23ccc' stroke-width='1' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23diagonal)'/%3E%3C/svg%3E\")",
  "polka-dots": "radial-gradient(circle at 1.5px 1.5px, #ccc 1.5px, transparent 1.5px)",
  "square-net": "linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)",
}

export const ALL_COLOR_TEXTURE_CODES: ColorTextureCode[] = [
  "red",
  "orange",
  "green",
  "blue",
  "yellow",
  "purple",
  "teal",
  "pink",
  "diagonal-stripes",
  "polka-dots",
  "square-net",
]

export const getDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export const applyColorToDate = (
  date: Date,
  coloredDays: Map<string, ColorTextureCode>,
  selectedColorTexture: ColorTextureCode,
  setColoredDays: (days: Map<string, ColorTextureCode>) => void
) => {
  const dateKey = getDateKey(date)
  const newColoredDays = new Map(coloredDays)
  const currentSelection = coloredDays.get(dateKey)

  if (currentSelection && currentSelection === selectedColorTexture) {
    newColoredDays.delete(dateKey)
  } else {
    newColoredDays.set(dateKey, selectedColorTexture)
  }
  setColoredDays(newColoredDays)
}
