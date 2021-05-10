import React, { useState, useEffect, useRef }from 'react';
import { useForm } from 'react-hook-form';
import { useStaticQuery, graphql, Link } from 'gatsby';
import Img from 'gatsby-image';
import ImageUploader from "react-images-upload";
//helpers/utils
import { check } from '../../../utils/helpers';
import axios from 'axios';
import Loader from '../../loader';
import Previewjob from './previewjob';
import Btninfo from '../../btns/btninfo';
//constants
// const rpcURL = 'http://185.130.45.130:5000/';
const adminEP = process.env.GATSBY_adminEP;
const nftEP = process.env.GATSBY_nftEP;
const rpcNode = process.env.GATSBY_testSSCNodeURL;
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
// end constants
// const SSC = require('sscjs');
// const ssc = new SSC('https://185.130.45.130:5000/');

// to change on my css as important
// if you need to modify it later on: >>> "/Users/SatMan1980/Downloads/program/gatsby/jobaboard/jobAboard/node_modules/react-images-upload/index.css"
// button delete on files uploaded: .fileContainer .deleteImage 
//upload button: .fileContainer .chooseFileButton { {


const Jobs = (props) => {

    //graphql queries
    const data = useStaticQuery(graphql`
        query{
            closeIcon: file(relativePath: {eq: "decline.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            infoIcon: file(relativePath: {eq: "info.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            # cats: allMongodbGatsbyCategory(sort: {fields: name}) {
            #     totalCount
            #         edges {
            #             node {
            #                 id
            #                 sub
            #                 name
            #             }
            #         }
            # }
            cats: allMongodbGatsbyCategories(sort: {fields: name}) {
                totalCount
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
        }
    `);
    //end grapqhl queries

    const userdata = check();
    //check on mounting
    useEffect(()=>{

        const _coins = localStorage.getItem("coins");
        if(_coins){
            setCoins(JSON.parse(_coins));
        }
        initCreateJob();
    },[]);

    const initialJobState = {
        username: userdata.username,
        category: String,
        sub_category: String,
        title: String,
        days_to_complete: 1, //by default 1 day.
        job_type: String,
        description: String,
        images: [String], 
        paying_price: Number,
        // escrow_type: String,
        // escrow_username: "TODO-NEXT-features",
        promoted: String, 
        active: String, 
        verifyed_profiles_only: String,
        files: [File],
    }

    const [job, setJob] = useState(initialJobState);
    const [selectedNft, setSelectedNft] = useState(null);
    const [ownedTokens, setOwnedTokens] = useState(null);
    const [pictures, setPictures] = useState([]);
    const { register, handleSubmit, errors } = useForm(); // initialize the hook
    const [subCats, setSubCats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myJobs, setMyJobs] = useState(null);
    const [sameTitle, setSameTitle] = useState(false);
    const [created, setCreated] = useState(false);
    const [newReceivedJob, setNewReceivedJOb] = useState(null);
    const [showNewJob, setShowNewJob] = useState(false);
    const [coins, setCoins] = useState(null);
    // to reset the imageUploader
    const [resetImgUp, setResetImgUp] = useState(false);
    // error on image so we will reset :D
    const [errorImage, setErrorImage] = useState(false);

    const [showMyJobs, setShowMyJobs] = useState(false);

    const [myNFTsMongo, setMyNFTsMongo] = useState([]); //the one this user has created on JAB an he is the actual issuer = owner.
    const [showMyNftsMongo, setShowMyNftsMongo] = useState(false);

    function initCreateJob(){
        //find user's owned NFTs.
        console.log('Asking for instances.')
        refreshUserNFTs();
        //get all job on this user
        // on load get jobs title for now.
        getDataWTFileImg(adminEP+"myjoblist")
        .then(response => {
            console.log(response);
            if(response.result.length > 0){
                setMyJobs(response.result);
            }
        })
        .catch(error => console.log('Error when query user jobs titles',error));
    }

    const clearOld = () => {
        setCreated(false);
        setPictures([]);
        setJob(initialJobState);
        initCreateJob();
    }

    //set a field on profile:
    function setJobField(name,value){
        if(name === "paying_price" && value > 10){ return alert('For now the max tokens you can ask is 10.\n As we expand the dev works we will update this to make it unlimited.\nSorry for the troubles.')}
        setJob(prevState => { return {...prevState, [name]: value}})
    }

    //refresh user tokens.
    function refreshUserNFTs(){
        // ssc.find("nft", "nfts", { issuer: "jobaboard", "properties.isPremium.authorizedEditingAccounts": userdata.username } , null, 0, [], (err, result) => {
        //     if(err) return console.log('Error asking state on User NFT tokens - SSCjs',err);
        //     // console.log(result);
        //     if(result.length > 0){
        //         setOwnedTokens(result);
        //     }
        // });
        getSSCData(nftEP+"allNFTs",{ issuer: "jobaboard", "properties.isPremium.authorizedEditingAccounts": userdata.username })
        .then(response => {
            if(response.error){ console.log('Error fetching data from BE',response.error);}
            if(response.length > 0){
                console.log(response);
                setOwnedTokens(response);
            }
        });
        updateNFTs();
    }

    //functions/CB
    function updateNFTs(){
        const query = {
            nft_id: null,
            symbol: '',
            account: userdata.username,
        };
        const sortby = { "symbol": 1 };
        bringNFTs(query,sortby);
    }
    function bringNFTs(query,sortby){
        sendGETBEJustH(nfthandlermongoEP + "getNFTquery",query,0, sortby)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setMyNFTsMongo(response.result);
            }
        }).catch(error => console.log('Error asking for NFTs on this user from DB, mongo.',error));
    }
    // end functions/CB

    // data fecthing
    async function sendGETBEJustH(url = '', query = {},limit = Number,sortby = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token,
                'query': JSON.stringify(query),
                'limit': limit,
                'sortby': JSON.stringify(sortby),
            },
        });
        return response.json(); 
    };
    // end data fecthing
    const testUploadImages = () => {
        //show loader
        setLoading(true);
        const formdata = new FormData();
        for (const file of pictures) {
            formdata.append('file', file);
        };
        formdata.append("username", job.username);
        const headers = {
            'x-access-token': userdata.token,
            'username': userdata.username,
            'title': '3 tristes tigresitos.....',
        };
        updateDataWTFileImg(`${adminEP}addImages`,formdata,headers)
        .then(data => {
            if(data.auth === false){
                console.log('Error on update!',data.message);
            }else{
                console.log('Images Uploaded!');
                console.log(data);
                //hide loader
                setLoading(false);
            }
        })
        .catch(error => console.log('Error while updating user data to API + image.',error));

    }

    const onSubmit = (data) => {
        // TODO confirmation message "are you happy with all the info you have written? yes to send >D"
        if(pictures.length === 0){
            const answerUser = window.confirm(`You are about to submit a Service/Job with no images.\nDo you agree to proceed?`);
            if(!answerUser) return null;
        }
        setLoading(true);
        console.log(data);
        const formdata = new FormData();
        for (const file of pictures) {
            formdata.append('file', file);
        };
        formdata.append("username", job.username);
        formdata.append("category", job.category);
        formdata.append("description", job.description);
        formdata.append("sub_category", job.sub_category);
        formdata.append("title", job.title);
        formdata.append("days_to_complete", job.days_to_complete);
        formdata.append("job_type", job.job_type);
        formdata.append("nft_symbol", selectedNft.symbol);
        formdata.append("paying_price", job.paying_price);
        // formdata.append("escrow_type", job.escrow_type);
        // formdata.append("escrow_username", job.escrow_username);
        formdata.append("promoted", (job.promoted === "on" ? true : false));
        formdata.append("active", (job.active === "on" ? true : false));
        formdata.append("verifyed_profiles_only", (job.verifyed_profiles_only === "on" ? true : false));
        formdata.append("createdAt", new Date().toString());
        const headers = {
            'x-access-token': userdata.token,
            'username': userdata.username,
            'title': job.title,
        };
        updateDataWTFileImg(`${adminEP}createJob`,formdata,headers)
        .then(response => {
            if(response.auth === false || response.status === 'failed'){
                console.log('Error on update!',response.message);
                setLoading(false);
            }else{
                console.log(response);
                if(response.status === 'success'){
                    console.log('Job Created!');
                    // todo later on, we may do something with response.data
                    setLoading(false);
                    setCreated(true);
                    setNewReceivedJOb(response.data);
                }
                //hide loader
                setLoading(false);
            }
        })
        .catch(error => console.log('Error while updating user data to API + image.',error));

    };
    
    const onDrop = picture => {
        //here we must check the aspect ratio and decide if the image go or not go
        if(picture.length > 0){
            const imgToCheck = picture[picture.length - 1];
            console.log(imgToCheck);
            var reader = new FileReader();
            reader.onload = function(e){
                var img = new Image();
                img.src = e.target.result;
                img.onload = function(){
                    const imgW = img.width;
                    const imgH = img.height;
                    const ar = imgW / imgH;
                    console.log(`W:${imgW},H:${imgH}. AR:${ar.toFixed(1).toString()}`);
                    if(ar >= 1){
                        console.log(`Passed`);
                    }else{
                        console.log('Not passed!');
                        setErrorImage(true);
                        setResetImgUp(!resetImgUp);
                        setTimeout(function(){
                            setErrorImage(false);
                        },9000);
                    }
                };
            };
            reader.readAsDataURL(imgToCheck);
        }
        setPictures(picture);
    };

    // useEffect(() => {
    //     console.log(pictures);
    // },[pictures]);

    // move just to handle 1 on loading useefeect above
    // useEffect(() => {
    //     // on load get jobs title for now.
    //     getDataWTFileImg(adminEP+"myjoblist")
    //     .then(response => {
    //         console.log(response);
    //         if(response.result.length > 0){
    //             setMyJobs(response.result);
    //         }
    //     })
    //     .catch(error => console.log('Error when query user jobs titles',error));
    // },[]);

    ////////////Axios Fetching DATA///////////
    async function updateDataWTFileImg(url = '', formData, headers) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            // headers: {
            //     'x-access-token': userdata.token
            // },
            headers: headers,
            body: formData,
        });
        return response.json(); 
    };
    async function getDataWTFileImg(url = '') {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token
            },
        });
        return response.json(); 
    };
    async function getSSCData(url = '',query = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token,
                'query': JSON.stringify(query),
            },
        });
        return response.json(); 
    };
    ////////////END Axios Fetching DATA//////

    const handleNftSelected = (event) => {
        // console.log(event.target.value);
        const symbolNft = String(event.target.value).split('-')[0];
        setSelectedNft(symbolNft);
        setJobField("nft_symbol",symbolNft);
    }

    const handleNftSelectedByIcon = (token) => {
        console.log('Selected:', token);
        console.log('Checking if the selected has price_base_on_cast:', token.price_base_on_cast);
        if(token.price_base_on_cast <= 0){ return alert('Before using a NFT for a Gig/Service, you must set its Casting Base Price.\nPlease go to Tokens > Edit.')}
        setSelectedNft(token);
        setJobField("nft_symbol",token.symbol);
    }

    const handleSelectedCat = (event) => {
        const cat = event.target.value;
        // old records
        // const _subCats = data.cats.edges.filter(({node: category}) => category.name === cat)[0].node.sub;
        // new records sub_category
        const _subCats = data.cats.edges.filter(({node: category}) => category.name === cat)[0].node.sub_category;
        setSubCats(_subCats);
        setJobField("category",cat);
    }

    const checkJobTitle = (event) => {
        const title = event.target.value;
        const name = event.target.name;
        if(myJobs){
            const founded = myJobs.filter(job => job.title === title);
            if(founded.length > 0){
                setSameTitle(true);
            }else{
                setSameTitle(false);
            }
        }
        setJobField(name,title);
    }

    return (
        <div className="jobsContainer">
            {/* <button onClick={testUploadImages}>Test images only</button> */}
            {
                (myNFTsMongo && myNFTsMongo.length > 0 && !created) &&
                    <div>
                        <h1>New Job/Service</h1>
                        <hr className="standardHr"></hr>
                        {
                            loading && 
                            <div className="miniImageJobs centered">
                                <Loader logginIn={true} type="spin" />
                            </div>
                        }
                        <form onSubmit={handleSubmit(onSubmit)} className={`formNewJob ${loading ? 'disableDiv': null}`}>
                            <label htmlFor="title">Title</label>
                            <input name="title" ref={register({ required: true })} onChange={checkJobTitle} />
                            { sameTitle &&  <div>
                                                <span className="alertSpan normalTextSmall">You already have a Job with this title. Please select a different title for the Job.</span>
                                                <div className="alertSpan normalTextSmall" onClick={() => setShowMyJobs(!showMyJobs)}>
                                                    {showMyJobs ? "Hide" : "Show"} <Img className="pointer" fixed={data.infoIcon.childImageSharp.fixed} title="Help me decide by showing all my jobs" />
                                                </div>
                                                {
                                                    showMyJobs &&   <ul className="normalTextSmall">
                                                                        {
                                                                            myJobs.map(job => {
                                                                                return (
                                                                                    <li key={job._id}>{job.title}</li>
                                                                                )
                                                                            })
                                                                        }
                                                                    </ul>
                                                }
                                            </div>
                            }
                            <label htmlFor="days_to_complete">How many days to complete:<Btninfo size={"mini"} msg={"This is an estimation to show. Can be modified on this Job by you at anytime, but before a deal is made with this Job/Gig."} /> </label>
                            <input name="days_to_complete" ref={register({ pattern: /[0-9]/g, required: true })} onChange={(e) => setJobField(e.target.name,e.target.value)} />
                            {errors.days_to_complete && <span className="errorValidation">'Please enter numbers Only.'</span>}
                            <label htmlFor="job_type">Job Type</label>
                            <select name="job_type" ref={register({ required: true })} onChange={(e)=>setJobField(e.target.name,e.target.value)}>
                                <option defaultValue="Select Type"></option>
                                <option value="employee">Employee(Who offers a Job/Service. I.e: I want to get hired.)</option>
                                <option value="employer">Employer(Who needs somebody to do Job/Service. I.e: I want to hire a professional.)</option>
                            </select>
                            <label htmlFor="description">Description</label>
                            <textarea name="description" ref={register({ required: true })} onChange={(e)=>setJobField(e.target.name,e.target.value)}  />
                            <label htmlFor="category">Category</label>
                            <select name="category" ref={register({ required: true })} onChange={handleSelectedCat}>
                                <option defaultValue="Select one Option"></option>
                                {
                                    data.cats.edges.map(({ node:cat }) => {
                                        return (
                                            cat.active ?
                                            <option key={cat.id}>{cat.name}</option>
                                            : null
                                        )
                                    })
                                }
                            </select>
                            <label htmlFor="sub_category">Sub Category</label>
                            
                            {   subCats &&
                                <select name="sub_category" ref={register({ required: true })} onChange={(e)=>setJobField(e.target.name,e.target.value)}>
                                <option defaultValue="Select one Option"></option>
                                {
                                    subCats.map(subcat => {
                                        return (
                                            <option key={`${subcat}-categoryJAB`}>{subcat}</option>
                                        )
                                    })
                                }
                            </select>
                            }
                            {/* <label htmlFor="nft_symbol">Token to Use</label>
                            <select name="nft_symbol" ref={register({ required: true })} onChange={handleNftSelected}>
                            <option defaultValue="Select one Token"></option>
                                {
                                    ownedTokens.map(token => {
                                        return (
                                            <option
                                                key={`${token._id}-ownedToken`}
                                            >
                                                {token.symbol} - SS: {token.circulatingSupply.toString()} Supply: {token.supply.toString()} Max Supply: {token.maxSupply.toString()}
                                            </option>
                                        )
                                    })
                                }
                            </select> */}
                            {/* new way more visual showing a mini icon of each user NFT */}
                            {/* <button className="btnMini2 normalTextSmall" onClick={() => setShowMyNftsMongo(!showMyNftsMongo)}>My NFTs</button> */}
                            <div className="standardDivRowFullW justAligned">
                                <p>{selectedNft ? `Token Selected: ${selectedNft.symbol} each on: ${selectedNft.price_base_on_cast} HIVE`: 'Please select a Token from the list bellow!'}</p>
                                <Btninfo size={"mini"} msg={"Only your NFTs with a Casting Price Set will be shown here. If you want to use another NFT definition you own, please go to Tokens > Edit > Edit Token Info"}/>
                            </div>
                            {   myNFTsMongo &&
                                <ul className="standardUlRowFlexPlain overflowXscroll">
                                    {
                                        myNFTsMongo.filter(token => token.price_base_on_cast > 0).map(token => {
                                            return (
                                                <li key={token._id} className="pointer hoveredBordered miniMarginLeft" onClick={() => handleNftSelectedByIcon(token)}>
                                                    <div className="textAlignedCenter">
                                                        <div>
                                                            <img src={token.thumb} className="miniImageJobs" />
                                                        </div>
                                                        <p className="xSmalltext justBoldtext">{token.symbol}</p>
                                                        <p className="xSmalltext">{token.price_base_on_cast} HIVE</p>
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            }
                            {/* emd new more visual way */}
                            { selectedNft && job.job_type &&
                                <>
                                <div className="standardDivRowFullW hSmall" name="divPaying">
                                    <label htmlFor="divPaying">
                                        {job.job_type === "employee" ? 'I will ask ': 'I will Pay '}
                                    </label>
                                    <input name="paying_price" className="inputSmall standardContentMarginLR" 
                                        ref={register({ pattern: /[0-9.,]/g, required: true })} 
                                        onChange={(e)=>setJobField(e.target.name,Number(e.target.value))}  
                                        defaultValue="0"
                                    />
                                    {/* <span>-{selectedNft ? selectedNft : 'Please select one Token.'}</span> */}
                                    <span className="justBoldtext">{job.paying_price ? `${selectedNft.symbol} ${job.paying_price === 1 ? 'Token.' : 'Tokens.'}`: null} {Number(selectedNft.price_base_on_cast * job.paying_price).toFixed(2)} HIVE. {(coins && job.paying_price) ? ` Equivalent to: ${Number(job.paying_price * coins.hive.usd * selectedNft.price_base_on_cast).toFixed(3)}  USD.`: null }</span>
                                </div>
                                </>
                            }
                            {errors.paying_price && <span className="errorValidation">'Please enter numbers Only.'</span>}
                            <label htmlFor="verifyed_profiles_only">Accept only Verified profiles</label>
                            <input type="checkbox" name="verifyed_profiles_only" ref={register} onChange={(e)=>setJobField(e.target.name,e.target.value)} />
                            <label htmlFor="active">Activate on Creation</label>
                            <input type="checkbox" name="active" ref={register} onChange={(e)=>setJobField(e.target.name,e.target.value)} />
                            <label htmlFor="promoted">Promoted</label>
                            <input type="checkbox" name="promoted" ref={register} onChange={(e)=>setJobField(e.target.name,e.target.value)}  />
                            {/* <label htmlFor="escrow_type">Escrow Type</label>
                            <select name="escrow_type" ref={register({ required: true })} onChange={(e)=>setJobField(e.target.name,e.target.value)} >
                                <option defaultValue="Select one Option">Select one Option</option>
                                <option value="system">System Auto</option>
                                <option value="select_from_lists">I want to select from list. -TODO</option>
                            </select> */}
                            <label htmlFor="imagesUploader-third-party">Support Images. First image will be Cover Image.</label>
                            {
                                errorImage &&
                                    <div className="warningTextSmall">
                                        <p>We allow images where the width is always bigger than the height, to keep a good Aspect Ratio. Please check this link-TODO</p>
                                        <p>Recommended sizes: 2048x1536(Max Resolution) / 1024x768(Medium) / 512x384(Small) .</p>
                                    </div>
                                    
                            }
                            <ImageUploader
                                {...props}
                                key={resetImgUp}
                                withIcon={true}
                                buttonText="Choose images"
                                onChange={onDrop}
                                imgExtension={[".jpg", ".gif", ".png", ".gif", ".jpeg"]}
                                maxFileSize={5242880}
                                withPreview={true}
                                name="imagesUploader-third-party"
                            />
                            <div className="standarBtnCont120x50Margin">
                                <button type="submit">Create Job</button>
                            </div>
                        </form>
                    </div>
            }
            {
                created && 
                    <div>
                        <p>A new Job/Service was successfully created.</p>
                        <ul>
                            <li>
                                <button onClick={() => setShowNewJob(true)}>Open it</button>
                            </li>
                            <li>
                                <button onClick={clearOld}>New Job</button>
                            </li>
                        </ul>
                    </div>
            }
            {
                showNewJob &&
                    <Previewjob job={newReceivedJob} cbClose={() => setShowNewJob(false)} />
            }
            {/* {
                !ownedTokens && 
                <div className="standardBlock150px centered">
                    <Loader logginIn={true} />
                </div>
            } */}
            {
                (myNFTsMongo && (myNFTsMongo.length <= 0)) &&
                    <div>
                        <p>Looks like you don't have any tokens created yet.</p>
                        <p>Please go to Add a New Token <Link to="/app/tokens">clicking Here.</Link></p>
                    </div>
            }
            
        </div>
    )
}

export default Jobs;