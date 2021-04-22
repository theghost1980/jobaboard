import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} classCSS - The css class that belongs to.
 */

const Btnprint = (props) => {
    const { classCSS, btnAction } = props;

    const data = useStaticQuery(graphql`
        query{
            printIcon: file(relativePath: {eq: "print.png"}) {
                childImageSharp {
                    fixed(width: 35) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    return (
        <div className={`${classCSS} pointer`} onClick={() => window.print()}>
            <Img fixed={data.printIcon.childImageSharp.fixed} />
        </div>
    )
}

export default Btnprint;