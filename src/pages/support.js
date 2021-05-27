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
                <h1 className="textAlignedCenter">Bugs/Errors Wanted.</h1>
                <div className="standardDivRowFullW" id="supportCont">
                    <div className="standardDivColW50perc justiAlig" id="supportCont-inner-1">
                        <Img fluid={data.wanted_poster.childImageSharp.fluid} className="bigImage400w boxShadowBottomStrong" />
                        {
                            userdata && userdata.logged &&
                            <h3 className="justUnderlineText pointer scaleOnHover" onClick={() => setShowTopUsersList(!showTopUsersList)}>Is there a list of top contributers?</h3>
                        }
                    </div>
                    <div className="standardDivColW50perc justJustifiedContent" id="supportCont-inner-2">
                        {
                            !showHandler &&
                            <div className="standardContentMarginLR">
                                <p>Please fill all the necessary information bellow and submit.</p>
                                <p>We will be giving away prizes, HIVE and splinterlands cards for those users who contribute the most.</p>
                                <h3>Why do we need you?</h3>
                                <p>Because we want to test many features and improve the current work on Jobaboard, so we can go live improved and reloaded.</p>
                                <p>You have more chances to win prizes if you:</p>
                                <ul>
                                    <li>Test out all the features of JAB. That means: create NFTs, transfer, buy/sell.</li>
                                    <li>Post Gig/Jobs/Services by using the NFTs you created.</li>
                                    <li>Order other users Gigs/Jobs.</li>
                                    <li>Submit the form bellow under any Bug, error or failed transaction or process.</li>
                                </ul>
                                <h4>After this 2 weeks we will check all the data received and give prizes away.</h4>
                                <button className="justWidth50" onClick={interactSupport}>Enough talk, Show me the form!</button>
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
