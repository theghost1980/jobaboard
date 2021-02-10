import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

//styles
import '../styles/styles.css'; 

const IndexPage = () => {
    //graphql queries
    const data = useStaticQuery(graphql`
    query {
      append_menu: allMongodbGatsbyCategory {
        edges {
          node {
            id
            image
            sub
            query
            name
            subtitle
            title
          }
        }
      }
    }`);

// [url=https://imgbb.com/][img]https://i.ibb.co/bFd4CWW/lifestyle.jpg[/img][/url]
// [url=https://imgbb.com/][img]https://i.ibb.co/RNN7zQF/music.jpg[/img][/url]
// [url=https://imgbb.com/][img]https://i.ibb.co/Czgq3fM/programming.png[/img][/url]
// [url=https://imgbb.com/][img]https://i.ibb.co/p3rtLB9/tech.jpg[/img][/url]
// [url=https://imgbb.com/][img]https://i.ibb.co/nMYKMrL/vide.jpg[/img][/url]

  return (
    <Layout>
      <SEO title="Home" />
      <h1>What is Lorem Ipsum?</h1>
      <p>Simple dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
      <ul className="catBigUl">
        {
          data.append_menu.edges.map(({ node: item}) => {
            return (
              <li key={item.id} className="catItemCont">
                <div className="imgContCat">
                  <img src={item.image} className="imgCat" />
                  <h2>{item.name}</h2>
                </div>
                <p className="content">{item.title}</p>
                <p className="content">{item.subtitle}</p>
              </li>
            )
          })
        }
      </ul>
      <h2>Why do we use it?</h2>
      <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
      <h2>Where does it come from?</h2>
      <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>
      <p>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</p>
    </Layout>
  )
}

export default IndexPage