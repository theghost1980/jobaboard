import React from 'react';
//components
import Layout from '../components/layout';
import { Link, useStaticQuery, graphql } from 'gatsby';
// import Img from 'gatsby-image';
//typewriter effect
import { Typewriter } from 'react-typewriting-effect'
import 'react-typewriting-effect/dist/index.css'
import Blockchainobserver from '../components/blockchainobserver';
import BtnOutLink from '../components/btns/btnoutlink';
//end typewriter effect

const Signup = () => {
    //graphql queries
    const data = useStaticQuery(graphql`
        query {
            signInImg: file(relativePath: {eq: "edited-jobaboard.svg"}) {
                publicURL
                id
            }
            benefit_lock: file(relativePath: {eq: "benefit1.svg"}) {
                publicURL
                id
            }
            benefit_instant: file(relativePath: {eq: "benefit2.svg"}) {
                publicURL
                id
            }
            benefit_dapps: file(relativePath: {eq: "benefit3.svg"}) {
                publicURL
                id
            }
        }
    `);
    //end grapqhql queries

    return (
        <Layout>
            <div className="signUpContainer">
                <div className="divRowSignUp" id="divSignUp">
                    <div className="contentDivSignUp">
                        <h1>One Crypto account to rule them all?</h1>
                        <p>
                        This makes us different from many other platforms out there. We operate in a decentralized manner and our cornerstone is the Hive cryptocurrency.
                        The steps are very simple: 
                        </p>
                        {/* TODO change this for an infographic */}
                        <ol>
                            <li>Open an account on <a href="https://hiveonboard.com?ref=jobaboard">Hive Blockchain</a></li>
                            <li>We recommend you to follow the "HiveOnboard" method since it is instant and you only need your phone number once.</li>
                            <li>Once you have your Hive account, come back and start using jobaboard.</li>
                        </ol>
                        <p>Under any doubts check our <Link to="/faq">F.A.Q section</Link>. We hope to see you On-a-board soon.</p>
                    </div>
                    <div className="signImgCont">
                        <img src={data.signInImg.publicURL} 
                            // TODO onLoad={() => <p>Loading...</p>}
                            className="svgSignUpImage"
                            alt={`${data.signInImg.id}`}
                        />
                    </div>
                </div>
                <div className="blockChainObserver">
                    <div className="standardContentMargin">
                        <Blockchainobserver renderMode={"compactMode"} testingData={false} showBlocks={false}/>
                        <p>We are showing you each 4 seconds. But in fact, a new block is created every 2 seconds. Amazing Right?</p>
                        <BtnOutLink toolTip={"Check our own Hive Block explorer."}
                            textLink={"New tab, new blocks."} link={"/jabexplorer?tx_id=default"}
                        />
                    </div>
                </div>
                <div className="divRowSignUp">
                    {/* benefits section */}
                    <ul className="ulBenefits">
                        <li>
                            <div className="cardBenefit">
                                <h2>Control you finances</h2>
                                <p>Less risk of losing your money. You are your own bank. Yes, just as you read it. You have full control of your tokens, all the time.</p>
                                <div className="cardImgCont">
                                    <img src={data.benefit_lock.publicURL} className="imgBenefitSVG" alt={`${data.benefit_lock.id}`} />
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="cardBenefit">
                                <h2>Instant{" "}
                                    <Typewriter 
                                        string={'money. Tokens.'}
                                        delay={80}
                                        cursor='_'
                                    />
                                </h2>
                                <p>Thanks to blockchain technology, used by Hive's blockchain, you can send or receive your tokens in seconds. <a href="https://hiveblocks.com/">See in real time</a> how fast the tokens move.</p>
                                <div className="cardImgCont">
                                    <img src={data.benefit_instant.publicURL} className="imgBenefitSVG" alt={`${data.benefit_instant.id}`} />
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="cardBenefit">
                                <h2>App and DApps</h2>
                                <p>By having a Hive account, you have access to many applications. One of them is jobaboard. That's why our motto is "one account to rule them all".</p>
                                <div className="cardImgCont">
                                    <img src={data.benefit_dapps.publicURL} className="imgBenefitSVG" alt={`${data.benefit_dapps.id}`}  />
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="divCalltoAction">
                    <p>Change the way you have been hiring people or getting hired.</p>
                    <a href="https://hiveonboard.com?ref=jobaboard" className="superText">Sign Up</a>
                </div>
            </div>
        </Layout>
    )
}

export default Signup;