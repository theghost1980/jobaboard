import React, { useState, useEffect } from 'react';
import { check, getStoredField } from '../../utils/helpers';
import Loader from '../../components/loader';

// testing on local
// const nfthandlermongoEP = 'http://localhost:3000/nft/jobaboard/';
// const nftEPLocal = 'http://localhost:3000/ssc/ssctest/'
//testing no local
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const nftEP = process.env.GATSBY_nftEP;
const nftEPLocal = nftEP;

// TODO we can take a different approach to create the NFT.
// validate input data -> this is very important to avoid errors
// After payment & validation.
// send the custom json. Here we may take 2 paths:
// 1. send as custom json as we are doing, but this implies to modify so it can be done in server
//      so we dont need to store/use the private keys on client side.
// 2. learn and use the transfer method on the same transfer done by user.
        // we could test on this method to see if this is more efficient
// After sending the broadcast, we must look into that TxId.
// if errors, will appear on field result.logs -> we must parse it to get:
    // result.logs.errors
// if no error then logs will appear as bellow:
    // {"events":[{"contract":"tokens","event":"transfer","data":{"from":"jobaboard","to":"null","symbol":"BEE","quantity":"100"}}]}
    // which let us know the NFT was created.
// now we must test this approach to see how to verify the NFT and apply the props
//  if needed. As we can create any new token with some default props and
//  allow the user to modify this at will later on.
//by doing this all the above we can:
// 1. define 2 methods for NFT creation.
// 1.1 The jobito helper, so we can reuse some parts of the old nftcreator, to guide the user and show him tips + the process live.
// 1.2 A nftcreator more automated so it will handle the whole process on server and, as soon as it was created,
//      it will send a notification to the user so he may check the NTF + instances.

