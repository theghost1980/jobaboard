import React, { useState, useEffect } from 'react';
import { check, formatDateTime } from '../../utils/helpers';
import Btnclosemin from '../btns/btncloseMin';
import Btnswitch from '../btns/btnswitch';
import Menuhover from '../interactions/menuhover';
import Loader from '../loader';
import Fullsizeimg from '../interactions/fullsizeimg';
import Tablinator from '../interactions/tablinator';
import Blogeditor from '../Blog/blogeditor';
import ImageUploader from "react-images-upload";
import Imageselector from '../interactions/imageselector';
import Formulator from '../interactions/formulator';
import Btncollapse from '../btns/btncollapse';

//TODO important: as soon as we test using the @sexosentido account
//add @jobaboard as the account.

//constants
const buildHook = process.env.GATSBY_buildHook;
const adminEP = process.env.GATSBY_adminEP;
const itemsMenu = [
        {title: 'Manage Categories', cbProp: 'manageCat', subMenu: [ 'List Categories', 'Add New'],},
        {title: 'Manage Menus', cbProp: 'manageMenus', subMenu: [ 'List Main Menu'],},
        {title: 'Manage Platform', cbProp: 'managePlat', subMenu: [ 'List Options TODO', 'Blog @jobaboard', 'Manage Image Bank CDN', 'Fire a Rebuild Hook']},
        {title: 'Logs', cbProp: 'manageLogs', subMenu: [ 'List Logs - TODO']},
]
const initialResponse = { status: '', message: '', result: '',};
{/* <li>List actual: Categories and sub cats.</li>
<li>Manage cats and sub-cats. Add new, Update.</li>
<li>Add, modify platform news(to load on especific sections of the page) and so on.</li>
<li>Log Web-Content activities of other admins.</li> */}

// as a guide from schema:
// name: {
//     type:String,
//     unique: true,
// }, 
// title: String,
// subtitle: String,
// query: {
//     type:String,
//     unique: true,
// },
// sub_category: [String],
// image: String, 
// hideOnLoggin: Boolean, 
// link: Boolean,
// active: Boolean,

