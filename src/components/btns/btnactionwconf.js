import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Optional, The extra css class.
 * @param {function} btnAction - Call back to assign a value on each switch action
 * @param {String} typeIcon - Type of icon to show: "block", "unblock"
 * @param {String} title - Tip tool text
 */

const Btnactionwithconf = (props) => {
    const { xclassCSS, btnAction, typeIcon, title } = props;

    const data = useStaticQuery(graphql`
        query{
            block: file(relativePath: {eq: "blocked.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            unblock: file(relativePath: {eq: "unblock.png"}) {
                childImageSharp {
                    fixed(width: 15) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries
    const sourceIcon = typeIcon === "block" ? data.block.childImageSharp.fixed : data.unblock.childImageSharp.fixed;

    const clicked = () => {
        const answer = window.confirm(`Do you confirm to ${typeIcon} this user?`);
        if(answer){
            btnAction();
        }
    };

    return (
        <div title={title} className={`${xclassCSS}  justBorders`} onClick={clicked}>
            <Img fixed={sourceIcon} />
        </div>
    )
}

export default Btnactionwithconf;