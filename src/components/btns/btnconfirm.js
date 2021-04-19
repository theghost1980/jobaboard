import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Optional, The extra css class.
 * @param {function} btnAction - Call back to assign a value on each switch action
 * @param {String} typeIcon - Type of icon to show: "confirm","decline"
 * @param {String} animation - animation class if needed.
 * @param {String} title - Tip tool text
 * @param {String} size - Optional to define a smaller version of the icons. "" = default = 35px. "mini" = 15px.
 */

const Btnconfirmcancel = (props) => {
    const { xclassCSS, btnAction, typeIcon, animation, title, size } = props;

    const data = useStaticQuery(graphql`
        query{
            confirmIcon: file(relativePath: {eq: "checked.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            declineIcon: file(relativePath: {eq: "decline_orange.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            miniconfirmIcon: file(relativePath: {eq: "checked.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            minideclineIcon: file(relativePath: {eq: "decline_orange.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries
    const typeBtn = typeIcon === "confirm" ? data.confirmIcon.childImageSharp.fixed
                                :   data.declineIcon.childImageSharp.fixed;
    const typeBtn2 = typeIcon === "confirm" ? data.miniconfirmIcon.childImageSharp.fixed
                                :   data.minideclineIcon.childImageSharp.fixed;

    const clicked = () => {
        btnAction();
    };

    return (
        <div title={title} className={`${xclassCSS} ${animation} ${size ? 'miniConfirmationBtn' : 'confirmationBtn'} justBorders justRounded`} onClick={clicked}>
            <Img fixed={!size ? typeBtn: typeBtn2} />
        </div>
    )
}

export default Btnconfirmcancel;