import React, { useState, useEffect } from 'react';
import { check, formatDateTime } from '../../utils/helpers';
import axios from 'axios';
//hooks-forms
import { useForm } from 'react-hook-form';
// import Img from 'gatsby-image';
// import { useStaticQuery, graphql } from 'gatsby';
//components
import Btnclosemin from '../btns/btncloseMin';
import Abswrapper from '../absscreenwrapper';
import { Link } from 'gatsby';
import Loader from '../loader';
import Nftcreator from '../nfthandling/nftcreator';
import Nftcreatorfinal from '../nfthandling/nftcreatorfinal';
//hiveio/keychain
import { isKeychainInstalled} from '@hiveio/keychain';
import Instantiator from '../nfthandling/nftinstantiator';
import Nfteditor from '../nfthandling/nfteditor';
import Btndisplayhiveusd from '../btns/btndisplayhiveusd';
import Nftsender from '../nfthandling/nftsender';
import Btninfo from '../btns/btninfo';
import Btnoutlink from '../btns/btnoutlink';
import Alerticon from '../icons/alerticon';
import Nftburner from '../nfthandling/nftburner';
import Btnswitch from '../btns/btnswitch';
import Tokentabulator from '../nfthandling/subcomponents/tokentabulator';
import Nftimporter from '../nfthandling/subcomponents/nftimporter';
import Marketenabler from '../nfthandling/subcomponents/marketenabler';
import Menuside from '../interactions/menuside';
import Recordnator from '../interactions/recordnator';
import Transferowner from '../nfthandling/subcomponents/transferowner';
import Tokenseller from '../nfthandling/subcomponents/tokenseller';
import Btncollapse from '../btns/btncollapse';
import Tablinator from '../interactions/tablinator';
// import Nfttransfer from '../nfthandling/subcomponents/nfttransfer';
//testing SSCjs library
// const SSC = require('sscjs');
// const ssc = new SSC('http://185.130.45.130:5000/');
//END testing
//dhive to broadcast a custom json
var dhive = require("@hiveio/dhive");
var client = new dhive.Client(["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network"]);
//constants
// TODO put in on .env
const jabFEE = { fee: "0.002", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};
const nftEP = process.env.GATSBY_nftEP;
const userEP = process.env.GATSBY_userEP;
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;
const ssc_test_id = "ssc-testNettheghost1980";
const amountArray = [
    {id: 'A-1', amount: 1},
    {id: 'A-2', amount: 2},
    {id: 'A-3', amount: 3},
    {id: 'A-4', amount: 4},
    {id: 'A-5', amount: 5},
    {id: 'A-6', amount: 6},
    {id: 'A-7', amount: 7},
    {id: 'A-8', amount: 8},
    {id: 'A-9', amount: 9},
    {id: 'A-10', amount: 10},
]
const devMode = true;

// IMportant TODO when creating the sale of a token.
// 1. A user wants to a NFT.
// 2. B users wants to buy it, so we so a transfers and emit a custom json.
    // 2.1 the amount is the price of the token.
    // 2.2 the json is first "addAuthorizedIssuingAccounts" as the user B is th enew owner.
    // 2.3 another custom json with "transferOwnership"
    // Note: let's play on this to see what is the best way to do it.

