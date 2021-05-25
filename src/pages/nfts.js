import React, { useState, useEffect } from 'react';
//components
import Layout from '../components/layout';
import Btncollapse from '../components/btns/btncollapse';
import Loader from '../components/loader';
import { Link } from 'gatsby';
// import { Link, useStaticQuery, graphql } from 'gatsby';
// import Img from 'gatsby-image';

const publicEP = process.env.GATSBY_publicEP;
const nft_sections = [
    {id:1, title: 'Non Fungible Tokens', content: 'Unlike cryptocurrencies, where all tokens are created equal, each non-fungible token is unique and limited in quantity. ', image: 'https://res.cloudinary.com/dbcugb6j4/image/upload/v1621976338/nft_1_s2as4n.jpg'},
    {id:2, title: 'What is a Non Fungible Token (NFT)?', content: 'Is a type of cryptographic token on a blockchain that represents a unique asset. These can be fully digital assets or tokenized versions of real-world assets. Since NFTs are not interchangeable with each other, they can function as proof of authenticity and ownership within the digital realm.', image: ''},
    {id:3, title: 'What is fungibility about?', content: 'Fungibility means that the individual units of an asset are interchangeable and essentially indistinguishable from one another.', image: ''},
    {id:4, title: 'How do NFTs work?', content: 'NFTs can be traded on open marketplaces, such as nftm.art and jobaboard.net. Such marketplaces connect buyers and sellers, and the value of each token is unique. Naturally, NFTs are prone to price changes in response to market supply and demand.', image: 'https://res.cloudinary.com/dbcugb6j4/image/upload/v1621976338/nft_2_dlvqvp.jpg'},
    {id:5, title: 'How can things like that be worth anything?', content: "As with any other valuable object, value is not something inherent to it, but a quality assigned by people. Basically, value is a shared belief. It doesn't matter whether it's fiat money, precious metals or a vehicle - all these things have value because people believe so. If that's how every valuable object becomes valuable, why should digital collectibles be any different?", image: ''},
    {id:6, title: 'Can I see the actual list of NFTs in Hive in real time?', content: 'Of course, just click on the expand list button just below this section.', image: ''},
];

const Nfts = () => {
    const [nfts, setNfts] = useState(null);
    const [showNfts, setShowNfts] = useState(false);
    const [loading, setLoading] = useState(false);

    //functions/CB
    function hasLink(nft){
        const md = JSON.parse(nft.metadata);
        if(md.url && md.url !== ''){
            return true;
        }else{
            return false;
        }
    }
    function getLink(nft){
        const md = JSON.parse(nft.metadata);
        if(md.url && md.url !== ''){
            return md.url;
        }
    }
    function getImage(nft){
        const md = JSON.parse(nft.metadata);
        if(md.icon){
            return md.icon;
        }else{
            return "https://res.cloudinary.com/dbcugb6j4/image/upload/v1621712575/file_1621712573714_rocket-emji_h1r5np.png"
        }
    }
    ///data fetching
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, headers: headers,})
                                        : fetch(url, { method: requestType, headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching
    //END functions/CB

    //load on each change
    useEffect(() => {
        if(showNfts === true){ // { contract: '', table: '', query: {}, limit: 0, offset: 0, indexes: [] };
            setLoading(true);
            const headers = { 'query': JSON.stringify({ contract: 'nft', table: 'nfts', query: {}, limit: 0, offset: 0, indexes: [] }) };
            dataRequest(publicEP+"publicQueryContractTable", "GET", headers, null).then(response => {
                console.log(response);
                if(response.status === 'sucess'){
                    setNfts(response.result);
                }
                setLoading(false);
            }).catch(error => {
                console.log('Error fecthing data.', error);
                setLoading(false);
            })
        }
    },[showNfts]);
    //END load on each change

    return (
        <Layout>
            <div>
                <h1 className="textAlignedCenter">Non Fungible Tokens - NFT</h1>
                <ul>
                    {
                        nft_sections.map(item => {
                            return (
                                <li key={`${item.id}-FAQ-JAB`} className="boxShadowBasicSoftBottom">
                                    <h2>{item.title}</h2>
                                    <div className="standardDivRowFlexAutoH">
                                        <p className={`textShadowBasicSoft ${item.image !== '' ? 'marginRight' : null}`}>{item.content}</p>
                                        {
                                            item.image !== '' ? <img src={item.image} className="justRounded border1pxContrast" /> : null
                                        }
                                    </div>
                                    
                                </li>
                            )
                        })
                    }
                </ul>
                <div className="standardDivRowFullW justiAlig justMargin0auto">
                    <p>{showNfts ? 'Collapse' : 'Expand'} NFTs list</p>
                    <Btncollapse xclassCSS="marginLeft" toogleValue={showNfts} btnAction={() => setShowNfts(!showNfts)}/>
                </div>
                {
                    loading && <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={loading} /></div>
                }
                {
                    showNfts && !loading && nfts &&
                    <ul className="justDisplayFlexRow justFlexWrap justAligned justSpaceAround">
                        {
                            nfts.map(nft => {
                                return (
                                        <li key={`${nft._id}-NFT-HIVE-JAB`} className="justDisplayFlexRow justAligned justWidth200 marginLeft justHeight140px miniMarginBottom justBordersRounded boxShadowBottomX relativeDiv scaleHovered">
                                            <div className="justDisplayFlexColumn">
                                                <div className="standardContentMarginMini">
                                                    <h4>{nft.symbol}</h4>
                                                    <h6>Circulating Supply: {nft.circulatingSupply}</h6>
                                                </div>
                                            </div>
                                            {   hasLink(nft) === true ?
                                                <a href={getLink(nft)} target="_blank" rel="noopener" className="justAbsolutePos justR_20T normalTextSmall">Visit</a> : null
                                            }
                                            <img src={getImage(nft)} className="smallImage"/>
                                        </li>
                                )
                            })
                        }
                    </ul>
                }
            </div>
        </Layout>
    )
}

export default Nfts;