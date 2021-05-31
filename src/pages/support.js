import React, { useState } from 'react';
import Layout from '../components/layout';
import { Link, useStaticQuery, graphql, navigateTo } from 'gatsby';
import Img from 'gatsby-image';
import Supporthandler from '../components/Support-bugs/supporthandler';
import { check } from '../utils/helpers';
import Winnersboard from '../components/Support-bugs/winnersboard';

const Support = () => {
    const userdata = check();
    const [showHandler, setShowHandler] = useState(false);
    const [showTopUsersList, setShowTopUsersList] = useState(false);

    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            supportImg: file(relativePath: {eq: "support_image.jpeg"}) {
                childImageSharp {
                    fluid {
                        ...GatsbyImageSharpFluid
                    }
                }
            }
            wanted_poster: file(relativePath: {eq: "wanted_poster_jab_edited_final.png"}) {
                childImageSharp {
                    fluid {
                        ...GatsbyImageSharpFluid
                    }
                }
            } 
        }
    `);//end graphql queries

    //functions/CB
    const interactSupport = () => {
        if(userdata && userdata.logged){
            setShowHandler(true);
        }else{
            navigateTo("/signup");
        }
    }
    //END functions/CB

    return (
        <Layout>
            <div>
                <h1 className="textAlignedCenter">JAB support for you.</h1>
                <div className="standardDivRowFullW" id="supportCont">
                    <div className="standardDivColW50perc justiAlig" id="supportCont-inner-1">
                        <Img fluid={data.supportImg.childImageSharp.fluid} className="bigImage100per boxShadowBottomStrong" />
                        {/* {
                            userdata && userdata.logged &&
                            <h3 className="justUnderlineText pointer scaleOnHover" onClick={() => setShowTopUsersList(!showTopUsersList)}>Is there a list of top contributers?</h3>
                        } */}
                    </div>
                    <div className="standardDivColW50perc justJustifiedContent" id="supportCont-inner-2">
                        {
                            !showHandler &&
                            <div className="standardContentMarginLR">
                                <p>If you need support.</p>
                                <p>If you have bugs to report.</p>
                                <p>If you have complains to tell.</p>
                                <button className="justWidth50" onClick={interactSupport}>I do</button>
                            </div>
                        }
                        {
                            showHandler && <Supporthandler devMode={true} closeCB={() => setShowHandler(false)} />
                        }
                        {
                            userdata && !userdata.logged &&
                            <p className="xtraSmall">To being able to use support, you must be loggged. If you are not, JAB with redirect you to the sign up page.</p>
                        }
                    </div>
                </div>
                {
                    showTopUsersList && <Winnersboard closeCB={() => setShowTopUsersList(false)} />
                }
            </div>
        </Layout>
    )
}

export default Support;
