import React, { useState } from 'react';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, LineMarkSeries} from 'react-vis';

/**
 * This component allows user to:
 * -> Draw a chart in mini or fullsize.
 * @param {String} xclassCSS - The css Extra class you want to assign to the main cont.
 * @param {Object} arrayData - The data you need to draw the chart.
 * @param {String} titleGraph - Title to show as "Hive 30 Days Price Chart".
 * @param {Number} daysToHandle - If you need to chart less days than 30 from initial request.
 */

const Charter = (props) => {
    const { arrayData, xclassCSS, titleGraph, daysToHandle} = props;

    //functions/CB
    function tsToDate(ts){
        const s2 = new Date(ts).toLocaleDateString();
        console.log(`s2:${s2}`);
        return s2;
    }
    //END functions/CB

    return (
        <div className={`${xclassCSS} relativeDiv`}>
            {
                titleGraph && <p className="textSmallGray justAbsolutePos">{titleGraph}</p>
            }
            <XYPlot
                width={320}
                height={200}>
                <HorizontalGridLines />
                    {/* <LineSeries */}
                    <LineMarkSeries
                        data={
                            (arrayData && arrayData.prices)
                            ?   arrayData.prices.slice(0,daysToHandle).map((price,index) => { 
                                    return { x: index, y: price[1] }
                                })   

                                : [
                                    {x: 1, y: 10},
                                    {x: 2, y: 5},
                                    {x: 3, y: 15}
                                    ]
                        }
                    />
                <XAxis title="date"/>
                <YAxis title="usd"/>
            </XYPlot>
        </div>
    )
}

export default Charter;