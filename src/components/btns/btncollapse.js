import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Clickeable button as expand/collapse action with a callback.
 * @param {String} xclassCSS - Optional, The extra css class.
 * @param {function} btnAction - Call back to assign a value on each switch action
 * @param {Boolean} toogleValue - the state constant you are using on parent's.
 * @param {String} title - Tip tool text
 */

const Btncollapse = (props) => {
    const { xclassCSS, btnAction, toogleValue, title } = props;

    const data = useStaticQuery(graphql`
        query{
            collapse: file(relativePath: {eq: "collapse_arrow.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            expand: file(relativePath: {eq: "expand_arrow.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries
    const sourceIcon = toogleValue ? data.collapse.childImageSharp.fixed : data.expand.childImageSharp.fixed;
    
    const clicked = () => {
        btnAction();
    };

    return ( 
        <div title={title} className={`${xclassCSS} aInlineFlexPlain pointer`} onClick={clicked}>
            <Img fixed={sourceIcon} />
        </div>
    )
}

export default Btncollapse;