import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';
import { useState } from 'react';

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Extra CSS class if needed.
 * @param {function} starCB - Call back to assign a value on each click action
 * @param {[Object]} rateDef - the array as [ { rated: 'Poor experience', star: 1 }....].
 * @param {Boolean} devMode optional to debug on console.
 */

// star_black.png
// star_orange.png
// star_white.png

const Starsgiver = (props) => {

    const data = useStaticQuery(graphql`
        query{
            starOrange: file(relativePath: {eq: "star_black.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    const { xclassCSS, starCB, devMode, rateDef } = props;
    const [star, setStar] = useState({ star: 0, rated: '',});

    //functions/CB
    const callBack = (star) => {
        if(starCB){
            starCB(star);
        }
        setStar(star);
    }
    //END functions/CB

    return (
        <div className={`${xclassCSS}`}>
            <ul className="standardUlRow justPaddingBottomX2">
            {
                rateDef.map(_star => {
                    return (
                        <li className="pointer" key={`${_star.star}-stars-JAB`} onClick={() => callBack(_star)}>
                            <Img fixed={data.starOrange.childImageSharp.fixed} title="My rating" className={star.star >= _star.star ? 'activeStar justRoundedFull': null } />
                        </li>
                    )
                })
            }
            {
                star.rated !== '' && <h3>{star.rated}</h3>
            }
            </ul>
        </div>
    )
}

export default Starsgiver;