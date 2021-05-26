import React, { useState, useEffect } from 'react';
import { formatDateTime, check } from '../../utils/helpers';
import Visualizator from './visualizator';
// the same component they use in hive
import sanitizeHtml from 'sanitize-html';
import { Remarkable } from 'remarkable';
import Btncollapse from '../btns/btncollapse';
import Imageselector from '../interactions/imageselector';

// /**
//  * Sets a Ul horizontal menu and pass active prop to parent to activate childs css classes on hovered.
//  * @param {String} xclassCSS - Optional The css Extra class.
//  * @param {Function} clickedSubItemCB - The function/CB to return the hovered item on menu.
//  * @param {[Object]} items - The Array of objects to map and present.
//  * @param {Object} toShow - The props you want to display of this array of items' As ['name','title','query','active']
//  * @param {String} titleTable - Optional, if provided will show a title on Top as a Tr.
//  * @param {Boolean} devMode - Optional to see all the props and details. default as false.
//  */

// TODO add on BE an unload-temp images
// so the admin can upload images into CDN to later on use on post.
// also we could define this images into another mongo schema, so they can have a image bank
// to re-use and so on.
// TODO very important:
// for now we are using sexosentido posting priv key and blog.
// LATER on, after tests, change to @jobaboard.

//constants
const testTemplate = "## Any updates for today's work?\nLorem ipsum dolor sit amet, consectetur adipiscing elit. In elit odio, accumsan condimentum odio sit amet, tempor imperdiet ligula. Suspendisse potenti. Pellentesque vel sem sapien.\n### Another Title\nPellentesque vel sem sapien.\n## Useful MD data\n[A link](https://hive.blog/@sexosentido)\n[A non secure link](http://hive.blog/@sexosentido)\n![img](imageLinkHere)\n\n\n<strong>Posted using JAB platform v1.00</strong>"; 

const { Client } = require("@hiveio/dhive");
const client = new Client('https://api.hive.blog');
const dhive = require('@hiveio/dhive');
const blogPrivKey = process.env.GATSBY_postingKey; //jab posting key.
const blogtags = [
    {id: 'tagJAB-1', tag: 'test-general', description: 'Use this tag to post a test general related post', willAppearOn: 'None on JAB, hive-chain.'},
    {id: 'tagJAB-2', tag: 'announcement-admins', description: 'Use this tag to post an Annoucement only to admins of JAB.', willAppearOn: 'Admins Dashboard, hive-chain.'},
    {id: 'tagJAB-3', tag: 'general-annouces', description: 'Use this tag to post a General Annoucement on JAB.', willAppearOn: 'Index Page, Blog page, hive-chain.'},
    {id: 'tagJAB-4', tag: 'promotions', description: 'Use this tag to post a Promotion Annoucement on JAB.', willAppearOn: 'Blog page, hive-chain.'},
    {id: 'tagJAB-5', tag: 'jabers-dashboard', description: 'Use this tag to post Annoucements, promotions, etc related to JOBs/GIGs on JAB.', willAppearOn: 'Blog page, hive-chain, Each User Job Dashboard.'},
];
const footerOnPosts = "\n\nPosted using the Admin's Editor on JobAboard - JAB\n[jobaboard.net](https://jobaboard.net/)";
const arTags = [];
blogtags.forEach(tag => {
    arTags.push(tag.tag);
});
// TODO change after tests for jobaboard
const accountToPostTo = 'jobaboard';
const md = new Remarkable({
    html: true, // remarkable renders first then sanitize runs...
    breaks: true,
    quotes: '“”‘’',
});

