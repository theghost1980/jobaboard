import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

const Btnswitch = (props) => {
    const { xtraClassCSS, btnAction, sideText, showValueDevMode } = props;

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

    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        btnAction(clicked);
        if(showValueDevMode){
            console.log(`Sending Value:${clicked} on startUp.`);
        }
    },[]);

    useEffect(() => {
        btnAction(clicked);
        if(showValueDevMode){
            console.log(`Sending Value:${clicked} on clicked.`);
        }
    },[clicked]);

    return (
        <div className={`standardDivRowFullW justiAlig ${clicked ? null: 'addOFFSwitch'}`}>
            <p className="darkText">{sideText}</p>
            <div className={`${xtraClassCSS !== null ? xtraClassCSS : null} btnSwitch marginTopRigthMin`} onClick={() => setClicked(!clicked)}>
                <Img fixed={data.sphere.childImageSharp.fixed} className={`imgSwitch ${clicked ? 'addLeft': 'addRight'}`} />
            </div>
        </div>
    )
}

export default Btnswitch;