import React, { useState } from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Img from 'gatsby-image';

const Jobitoassistant = (props) => {
    const [open, setopen] = useState(true);
    //passing by props to know what he must help with. In order to show a nice phrase about it
    const { helpmewith } = props;

    const data = useStaticQuery(graphql`
        query{
            jobixSVG: file(relativePath: {eq: "jobito.svg"}) {
                publicURL
            }
            closeIcon: file(relativePath: {eq: "decline.png"}) {
                childImageSharp {
                    fixed(width: 30) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            # faqIcon: file(relativePath: {eq: "faq.png"}) {
            #     childImageSharp {
            #         fixed(width: 40) {
            #             ...GatsbyImageSharpFixed_withWebp
            #         }
            #     }
            # }
            # supportIcon: file(relativePath: {eq: "support.png"}) {
            #     childImageSharp {
            #         fixed(width: 40) {
            #             ...GatsbyImageSharpFixed_withWebp
            #         }
            #     }
            # }
        }
    `);
    //end grapqhl queries
    
    return (
        open &&
            <div className="jobitoAssistantCont">
                <div className="divRowJobitoAssistant">
                    <div className="absCloseCont" onClick={() => setopen(false)}>
                        <Img fixed={data.closeIcon.childImageSharp.fixed} className="closeImg" />
                    </div>
                    <div>
                        <h2>Jobito is happy to help you!</h2>
                        <h3>Assist me with: <span className="propSearch">{helpmewith}</span></h3>
                        {/* TODO -> all logic about this tutorials & stuff */}
                        <button>Take me</button>
                    </div>
                    <div>
                        <img src={data.jobixSVG.publicURL} className="jobitoMini" />
                    </div>
                </div>
            </div>
    )
}

export default Jobitoassistant;