const Blogeditor = (props) => {
    const userdata = check();
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
    const initialPostState = {
        title: "",
        body: "",
        author: accountToPostTo,
        tag: '', 
    };
    const [showEditor, setShowEditor] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [post, setPost] = useState(initialPostState);
    const [showTags, setShowTags] = useState(false);
    const [showImageBank, setShowImageBank] = useState(false);

    const { xclassCSS, clickedSubItemCB, items, toShow, devMode, titleTable } = props;
    if(devMode){
        console.log('Received on props::::');
    }

    //functions/CB
    function data(){
        if(post.title === '' || post.body === '' || post.tag === '' || post.author === ''){
            return false;
        }else{
            return true;
        }
    }
    function permLink(str){ // \d - numeric class, \s - whitespace, a-zA-Z - matches all the letters // ^ - negates them all - so you get - non numeric chars, non spaces and non colon // added match all - as well
        return (str === null || str === "") ? "" : String(str.replace(/[^a-zA-Z\-\d\s]/g, "")).toLowerCase().split(" ").join("-");
    }
    const sendPost = () => {
        if(!data()) return alert('Please fill all necessary fields!');
        const answer = window.confirm('Are you ready to send the post?\nPlease always check carefully as the following action is irreversible.');
        if(answer){
            //broadcast post to the MainNet
            // TODO send info to OPlogger
            function privKEY(){ 
                try {
                    const privateKey = dhive.PrivateKey.fromString(`${blogPrivKey}`);
                    return privateKey
                } catch (error) {
                    alert('It appears there is an error with that key, check if the format is correct for a posting key');
                    return null
                }
            }   
            client.broadcast
            .comment(processPostData(post),privKEY())
            .then(
                function(result) {
                    // TODO send results to OPlogger
                    console.log('Posted on MainNet Hive.blog');
                    console.log(`Block Number#${result.block_num}`);
                    alert(`Block Number#${result.block_num}`);
                    alert('Sent successfully to Hive Chain. You should be able to see the post within a few moments.');
                    setPost(initialPostState);
                    setShowEditor(false);
                },
                function(error) {
                    // TODO send results to OPlogger
                    alert('Please check the console --->');
                    console.log('There was an error while trying to push on MainNet');
                    console.error(error);
                }
            );
        }
    }
    function updatePostValue(name,value){
        setPost(prevState => {return {...prevState, [name]: value }});
    }
    function processPostData(postData){
        let matchArray = postData.body.match(/\(([^)]+)\)/g);
        const cleanArray = matchArray.map(item => {
            const newItem = item.split("(")[1]
            return newItem.split(")")[0]
        })
        const imageLinks = cleanArray.filter(item => 
            ((item.search('.jpg') !== -1) || (item.search('.png') !== -1) || (item.search('.jpeg') !== -1)) 
        );
        const links = cleanArray.filter(itemLink => 
            (itemLink.search('https://') !== -1 || itemLink.search('http://') !== -1) 
            &&
            ((itemLink.search('.jpg') === -1) && (itemLink.search('.png') === -1) && (itemLink.search('.jpeg') === -1))
        );
        const tags = ["jobaboard", "hive", post.tag];
        const json_metadata = JSON.stringify({
            app: "jobaboard platform/0.1",
            format: "markdown",
            image: imageLinks,
            links: links,
            tags: tags,
        });
        const permaLink = permLink(postData.title);
        const finalBody = postData.body + footerOnPosts;
        return {    
                author: postData.author,
                body: finalBody,
                json_metadata: json_metadata,
                parent_author: '',
                parent_permlink: tags[0],
                permlink: permaLink,
                title: postData.title 
            };
    }
    // const selectedItem = (item) => {
    //     if(devMode){ console.log('Clicked and about to send it to parent:', item);}
    //     clickedSubItemCB(item);
    // }
    //END functions/CB
    return (
        <div className={xclassCSS}>
            <ul className="warningTextXSmall">
                <li>Options the Editor</li>
                <li>Create new Post on @jobaboard, under defined TAGS: announcement-admins, general-annouces, promotions-users, contests.</li>
                <li>Edit posts.</li>
                <li>Delete by adding a deleted-from-jab tag.</li>
                <li>Visualise posts by tags, date, admin-creator.</li>
                <li>log the important actions to the OPLogger under admin-log</li>
                <li>Educate the admin about what tags correspont to each section on the platform. This can be a guided tour or just highlight each blog section in a SS.</li>
                <li>DEV NOTES</li>
                <li>Use the editor u did and the admin signs with his key to post blog posts under the desinged tags</li>
                <li>JAB-annoucements -> goes into all dashboards</li>
                <li>JAB-admins -> goes into admins and so on.</li>
                <li>JAB-promo -> index page and so on.</li>
            </ul>
            <Visualizator devMode={true} hiveUser={"jobaboard"} limit={100} filter_tags={arTags}
                xclassCSS={"standardDivFlexPlain"} openMode={"onTopOfAll"}
            />
            <button onClick={() => setShowEditor(!showEditor)}>Create Post</button>
            {
                showEditor &&
                <div>
                    <form className="formVertFlex">
                        <label htmlFor="title">Title of Post</label>
                        <input type="text" id="title" name="title" onChange={(e) => updatePostValue(e.target.name,e.target.value)} />
                        <p>permlink: {permLink(post.title)}</p>
                        <p>Available Tags:
                            <Btncollapse xclassCSS={"scaleHovered"} btnAction={() => setShowTags(!showTags)} toogleValue={showTags}/>
                        </p>
                        {
                            showTags &&
                            <ul>
                            {
                                blogtags.map(tag => {
                                    return (
                                        <li key={tag.id} title={`Will appear on: ${tag.willAppearOn}`}
                                            onClick={() => updatePostValue("tag",tag.tag)}
                                            className="standardLiHovered normalTextSmall"
                                        >
                                            tag: <strong>{tag.tag}</strong> Will appear on: {tag.willAppearOn}
                                        </li>
                                    )
                                })
                            }
                            </ul>
                        }
                        <p>Image Bank
                            <Btncollapse xclassCSS={"scaleHovered"} btnAction={() => setShowImageBank(!showImageBank)} toogleValue={showImageBank}/>
                        </p>
                        {
                            showImageBank &&
                            <div>
                                <Imageselector token={userdata.token} btnAction={(item) => console.log('From ImageS:',item)}/>
                            </div>
                        }
                        {
                            post.tag && <p title="jobaboard tag mandatory and automatic.">Selected Tag: #jobaboard <strong>#{post.tag}</strong></p>
                        }
                        <button className="standarBtnCont120x50Margin" type="button" onClick={() => updatePostValue("body",testTemplate)}>Template</button>
                        <label htmlFor="body">Body Content of Post:</label>
                        <textarea id="body" name="body" className="textEditorBody" placeholder="[Only Markdown Here please, avoid the use of img reserved word]"
                            onChange={(e) => updatePostValue(e.target.name,e.target.value)} 
                            value={post.body}
                        />
                    </form>
                    <div className="standardDisplayJusSpaceAround ">
                        <button onClick={() => setShowPreview(!showPreview)}>Show Preview Bellow</button>
                        <button onClick={sendPost}>Submit Post</button>
                    </div>
                </div>
            }
            {
                showPreview &&
                <div>
                    <br></br>
                    <hr></hr>
                    <p>Live Preview</p>
                    <h1>{post.title}</h1>
                    <div className="contentBody borderPreview" 
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(md.render(post.body), optionSanitize)
                        }}
                    />
                </div>
            }
        </div>
    )
}

