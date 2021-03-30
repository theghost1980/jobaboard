import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} xtraClassCSS - Assign an extra class for this component css.
 * @param {function} btnAction - Call back to assign a value on each switch action
 * @param {String} sideText - An extra string to show on component's left side.
 * @param {Boolean} showValueDevMode - If true show on console the actual value on each click.
 * @param {Boolean} initialValue - Value to start.
 * @param {String} title - Optional if you need to show as toolTip.
 */

const Btnswitch = (props) => {
    const { xtraClassCSS, btnAction, sideText, showValueDevMode, initialValue, title } = props;

    const data = useStaticQuery(graphql`
        query{
            sphere: file(relativePath: {eq: "sphere.png"}) {
                childImageSharp {
                    fixed(width: 25) {
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
        console.log(`Prop as initialValue received, using ${initialValue}.`)
    }

    const [clicked, setClicked] = useState(initialValue);

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
        <div className={`standardDivRowFullW justifyContentSpaced ${clicked ? null: 'addOFFSwitch'}`} title={title ? title : null}>
            <p className="darkText">{sideText}</p>
            <div className={`${xtraClassCSS !== null ? xtraClassCSS : null} btnSwitch marginTopRigthMin`} onClick={() => setClicked(!clicked)}>
                <Img fixed={data.sphere.childImageSharp.fixed} className={`imgSwitch ${clicked ? 'addLeft': 'addRight'}`} />
            </div>
        </div>
    )
}

export default Btnswitch;