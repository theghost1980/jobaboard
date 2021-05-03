import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';
import Btnswitch from '../btns/btnswitch';

//constants
const adminEP = process.env.GATSBY_adminEP;

/**
 * Load images from DB bank, to allow user select one and use it.
 * @param {String} xclassCSS - Optional, The extra css class.
 * @param {String} token - userdata.token from parent.
 * @param {function} btnAction - Call back to assign a value on each switch action
 */

const Imageselector = (props) => {
    const { xclassCSS, btnAction, toogleValue, token } = props;
    const [imagesBE, setImagesBE] = useState([]);
    const [showPreviewImgs, setShowPreviewImgs] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [renderThumbs, setRenderThumbs] = useState(false);

    //functions/CB
    function getImages(query = { filter: {}, limit: 0, sort: {} }){ 
        const headers = { 'x-access-token': token, 'filter': JSON.stringify(query.filter), 'limit': query.limit, 'sort': JSON.stringify(query.sort) };
        fetchBE(adminEP+"getImgBank",headers,'GET')
        .then(response => {
            // console.log(response);
            if(response.status === 'sucess'){
                setImagesBE(response.result);
            }
        })
        .catch(err => {
            console.log('Error while fetching data from BE - admins', err);
        })
    }
    ///data fecthing
    async function fetchBE(url = '', headers, type) { 
        const response = await fetch(url, {
            method: type,
            mode: 'cors',
            headers: headers,
        });
        return response.json(); 
    };
    ///END data fecthing
    function getFileName(image = String){
        const lastSlash = String(image).lastIndexOf("/");
        const subLast = String(image).substring(lastSlash + 1,String(image).length);
        const extFile = String(subLast).split(".")[1];
        return subLast + " Ext: " + extFile;
    }
    const clickedItem = (item) => {
        btnAction(item);
        setSelectedItem(item);
        var copyText = document.getElementById("toClipboard"); /* Get the text field */
        copyText.select(); /* Select the text field */
        copyText.setSelectionRange(0, 99999); /* For mobile devices */
        document.execCommand("copy"); /* Copy the text inside the text field */
        if(!showAlert){
            alert("Copied the text: " + copyText.value); /* Alert the copied text */
        }
    }
    //END functions/CB

    //To load on init
    useEffect(() => {
        getImages({ filter: {}, limit: 0, sort: {}});
    }, []);
    //END To load on init
    //on each state change
    useEffect(() => {
        if(selectedItem){
            btnAction(selectedItem);
            if(!showAlert){
                alert(`Please admin, copy the Url:\n${selectedItem.image}`);
            }
            //TODO: fixe this part to decide if we use or not
            // var copyText = document.getElementById("toClipboard"); /* Get the text field */
            // copyText.select(); /* Select the text field */
            // copyText.setSelectionRange(0, 99999); /* For mobile devices */
            // document.execCommand("copy"); /* Copy the text inside the text field */
            // alert("Copied the text: " + copyText.value); /* Alert the copied text */
        }
    },[selectedItem]);
    //END on each state change

    return ( 
        <div className={`${xclassCSS}`}>
            {
                (imagesBE.length > 0) &&
                <div>
                    <Btnswitch xtraClassCSS={"justAligned"} sideText={'Make it faster, show not preview images, just names.'}
                        initialValue={showPreviewImgs} btnAction={(cen) => setShowPreviewImgs(cen)} showValueDevMode={false}
                    />
                    <Btnswitch xtraClassCSS={"justAligned"} sideText={'Just print the url bellow when I click on images. No alert please!.'}
                        initialValue={showAlert} btnAction={(cen) => setShowAlert(cen)} showValueDevMode={false}
                    />
                    <Btnswitch xtraClassCSS={"justAligned"} sideText={'I need the thumbs too please!.'}
                        initialValue={renderThumbs} btnAction={(cen) => setRenderThumbs(cen)} showValueDevMode={false}
                    />
                    <ul className={`${showPreviewImgs ? 'standardUlVerSmall justBorders justRounded whiteBack justHeight500pOverY': 'standardULImagesRow overflowXscroll'}`}>
                        {
                            imagesBE.map(image => {
                                return (
                                    <li key={image._id} className="scaleHovered pointer" onClick={() => setSelectedItem(image)}>
                                            {
                                                !showPreviewImgs ? <img src={image.image} className="miniImageJobs" />
                                                : <p>{getFileName(image.image)}</p>
                                            }
                                    </li>
                                )
                            })
                        }
                    </ul>
                    {
                        selectedItem && 
                        <div>
                            <p>Selected: <span className="coloredContrast2 textColorWhite">{selectedItem.image}</span></p>
                            <input type="text" value={selectedItem.image} id="toClipboard" disabled className="justWidth100per"/>
                            {
                                selectedItem.thumb &&
                                <div>
                                    <p>Thumb:</p>
                                    <input type="text" value={selectedItem.thumb} id="toClipboard" disabled className="justWidth100per"/>
                                </div>
                            }
                        </div>
                    }
                    <p>Total Images on Bank: {imagesBE.length}</p>
                </div>
            }
        </div>
    )
}

export default Imageselector;