import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';
import Btninfo from './btninfo';

/**
 * Assign the project to an employee.
 * @param {String} xtraClassCSS - Assign an extra class for this component css.
 * @param {function} btnAction - Call back to assign a value on each switch action
 * @param {String} sideText - An extra string to show on component's left side.
 * @param {Boolean} showValueDevMode - If true show on console the actual value on each click.
 * @param {Boolean} initialValue - Value to start.
 * @param {String} title - Optional if you need to show as toolTip.
 * @param {Boolean} addInfoBtn - Optional if you need to show the info icon + infoMsg.
 * @param {String} infoMsg - Optional as the message to be shown when user hover the info icon.
 * @param {Boolean} miniSizes - Optional to reduce the size of icons.
 */

const Btnswitch = (props) => {
    const { xtraClassCSS, btnAction, sideText, showValueDevMode, initialValue, title, addInfoBtn, infoMsg, miniSizes } = props;

    const data = useStaticQuery(graphql`
        query{
            sphere: file(relativePath: {eq: "sphere.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            miniSphere: file(relativePath: {eq: "sphere.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries
    
    if(initialValue === null){ 
        initialValue = false ;
        if(showValueDevMode){ console.log(`Prop as initialValue not received, using false.`)}
    }else{
        if(showValueDevMode){console.log(`Prop as initialValue received, using ${initialValue}.`)};
    }

    const [clicked, setClicked] = useState(initialValue);
    const iconSource = miniSizes ? data.miniSphere.childImageSharp.fixed : data.sphere.childImageSharp.fixed;

    // useEffect(() => {
    //     btnAction(clicked);
    //     if(showValueDevMode){
    //         console.log(`Sending Value:${clicked} on startUp.`);
    //     }
    // },[]);

    useEffect(() => {
        btnAction(clicked);
        if(showValueDevMode){
            console.log(`Sending Value:${clicked} on clicked.`);
        }
    },[clicked]);

    return (
        <div className={`standardDivRowFullW ${xtraClassCSS} justifyContentSpaced ${clicked ? null: 'addOFFSwitch'}`} title={title ? title : null}>
            <p className="darkText">{sideText}</p>
            <div className={`${miniSizes ? 'btnSwitchMini': 'btnSwitch'} ${clicked ? 'justFlexJustStart':'justFlexJustEnd'}`} onClick={() => setClicked(!clicked)}>
                <Img fixed={iconSource} className={`imgSwitch`} /> 
            </div>
            {
                (addInfoBtn === true) ? <Btninfo size={"mini"} msg={infoMsg} /> : null
            }
        </div>
    )
}

export default Btnswitch;

//remove code ${clicked ? 'addLeft': 'addRight' }