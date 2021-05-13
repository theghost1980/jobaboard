import React from "react";
import { graphql, useStaticQuery, Link } from "gatsby"

import Layout from "../components/layout"
// import SEO from "../components/seo"

//styles
import '../styles/styles.css'; 
//components
import MainCarousel from "../components/maincarousel";
import Visualizator from "../components/Blog/visualizator";

const Index = () => {
    //graphql queries
    const data = useStaticQuery(graphql`
    query {
      # append_menu: allMongodbGatsbyCategory {
      #   edges {
      #     node {
      #       id
      #       image
      #       sub
      #       query
      #       name
      #       subtitle
      #       title
      #     }
      #   }
      # }
      append_menu: allMongodbGatsbyCategories(sort: {fields: name}) {
          edges {
              node {
                  active
                  id
                  thumb
                  image
                  name
                  query
                  sub_category
                  subtitle
                  title
              }
          }
      }
    }`);

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
            <MainCarousel />
          </div>
          {/* TODO important: Modify the old cats but the new one in a separate component */}
          <h1>What is JAB?</h1>
          <p>Simple dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
          <ul className="catBigUl marginsTB">
            {
              data.append_menu.edges.map(({ node: item}) => {
                // console.log(item)
                return (
                  item.active ?
                  <li key={item.id}>
                    <Link onClick={() => navigateToApp("explore")} to={`/explore?category=${item.name}|sub_category=none`}>
                      <div className="imgContCat relativeDiv">
                        <img src={item.image} className="imgCat" alt={`${item.name}-${item.id}`} />
                        <h2 className="justAbsolutePos">{item.name}</h2>
                      </div>
                    </Link>
                    {/* <p className="content">{item.title}</p>
                    <p className="content">{item.subtitle}</p> */}
                  </li>
                  : null
                )
              })
            }
          </ul>
          <h2>Why do we use NFTs?</h2>
          <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
          <h2>Where does it come from?</h2>
          <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>
          <p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>
          <h3>TODO. Explain about NFT. What make us different from other places to hire professionals.</h3>
          <div className="marginsTB">
            <h2 className="textAlignedCenter">Annoucements on JAB@blog</h2>
            <Visualizator hiveUser={"sexosentido"} limit={10}  filter_tags={['general-accounces']} openMode={"onTopOfAll"}
              xclassCSS={"standardDivFlexPlain bordersRounded justshadows justiAlig bgBlocksBlue justWidthAuto"} devMode={false} hideRefreshBtn={true}
              xtraClassOnTopDiv={"justTop100p bordersRounded"} xclassCSSLi={"marginLeft"} xclassCSSUL={"scrolBarThin"}
            />
          </div>
        </div>
      </Layout>
  )
}

export default Index;
