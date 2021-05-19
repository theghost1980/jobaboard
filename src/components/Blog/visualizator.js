import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/helpers';
import Loader from '../loader';
import AbsWrapper from '../absscreenwrapper';
import BtnCloseMin from '../btns/btncloseMin';
import BtnOutLink from '../btns/btnoutlink';
// the same component they use in hive
import sanitizeHtml from 'sanitize-html';
import { Remarkable } from 'remarkable';
import Btnactionicon from '../btns/btnactionicon';
//constants
const { Client } = require("@hiveio/dhive");
const client = new Client('https://api.hive.blog');
const noImageSrc = process.env.GATSBY_noImg;
const md = new Remarkable({
    html: true, // remarkable renders first then sanitize runs...
    breaks: true,
    quotes: '“”‘’',
});
/**
 * Ask to fetch data posts on the selected account, from Hive chain.
 * It uses dhive straight from client - hive-chain.
 * It will bring a max of 100 posts, always the last posts.
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {String} xclassCSSUL - Optional The css Extra class for the Ul thats contains the blog post list.
 * @param {String} xclassCSSLi - Optional The css Extra class for the li that contains each post.
 * @param {String} xtraClassOnTopDiv - Optional if you need i.e render the blog post as "topOfAll" with extra magin-top.
 * @param {Boolean} hideRefreshBtn - Optional, default as false.
 * @param {String} hiveUser - The HiveUser you need to query on Dhive API.
 * @param {Number} limit - The number of posts you want to limit the response. 1 - 100(Max supported).
 * @param {Object} filter_tags - The array of tags you want to filter on client-side, as string['gatsby','hive',....]
 * @param {Boolean} noFilter - Mandatory to use when no filter to apply. 
 * @param {String} openMode - Define how to show the post when selected. Options: "none"(do nothing), "sameBottom"(opens the post bellow), "onTopOfAll"(opens the post on top of all), "newWindow"(as it says...)
 * @param {Boolean} devMode - Optional to console props and responses.
 */
// TODO very important:
// for now we are using sexosentido posting priv key and blog.
// LATER on, after tests, change to @jobaboard.