const Managewebcontent = (props) => {
    const initialCat = {
        name: "", 
        title: "",
        subtitle: "",
        query: "",
        sub_category: [],
        file: File, 
        active: Boolean,
    };
    const initialMenu = {
        title: "", 
        inner_link: "", 
        hideOnLoggin: false, 
        link: false,
        active: true,
        icon_url: "",
        show_icon: false,
        createdAt: Date(),
        updatedAt: Date(),
    };
    const userdata = check();
    const [categories, setCategories] = useState(null);
    const [mainMenus, setMainMenus] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [errorImageIcon, setErrorImageIcon] = useState(false);
    const [response, setResponse] = useState(initialResponse);
    const [loadingData, setLoadingData] = useState(false);
    const [showImageFull, setShowImageFull] = useState(false);
    const [errorValidation, setErrorValidation] = useState({
        error: false, message: '',
    })
    const [category, setCategory] = useState(initialCat);
    const [mainMenu, setMainMenu] = useState(initialMenu);
    const [option, setOption] = useState("");
    const [subOption, setSubOption] = useState({ option: '', subOption: '', item: {} });

    // TODO: organize and move as components all the posible parts
    //images handlers
    const [imagesBE, setImagesBE] = useState([]);
    const [imagesToBe, setImagesToBe] = useState({
        files: [File],
        title: '', //optional if needed for later.
        relatedTo: [''], //optional to define a bit more than tags if needed.
        tags: [''], //mandatory.
        createdAt: Date,
        updateAt: Date, //for now not in use maybe later.
    })
    const [resetImgUp, setResetImgUp] = useState(false);// to reset the imageUploader
    const [showUploaderImg, setShowUploaderImg] = useState(false);
    const [needThumbs, setNeedThumbs] = useState(false);
    const [showPreviewImgs, setShowPreviewImgs] = useState(false);
    const [selectedImg, setSelectedImg] = useState(null);
    const [dimmImgSelected, setDimmImgSelected] = useState({
        width: '', height: '', unit: 'pixels',
    })
    //functions/CB for images handlers
    function updateSubOption(name,value){ 
        return setData(prevState => { return { ...prevState, [name]: _value }});
    }
    const onDrop = picture => {
        console.log(picture);
        // setResetImgUp(!resetImgUp);
        updateValue("imageC", 'files',picture);
    };
    const sendImages = (event) => {
        event.preventDefault();
        // if(imagesToBe.tags.length === 0){ return alert('Mandatory fields, add them all please.')};
        if(imagesToBe.files.length !== 0){
            setLoadingData(true);
            const formdata = new FormData();
            for (const file of imagesToBe.files) {
                formdata.append('file', file);
                console.log(file);
            };
            formdata.append("tags", JSON.stringify(imagesToBe.tags)); //to be parsed on BE.
            formdata.append("createdAt", new Date());
            if(imagesToBe.relatedTo.length > 0){
                formdata.append("relatedTo", JSON.stringify(imagesToBe.relatedTo)); //to be parsed on BE.
            }
            if(imagesToBe.title !== ''){
                formdata.append("title", imagesToBe.title);
            }
            const headers = {'x-access-token': userdata.token, 'createthumbs': needThumbs };
            postData(adminEP+"uploadImgsToBank",formdata,headers)
            .then(response => {
                console.log(response);
                if(response.status === 'sucess'){
                    alert('Collection added succesfully. Updating List.');
                    // setResponse({ status: response.status, result: response.result, message: 'New Collection to Image Bank created.' });
                    setLoadingData(false);
                    setShowUploaderImg(false);
                    getAllImages();
                    // setTimeout(() => setResponse(initialResponse),6000);
                }
            }).catch(error => {
                console.log('Error uploading collection to BE.',error);
                setLoadingData(false);
            });
        }
    }
    function getAllImages(){
        const headers = { 'x-access-token': userdata.token, 'filter': JSON.stringify({}), 'limit': 0, 'sort': JSON.stringify({}) };
        getData(adminEP+"getImgBank",headers)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setImagesBE(response.result);
            }
        })
        .catch(err => {
            console.log('Error while fetching data from BE - admins', err);
        })
    }
    function getAllMenus(){
        const headers = { 'x-access-token': userdata.token, 'filter': JSON.stringify({}), 'limit': 0, 'sort': JSON.stringify({ order: 1 }) };
        getData(adminEP+"getMmenuJab",headers)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setMainMenus(response.result);
            }
        })
        .catch(err => {
            console.log('Error while fetching data from BE - admins', err);
        })
    }
    function getFileName(image = String){
        const lastSlash = String(image).lastIndexOf("/");
        const subLast = String(image).substring(lastSlash + 1,String(image).length);
        const extFile = String(subLast).split(".")[1];
        return subLast + " Ext: " + extFile;
    }
    const deleteImg = () => {
        const answer = window.confirm("Are you sure to remove this image from JAB DB?\nnote:for now the image will still be on cloudinary waiting for admins manual review.");
        if(answer){
            const headers = { 'x-access-token': userdata.token, 'filter': JSON.stringify({ _id: selectedImg._id }) };
            postData(adminEP+"deleteImgOnBank",{},headers)
            .then(response => {
                console.log(response);
                if(response.status === 'sucess'){
                    alert('Image has been removed from JAB DB.');
                    getAllImages();
                    setSelectedImg(null);
                }
            }).catch(error => console.log('Error on deletion of img on BE.',error));
        }
    }
    function getDimmensionsImg(event){
        const hImgSelected = event.target.height;
        const wImgSelected = event.target.width;
        setDimmImgSelected({
            width: wImgSelected, height: hImgSelected, unit: 'Pixels(px)'
        })
    }
    //END functions/CB for images handlers
    useEffect(() => {//to load on init
        getAllImages();
        getAllMenus();
        getAllCats();
    },[]);
    //End images handlers

    //functions/CB
    const cbOnSuccess = (from) => {
        // if(from === "Add New Main Menu"){
            getAllMenus();
        // }
    }
    const clickedOnMenu = (menu) => {
        console.log('Clicked on', menu);
        if(menu === "Add New"){
            setShowEditor(true);
            setSelectedCategory(null);
            setCategory(initialCat);
        }else{
            setOption(menu);
        }
    }
    const editSelected = (cat) => {
        console.log(cat);
        setShowEditor(false);
        setSelectedCategory(cat);
        updateValue("cat","name", cat.name);
        updateValue("cat","query", cat.query);
        updateValue("cat","title", cat.title);
        updateValue("cat","subtitle", cat.subtitle);
        updateValue("cat","sub_category", cat.sub_category);
        updateValue("cat","active", cat.active);
    }
    const updateData = () => {
        event.preventDefault();
        setLoadingData(true);
        const formdata = new FormData();
        formdata.append("title", category.title); 
        formdata.append("subtitle", category.subtitle);
        formdata.append("sub_category", JSON.stringify(category.sub_category));
        formdata.append("active", category.active);
        if(category.file !== undefined ||  category.file.name ){
            formdata.append("file", category.file);
        }
        console.log('Sending for Update:', category); 
        const headers = { 'x-access-token': userdata.token, 'query':  JSON.stringify({ name: category.name, query: category.query })}
        postData(adminEP+"updateCat",formdata, headers)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setResponse({ status: response.status, result: response.result, message: 'Category Updated.' });
                setShowEditor(false);
                setSelectedCategory(null);
                getAllCats();
                setTimeout(() => setResponse(initialResponse),6000);
            }else if(response.status === 'failed'){
                setResponse({ status: response.status, message: response.message });
                setTimeout(() => setResponse({ status: '', message: ''}),6000);
            }
            setLoadingData(false);
        }).catch(error => {
            console.log('Error fecthing category data on BE.', error);
            setLoadingData(false);
        });
    }
    const processData = (event) => {
        //TODO handle validations of data.
        event.preventDefault(); 
        if(category.file === undefined ||  !category.file.name ){
            return setErrorValidation({ error: true, message: 'For each Category an Image must be set!'});
        }//else process it as a post request using a formdata.
        setLoadingData(true);
        const formdata = new FormData();
        formdata.append("name", category.name);
        formdata.append("title", category.title); 
        formdata.append("subtitle", category.subtitle);
        formdata.append("query", category.query);
        formdata.append("sub_category", JSON.stringify(category.sub_category));
        formdata.append("file", category.file);
        formdata.append("active", category.active);
        console.log('Sending:', category); 
        const headers = { 'x-access-token': userdata.token, 'query':  JSON.stringify({ name: category.name, query: category.query })}
        postData(adminEP+"addCat",formdata, headers)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setResponse({ status: response.status, result: response.result, message: 'New Category created.' });
                setShowEditor(false);
                getAllCats();
                setTimeout(() => setResponse(initialResponse),6000);
            }else if(response.status === 'failed'){
                setResponse({ status: response.status, message: response.message });
                setTimeout(() => setResponse({ status: '', message: ''}),6000);
            }
            setLoadingData(false);
        }).catch(error => {
            console.log('Error fecthing category data on BE.', error);
            setLoadingData(false);
        });
    }
    const toogleActive = (cen) => {
        // console.log('cen:',cen);
        updateValue('cat',"active",cen);
    }
    const setOptions = (opt) => {
        setOption("editCats")
        setOption("");
    }
    function updateValue(item,name,value){
        // console.log(`item:${item},name:${name},value:${value}`);
        if(item === 'cat'){
            // TODO handle the validations
            if(name === 'name'){
                const query = String(value).split(" ")[0].toLocaleLowerCase();
                setCategory(prevState => { return {...prevState, ['query']: query}});
            }
            const val = (name === "sub_category") ? String(value).split(",") : value;
            // if(name === "sub_category") { console.log(val)};
            // console.log(`setting name:${name},value:${val} - ${typeof val}`);
            setCategory(prevState => { return {...prevState, [name]: val}});
        }else if(item === "imageC"){
            console.log('Setting now on imageC:',value);
            setImagesToBe(prevState => { return {...prevState, [name]: value}});
        }else if(item === "mainMenu"){
            setMainMenu(prevState => { return { ...prevState, [name]: value }});
        }
    }
    const deleteCat = (catId) => {
        setLoadingData(true);
        const answer = window.confirm('Please proceed with caution as you will affect the website when showing categories.\nAre you sure to delete it?');
        if(answer){
            console.log(`Deleting Category ID:${catId} on BE!`);
            const headers =  { 'x-access-token': userdata.token, 'catid': catId };
            postData(adminEP+"deleteCat",{}, headers)
            .then(response => {
                console.log(response);
                if(response.status === 'sucess'){
                    setResponse({ status: 'Sucessfully Deleted.', message: `The Category was deleted.`});
                    setSelectedCategory(null);
                    getAllCats();
                    setTimeout(() => setResponse(initialResponse),6000);
                }
                setLoadingData(false);
            }).catch(error => {
                console.log('Error on deletion of category.',error);
                setLoadingData(false);
            });
        }
    }
    const fireBuild = () => {
        const answer = window.confirm('We are about to Fire a Build on CDN, this action will be recorded on BE.\nShall we proceed?');
        if(answer){
            // TODO send this info,time,admin_data to OPLogger
            setOption("");
            setLoadingData(true);
            postFire(buildHook)
            .then(response => {
                console.log(response);
                if(response.status === 200 && response.ok){
                    alert('Successfully sent/received the build by Netlify.\nJust wait for the email success notification.\nAfter confirming the mail check lives changes on JAB.');
                    setLoadingData(false);
                }
            })
            .catch(error => {
                setLoadingData(false);
                alert('Error when firing Build Hook.' + "\n" + error);
            });
        }
    }
    function getAllCats(){
        setLoadingData(true);
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ query: 'all'})};
        getData(adminEP+"getCats", headers)
        .then(response => {
            console.log(response);
            if(response.status = 'sucess'){ setCategories(response.result)};
            setLoadingData(false);
        }).catch(err => {
            console.log('Error while fetching data from Admins BE', err);
            setLoadingData(false);
        })
    }
    const uploadedImage = React.useRef(null);
    const selectedImgFile = (event) => {
        if(event.target.files === null){ return console.log('User cancelled uploading image!')}
        const imgFile = event.target.files[0];
        console.log(imgFile);
        if(imgFile.type === "image/jpeg" || imgFile.type === "image/png"){
            const { current } = uploadedImage;
            current.file = imgFile;
            const reader = new FileReader();
            reader.onload = e => {
                current.src = e.target.result;
                // now test if the aspect ratio is 1 so the image is square if not...not allowed as icon.
                const img = new Image();
                img.src = e.target.result;
                img.onload = function(){
                    const imgW = img.width;
                    const imgH = img.height;
                    const ar = imgW / imgH;
                    console.log(`W:${imgW},H:${imgH}. AR:${ar.toString()}`);
                    if(ar >= 1.4){
                        console.log(`Passed`);
                        setErrorImageIcon(false);
                    }else{
                        console.log('Not passed!');
                        setErrorImageIcon(true);
                    }
                };
            };
            reader.readAsDataURL(imgFile);
            //now we pass the file 
            updateValue('cat','file',event.target.files[0]);
            setErrorValidation( { error: false, message: 'Nothing for now :D'});
        }else{
            alert('File Must be Image type: jpeg/png.');
            return null
        }
    }
    /////////DATA fecthing////////////
    async function getData(url = '', headers) { 
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: headers,
        });
        return response.json(); 
    };
    async function postData(url = '', formdata, headers) { 
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: formdata,
        });
        return response.json(); 
    };
    async function postFire(url = '') { 
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            body: {},
        });
        return response; 
    };
    ///////////////////////////////////////
    //END functions/CB

    //load on every state change
    //for testing TO delete later on
    // useEffect(() => {
    //     if(category){
    //         console.log(category);
    //     }
    // }, [category]);
    //END load on every state change
    return (
        <div className="standardContentMargin">
            <Menuhover items={itemsMenu} clickedSubItemCB={clickedOnMenu} xtraclassCSS={"jusBordersRounWhiteBack"}/>
            {
                option === "Blog @jobaboard" &&
                <div>
                    <Blogeditor />
                </div>
            }
            {
                option === "List Categories" && categories &&
                <div>
                <Tablinator items={categories} toShow={['name','title','query','active']}
                    clickedSubItemCB={(item) => editSelected(item)}
                />
                <button onClick={() => setOption("")}>close</button>
                </div>
            }
            {
                option === "List Main Menu" && mainMenus &&
                <div>
                <Tablinator items={mainMenus} toShow={['title','inner_link','hideOnLoggin','active','order']}
                    clickedSubItemCB={(item) => setSubOption({ option: option, subOption: 'update', item: item})}
                />
                {
                    (subOption.option === option)
                    && (subOption.subOption !== '') &&
                    <Formulator 
                    title={`${subOption.subOption} Main Menu`} devMode={true} closeCb={() => setSubOption({ option: option, subOption: '', item: null})}
                    inputs={[
                        { id: 'input-JAB-1', iType: 'text', iName: 'title', iLabel: true, iValue: '', iValueType: 'String', iRequired: true, iPattern: 'general-string', iInfo: true, iMsg: 'Title of the menu, the ones will be shown. I.e: Marketplace.'},
                        { id: 'input-JAB-2', iType: 'text', iName: 'inner_link', iLabel: true, iValue: '', iValueType: 'String', iRequired: true, iPattern: 'general-string-all', iInfo: true, iMsg: 'Inner link to component/Page. I.e: "/marketplace".'},
                        { id: 'input-JAB-3', iType: 'switch', iName: 'link', iLabel: false, iValue: '', iValueType: 'Boolean', iRequired: true, iPattern: 'null', iInfo: true, iMsg: 'Define menu appearance. true: link, false: button. I.e: login button.' },
                        { id: 'input-JAB-4', iType: 'switch', iName: 'hideOnLoggin', iLabel: false, iValue: '', iRequired: true, iValueType: 'Boolean', iPattern: 'null', iInfo: true, iMsg: 'Defines if menu hide after the user has logged in.' },
                        { id: 'input-JAB-5', iType: 'text', iName: 'order', iLabel: true, iValue: '', iRequired: true, iValueType: 'Number', iPattern: 'general-number-2max', iInfo: true, iMsg: 'Number to order the menus when shown, left to right(visually), 1(most left as first one.)'},
                        { id: 'input-JAB-7', iType: 'switch', iName: 'active', iLabel: false, iValue: '', iRequired: true, iValueType: 'Boolean', iPattern: 'null', iInfo: true, iMsg: 'Defines if the menu is active to show after the next build of the website.' },
                    ]}
                    actionType={subOption.subOption}
                    beEP={adminEP+`${subOption.subOption}MmenuJab`}
                    cbOnSuccess={cbOnSuccess}
                    selectedToEdit={subOption.item}
                    uniqueField={"title"}
                />
                }
                <div className="standardDisplayJusSpaceAround">
                    {   (subOption.subOption === '') &&
                        <button onClick={() => setSubOption({ option: option, subOption: 'add', item: null})}>Add New Menu</button>
                    }
                    <button onClick={() => setOption("")}>Close Main Menus</button>
                </div>
                </div>
            }
            {
                loadingData &&
                <div className="standardDiv30Percent justMargin0auto">
                    <Loader logginIn={loadingData} typegif={"blocks"}/>
                </div>
            }
            {
                (response.status !== '') &&
                <div>
                    <p>{response.status}</p>
                    <p>{response.message}</p>
                </div>
            }
            {
                !showEditor && selectedCategory &&
                <div className="marginsTB">
                    <p>Edit Category</p>
                    { errorValidation.error && <p className="errorValidation">{errorValidation.message}</p>}
                    <form onSubmit={updateData} className="marginsTB">
                        <div className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                            <label htmlFor="name">Category Name:</label>
                            <input name="name" type="text" value={selectedCategory.name} disabled />
                            <label htmlFor="title">Title:</label>
                            <input name="title" type="text"
                                required pattern="[&\w\s]{3,55}" title="Letters, numbers and & characters, are allowed. 3 to 55 max."
                                // defaultValue={selectedCategory.title}
                                value={category.title}
                                onChange={(e) => {updateValue("cat",e.target.name,e.target.value)}}
                            />
                            <label htmlFor="subtitle">Sub Title:</label>
                            <input name="subtitle" type="text" 
                                required pattern="[&\w\s]{3,25}" title="Letters, numbers and & characters, are allowed. 3 to 25 max."
                                // defaultValue={selectedCategory.subtitle}
                                value={category.subtitle}
                                onChange={(e) => {updateValue("cat",e.target.name,e.target.value)}}
                            />
                            <p>Query: {category.query}</p>
                            <label htmlFor="image"></label>
                            <img 
                                src={selectedCategory.thumb} 
                                className="smallImageMax120x120" 
                                ref={uploadedImage} 
                            />
                            <input type="file" 
                                    onChange={selectedImgFile} 
                                    accept="image/*"
                                    multiple={false} 
                            />
                            {
                                errorImageIcon && 
                                <p className="warningTextSmall">We do recommend using an image with different sizes for height/width, please choose an image as 500px by 250px//1000px by 768px//2000px by 1024px.</p>
                            }
                            <label htmlFor="sub_category">Sub Categories:</label>
                            <input name="sub_category" placeholder="Add them separate by commas please."
                                // defaultValue={selectedCategory.sub_category.join(",")}
                                value={category.sub_category.join(",")}
                                onChange={(e) => {updateValue("cat",e.target.name,e.target.value)}}
                            />
                            <div className="standardDivRowFullW">
                                <Btnswitch showValueDevMode={true} sideText={"Active to show(true by default)"} btnAction={toogleActive} initialValue={selectedCategory.active} />
                            </div>
                        </div>
                        <div className="standardDisplayJusSpaceAround ">
                            <button type="submit">Update Category</button>
                            <button type="button" onClick={() => deleteCat(selectedCategory._id)}>Delete</button>
                            <button type="button" onClick={() => setSelectedCategory(null)}>cancel</button>
                        </div>
                    </form>
                </div>
            }
            {
                showEditor && !selectedCategory &&
                <div className="marginsTB">
                    { errorValidation.error && <p className="errorValidation">{errorValidation.message}</p>}
                    <form onSubmit={processData} className="marginsTB">
                        <div className="standardFormColHorFullWAutoH relativeDiv colorX marginBottom">
                            <label htmlFor="name">Category Name:</label>
                            <input name="name" type="text" onChange={(e) => updateValue("cat",e.target.name,e.target.value)} 
                                required pattern="[&\w\s]{3,25}" title="Letters, numbers and & characters, are allowed. 3 to 25 max."
                            />
                            <label htmlFor="title">Title:</label>
                            <input name="title" type="text" onChange={(e) => updateValue("cat",e.target.name,e.target.value)}
                                required pattern="[&\w\s]{3,55}" title="Letters, numbers and & characters, are allowed. 3 to 55 max."
                            />
                            <label htmlFor="subtitle">Sub Title:</label>
                            <input name="subtitle" type="text" onChange={(e) => updateValue("cat",e.target.name,e.target.value)}
                                required pattern="[&\w\s]{3,25}" title="Letters, numbers and & characters, are allowed. 3 to 25 max."
                            />
                            <p>Query: {category.query}</p>
                            <label htmlFor="image"></label>
                            <img 
                                // src={nftMongo.thumb} 
                                className="smallImageMax120x120" 
                                ref={uploadedImage} 
                            />

                            <input type="file" 
                                    onChange={selectedImgFile} 
                                    accept="image/*"
                                    multiple={false} 
                            />
                            {
                                errorImageIcon && 
                                <p className="warningTextSmall">We do recommend using an image with different sizes for height/width, please choose an image as 500px by 250px//1000px by 768px//2000px by 1024px.</p>
                            }
                            <label htmlFor="sub_category">Sub Categories:</label>
                            <input name="sub_category" placeholder="Add them separate by commas please." onChange={(e) => updateValue('cat',e.target.name,e.target.value)} />
                            <div className="standardDivRowFullW">
                                <Btnswitch showValueDevMode={true} sideText={"Active to show(true by default)"} btnAction={toogleActive} initialValue={true} />
                            </div>
                        </div>
                        <div className="standardDisplayJusSpaceAround ">
                            <button type="submit">Submit</button>
                            <button type="button" onClick={() => setShowEditor(false)}>close</button>
                        </div>
                    </form>
                </div>
            }
            {
                option === "Manage Image Bank CDN" &&
                <div>
                    <ul>
                        <li>Options Here.</li>
                        <li>List Images on CDN, using the mongoDB Schema.</li>
                        <li>Edit/Delete images.</li>
                        <li>Add new images to bank.</li>
                        <li>All this images will be used, for now on Blog. Later on the whole platform.</li>
                    </ul>
                    {
                        (imagesBE.length > 0) &&
                        <div>
                            {/* <Btnswitch xtraClassCSS={"justAligned"} sideText={'Make it faster, show not preview images, just names.'}
                                initialValue={showPreviewImgs} btnAction={(cen) => setShowPreviewImgs(cen)}
                            />
                            <ul className="standardULImagesRow overflowXscroll">
                                {
                                    imagesBE.map(image => {
                                        return (
                                            <li key={image._id} className="scaleHovered pointer" onClick={() => setSelectedImg(image)}>
                                                {
                                                    showPreviewImgs ?
                                                    <img src={image.image} className="miniImageJobs" />
                                                    : <p>{getFileName(image.image)}</p>
                                                }
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                            <p>Total Images on Bank: {imagesBE.length}</p> */}
                            <Imageselector token={userdata.token} btnAction={(image) => setSelectedImg(image)}/>
                            {
                                selectedImg &&
                                <div className="relativeDiv">
                                    <Btnclosemin btnAction={() => setSelectedImg(null)}/>
                                    <div>
                                        <img src={selectedImg.image} onLoad={(e) => getDimmensionsImg(e)} className="justWidth100per" />
                                        {
                                            selectedImg.thumb ? <img src={selectedImg.thumb} /> : <p>Thumb not set yet.</p>
                                        }
                                        {
                                            (dimmImgSelected.width !== '') &&
                                            <p>Dimensions: W:{dimmImgSelected.width} H:{dimmImgSelected.height} on {dimmImgSelected.unit}</p>
                                        }
                                    </div>
                                    <p>Title: {selectedImg.title}</p>
                                    <p>Filename: {getFileName(selectedImg.image)}</p>
                                    <p>Tags: {selectedImg.tags.join(" #")}</p>
                                    <p>Related To: {selectedImg.relatedTo.join(" ,")}</p>
                                    <p>Created At: {formatDateTime(selectedImg.createdAt)}</p>
                                </div>
                            }
                        </div>
                    }
                    {/* { "acknowledged" : true, "deletedCount" : 1 } */}
                    <div className="standardDisplayJusSpaceAround ">
                        <button onClick={() => setShowUploaderImg(!showUploaderImg)}>Upload New</button>
                        <button onClick={deleteImg}>Delete</button>
                    </div>
                    {
                        showUploaderImg &&
                        <div className={`marginsTB ${loadingData ? 'disableDiv2': null}`}>
                            <ImageUploader
                                {...props}
                                // key={resetImgUp}
                                withIcon={true}
                                buttonText="Choose images"
                                onChange={onDrop}
                                imgExtension={[".jpg", ".gif", ".png", ".gif", ".jpeg"]}
                                maxFileSize={5242880}
                                withPreview={true}
                                name="imagesUploader-third-party"
                            />
                            <form className="formVertFlex" onSubmit={sendImages}>
                                <label htmlFor="tags">Tags for this Collection</label>
                                <textarea name="tags" onChange={(e) => updateValue("imageC",e.target.name,String(e.target.value).split(","))}
                                    placeholder="Separate each Tag using a coma, i.e: Trees,bushes,blog" required
                                />
                                <label htmlFor="title">Title for Collection</label>
                                <input type="text" name="title" onChange={(e) => updateValue("imageC",e.target.name,e.target.value)}
                                    required
                                />
                                <label htmlFor="relatedTo">Related To:</label>
                                <input type="text" name="relatedTo" onChange={(e) => updateValue("imageC",e.target.name,String(e.target.value).split(","))}
                                    placeholder="Separate each RelatedTo using a coma, i.e: Trees,bushes,blog" required
                                />
                                <Btnswitch xtraClassCSS={"justAligned"} sideText={`I need thumbs for each image.  ${needThumbs ? 'Now active': 'Not active'}`} initialValue={needThumbs}
                                    btnAction={(cen) => setNeedThumbs(cen)} showValueDevMode={true}
                                />
                                <div className="standardDisplayJusSpaceAround ">
                                    <button type="button" onClick={() => setShowUploaderImg(false)}>cancel</button>
                                    <button type="submit">Submit</button>
                                </div>
                            </form>
                        </div>
                    }
                </div>
            }
            {
                (option === "Fire a Rebuild Hook") &&
                <div>
                    <h3>Important: This action means to fire a deploy action on the netlify CDN.</h3>
                    <p>As the site is being built, anytime we modify the categories or any other feature that affects the UI platform, we must fire a deploy in order to apply the changes.</p>
                    <h3>What will happen?</h3>
                    <p>After submitting the fire event, a special hook activates the deploy.</p>
                    <p>Under any possible error, the CDN will not proceed and an error log will be created and the dev or assigned person on the netflify CDN, will be notified automatically.</p>
                    <h3>After a Successfull Deployment</h3>
                    <p>A mail is sent to your account or the admin in charge.</p>
                    <p>A log will be created on JAB BE and you will be able to see the reflected changes live.</p>
                    <h3>How do I check?</h3>
                    <p>Go to the admin's email, the one in charge of the deploys to confirm the success.</p>
                    <div className="standardDisplayJusSpaceAround ">
                        <button onClick={fireBuild}>Proceed, I know what I am doing</button>
                        <button type="button" onClick={() => setOption("")}>cancel</button>
                    </div>
                </div>
            }
            {/* {
                showImageFull && selectedCategory &&
                <Fullsizeimg imgUrl={selectedCategory.image}/>
            } */}
        </div>
    )
}

export default Managewebcontent;