export default Blogeditor;

// TEST data
// ## Any updates for today's work?
// In deed yes. I will work on constructing the post's data. Specifically the fields: `json_metadata`, so it can respect the initial form as used in hive.

// ### Data for testing markdown bellow

// # H1 Title
// ## H2 Title
// ### A h3 Title
// #### A h4 Title
// ##### A h5 Title
// ###### A h6 Title

// This is a test coming from Gatsby client.

// ### Things are not that easy
// It is a lot of work getting all the necessary to implement a crypto-social network.

// [A link](https://hive.blog/@sexosentido)
// [A non secure link](http://hive.blog/@sexosentido)

// Single line of code
// `let gatsbyJS = document.getAllByName("all");`

// Multiline of code
// ```
// const imageNode = {
//     id: createNodeId(`${firstImage}`),
//     imageUrl: `${firstImage}`,
//     internal: {
//       type: `CoverImage`,
//       description: `dummy`,
//       contentDigest: createContentDigest({}),
//     }
// }
// ```

// Lists ul & ol
// - List 1.
// - List 2.

// 1. List 1.
// 2. List 2.
// 3. List 3.

// Finally an Image:

// ![img](https://images.hive.blog/1536x0/https://i.stack.imgur.com/L9eua.jpg)

// <strong>Posted using JAB platform v1.00</strong>

// END TEST data