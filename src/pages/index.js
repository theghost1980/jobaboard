import React from "react";
import { graphql, useStaticQuery, Link, navigate } from "gatsby"

import Layout from "../components/layout"
// import SEO from "../components/seo"

//styles
import '../styles/styles.css'; 
//components
import MainCarousel from "../components/maincarousel";
import Visualizator from "../components/Blog/visualizator";
import Browseby from "../components/Categories/browseby";
import Infographic from "../components/Infographics/infographic";
import { check } from "../utils/helpers";

const Index = (props) => {
    const userdata = check();
    //functions/CB
    //testing to add navigating_on into redux on each user clicked on Menu
    const navigateToApp = (goingTo) => {
      console.log('User wants to go to:',goingTo);
      //TODO save into redux
      // dispatch(setValueOnProfile({ type: "navigating_on", value: goinTo}));
    }
    //END testing to add navigating_on into redux on each user clicked on Menu
    //END functions/CB

  return (
      <Layout>
        <div className="homepageContainer">
          {/* <SEO title="Home" /> */}
          <div className="mainCarouselExtCont">
            <MainCarousel logged={userdata.logged} />
          </div>
          {/* TODO important: Modify the old cats but the new one in a separate component */}
          <h1>What is JAB?</h1>
          <p>JobABoard is a jobs and services platform that operates under today's industry standards but, using something that sets us apart. We make use of NFTs.</p>
          <p>On JobAboard you can post your virtual or physical services and earn money. Like many other platforms, you can create your profile, post your skills and experiences but, here you don't need to have an international bank account because we use Blockchain technology.</p>
          <h2>What do I need to start on JAB?</h2>
          <p>All you need is to have an account on our blockchain called HIVE and a huge desire to gain experience and coins.</p>
          <Infographic />
          <hr></hr>
          <Browseby pagination={{ pagination: true, perSlide: 3}} cbSeleted={(item) => navigate(`/explore?category=${item.name}|sub_category=none`)}/>
          <hr></hr>
          <h2>Why do we use NFTs?</h2>
          <p>We use NFTs or non-fungible tokens because we can represent, in the form of durable data, something in particular. Imagine you have a lot of experience doing a trade like web pages. You can create your own token and make that token last over time in every job you do from now on.</p>
          <p>Another reason is because of its level of security that makes it impossible for third parties to tamper with the token. The blockchain technology also serves as a secure and completely autonomous means of exchange. Free from any political or governmental entity.</p>
          <h2>NFTs are here for stay</h2>
          <p>By being able to use the benefits of NFTs, we can create digital content that lasts as long as the Internet is active, that is, virtually forever.</p>
          <p>To learn more about NFTs visit our <Link to="/blog">Blog</Link> or access the <Link to="/nfts">NFTs</Link> section.</p>
          <div className="marginsTB">
            <h2 className="textAlignedCenter">Annoucements on JAB@blog</h2>
            <Visualizator hiveUser={"jobaboard"} limit={10}  filter_tags={['general-annouces']} openMode={"onTopOfAll"}
              xclassCSS={"standardDivFlexPlain bordersRounded justshadows justiAlig bgBlocksBlue justWidthAuto"} devMode={false} hideRefreshBtn={true}
              xtraClassOnTopDiv={"justTop100p bordersRounded"} xclassCSSLi={"marginLeft"} xclassCSSUL={"scrolBarThin"}
            />
          </div>
        </div>
      </Layout>
  )
}

export default Index;
