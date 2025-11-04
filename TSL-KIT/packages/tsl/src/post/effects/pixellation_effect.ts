import { Fn, float, floor, screenSize } from 'three/tsl'

export const pixellationEffect = Fn(([uv, size = 20]) => {
  const pixelSize = float(size).div(screenSize.x)
  return floor(uv.div(pixelSize)).mul(pixelSize)
})