const Visualizator = (props) => {
    const { xclassCSS, hiveUser, limit, filter_tags, openMode, devMode, noFilter, hideRefreshBtn, xtraClassOnTopDiv, xclassCSSLi, xclassCSSUL, showRefresh } = props;
    // remarkable + sanitize-html
    const optionSanitize = {
        allowedTags: [ 
            'p', 'em', 'strong', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'sub', 'img', 'a', 'div',
            'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'quote', 'blockquote', 'iframe', 's',
            'ul', 'ol', 'code', 'li'
        ],
        allowedClasses: {
            'div': [ 'pull-right' ],
        }
    };
    //END remarkable + sanitize-html
    const [blogPosts, setBlogPosts] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [totalFounds, setTotalFounds] = useState(0);
    // const [tagSelectedPost, setTagSelectedPost] = useState([]);
    if(devMode){
        console.log('Received on props::::');
        console.log(`To lookUp posts from:${hiveUser}`);
        console.log(`limit:${limit}`);
        console.log(`filter_tags:${filter_tags}`);
        console.log(`openMode: ${openMode}`);
        console.log(`hideRefreshBtn: ${hideRefreshBtn}`);
    }

    //functions/CB
    // const selectedItem = (item) => {
    //     if(devMode){ console.log('Clicked and about to send it to parent:', item);}
    //     clickedSubItemCB(item);
    // }
    async function loadPosts(){
        // const filterTags = filter_tags ? filter_tags : [];
        setLoadingData(true);
        const query = { tag: hiveUser, limit: limit,};
        if(devMode){ console.log('Sending query to HIVE:',query)};
        await client.database
            .getDiscussions('blog', query)
            .then(response => {
                if(devMode){ console.log("We've got a response from HIVE:")};
                console.log(response); 
                setBlogPosts(response);
                setLoadingData(false);
            }).catch(error => {
                console.log('Error fecthing data from HIVE.',error);
                setLoadingData(false);
            });
    }
    function checkImage(metadata){
        // "{\"app\":\"gatsby-source-hivejs/0.1\",\"format\":\"markdown\",\"image\":[\"https://ep01.epimg.net/cultura/imagenes/2020/07/09/babelia/1594283839_429585_1594285276_noticia_normal_recorte1.jpg\",\"https://www.cesarsway.com/wp-content/uploads/2015/06/puppy-checklist.png\",\"https://static.theceomagazine.net/wp-content/uploads/2019/06/12110705/Iceland.jpg\"],\"links\":[\"https://www.gatsbyjs.com/\",\"https://www.quora.com/What-are-some-examples-of-dynamic-websites-and-why-are-they-called-dynamic\",\"https://saturnoman.com/blog/\",\"https://saturnoman.com/\"],\"tags\":[\"leofinance\",\"hive\",\"gatsbyjs\",\"reactjs\",\"saturnoman\"]}"
        const mdParsed = JSON.parse(metadata);
        if(mdParsed.image && mdParsed.image[0]){
            return mdParsed.image[0];
        }else{
            return noImageSrc;
        }
    }
    function getTags(metadata){
        const mdParsed = JSON.parse(metadata);
        if(mdParsed.tags){
            // setTagSelectedPost(mdParsed.tags);
            return "#"+mdParsed.tags.join(" #");
        }
    }
    function formatDate(strDate){
        const arDate = String(strDate).split("T")[0].split("-").reverse().join("/");
        // const arTime = String(strDate).split("T")[1].split(":");
        // const hMs = arTime[0] + ":" + arTime[1] + ":" + String(Number(arTime[2]).toFixed(0));
        // console.log(`${arDate} at ${hMs}`);
        return `${arDate}`;
    }
    //END functions/CB

    //to load on init
    useEffect(() => {
        if(hiveUser && limit){
            if(devMode){ console.log('Searching posts...')}
            setLoadingData(true);
            loadPosts();
        }else{
            if(devMode){
                console.log('One mandatory prop was not provided. Please check!');
            }
        }
    },[]);
    //END to load on init
    return (
        <div className={`${xclassCSS} justiAlig`}>
            {
                loadingData &&
                <div className="standardFlex150px  justiAlig"><Loader xtraClass={"justMarginAuto"} logginIn={loadingData} typegif={"spin"}/></div>
            }
            {
                blogPosts && blogPosts.length > 0 && !loadingData &&
                <div>
                    <ul className={`standardUlRowFlexPlain justOverflowX ${xclassCSSUL}`}>
                        {
                            blogPosts.map(post => {
                                const parsedMD = JSON.parse(post.json_metadata);
                                const tags = parsedMD.tags;
                                const found = filter_tags.some(p => tags.includes(p));
                                // console.log(found);
                                return (
                                    (found || noFilter) ?
                                    <li key={post.post_id} className={`scaleHovered pointer standardUlColPlain whiteBack justWidth250 ${xclassCSSLi}`}
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        {
                                            post.json_metadata
                                            && 
                                            <div className="standardDiv250x140OverflowH">
                                                <img src={checkImage(post.json_metadata)} className="miniImagePosts250p" />
                                            </div>
                                        }
                                        <div className="standardDivRowFullW justSpaceAround">
                                            <p className="normalTextSmall">{String(post.title).substring(0,18) + "..."}</p>
                                            <p className="normalTextSmall">{formatDate(post.created)}</p>
                                        </div>
                                        <p className="justxxsmalltext noMarginsTB textAlignedCenter">{getTags(post.json_metadata)}</p>
                                    </li>
                                    : null
                                )
                            })
                        }
                    </ul>
                    {
                        hideRefreshBtn ? null : <Btnactionicon xclassCSS={"minidisplay pointer whiteBack scaleHovered"} title={"Click to refresh recent blog posts."} btnAction={() => loadPosts()}/>
                    }
                </div>
            }
            {
                selectedPost && !loadingData &&
                (openMode === 'sameBottom') &&
                <div>
                    <h1>{selectedPost.title}</h1>
                    <div className="contentBody borderPreview" 
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(md.render(selectedPost.body), optionSanitize)
                        }}
                    />
                </div>
            }
            {
                selectedPost && !loadingData &&
                (openMode === 'onTopOfAll') &&
                <AbsWrapper>
                    <div className={`relativeDiv whiteBack justWidth90 ${xtraClassOnTopDiv}`}>
                        <div className="standardDisplayJusSpaceAround justHeightAuto">
                            <p>Viewing Now: <BtnOutLink toolTip={'Open a new tab, to View it on Hive.Blog'} textLink={selectedPost.title} link={`https://hive.blog/@${selectedPost.author}/${selectedPost.permlink}`} /> </p>
                            <BtnCloseMin btnAction={() => setSelectedPost(null)}/>
                        </div>
                        <div className="standardContentMargin">
                            <h1>{selectedPost.title}</h1>
                            <div className="contentBody borderPreview relativeDiv" 
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(md.render(selectedPost.body), optionSanitize)
                                }}
                            />
                            <BtnCloseMin classCSS={"justBottomPosLeft0"} btnAction={() => setSelectedPost(null)}/>
                        </div>
                    </div>
                </AbsWrapper>
            }
        </div>
    )
}

export default Visualizator;