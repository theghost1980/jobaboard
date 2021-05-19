import React from 'react';

/**
 * Use to show the pages menu, after pagination on an array of items.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} xclassCSSUl - Optional The css Extra class for the ul.
 * @param {[Object]} items - array of items extract the pages from.
 * @param {Function} cbSetPageSelected - mandatory to set in parent the actual page.
 * @param {Number} actualPage mandatory as the actual page state on parent.
 * @param {Boolean} devMode - Optional to see all the props and details. default as false.
 */

const Pagesmenu = (props) => {
    const { xclassCSS, items, cbSetPageSelected, devMode, actualPage, xclassCSSUl } = props;
    return (
        <div className={`${xclassCSS}`}>
            <ul className={`standardUlRow2 ${xclassCSSUl}`}>
                {
                    items.map((page,index) => {
                        return (
                            <li key={`${index}-page-Job-JAB`} className={`marginRight pointer scaleHovered ${index === actualPage ? 'activePage' : null }`}
                                onClick={() => cbSetPageSelected(index)}
                            >
                                {index + 1}
                            </li>
                        ) 
                    })
                }
            </ul>
        </div>
    )
}

export default Pagesmenu;
