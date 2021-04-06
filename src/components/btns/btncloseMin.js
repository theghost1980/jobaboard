import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} classCSS - The css class that belongs to.
 * @param {function} btnAction - Call back to assign a value on each switch action
 */

const Btnclosemin = (props) => {
    const { classCSS, btnAction } = props;

    const data = useStaticQuery(graphql`
        query{
            closeIcon: file(relativePath: {eq: "decline.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    const clicked = () => {
        btnAction();
    };

    return (
        <div className={`${classCSS} marginTopRigthMin pointer`} onClick={clicked}>
            <Img fixed={data.closeIcon.childImageSharp.fixed} />
        </div>
    )
}

export default Btnclosemin;