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

import { isValid } from '../common/utils/typeChecks'
import { CandleColorCompareRule } from '../common/Styles'

import View from './View'

import type YAxis from '../component/YAxis'

type IsLeftYAxis = boolean
type DrawImpExtend = [IsLeftYAxis]

export default class CandleLastPriceLabelView extends View {
  override drawImp (ctx: CanvasRenderingContext2D, arg?: DrawImpExtend): void {
    const widget = this.getWidget()
    const pane = widget.getPane()
    const bounding = widget.getBounding()
    const chartStore = pane.getChart().getChartStore()
    const priceMarkStyles = chartStore.getStyles().candle.priceMark
    const lastPriceMarkStyles = priceMarkStyles.last
    const lastPriceMarkTextStyles = lastPriceMarkStyles.text
    if (priceMarkStyles.show && lastPriceMarkStyles.show && lastPriceMarkTextStyles.show) {
      const precision = chartStore.getPrecision()
      const yAxis = pane.getAxisComponent(arg?.[0]) as YAxis
      const dataList = chartStore.getDataList()
      const data = dataList[dataList.length - 1]
      if (isValid(data)) {
        const { close, open } = data
        const comparePrice = lastPriceMarkStyles.compareRule === CandleColorCompareRule.CurrentOpen ? open : (dataList[dataList.length - 2]?.close ?? close)
        const priceY = yAxis.convertToNicePixel(close)
        let backgroundColor = ''
        if (close > comparePrice) {
          backgroundColor = lastPriceMarkStyles.upColor
        } else if (close < comparePrice) {
          backgroundColor = lastPriceMarkStyles.downColor
        } else {
          backgroundColor = lastPriceMarkStyles.noChangeColor
        }
        const yAxisRange = yAxis.getRange()
        let text = yAxis.displayValueToText(
          yAxis.realValueToDisplayValue(
            yAxis.valueToRealValue(close, { range: yAxisRange }),
            { range: yAxisRange }
          ),
          precision.price
        )
        text = chartStore.getDecimalFold().format(chartStore.getThousandsSeparator().format(text))
        let x = 0
        let textAlgin: CanvasTextAlign = 'left'
        if (yAxis.isFromZero()) {
          x = 0
          textAlgin = 'left'
        } else {
          x = bounding.width
          textAlgin = 'right'
        }

        if (yAxis.name === 'percentage') {
          backgroundColor = Number.parseFloat(text) > 0 ? lastPriceMarkStyles.upColor : lastPriceMarkStyles.downColor
        }

        this.createFigure({
          name: 'text',
          attrs: {
            x,
            y: priceY,
            text,
            align: textAlgin,
            baseline: 'middle'
          },
          styles: {
            ...lastPriceMarkTextStyles,
            backgroundColor
          }
        })?.draw(ctx)
      }
    }
  }
}
