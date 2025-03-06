import type Coordinate from '../../common/Coordinate'
import type { TextStyle } from '../../common/Styles'

import type { FigureTemplate } from '../../component/Figure'

export function checkCoordinateOnImage (coordinate: Coordinate, attrs: ImageAttrs | ImageAttrs[]): boolean {
  let images: ImageAttrs[] = []
  images = images.concat(attrs)
  for (const img of images) {
    const { x, y, width, height } = img
    if (
      coordinate.x >= x &&
      coordinate.x <= x + width &&
      coordinate.y >= y &&
      coordinate.y <= y + height
    ) {
      return true
    }
  }
  return false
}

export function drawImage (ctx: CanvasRenderingContext2D, attrs: ImageAttrs | ImageAttrs[]): void {
  let images: ImageAttrs[] = []
  images = images.concat(attrs)

  images.forEach((img) => {
    ctx.beginPath()
    ctx.drawImage(img.img, img.x, img.y, img.width, img.height)
    ctx.closePath()
  })
}

export interface ImageAttrs {
  x: number
  y: number
  text: string
  width: number
  height: number
  img: CanvasImageSource
}

const img: FigureTemplate<ImageAttrs | ImageAttrs[], Partial<TextStyle>> = {
  name: 'img',
  checkEventOn: checkCoordinateOnImage,
  draw: (ctx: CanvasRenderingContext2D, attrs: ImageAttrs | ImageAttrs[]) => {
    drawImage(ctx, attrs)
  }
}

export default img
