import {init} from './src'
import { AxisPosition } from "./src/component/Axis"
import { LayoutChildType } from "./src/Options"

const chart = init('chart-container', {
  styles: {
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

          const data = chart.getChartStore().getDataList()
          const range = chart.getChartStore().getVisibleRange()
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
            const data = chart.getChartStore().getDataList()
            const range = chart.getChartStore().getVisibleRange()
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
          position: AxisPosition.Right
        },
        leftAxis: {
          position: AxisPosition.Left
        }
      }
    }
  ]
})

;(async () => {
//   {
//     url: 'https://us.mgjkn.com/stock/chart?ticker=' + ticker + '&interval=' + interval + '&start_at=2023-10-29&_tr=1737517264_316756&gzencode=false',
//     dataType: 'json',
//     success(res) {
//         if (res.status == 1) {
//             var candlesticks = res.data.history;
//             for (let i = 0; i < candlesticks.length; i++) {
//                 candlesticks[i][0] = Math.floor(Date.parse(candlesticks[i][0]) / 1000)
//             }
//             // console.log(candlesticks.length);

//             // 调用 WebAssembly 函数 coiling_calculate
//             const start = performance.now();
//             const result = Module.coiling_calculate(candlesticks, candlesticks.length, interval);
//             const end = performance.now();

//             // 计算耗时
//             const timeElapsed = end - start;
//             console.log(`C++ 函数调用耗时：${timeElapsed} 毫秒`);

//             // 输出结果
//             console.log(result);
//         }
//     },
//     error() {
//         console.log('error');
//     }
// }
  const ticker = 'AAPL'
  const interval = '1440'
  fetch( 'https://us.mgjkn.com/stock/chart?ticker=' + ticker + '&interval=' + interval + '&start_at=2022-10-29&_tr=1737517264_316756&gzencode=false').then(res => res.json()).then(r => {
    const candlesticks = r.data.history.map(item => ({
      timestamp: Math.floor(Date.parse(item[0])),
      open: item[1],
      high: item[3],
      low: item[4],
      close: item[2],
      volume: item[5],
      turnover: item[6]
    }))

    chart?.applyNewData(candlesticks)
  })
})()