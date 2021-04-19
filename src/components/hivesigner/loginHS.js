import React, { useEffect } from 'react';
import { useStaticQuery, graphql, navigate } from "gatsby"
import Img from 'gatsby-image';
//hivesigner SDK + init
var hivesigner = require('hivesigner');
/////////////////////////////
// for local testing
// const client = new hivesigner.Client({
//     app: 'jobaboard',
//     callbackURL: 'http://localhost:8000/callbackhs',
//     scope: ['vote', 'comment']
// });

// for testing on neflify https://awesome-hoover-fbbbdc.netlify.app/callbackhs
const client = new hivesigner.Client({
    app: 'jobaboard',
    callbackURL: 'https://awesome-hoover-fbbbdc.netlify.app/callbackhs',
    scope: ['vote', 'comment']
});
/////////////////////////////

const LoginHS = (props) => {
    const { username } = props;

     //graphql queries
     const data = useStaticQuery(graphql`
        query {
            logoHS: file(relativePath: {eq: "hivesigner.png"}) {
                childImageSharp {
                    fixed(width: 200, webpQuality: 70) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
     `);
     //end grapqhql queries

     const tryLoginHS = () => {
        if(!username){
            return console.log('No input no sauce. Please add a username!');
        }else{
            //this state could be the actual page so we can take the person to this same page??
            //or we taje the person to profile as usual???
            client.login({ state: 'the MOFO, state'});
        }
     }

    return (
        <div onClick={tryLoginHS}>
            <Img fixed={data.logoHS.childImageSharp.fixed} className="hsImgLogo" />
        </div>
    )
}

export default LoginHS;