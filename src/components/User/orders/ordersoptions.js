import React from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Extra CSS class if needed.
 * @param {function} btnAction - Call back to assign a value on each switch action
 */

const Orderoptions = (props) => {
    const { xclassCSS, btnAction } = props;

    const data = useStaticQuery(graphql`
        query{
            closeIcon: file(relativePath: {eq: "decline.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            reportIcon: file(relativePath: {eq: "report-white.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            editIcon: file(relativePath: {eq: "edit-white.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            
        }
    `);
    //end grapqhl queries

    // const clicked = () => {
    //     btnAction();
    // };

    return (
        <div className={`${xclassCSS} marginLeft`}>
            <ul className="justBackRed standardUlRow justRounded">
                <li className="standardLiHovered" title="Report to admins!">
                    <Img fixed={data.reportIcon.childImageSharp.fixed} />
                </li>
                <li className="standardLiHovered" title="Edit Order">
                    <Img fixed={data.editIcon.childImageSharp.fixed} />
                </li>
            </ul>
        </div>
    )
}

export default Orderoptions;