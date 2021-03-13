import React from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Img from 'gatsby-image';

const Jobix = () => {
    const data = useStaticQuery(graphql`
        query{
            jobixSVG: file(relativePath: {eq: "jobito.svg"}) {
                publicURL
            }
            faqIcon: file(relativePath: {eq: "faq.png"}) {
                childImageSharp {
                    fixed(width: 40) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            supportIcon: file(relativePath: {eq: "support.png"}) {
                childImageSharp {
                    fixed(width: 40) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    return (
        <div className="jobixContainer">
            <div className="divRowJobix">
                {/* absolute menu */}
                <div className="supportMenuCont">
                    <ul className="ulSupportMenu">
                        <li>
                            <Img fixed={data.faqIcon.childImageSharp.fixed} className="imgSupport" 
                                title="Check Our FAQ section"
                            />
                        </li>
                        <li>
                            <Img fixed={data.supportIcon.childImageSharp.fixed} className="imgSupport"  
                                title="Talk to a live agent"
                            />
                        </li>
                    </ul>
                </div>
                {/* END absolute menu */}
                <div>
                    <h2>Jobito is the man!</h2>
                    <h3 style={{ fontStyle: 'italic', color: '#214E34'}}>He is quite seriuos but you will like him.</h3>
                    <h3>He will help you create a new job or service. Just follow his lead.</h3>
                    <button>Start my Journey</button>
                </div>
                <div>
                    <img src={data.jobixSVG.publicURL} className="jobito" />
                </div>
            </div>
        </div>
    )
}

export default Jobix;