export type ColorCode = "red" | "orange" | "green" | "blue" | "yellow" | "purple" | "teal" | "pink"

export type TextureCode = "diagonal-stripes" | "polka-dots" | "square-net"

export type ColorTextureCode = ColorCode | TextureCode

export interface ColorTextureSelection {
  colorCode?: ColorCode
  textureCode?: TextureCode
}

export interface DateCellData {
  color?: ColorCode
  texture?: TextureCode
  customText?: string
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

export const WEEKEND_COLOR = "oklch(0.95 0.015 240)"

export const UI_COLORS = {
  background: {
    primary: "oklch(0.995 0.002 240)",
    secondary: "oklch(0.97 0.005 240)",
    tertiary: "oklch(0.985 0.003 240)",
    quaternary: "oklch(0.94 0.008 240)",
    hover: "oklch(0.93 0.015 240)",
  },

  border: {
    primary: "oklch(0.25 0.02 240)",
    secondary: "oklch(0.75 0.01 240)",
    tertiary: "oklch(0.85 0.005 240)",
    inset: "oklch(0.15 0.03 240)",
  },

  text: {
    primary: "oklch(0.25 0.02 240)",
    secondary: "oklch(0.45 0.015 240)",
    white: "oklch(0.98 0.005 240)",
  },

  button: {
    primary: {
      normal: "oklch(0.55 0.18 240)",
      hover: "oklch(0.45 0.2 240)",
    },
    success: {
      normal: "oklch(0.65 0.15 140)",
      hover: "oklch(0.55 0.17 140)",
    },
    danger: {
      normal: "oklch(0.6 0.2 25)",
      hover: "oklch(0.5 0.22 25)",
    },
  },
} as const

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
  dateCells: Map<string, DateCellData>,
  selectedColorTexture: ColorTextureCode,
  setDateCells: (dateCells: Map<string, DateCellData>) => void
) => {
  const dateKey = getDateKey(date)
  const newDateCells = new Map(dateCells)
  const currentCell = dateCells.get(dateKey)

  // Check if the current selection matches what we're trying to apply
  const isColor = Object.keys(COLORS).includes(selectedColorTexture)
  const isTexture = Object.keys(TEXTURES).includes(selectedColorTexture)

  const currentMatchesSelection =
    (isColor && currentCell?.color === selectedColorTexture) ||
    (isTexture && currentCell?.texture === selectedColorTexture)

  if (currentMatchesSelection) {
    // Remove the color/texture if it's already applied
    const updatedCell = { ...currentCell }
    if (isColor) {
      delete updatedCell.color
    } else if (isTexture) {
      delete updatedCell.texture
    }

    // If the cell has no other properties, remove it entirely
    if (Object.keys(updatedCell).length === 0) {
      newDateCells.delete(dateKey)
    } else {
      newDateCells.set(dateKey, updatedCell)
    }
  } else {
    // Apply the new color/texture
    const updatedCell = { ...currentCell }
    if (isColor) {
      updatedCell.color = selectedColorTexture as ColorCode
      // Remove any existing texture when applying a color
      delete updatedCell.texture
    } else if (isTexture) {
      updatedCell.texture = selectedColorTexture as TextureCode
      // Remove any existing color when applying a texture
      delete updatedCell.color
    }
    newDateCells.set(dateKey, updatedCell)
  }

  setDateCells(newDateCells)
}
