/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type Chart from '../../Chart'
import type Coordinate from '../../common/Coordinate'
import type { TextStyle } from '../../common/Styles'

import { createFont, calcTextWidth } from '../../common/utils/canvas'
import { isArray, isFunction } from '../../common/utils/typeChecks'

import type { FigureTemplate } from '../../component/Figure'

import { type RectAttrs, drawRect } from './rect'

export function getTextRect (attrs: TextAttrs, styles: Partial<TextStyle>): RectAttrs {
  const { size = 12, paddingLeft = 0, paddingTop = 0, paddingRight = 0, paddingBottom = 0, weight = 'normal', family } = styles
  const { x, y, text, align = 'left', baseline = 'top', width: w, height: h } = attrs
  const width = w ?? (paddingLeft + calcTextWidth(text, size, weight, family) + paddingRight)
  const height = h ?? (paddingTop + size + paddingBottom)
  let startX = 0
  switch (align) {
    case 'left':
    case 'start': {
      startX = x
      break
    }
    case 'right':
    case 'end': {
      startX = x - width
      break
    }
    default: {
      startX = x - width / 2
      break
    }
  }
  let startY = 0
  switch (baseline) {
    case 'top':
    case 'hanging': {
      startY = y
      break
    }
    case 'bottom':
    case 'ideographic':
    case 'alphabetic': {
      startY = y - height
      break
    }
    default: {
      startY = y - height / 2
      break
    }
  }
  return { x: startX, y: startY, width, height }
}

export function checkCoordinateOnText (coordinate: Coordinate, attrs: TextAttrs | TextAttrs[], styles: Partial<TextStyle>): boolean {
  let texts: TextAttrs[] = []
  texts = texts.concat(attrs)
  for (const text of texts) {
    const { x, y, width, height } = getTextRect(text, styles)
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

export function drawText (ctx: CanvasRenderingContext2D, attrs: TextAttrs | TextAttrs[], styles: Partial<TextStyle>, chart?: Chart): void {
  let texts: TextAttrs[] = []
  texts = texts.concat(attrs)
  const {
    color = 'currentColor',
    size = 12,
    family,
    weight,
    paddingLeft = 0,
    paddingTop = 0,
    paddingRight = 0
  } = styles
  const rects = texts.map(text => getTextRect(text, styles))
  let bgColor: string | CanvasGradient | Array<string | CanvasGradient> = styles.backgroundColor as string

  if (isFunction(styles.backgroundColor) && chart !== undefined) {
    bgColor = texts.map(text => (styles.backgroundColor as (text: string, chart: Chart) => string | CanvasGradient)(text.text, chart) as string)
  }

  if (!isArray(bgColor)) {
    drawRect(ctx, rects, { ...styles, color: bgColor })
  } else {
    rects.forEach((rect, index) => {
      drawRect(ctx, rect, { ...styles, color: bgColor[index] })
    })
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.font = createFont(size, weight, family)

  texts.forEach((text, index) => {
    if (isFunction(styles.color) && chart !== undefined) {
      ctx.fillStyle = styles.color(ctx, text.text, chart)
    } else {
      ctx.fillStyle = color as string
    }
    const rect = rects[index]
    ctx.fillText(text.text, rect.x + paddingLeft, rect.y + paddingTop, rect.width - paddingLeft - paddingRight)
  })
}

export interface TextAttrs {
  x: number
  y: number
  text: string
  width?: number
  height?: number
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
}

const text: FigureTemplate<TextAttrs | TextAttrs[], Partial<TextStyle>> = {
  name: 'text',
  checkEventOn: checkCoordinateOnText,
  draw: (ctx: CanvasRenderingContext2D, attrs: TextAttrs | TextAttrs[], styles: Partial<TextStyle>, chart?: Chart) => {
    drawText(ctx, attrs, styles, chart)
  }
}

export default text
