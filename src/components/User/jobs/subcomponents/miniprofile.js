import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';
// import { Link } from "gatsby"
import axios from 'axios';

//constants
const portfolio_EP = process.env.GATSBY_portfolioEP;
const publicEP = process.env.GATSBY_publicEP;
const noImage = process.env.GATSBY_noImg;
//end constants

const Miniprofile = (props) => {
    const { username } = props;
    const [portfolio, setPortfolio] = useState(null);
    const [profile, setProfile] = useState(null);

    const data = useStaticQuery(graphql`
        query{
            externalIcon: file(relativePath: {eq: "external_red.png"}) {
                childImageSharp {
                    fixed(width: 22) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    useEffect(() => {
        if(username){
            getData(portfolio_EP+"queryUser",username)
            .then(response => {
                // console.log(response);
                if(!response.message){
                    setPortfolio(response);
                }
            })
            .catch(error => console.log('Error fetching MiniP data from BE',error));
            
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'query': JSON.stringify({ username: username }),
            }

            axios.get(publicEP+"getField", { headers: headers })
            .then(response => {
                // console.log(response);
                if(response.data.status === 'sucess'){
                    setProfile(response.data.result);
                }
            }).catch(error => console.log('Error trying to fetch MiniP user avatar from BE',error));
        }
    },[]);

    /////////fecthing data////////////
    async function getData(url = '', _username) {
        const response = await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'username': _username,
        },
        });
        return response.json(); 
    };
    /////////END fecthing data////////////

    return (
        <div>
            {
                (profile && portfolio) &&
                    <div className="standardDivRowFullW justiAlig">
                        <img src={profile.avatar ? profile.avatar : noImage} className="miniImageJobs2" />
                        <div className="contentMiniMargins">
                            <p>{portfolio.description}</p>
                            {/* <Link to={`/portfoliouser?query=${portfolio.username}`}>{portfolio.username}</Link> */}
                            <a href={`/portfoliouser?query=${portfolio.username}`} className="aFlexAlignedCont" target="_blank" rel="noopener noreferrer">
                                {portfolio.username}<Img fixed={data.externalIcon.childImageSharp.fixed} className="miniMarginLeft" />
                            </a>
                        </div>
                    </div>
            }
        </div>
    )
}

export default Miniprofile;