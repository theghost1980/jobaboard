import React from 'react';

/**
 * Assign the project to an employee.
 * @param {String} xtraClass - Extra class you want to apply to the absolute black wrapper. I.e: justifyFlexStart.
 */

const Absscreenwrapper = (props) => {
    const { xtraClass } = props;
    return (
        <div className={`blackAbsCont ${xtraClass} zIndexMaxTop`}>
            {props.children}
        </div>
    )
}

export default Absscreenwrapper;