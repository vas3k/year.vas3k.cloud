import { ColorTextureCode } from "../types/colors"

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
