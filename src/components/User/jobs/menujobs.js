import React from 'react';
import { useStaticQuery, graphql, Link, navigate } from "gatsby"
import Img from 'gatsby-image';


// TODO: active it or just remove it.
// We must decide if this one is needed.
const Menujobs = () => {
     //graphql queries
     const data = useStaticQuery(graphql`
     query {
         delete: file(relativePath: {eq: "delete-white.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         edit: file(relativePath: {eq: "edit-white.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         pause: file(relativePath: {eq: "pause-white.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         report: file(relativePath: {eq: "report-white.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
         resume: file(relativePath: {eq: "resume-white.png"}) {
             childImageSharp {
                 fixed(width: 30) {
                     ...GatsbyImageSharpFixed_withWebp
                 }
             }
         }
     }
     `);
     //end grapqhql queries

    return (
        <div className="standardFlexFixed coloredContrast2">
            <ul className="standardUlColThin">
                <li className="scaleHovered">
                    <Img fixed={data.resume.childImageSharp.fixed} />
                </li>
                <li className="scaleHovered">
                    <Img fixed={data.report.childImageSharp.fixed} />
                </li>
                <li className="scaleHovered">
                    <Img fixed={data.pause.childImageSharp.fixed} />
                </li>
                <li className="scaleHovered">
                    <Img fixed={data.edit.childImageSharp.fixed} />
                </li>
                <li className="scaleHovered">
                    <Img fixed={data.delete.childImageSharp.fixed} />
                </li>
            </ul>
        </div>
    )
}

export default Menujobs;