const Nfttests = () => {
    // now testing to see if the issuer is keep even when the token's ownership has been
    // transferred

    const logs = {
        "errors": [
            "not allowed to issue tokens"
        ]
    };
    const found = logs.errors.filter(error => error === "not allowed to issue tokens");
    if(found.length >= 1){
        console.log('Error found');
    }
    console.log(logs.errors.length);

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
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [newNft, setNewNft] = useState(null);
    const [sendingData, setSendingData] = useState(false);
    const [myNFTsMongo, setMyNFTsMongo] = useState([]);
    const [txID, setTxID] = useState(null);

    const showMe = () => {
        getSSCData(nftEP+"allNFTs",{})
        .then(response => {
            console.log(response);
        })
        .catch(error => console.log('Error fetching data from BE',error));
    }

    useEffect(() => {
        console.log(file);
    }, [file]);

    useEffect(() => {
        bringNFTs();
    }, []);

    function bringNFTs(){
        const query = {
            nft_id: null,
            symbol: '',
            account: 'theghost1980',
            sort: null,
        }
        const sortby = { "null": null }
        sendPostBEJustH(nfthandlermongoEP + "getNFTquery",query,0, sortby)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setMyNFTsMongo(response.result);
            }
        }).catch(error => console.log('Error asking for NFTs on this user from DB, mongo.',error));
    }

    const getInfoTX = () => {
        if(txID){
            getSSCData(nftEPLocal + "tx",txID)
            .then(response => {
                console.log(response);
            }).catch(error => console.log('Error asking data ssc on BE',error));
        }
    }

    const sendData = () => {
        setSendingData(true);
        // const nftCreated = {
        //     symbol: "AKA",
        //     name: "D My NFT created in JAB",
        //     orgName: "JAB jobs and gigs on a Hive blockchain",
        //     productName: "JAB NFT on the run",
        //     url: "https://www.jab.com",
        //     maxSupply: "1000"
        // }
        // const priceNft = 10;
        // const id = "109"
        // const formdata = new FormData();
        // formdata.append("symbol", nftCreated.symbol);
        // formdata.append("name", nftCreated.name);
        // formdata.append("orgName", nftCreated.orgName);
        // formdata.append("url", nftCreated.url);
        // formdata.append("maxSupply", nftCreated.maxSupply);
        // formdata.append("price", Number(priceNft));
        // formdata.append("nft_id", Number(id));
        // formdata.append("issuer", "jobaboard");
        // // formdata.append("authorizedIssuingAccounts", ['jobaboard', `${userdata.username}`]);
        // formdata.append("account", userdata.username);
        // formdata.append("createdAt", new Date().toString());
        // const headers = {
        //     'x-access-token': userdata.token,
        //     'id': id,
        // };
        const data = {
            "test1": 'test1',
            "test2": 2,
            "test3": true,
            "test4": ['1','2'],
        }

        // sendPostBE(nfthandlermongoEP+"testData",data)
        // .then(response => console.log(response))
        // .catch(error => console.log('Error sending test request to BE.',error));

        const formData = new FormData();
        // const testing = [];
        // Object.entries(data).forEach(([key, val]) =>{
        //     formData.append(`${key}`,val);
        //     testing.push({ [key]: val});
        // });
        // console.log('To send:');
        // console.log(testing);
        // formData.append("field1",1);
        // formData.append("boolean",true);
        // formData.append("number",1034.45);
        // formData.append("array", ['1','2','3']);
        // formData.append("object",{ one: '1', two: '2'});
        // if(file){
        //     formData.append("image",file[0]);
        // }
        const id = 134;
        formData.append("nft_id", id);
        formData.append("account", "theghost1980");
        formData.append("symbol","RABI");
        formData.append("name","RABI the token");
        formData.append("orgName", "JAB jobs and gigs on a Hive blockchain");
        formData.append("productName", "JAB NFT on the run");
        formData.append("price", 100.00);
        formData.append("authorizedIssuingAccounts", JSON.stringify(['jobaboard','theghost1980']));
        formData.append("issuer", "jobaboard");
        formData.append("supply", 100000);
        formData.append("circulatingSupply", 0);
        formData.append("createdAt", new Date);

        if(file){
            formData.append("file",file[0]);
        }

        sendPostBE(nfthandlermongoEP+"addNFTDB",formData, id)
        .then(response => {
            console.log(response);
            if(response.status === "failed"){
                setError(response.message);
                setTimeout(function(){
                    setError(null);
                },4000);
                setSendingData(false);
            }else if(response.status === "success"){
                setNewNft(response.result);
                setSendingData(false);
            }
        })
        .catch(error => {
            console.log('Error sending test request to BE.',error);
            setSendingData(false);
        });
        
    }

    async function getSSCData(url = '', tx) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': getStoredField("token"),
                'tx': String(tx),
            },
        });
        return response.json(); 
    };

    async function sendPostBEJustH(url = '', query = {},limit = Number,sortby = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': getStoredField("token"),
                'query': JSON.stringify(query),
                'limit': limit,
                'sortby': JSON.stringify(sortby),
            },
        });
        return response.json(); 
    };

    async function sendPostBE(url = '', data, id) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            // mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': getStoredField("token"),
                'id': id
            },
            // headers: headers,
            // body: JSON.stringify(data),
            body: data,
        });
        return response.json(); 
    };

    return (
            <div style={{
                display: 'flex', flexDirection: 'column', height: '500px', justifyContent: 'space-evenly'
            }}>
               <h1>Nothing to see here. Keep moving on :D</h1>
               {
                   error &&
                    <h3 style={{ color: 'red' }}>{error}</h3>
               }
               {/* <button onClick={showMe}>Show me Current NFTs</button> */}
               <p>First add the image, then send the Click</p>
               <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" onChange={(e) => setFile(e.target.files)} />
               <button onClick={sendData}>Send data BE</button>
               <hr></hr>
               {
                   sendingData && <Loader logginIn={true} typegif={"dots"} />
               }
               {
                   newNft &&
                    <div className="textAlignedCenter">
                        <div>
                            <img src={newNft.thumb} />
                        </div>
                        <p>Symbol: {newNft.symbol} / Price: {newNft.price} HIVE</p>
                        <p>Owner: {newNft.account} / Token Id:{newNft.nft_id}</p>
                    </div>
               }
               {
                   (myNFTsMongo.length > 0) &&
                    <div>
                        <h2>My current Tokens</h2>
                        <ul className="standardUlRowFlexPlain">
                            {
                                myNFTsMongo.map(token => {
                                    return (
                                        <li key={token._id}>
                                            <div className="textAlignedCenter marginLeft">
                                                <div>
                                                    <img src={token.thumb} className="smallImage" />
                                                </div>
                                                <p className="xSmalltext">Symbol: {token.symbol} / Price: {token.price} HIVE</p>
                                                <p className="xSmalltext">Token Id:{token.nft_id}</p>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
               }
               {/* <p>Testing form</p>
               <form action={nfthandlermongoEP+"testData"} method="POST">
                   <input type="text" name="name" />
                   <input type="text" name="pass" />
                   <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" multiple></input>
                   <button type="submit">Submit</button>
               </form> */}
               <input type="text" onChange={(e) => setTxID(e.target.value)} />
               <button onClick={getInfoTX}>Get TX info</button>
            </div>
    )
}

export default Nfttests;