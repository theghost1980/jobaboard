import React, { useState } from 'react';
// import { fecthDataBE } from '../../utils/logger';
import { check, encode, decode } from '../../utils/helpers';

// import axios from 'axios';
import ImageUploader from "react-images-upload";

// import ImgUploader from '../../components/Imagehandling/imgUploader';

// constants
const nftEP = process.env.GATSBY_nftEP;

const Generaltesting = (props) => {

    // const userdata = check();
    // const [reset, setReset] = useState(false);

    // async function getSSCData(url = '',query = {}) {
    //     const response = await fetch(url, {
    //         method: 'GET', // *GET, POST, PUT, DELETE, etc.
    //         mode: 'cors', // no-cors, *cors, same-origin
    //         headers: {
    //             'x-access-token': userdata.token,
    //             'query': JSON.stringify(query),
    //         },
    //     });
    //     return response.json(); 
    // };

    // const testSSCBE = () => {
    //     getSSCData(nftEP+"allNFTs", { issuer: 'jobaboard' })
    //     .then(response => console.log(response))
    //     .catch(error => console.log('Error on request',error));
    // }

    const saveLS = () => {
        // const _h = hashMe;
        // console.log(`h:${_h}`);
        // const fields = {
        //     field1 : '1',
        //     field2 : '2',
        //     field3 : '3',
        // };
        // const newNode = {};
        // Object.entries(fields).forEach(([key, val]) => (newNode[encode(key)] = _h+"|"+encode(val)));
        // console.log(newNode);
        // localStorage.setItem(`NonOfYFB`,JSON.stringify(newNode));
        // Object.entries(fields).forEach(([key, val]) => (newNode[key] = decode(val)));
    }

    const getLS = () => {
        // const dataLs = localStorage.getItem("NonOfYFB");
        // if (dataLs){
        //     const newNode = {};
        //     Object.entries(JSON.parse(dataLs)).forEach(([key, val]) => (newNode[decode(key)] = decode(val)));
        //     console.log('Retrieved Value:::');
        //     console.log(newNode);
        // }
    }
       
    return (
        <div>
            <ul>
                {/* <li>
                    <button onClick={testSSCBE}>Send SSC test</button>
                </li>
                <li>
                    <ImageUploader 
                        {...props}
                        key={reset}
                        withIcon={true}
                        buttonText="Choose images"
                        // onChange={onDrop}
                        imgExtension={[".jpg", ".gif", ".png", ".gif"]}
                        maxFileSize={5242880}
                        withPreview={true}
                        name="imagesUploader-third-party"
                    />
                </li>
                <li>
                    <button onClick={() => setReset(!reset)}>Reset</button>
                </li> */}
                <li>
                    <button onClick={saveLS}>Save LS Encoded fully</button>
                </li>
                <li>
                    <button onClick={getLS}>Retrieve LS Decoded fully</button>
                </li>
            </ul>
            
        </div>
    )
}

export default Generaltesting;