const Tokensuser = () => {
    // grapqhl queries
    // const data = useStaticQuery(graphql` query{ expandIcon: file(relativePath: {eq: "expand_arrow.png"}) { childImageSharp { fixed(width: 18) { ...GatsbyImageSharpFixed_withWebp }}}
    //         collapseIcon: file(relativePath: {eq: "collapse_arrow.png"}) { childImageSharp { fixed(width: 18) { ...GatsbyImageSharpFixed_withWebp }} }}
    // `);
    //end grapqhl queries

    const userdata = check();
    // TODO: factor the state, maybe to use less.
    const [hive, setHive] = useState(null);
    const [noHive, setNoHive] = useState(null);
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [noowned, setNoowned] = useState(false);
    const [createToken, setCreateToken] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [existsNft, setExistsNft] = useState(false);
    const [loadingData, setLoadingData] = useState(true); //by default on init
    const [loadingInstances, setLoadingInstances] = useState(false);
    const [canCreate, setCanCreate] = useState(false);
    const [reviewing, setReviewing] = useState(false);
    const [payload, setPayload] = useState(null);
    const [nameLenght, setNameLenght] = useState(0);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [noInstancesOfNFT, setnoInstancesOfNFT] = useState(false);
    const [myNFTsMongo, setMyNFTsMongo] = useState([]); //the one this user has created on JAB an he is the actual issuer = owner.
    const [myHoldings, setMyHoldings] = useState([]); //represent the instances this user has. You look into user.holding[] and each one of those means he has at least 1 instance. With that data, we look into each instance table and bring the data when user request it.
    const [selected, setSelected] = useState(null);
    const [selectedInstances, setSelectedInstances] = useState([]);
    const [showCreator, setShowCreator] = useState(false);
    const [wantToBurn, setWantToBurn] = useState(false);
    const [tx, setTx] = useState(null);
    const [wantToInstantiate, setWantToInstantiate] = useState(false);
    const [amount, setAmount] = useState(0);
    const [showInstantiator, setShowInstantiator] = useState(false);
    const [showImporter, setShowImporter] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [wantToEdit, setWantToEdit] = useState(false);
    const [wantToSend, setWantToSend] = useState(false);
    const [wantToSell, setWantToSell] = useState(false);
    //just for instance TODO: fix later on
    const [wantActionInstance, setWantActionInstance] = useState("");
    //END just for instance TODO: fix later on
    const [wantToTrasnferOwn, setWantToTrasnferOwn] = useState(false);
    const [selectedFromHive, setselectedFromHive] = useState(null);
    const [showDangerZone, setShowDangerZone] = useState(false);
    const [showMarketEnabler, setShowMarketEnabler] = useState(false);
    const [toEdit, setToEdit] = useState("");
    const [authEditingAcc, setAuthEditingAcc] = useState(null);
    const [showIconsHoldings, setShowIconsHoldings] = useState(false);
    const [fireUpdateNfts, setFireUpdateNfts] = useState(false);
    const [fireUpdateInstances, setFireUpdateInstances] = useState(false);
    const [selectedNft_Instance, setSelectedNft_Instance] = useState(null);
    const [showNftDefinition, setShowNftDefinition] = useState(false);
    const [showCirculatingSupply, setShowCirculatingSupply] = useState(false);
    const [circulatingSupply, setCirculatingSupply] = useState(null);
    //init forms-hooks
    const { register, handleSubmit, errors } = useForm();
    // on load
    // show user's swap.hive balance
    // for multiples values in query account: { $in: ['themarkymark', 'theghost1980']}

    // to load once on first render
    useEffect(() => {
        updateAll();
        // updateHoldings();
        // getUserField({ nfts: 1 },null);
    }, []);
    // END to load once on first render

    // to execute on each set state
    useEffect(() => {
        function queryData(){
            setLoadingData(true);
            setselectedFromHive(null);
            setSelectedInstances([]);
            console.log('Searching on:', active);
            getSSCDataTable(nftEP+"allInstances",`${active.symbol}`,"instances",{ account: userdata.username })
            .then(response => {
                console.log(response);
                setSelectedInstances(response);
            }).catch(error => {
                console.log('Error fecthing BE - instances.',error);
                setLoadingData(false);
            });
            // console.log(`Searching on:${active.symbol} but in Hive chain...`);
            getSSCData(nftEP+"allNFTs",{ symbol: active.symbol,  })
            .then(response => {
                console.log(response);
                if(response.length === 1){
                    setselectedFromHive(response[0]);
                    setLoadingData(false);
                }
            }).catch(error => {
                console.log('Error fecthing BE - instances.',error);
                setLoadingData(false);
            });
        }
        const active = {};
        if(selected){
            active['source'] = 'selected';
            active['symbol'] = selected.symbol;
            queryData();
        }else if(selectedNft_Instance){
            active['source'] = 'selected_instance';
            active['symbol'] = selectedNft_Instance.ntf_symbol;
            queryData();
        }
    }, [selected, selectedNft_Instance]);
    useEffect(() => { if(tx){ setTimeout(getInfoTX,3000) }; }, [tx]); //testing on 3s
    useEffect(() => {
        if(showCirculatingSupply){
            getSSCDataTable(nftEP+"allInstances",`${selected.symbol}`,"instances",{})
            .then(response => {
                setCirculatingSupply(response);
            }).catch(error => { console.log('Error fecthing BE - instances.',error) } );
        }else{
            setCirculatingSupply(null);
        }
    },[showCirculatingSupply]);
    // useEffect(() => {
    //     if(nfts){
    //         console.log(nfts);
    //     }
    // },[nfts])
    // end to execute on each set

    // functions/CB
    // function addIntoHoldings(value){
    //     setMyHoldings(prevState => [ ...prevState, value]);
    // }
    function updateAll(){
        updateNFTs();
        updateInstances();
        updateHiveBalance();
    }
    function updateHiveBalance(){
        setLoadingData(true);
        client.database.getAccounts([userdata.username])
        .then(result => {
            console.log(result);
            if(result.length > 0 && result[0].balance){
                const hives = Number(result[0].balance.split(' HIVE')[0]).toFixed(3);
                if(hives > 1){
                    setCanCreate(true);
                    setHive(hives);
                }else{
                    setCanCreate(false);
                    setHive("0.00");
                }
                setLoadingData(false);
            }
        })
        .catch(error => { console.log('Error while querying user on DHIVE.',error)});
    }
    function updateInstances(){ //get all instances on mongoDB
        const query = { username: userdata.username };
        sendGETBEJustH(nfthandlermongoEP+"getNFTInstancesQuery",query,0, { symbol: 1 })
        .then(response => {
            console.log(response);
            setMyHoldings(response.result);
            setLoadingData(false);
        })
        .catch(error => console.log('Error getting data BE.',error));
    }
    function getInfoTX(){
        if(tx){
            getSSCDataTX(nftEP + "tx", tx)
            .then(response => {
                // console.log(response);
                if(response.status === "askAgain"){
                    return setTimeout(getInfoTX,3000);
                }else{
                    //{"events":[{"contract":"nft","event":"burn","data":{"account":"theghost1980","ownedBy":"u","unlockedTokens":{},"unlockedNfts":[],"symbol":"APII","id":"1"}}]}
                    // console.log(response);
                    if(response.logs){
                        const logs = JSON.parse(response.logs);
                        // console.log(logs.events);
                        if(logs.events.length === 1 && logs.events[0].event === "burn"){
                            //burned. show message to user
                            setWantToBurn(false);
                            setSelected(null);
                            setSelectedInstances([]);
                            const msg = `Symbol: ${logs.events[0].data.symbol} ID: ${logs.events[0].data.id} has been sent to null.`
                            alert('Token Burned Successfully\n' + msg);
                            setTx(null);
                            //TODO: update the main nft list.
                            // TODO: send log to loggerOP
                        }
                    }
                }
            })
            .catch(error => {
                console.log('Error asking data ssc on BE',error);
            });
        }
    }
    const updateUserNFTS = () => {
        console.log('Updating NFTs');
        updateNFTs();
    }
    function getUserField(field = {},storeTo){
        const headers = { 
            'x-access-token': userdata.token, 
            'query': JSON.stringify(field), //{ holding: 1}
            'tolookup': null,
        }; //as if you need to lookup for user just fill the header tolookup
        getDataWH(userEP+"jabUserField",headers)
        .then(response => {
            console.log(response);
        }).catch(error => console.log(`Error getting ${field} for user on BE.`,error));
    }
    function updateHoldings(){
        //we must check on holding so we can bring all the tokens he holds.
        const headers = { 'x-access-token': userdata.token, 'query': JSON.stringify({ holding: 1 }),'tolookup': null, }; //as if you need to lookup for user just fill the header tolookup
        getDataWH(userEP+"jabUserField",headers).then(response => {
            // console.log(response);
            if(response.status === "sucess" && response.result.holding.length > 0){
                //now search on the info of this nft on mongo.
                // testing the in operator query = { quantity: { $in: [20, 50] } } // i.e { symbol: { $in: [..._holding] } }
                const _holding = response.result.holding;
                // console.log(`Searching on:${JSON.stringify(_holding)} BE for ${userdata.username}`);
                const query = { nft_id: null, symbol: { $in: [..._holding] }, account: null,};
                sendGETBEJustH(nfthandlermongoEP + "getNFTquery",query,0, { "null": null })
                .then(response => {
                    // console.log(response);
                    if(response.status === 'sucess' && response.result.length > 0){
                        // we may add it to myHoldings
                        setMyHoldings(response.result);
                    }
                }).catch(error => console.log('Error asking for NFTs on this user from DB, mongo.',error));
            }
        }).catch(error => {
            console.log('Error asking for holding field',error);
        });
        //new method using the user.nfts as the final that containts each instance the user has
        const headers2 = { 'x-access-token': userdata.token, 'query': JSON.stringify({ nfts: 1 }),'tolookup': null, }; //as if you need to lookup for user just fill the header tolookup
        getDataWH(userEP+"jabUserField",headers2)
        .then(response => {
            console.log(response);
            if(response.status === "sucess"){
                const _nfts = response.result.nfts.map(nft => {
                    return nft.ntf_symbol;
                });
                console.log('We should look into:',_nfts);
                // const query = { nft_id: null, symbol: { $in: [..._holding] }, account: null,};
                // sendGETBEJustH(nfthandlermongoEP + "getNFTquery",query,0, { "null": null })
                // .then(response => {
                //     // console.log(response);
                //     if(response.status === 'sucess' && response.result.length > 0){
                //         // we may add it to myHoldings
                //         setMyHoldings(response.result);
                //     }
                // }).catch(error => console.log('Error asking for NFTs on this user from DB, mongo.',error));
            }
        }).catch(error => { console.log('Error asking for user.nfts field',error)});
    }
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
                setNfts([]);
                response.result.map(nft => updateNftArray('created', nft));
                setLoadingData(false);
            }
        }).catch(error => console.log('Error asking for NFTs on this user from DB, mongo.',error));
    }
    const onSaleNft = () => {
        if(!selected.price_definition || selected.price_definition === 0){ return alert('In order to sell this NFT Definition, you must set a Price Definition.\nPlease go to Edit > Edit Token Info.')}
        const update_for_sale = selected.for_sale ? false : true; //toogle the status.
        const answer = window.confirm(`Update NFT definition ${selected.symbol} as ${update_for_sale ? 'For Sale': 'Cancel Sell'}\nDo we proceed?`);
        if(answer){
            if(selected){
                // TODO a component abs on top to show the loader while we load data or do something
                // TODO add the logic so the same component can be used to toogle on_sale
                // maybe with a cool down to prevent abuse or "fooling around"
                const query = {
                    for_sale: update_for_sale,
                    updatedAt: new Date().toString(),
                }
                sendPostBEJH(nfthandlermongoEP+"updateNFTfield",query, selected.nft_id)
                .then(response => {
                    console.log(response); //status, result
                    if(response.status === "sucess"){
                        setSelected(response.result);
                        if(response.result.for_sale){
                            alert('Nft definition placed on Sell.');
                        }else{
                            alert('Cancelled Sell!');
                        }
                    }
                    // todo some kind of component that show messages smoothly on top of everything
                    // maybe we can just improve the topmessenger.
                }).catch(error => console.log('Error updating field on NFT to DB.',error));
            }
        }
    }

    const showCreatorHideRest = () => {
        setShowCreator(true);
        setSelectedNft_Instance(null);
        setSelected(null);
    }
    // function burnToken(token){
    //     // TODO: play with the logic on, if this token is been used on a job?
    //     // I guess in_use can serve to "transfers" maybe but cannot see the logic yet.
    //     if(isKeychainInstalled){
    //         const answer = window.confirm('You are about to Burn 1 token. Shall we proceed?');
    //         if(answer){
    //             console.log(`To burn:${token._id}`);
    //             const jsonData = {
    //                         "contractName": "nft",
    //                         "contractAction": "burn",
    //                         "contractPayload": {
    //                             "nfts": [ {"symbol": String(selected.symbol), "ids": [ String(token._id) ]} ]
    //                         }
    //             }
    //             const msg = `To burn 1 ${selected.symbol}`;
    //             window.hive_keychain.requestCustomJson(userdata.username, ssc_test_id, "Active", JSON.stringify(jsonData), msg, function(result){
    //                 const { message, success, error } = result;
    //                 console.log(result);
    //                 if(!success){
    //                     if(error !== "user_cancel"){
    //                         const { error, cause, data } = result.error;
    //                         console.log('Error while trying to burn NFT.', message);
    //                     }else if(error === "user_cancel"){
    //                         // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
    //                         console.log('User cancelled burning!');
    //                     }
    //                 }else if (success){
    //                     //check on this txId to analize results.
    //                     setTx(result.result.id);
    //                     console.log('Checking TX!',result.result.id);
    //                     // TODO: send log to loggerOP
    //                 };
    //             });
    //         }else{
    //             console.log('Token Burning cancelled. Send this to loggerOps');
    //         }
    //     }
    // }
    const successOp = () => {
        console.log('Called from ChilDo!')
        //new one to update on tokentabulator
        setFireUpdateNfts(!fireUpdateNfts);
        setFireUpdateInstances(!fireUpdateInstances);
        updateAll();
        setSelected(null); //testing this "trick" to see it will update the 2 nft states :P
        setselectedFromHive(null);
        // setSelected(selec); //results: it works but it make the whole 2 components to re-render dunno how nice is that????
        //for now let's close any of the options so the user can select again what to do.
        closeAllOthers();
    }
    function closeAllOthers(){
        setShowInstantiator(false);
        setShowEditor(false);
        setAmount(0);
        setWantToInstantiate(false);
        setWantToEdit(false);
        setWantToSend(false);
        setWantToTrasnferOwn(false);
        setSelectedNft_Instance(null);
        setWantActionInstance("");
    }
    const closeInstantiator = () => {
        setShowInstantiator(false);
    }
    const closeEditor = () => {
        setShowEditor(false);
    }
    const closeSender = () => {
        setWantToSend(false);
    }
    const collapseClean = () => {
        setAmount(0);
        setWantToInstantiate(!wantToInstantiate);
    } 
    const closeAndUpdateNFTs = () => {
        setShowCreator(false);
        updateNFTs();
    }
    const editNft = (toEdit) => {
        setToEdit(toEdit);
        setShowEditor(true);
    }
    function updateNftArray(type,item){
        if(type === 'created'){
            item.type = type;
            setNfts(prevState => [ ...prevState, item ])
        }else{
            setNfts(prevState => [ ...prevState, item ]);
        }
    }
    // END functions/CB

    //data fecthing
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
    async function sendPostBEJH(url = '', query, nft_id) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-access-token': userdata.token,
                'nft_id': nft_id,
                'query':JSON.stringify(query),
            },
        });
        return response.json(); 
    };
    async function getDataWH(url = '', headers = {}) {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors', 
            headers: headers,
        });
        return response.json(); 
    };
    // end data fecthing

    function getThumb(nftId){
        return nfts.filter(item => item.nft_id === nftId)[0].thumb
    }

    // useEffect(() => {
    //     setLoadingData(true);
    //     client.database.getAccounts([userdata.username])
    //     .then(result => {
    //         console.log(result);
    //         if(result.length > 0 && result[0].balance){
    //             const hives = Number(result[0].balance.split(' HIVE')[0]).toFixed(3);
    //             if(hives > 1){
    //                 setCanCreate(true);
    //                 setHive(hives);
    //             }else{
    //                 setCanCreate(false);
    //                 setHive("0.00");
    //             }
    //             setLoadingData(false);
    //         }
    //     })
    //     .catch(error => { console.log('Error while querying user on DHIVE.',error)});
    // },[])

    // const refreshNfts = () => {
    //     // ssc.find("nft", "nfts", { issuer: "jobaboard", "properties.isPremium.authorizedEditingAccounts": userdata.username } , null, 0, [], (err, result) => {
    //     //     if(err) return console.log('Error asking state on New NFT Instance - SSCjs',err);
    //     //     console.log(result);
    //     //     if(result.length > 0){
    //     //         setOwnedTokens(result);
    //     //     }else{
    //     //         setNoowned(true);
    //     //     }
    //     //     setLoadingData(false);
    //     // });
    //     getSSCData(nftEP+"allNFTs",{ issuer: "jobaboard", "properties.isPremium.authorizedEditingAccounts": userdata.username })
    //     .then(response => {
    //         if(response.error){ 
    //             console.log('Error fetching data from BE',response.error);
    //             setLoadingData(false);
    //         }else if(response.length > 0){
    //             setOwnedTokens(response);
    //         }else if(response.length === 0){
    //             setNoowned(true);
    //         }
    //         setLoadingData(false);
    //     })
    // }

    // const closeMe = () => {
    //     setCreateToken(!createToken);
    // }

    // const cancelTokenCreation = () => {
    //     setPayload(null);
    //     setReviewing(false);
    //     setCreateToken(!createToken);
    // }

    //handling the form data as create the token
    // const onSubmit = (data) => {
    //     if(!reviewing){
    //         alert('Please review carefully the data to print onto the Blockchain.\nWhen ready send.');
    //         setReviewing(true);
    //         setPayload(data);
    //         console.log(data);
    //     }
    // };

    // const checkLength = (event) => {
    //     setNameLenght(event.target.value.length);
    // }

    // const findInstances = (_nft) => {
    //     setSelectedNFT(null);
    //     setLoadingInstances(true);
    //     // ssc.find("nft", `${_nft.symbol}instances`, { account: userdata.username } , null, 0, [], (err, result) => {
    //     //     if(err){
    //     //         setLoadingInstances(false);
    //     //         return console.log('Error asking state on User NFT Instance - SSCjs',err);
    //     //     } 
    //     //     // console.log(result);
    //     //     if(result.length > 0){
    //     //         setSelectedNFT(result);
    //     //     }else{
    //     //         //no issued yet, show user that and invite him to instantiate or sell the token.... Ideas..more ideas...
    //     //         setnoInstancesOfNFT(true);
    //     //     }
    //     //     setLoadingInstances(false);
    //     // });
    //     console.log(_nft.symbol);
    //     getSSCDataTable(nftEP+"allInstances",`${_nft.symbol}`,"instances",{ account: userdata.username })
    //     .then(response => {
    //         if(response.error){console.log('Error fetching data from BE',response.error);};
    //         if(response.length > 0){
    //             console.log(response);
    //             setSelectedNFT(response);
    //         }else if(response.length === 0){
    //             setnoInstancesOfNFT(true);
    //         }
    //         setLoadingInstances(false);
    //     })
    //     .catch(error => console.log('Error fetching Data',error));
    // }

    // const checkSymbolName = (nft) => {
    //     if(nfts && nfts.length > 0){
    //         const NFT = String(nft).toUpperCase();
    //         // console.log(`Checking:${NFT}`);
    //         //we check if symbol already exists
    //         const matchedNFT = nfts.filter(nft => nft.symbol === String(NFT).toLocaleUpperCase());
    //         if(matchedNFT.length > 0){
    //             setExistsNft(true);
    //         }else{
    //             setExistsNft(false);
    //         }
    //     }
    // }

    // function goCreateNFT(){
    //     setCreateToken(!createToken);
    //     // const element = document.getElementById("nftCreatorJAB");
    //     // element.scrollIntoView({block: "start", behavior: "smooth"});
    //     if(!createToken){
    //         window.scrollTo(0, 900);
    //     }
    // }

    const setCirculatingReset = () => {
        setShowCirculatingSupply(!showCirculatingSupply);
    }

    const wantToPlayWithInstance = (menuOption) => { //"Send Token" //"Sell on Market" //"Burn Token"
        console.log('Clicked on:', menuOption);
        if(menuOption === "Burn Token"){
            setWantActionInstance("Burn");
            // console.log('Set as: Burn');
        }else if(menuOption === "Send Token"){
            setWantActionInstance("Transfer");
            // console.log('Set as: Transfer');
        }else if(menuOption === "Sell on Market"){
            setWantActionInstance("Sell");
        }
    }

    const cancelActionInstance = () => {
        setWantToBurnInstance(false);
        setWantToSendInstance(false);
    }

    //////////data fecthing BE////////////
    async function getSSCDataTX(url = '',tx) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token,
                'tx': tx,
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
    async function getSSCDataTable(url = '',nftSymbol = String, table = String, query = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': userdata.token,
                'nftsymbol': nftSymbol,
                'query': JSON.stringify(query),
                'table': table,
            },
        });
        return response.json(); 
    };
    //////////////////////////////////////

    const settingSelected = (item,type) => {
        if(devMode) { console.log(item,type) };
        if(type === "nft_definition"){
            setSelected(item);
            setSelectedNft_Instance(null);
        }else{
            setSelected(null);
            setSelectedNft_Instance(item);
        }
    } 

    return (
        <div className="userTokensContainer">
            <Tokentabulator cbSendItem={(item,type) => settingSelected(item,type)} userdata={userdata}
                tradeCointBalance={hive ? { coin: 'HIVE', balance: hive} : { coin: 'HIVE', balance: 0 }}
                fireAnUpdateNfts={fireUpdateNfts} fireAnUpdateInstances={fireUpdateInstances}
                devMode={true}
            />
            <ul className="textNomarginXXSmall">
                <li>Todo Here</li>
                <li>On holdings: add the options for instance as: send to market(put on sale).</li>
            </ul>
            {
                !loadingData &&
                <div>
                    <ul className="standardUlHorMini justSpaceAround">
                        <li>
                            {
                                hive > 1 ? <button onClick={showCreatorHideRest}>Create Token</button> : <button>Top Up</button>
                            }
                        </li>
                        <li>
                            <button onClick={() => setShowImporter(true)}>Import Token</button>
                        </li>
                    </ul>
                </div>
            }
            {
                showImporter && 
                <Nftimporter cbOnSucess={successOp} jabFEE={jabFEE} userdata={userdata} 
                    closeCB={() => setShowImporter(false)} 
                    ssc_test_id={ssc_test_id} devMode={true}
                />
            }
            {
                showCreator && 
                <div className="relativeDiv">
                    <Btnclosemin classCSS={"absDivColSmall"} btnAction={closeAndUpdateNFTs}/>
                    <Nftcreatorfinal updateOnSuccess={successOp} />
                </div>
            }
            {
                selectedNft_Instance && !selected &&
                <div className="relativeDiv marginsTB borderTPGroove">
                    <Btnclosemin classCSS={"pointer"} btnAction={() => setSelectedNft_Instance(null)} />
                    <div className="standardDivRowFullW">
                        <div className="standardDiv30Percent">
                            <img src={selectedNft_Instance.image} className="imageMedium" />
                            {   
                                <Menuside xclassCSS={`${selectedNft_Instance.burned ? 'disableDiv': null }`}
                                    clickedSubItemCB={(item) => wantToPlayWithInstance(item)}
                                    items={[
                                        { id: 'men-Jab-Instance-1', title: 'Send Token', hasSubMenu: false, clickeable: true },
                                        // { id: 'men-Jab-Instance-2', title: 'Send to JAB', hasSubMenu: false, clickeable: true },
                                        { id: 'men-Jab-Instance-3', title: 'Sell on Market', hasSubMenu: false, clickeable: true },
                                        { id: 'men-Jab-Instance-3', title: 'Burn Token', hasSubMenu: false, clickeable: true },
                                    ]}
                                />
                            }
                            { selectedNft_Instance.burned && <p className="smallText">Token Burned. Sadness.</p>}
                        </div>
                        <div className="standardDiv70Percent">
                            <Recordnator 
                                item={selectedNft_Instance}
                                toShow={[
                                    { field:'nft_instance_id', type: 'Number', link: false },
                                    { field:'ntf_symbol', type: 'String', link: false },
                                    { field:'on_sale', type: 'Boolean', link: false },
                                    { field:'price', type: 'Number', link: false },
                                    { field:'priceSymbol', type: 'String', link: false },
                                    { field:'createdAt', type: 'Date', link: false },
                                    { field:'updatedAt', type: 'Date', link: false },
                                ]}
                                devMode={true}
                            />
                            <Btnswitch xtraClassCSS={"justAligned"} sideText={"Show me its definition bellow."} initialValue={false} btnAction={(cen) => setShowNftDefinition(cen)}/>
                            {
                                showNftDefinition &&
                                <Recordnator 
                                    item={selectedNft_Instance.nft_definition}
                                    toShow={[
                                        { field:'issuer', type: 'String', link: false },
                                        { field:'issued_On', type: 'String', link: false },
                                        { field:'account', type: 'String', link: false },
                                        { field:'createdAt', type: 'Date', link: false },
                                        { field:'updatedAt', type: 'Date', link: false },
                                        { field:'market_enabled', type: 'Boolean', link: false },
                                        { field:'nft_id', type: 'Number', link: false },
                                        { field:'price', type: 'Number', link: false },
                                        { field:'price_definition', type: 'Number', link: false },
                                        { field:'price_base_on_cast', type: 'Number', link: false },
                                        { field:'for_sale', type: 'Boolean', link: false },
                                        { field:'url', type: 'String', link: true },
                                    ]}
                                    miniSizes={true}
                                />
                            }
                        </div>
                    </div>
                </div>
            }
            {/* just for instances send/burn, TODO modify to re-use code */}
            {
                            (wantActionInstance === "Transfer") &&
                            <Abswrapper xtraClass={"justiAlig"}>
                                <Nftsender userdata={userdata} nft={selectedFromHive} cbCancel={() => setWantActionInstance("")} 
                                    ssc_id={ssc_test_id} userEP={userEP}
                                    nftEP={nftEP} cbOnFinish={successOp} nftInstances={selectedInstances}
                                />
                            </Abswrapper>
            }
            {
                (wantActionInstance === "Burn") &&
                <Nftburner userdata={userdata} closeCB={() => setWantActionInstance("")}
                    selectedInstances={selectedInstances} ssc_test_id={ssc_test_id}
                    cbOnSucess={successOp}
                    selectedInstances={selectedInstances}
                    selected={selectedNft_Instance.nft_definition}
                    devMode={true}
                />
            }
            { 
                (wantActionInstance === "Sell") &&
                <Tokenseller 
                    selectedNft_instance={selectedNft_Instance}
                    userdata={userdata} closeCB={() => setWantActionInstance("")}
                    devMode={true}
                    ssc_test_id={ssc_test_id}
                    nfthandlermongoEP={nfthandlermongoEP} nftEP={nftEP}
                    renderMode={"onTop"}
                    cbOnSucess={successOp}
                />
            }
            {/* END just for instances send/burn, TODO modify to re-use code */}
            {
                selected && selectedFromHive &&
                <div className="relativeDiv marginsTB borderTPGroove">
                    <Btnclosemin classCSS={"absDivColSmall"} btnAction={() => setSelected(null)} />
                    <div className="standardDivRowFullW">
                        <div className="standardDiv30Percent">
                            <img src={selected.image} className="imageMedium" />
                            <ul className="standardUlColPlain90p normalTextSmall">
                                {   (selected.account === userdata.username) &&
                                    <li className={`standardLiHovered ${!wantToInstantiate ? 'listItemClosed':'listItemOpened'}`} onClick={collapseClean}>Cast More</li>
                                }
                                {
                                    wantToInstantiate &&
                                        <li className="borderedFlexShadow90pW2 miniMarginTB">
                                            <form className="miniMarginTB">
                                                <label htmlFor="amount">Amount</label>
                                                <select name="amount" onChange={(e) => setAmount(e.target.value)}>
                                                    <option defaultValue="0">Please Select an amount</option>
                                                    {
                                                        amountArray.map(amount => {
                                                            return (
                                                                <option key={amount.id} value={amount.amount}>{amount.amount}</option>
                                                            )
                                                        })
                                                    }
                                                </select>
                                            </form>
                                            {
                                                (amount > 0) &&
                                                <div>
                                                    {
                                                        ((Number(jabFEE.costInstance) * amount) > hive)
                                                        ? <p className="alertSpan textAlignedCenter">Amount greater than your current balance. <Link to={"/app/wallet"}>Please Top up Balance</Link>, to cast that amount of tokens.</p>
                                                        :   <div>
                                                            <p>Total:{Number(jabFEE.costInstance) * amount} {jabFEE.acceptedCur}</p>
                                                            <button className="miniMarginTB minibtn" onClick={() => setShowInstantiator(true)}>Review</button>
                                                            </div>
                                                    }
                                                </div>
                                            }
                                        </li>
                                }
                                {   (selected.account === userdata.username) &&
                                    <li className={`standardLiHovered justifyContentSEvenly ${!wantToEdit ? 'listItemClosed':'listItemOpened'}`} onClick={() => setWantToEdit(!wantToEdit)}>Edit </li>
                                }
                                {
                                    wantToEdit &&
                                    <div className="borderedFlexShadow90pW2 miniMarginTB">
                                        <div className="contentMiniMargins">
                                            <li className="standardLiHovered" onClick={() => editNft("Authorized Issuing Account")}>Edit Issuing Accounts</li>
                                            {/* TODO on edit token info: check on transaction to see if there is transaction>token_used && transaction>status = "ongoing" to prevent price edition */}
                                            <li className="standardLiHovered" onClick={() => editNft("Edit Token Information")}>Edit Token Info</li>
                                        </div>
                                    </div>
                                }
                                {
                                    (selected.account === userdata.username) &&
                                    // <li className="standardLiHovered" onClick={onSaleNft}>Put on sale</li>
                                    <li className={`standardLiHovered justifyContentSEvenly ${!wantToSell ? 'listItemClosed':'listItemOpened'}`} onClick={() => setWantToSell(!wantToSell)}>Sale Options</li>
                                }
                                {
                                    wantToSell &&
                                    <div className="borderedFlexShadow90pW2 miniMarginTB">
                                        <div className="contentMiniMargins">
                                            { selected && !selected.market_enabled &&
                                                <li className="standardLiHovered justAligned" onClick={() => setShowMarketEnabler(true)}>
                                                    Enable Sales on NFT <Btninfo xclassCSS={"textColorBlack"} size={"mini"}  msg={"This option allows you to enable the market for the selected NFT definition. By doing this any user that owns one of this tokens, will be able to place sell orders on the MarketPlace."}/>
                                                </li>
                                            }
                                            {/* TODO on edit token info: check on transaction to see if there is transaction>token_used && transaction>status = "ongoing" to prevent price edition */}
                                            <li className="standardLiHovered" onClick={onSaleNft}>
                                                <div className="standardDivRowFullW">
                                                    <p className="minimumMarginTB">
                                                        {
                                                            selected.for_sale ? 'Cancel Selling' : 'Sell Definition'
                                                        }
                                                    </p>
                                                    <Btninfo xclassMsg={"textColorBlack"} size={"mini"} msg={"Each NFT has a definition that holds the most important info and properties. If you decide you can sell it on JAB. We suggest a high price."} />
                                                </div>
                                            </li>
                                        </div>
                                    </div>
                                }
                                <li>
                                    <div className="borderedFlexShadow90pW2 miniMarginTB">
                                        <p className="contentMiniMargins textSmallOrange">Actual Token Balance</p>
                                        <div className="contentMiniMargins">
                                            {/* for now i will handle it straight away from hive ssc */}
                                            {
                                                <h2 className="noMargintop">{selectedInstances.length.toString()} {selectedInstances.length === 1 ? 'Token':'Tokens'}</h2>
                                            }
                                            <ul className="normalTextSmall standardUlColPlain90p">
                                            <li className="standardLiHovered" onClick={() => alert('TODO. We open a new tab, to show transactions on this NFT and its instances.')}>Review History of {selected.symbol}</li>
                                            {
                                                (selectedInstances.length > 0) &&
                                                    <div>
                                                        <li onClick={() => setWantToSend(true)} className="standardLiHovered">Send</li>
                                                        {/* <li onClick={() => alert('TODO the options could be:\n1. Sell it back to owner for a cheaper price.\n2. Put in on the JAB market. The Market may be a place to buy and sell tokens.\n3. Sell it to JAB for a very cheap price. Also can be trade with JAB(for free promotions, special JAB tokens,etc). JAB could also put it on sale as "Week NFTs bargains"')} className="standardLiHovered">Send To JAB</li> */}
                                                    </div>
                                            }
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    {
                                        <div className="borderedFlexShadow90pW2 miniMarginTB relativeDiv justTransitions">
                                            <div className="standardDivRowPlain justAligned">
                                                <p className="contentMiniMargins warningTextSmall pointer hoveredAlert" onClick={() => setShowDangerZone(!showDangerZone)}>Danger Zone</p>
                                                <Alerticon type={"filled"} typeDiv={"notAbsolute"}/>
                                            </div>
                                            {
                                                showDangerZone &&
                                                <ul className="standardUlColPlain contentMiniMargins">
                                                    {
                                                        selectedInstances.length > 0 &&
                                                        <li className="standardLiHovered" onClick={() => setWantToBurn(true)}>Burn Tokens</li>
                                                    }
                                                    {
                                                        (selected.account === userdata.username) &&
                                                        <li className="standardLiHovered" onClick={() => setWantToTrasnferOwn(true)}>Transfer Ownership</li>
                                                    }
                                                </ul>
                                            }
                                        </div>
                                    }
                                </li>
                            </ul>
                        </div>
                        {
                            showInstantiator && 
                            <Abswrapper xtraClass={"justiAlig"}>
                                <Instantiator cbCancel={closeInstantiator} 
                                    userdata={userdata} nft={selected} amount={amount} 
                                    jabFEE={jabFEE} ssc_id={ssc_test_id} nftEP={nftEP} 
                                    cbOnFinish={successOp} devMode={true}
                                />
                            </Abswrapper>
                        }
                        {
                            showEditor &&
                            <Abswrapper xtraClass={"justiAlig"}>
                                <Nfteditor userdata={userdata} nft={selectedFromHive} cbCancel={closeEditor} 
                                    ssc_id={ssc_test_id} toEdit={toEdit} userEP={userEP} nftMongo={selected}
                                    nftEP={nftEP} cbOnFinish={successOp} jabFEE={jabFEE}
                                />
                            </Abswrapper>
                        }
                        {
                            wantToSend &&
                            <Abswrapper xtraClass={"justiAlig"}>
                                <Nftsender userdata={userdata} nft={selectedFromHive} cbCancel={closeSender} 
                                    ssc_id={ssc_test_id} userEP={userEP}
                                    nftEP={nftEP} cbOnFinish={successOp} nftInstances={selectedInstances}
                                />
                            </Abswrapper>
                        }
                        {
                            (wantToBurn) &&
                            <Nftburner userdata={userdata} closeCB={() => setWantToBurn(false)}
                                selectedInstances={selectedInstances} ssc_test_id={ssc_test_id}
                                selected={selected} 
                                cbOnSucess={successOp}
                                devMode={true}
                                xtraClassCSS={"justTop100p"}
                            />
                        }
                        {
                            showMarketEnabler && 
                            <Marketenabler 
                                closeCB={() => setShowMarketEnabler(false)}
                                userdata={userdata} selectedNft={selected}
                                ssc_test_id={ssc_test_id}
                                nftEP={nftEP} nfthandlermongoEP={nfthandlermongoEP}
                                devMode={true}
                                cbOnSucess={successOp}
                            />
                        }
                        {
                            wantToTrasnferOwn &&
                            <Transferowner 
                                userdata={userdata}
                                selectedNftDefinition={selected}
                                cbCancel={() => setWantToTrasnferOwn(false)}
                                ssc_id={ssc_test_id}
                                nftEP={nftEP}
                                nfthandlermongoEP={nfthandlermongoEP}
                                cbOnSucess={successOp}
                            />
                        }
                        {/* {
                            wantToBurn &&
                            <Abswrapper xtraClass={"justiAlig"}>
                                <div className="standardDiv60Percent relativeDiv justBorders justRounded justbackground marginAuto">
                                    <Btnclosemin classCSS={"closeBtnAbs"} btnAction={() => setWantToBurn(false)} />
                                    <div className="standardContentMargin">
                                        <p>You must understand that this action cannot be undone.</p>
                                        <p>Once a token has been burned, we cannot recover it. So please proceed with caution.</p>
                                        <p>Select the Token to burn from the list</p>
                                        <ul className="justBorders justRounded ">
                                            {
                                                selectedInstances.map(token => {
                                                    return (
                                                        <li key={`${token._id}-toBurn`} className="standardLiHovered" onClick={() => burnToken(token)}>
                                                            ID: {token._id} - Owned By: {token.ownedBy}
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </Abswrapper>
                        } */}
                        <div className="standardDiv60Percent">
                            <div className="standardDivRowFlexAutoH">
                                <p className="extraMiniMarginsTB">
                                    Price Definition:<Btninfo size={"mini"} msg={"Each NFT has its definitions. This is the price you set if you decide to trade the NFT Token definition."} /> {selected.price_definition} {jabFEE.acceptedCur}
                                </p>
                                <Btndisplayhiveusd expanded={true} amount={selected.price_definition} sideText={"Equivalent to:"} title={"Equivalent to: USD/Crypto"} />
                            </div>
                            <div className="standardDivRowFlexAutoH">
                                <p className="extraMiniMarginsTB">
                                    Casting Price:<Btninfo size={"mini"} msg={"This is the price you set as a Casting base price on each token. A buyer/employer must pay this price to trade for your Gigs/Services."} /> {selected.price_base_on_cast} {jabFEE.acceptedCur}
                                </p>
                                <Btndisplayhiveusd expanded={true} amount={selected.price_base_on_cast} sideText={"Equivalent to:"} title={"Equivalent to: USD/Crypto"} />
                            </div>
                            <p className="extraMiniMarginsTB">Symbol: {selected.symbol}</p>
                            <div className="standardDivRowFlexAutoH">
                                Owner: {selected.account === userdata.username ? 'You': <Btnoutlink link={`/portfoliouser?query=${selected.account}`} textLink={selected.account} />}
                            </div>
                            <p className="extraMiniMarginsTB">Id: {selected.nft_id}</p>
                            {
                                (selected.account === userdata.username) &&
                                <div>
                                <p className="extraMiniMarginsTB">Created At: {formatDateTime(selected.createdAt)}</p>
                                {selected.updatedAt && <p className="extraMiniMarginsTB">Updated At: {formatDateTime(selected.updatedAt)}</p>}
                                </div>
                            }
                            <p className="extraMiniMarginsTB">For sale: {selected.for_sale ? 'Yes':'No'}</p>
                            <p className="extraMiniMarginsTB">Market Enabled: {selected.market_enabled ? 'Yes':'No'}</p>
                            <p className="extraMiniMarginsTB">Issued On: {selected.issued_On}</p>
                            <p className="extraMiniMarginsTB">Issued By: {selected.issuer}</p>
                            {/* TODO: create a component called hivePrice that get the price from coinPrices component and show the icon, plus option as when clicked show price on hive/USD */}
                            <p className="extraMiniMarginsTB">Name: {selectedFromHive.name}</p>
                            <p className="extraMiniMarginsTB">Organization Name: {selectedFromHive.orgName}</p>
                            <p className="extraMiniMarginsTB">Product Name: {selectedFromHive.productName}</p>
                            <p className="extraMiniMarginsTB">Supply: {selectedFromHive.supply.toString()}</p>
                            <div className="">
                                <div className="standardDivRowFlexAutoH">
                                    <p className="extraMiniMarginsTB">
                                        Circulating Supply:<Btninfo size={"mini"} msg={"Show current token holders."} /> {selectedFromHive.circulatingSupply.toString()}
                                    </p>
                                    <Btncollapse xclassCSS={"marginLeft"}  toogleValue={showCirculatingSupply} btnAction={() => setShowCirculatingSupply(!showCirculatingSupply)} />
                                </div>
                                {
                                    (showCirculatingSupply && circulatingSupply ) ?
                                    <Tablinator xclassCSS={"justHeight150pOverY justBordersRounded"}
                                        items={circulatingSupply} titleTable={`Circulating supply of ${selected.symbol}`}
                                        toShow={['_id','account','ownedBy']}
                                    />
                                    : showCirculatingSupply ? <div className={"justMarginAuto"}><Loader logginIn={true} typegif={"spin"}/></div> : null
                                }
                            </div>
                            {
                                selectedFromHive.maxSupply ? 
                                <p className="extraMiniMarginsTB">Max Supply: {selectedFromHive.maxSupply.toString()}</p> : null
                            }
                            {
                                (selected.account === userdata.username) &&
                                <div>
                                    <p className="extraMiniMarginsTB">Authorized Isssuing Accounts:{JSON.stringify(selectedFromHive.authorizedIssuingAccounts)}</p>
                                    <p className="extraMiniMarginsTB">In Use: {selected.in_use ? 'Yes':'No'}</p>  
                                </div> 
                            }
                            <div className="standardDivRowFlexAutoH">
                                Url: {selected.url ? <Btnoutlink link={selected.url} textLink={selected.url} /> : "not set."}
                            </div>
                        </div>
                    </div>
                </div>
            }
            {/* <h1>My Tokens</h1> */}
            {
                loadingData && 
                <div className="standardDivRowFlex100pX100pCentered marginsTB">
                    <Loader xtraClass={"marginsTB"} logginIn={true} typegif={"blocks"} />
                </div>
            }
            {
                !loadingData &&
                <>
                {/* <div className="standardDivRowFullW">
                    <div className="importantUserBalanceCont centered">
                        <p>Current HIVE: {hive ? hive.toString() : '0.0'}</p>
                    </div>
                    {
                    (canCreate) &&
                        <ul className="standardUlHor">
                            <li>
                                <button onClick={goCreateNFT}>{createToken ? 'close': 'Create Token'}</button>
                            </li>
                            <li>
                                <button>Option 2</button>
                            </li>
                            <li>
                                <button>Option 3</button>
                            </li>
                            <li>
                                <button>Option 4</button>
                            </li>
                        </ul>
                    }
                </div> */}
                <div>
                    {/* <ul className="standardUlHorSmall">
                        {
                            (ownedTokens.length > 0) &&
                                ownedTokens.map(token => {
                                    return (
                                        <li className="standardLiHovered" key={`${token._id}-ownedToken`} onClick={() => findInstances(token)}>
                                            *{token._id}* {token.symbol} - {token.name} - S:{token.supply.toString()} - SS:{token.circulatingSupply.toString()} - Max Supply: {token.maxSupply.toString()}
                                        </li>
                                    )
                                })
                        }
                    </ul> */}
                    {/* <ul className="standardUlHor">
                        <li>
                            <button>Filter By</button>
                        </li>
                        <li>
                            <button>Search</button>
                        </li>
                        <li>
                            <button>Go to Last</button>
                        </li>
                        <li>
                            <button onClick={refreshNfts}>Refresh</button>
                        </li>
                    </ul> */}
                    {/* {
                        loadingInstances && 
                        <div className="standardDivRowFlex100pX100pCentered">
                            <Loader logginIn={true} typegif={"blocks"} />
                        </div>
                    }
                    {
                        (!selectedNFT && noInstancesOfNFT) &&
                            <div>
                                <p>Looks like you haven't cast any of that Token.</p>
                                <button>Let's Cast it</button>
                                <p>Tech me how (+Link TODO)</p>
                            </div>
                    }
                    {
                        selectedNFT &&
                        <div>
                            <ul className="standardUlHorSmall">
                                {
                                    selectedNFT.map(instance => {
                                        return (
                                            <li key={`${instance._id}-myInstance-JAB`}>
                                                ID: {instance._id} - Owned by: {instance.ownedBy} -{" "}  
                                                {instance.properties.hasOwnProperty("isPremium") ? `Is Premium:${instance.properties.isPremium ? 'Yes': 'No'}`: null}
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                            <button onClick={() => setSelectedNFT(null)}>Close</button>
                        </div>
                    } */}
                </div>
                {    
                noowned && <p>Looks like you have no tokens Yet. Click to follow tutorial. TODO</p>
                }
                {
                noHive && <p>Your current HIVE balance do not allow you to create tokens. Please <Link to="/app/wallet">Top Up</Link></p>
                }
                </>
            }
            {/* {
                (createToken && userdata.username) &&
                <div id="nftCreatorJAB">
                    <Nftcreator  account={userdata.username} token={userdata.token}/>
                </div>
            } */}
        </div>
    )
}

export default Tokensuser;