import {CandleType, getFigureClass, init, registerIndicator} from './src'
import { AxisPosition } from "./src/component/Axis"
import { LayoutChildType } from "./src/Options"


const chart = init('chart-container', {
  styles: {
    candle: {
      bar: {
       color: (a) => {
          return undefined
       }
      },
      tooltip: {
        showType: 'rect'
      }
    },
    yAxis: {
      tickText: {
        color: (ctx, text, chart) => {
          if(text.endsWith('%')){
            if(parseInt(text) > 0){
              return 'green'
            }else{
              return 'red'
            }
          }

          const data = chart.getDataList()
          const range = chart.getVisibleRange()
          const startData = data[range.from]
          if(!startData){
            return 'transparent'
          }
          return Number.parseInt(text) > startData.close ? 'green' : 'red'
        }
      }
    },
    crosshair: {
      horizontal: {
        text: {
          color: '#fff',
          backgroundColor: (text, chart) => {
            if(text.endsWith('%')){
              if(parseInt(text) > 0){
                return 'green'
              }else{
                return 'red'
              }
            }
            const data = chart.getDataList()
            const range = chart.getVisibleRange()
            const startData = data[range.from]

            if(!startData){
              return 'transparent'
            }
            
            return Number.parseInt(text) > startData.close ? 'green' : 'red'
          }
        }
      }
    }
  },
  layout: [
    {
      type: LayoutChildType.Candle,
   
      options: {
        axis: {
          position: AxisPosition.Right,
          name: 'percentage'
        },
        leftAxis: {
          position: AxisPosition.Left,
          
        }
      }
    }
  ]
})

chart?.createIndicator('SMA', true)
document.querySelector('#btn-reset')?.addEventListener('click', () => {
  chart?.resize()
})
;(async () => {
  const ticker = 'QQQ'
  const interval = '1440'
  fetch( 'https://us.mgjkn.com/stock/chart?ticker=' + ticker + '&interval=' + interval + '&start_at=2022-10-29&_tr=1737517264_316756&gzencode=false').then(res => res.json()).then(r => {
    const candlesticks = r.data.history.map(item => ({
      timestamp: Math.floor(Date.parse(item[0])),
      open: item[1],
      high: item[3],
      low: item[4],
      close: item[2],
      volume: item[5],
      turnover: item[6],
      prevClose: item[7]
    }))

    chart?.applyNewData(candlesticks)
  })
})()

