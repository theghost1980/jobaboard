import React, { useState, useEffect } from 'react'
import { check } from '../../utils/helpers';
import axios from 'axios';
import Img from 'gatsby-image';
import { Link, useStaticQuery, graphql, navigate } from 'gatsby';
import Loader from '../loader';
import Jobitoassistant from './jobitoassistant';
import { useForm } from 'react-hook-form';
//hiveio/keychain
import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain';
//testing SSCjs library
const SSC = require('sscjs');
const ssc = new SSC('https://api.hive-engine.com/rpc');
//END testing

const Userwallet = () => {
    const { register, handleSubmit, errors } = useForm(); // initialize the hook

    const userdata = check();
    const [tokens, setTokens] = useState([]);
    const [iconsTokens, setIconsTokens] = useState([]);
    const [noTokens, setNoTokens] = useState(false);
    const [action, setAction] = useState('');

       //graphql queries
       const data = useStaticQuery(graphql`
       query {
           depositIcon: file(relativePath: {eq: "topUp.png"}) {
               childImageSharp {
                   fixed(width: 35) {
                       ...GatsbyImageSharpFixed_withWebp
                   }
               }
           }
           withdrawIcon: file(relativePath: {eq: "withdraw.png"}) {
               childImageSharp {
                   fixed(width: 35) {
                       ...GatsbyImageSharpFixed_withWebp
                   }
               }
           }
           infoIcon: file(relativePath: {eq: "info.png"}) {
               childImageSharp {
                   fixed(width: 20) {
                       ...GatsbyImageSharpFixed_withWebp
                   }
               }
           }
       }
   `);
   //end grapqhql queries

    //just for testing - TODO -> remove later on
    // useEffect(() => {
    //     console.log(iconsTokens);
    //     if(iconsTokens.length > 0){
    //         console.log(iconsTokens.filter(tok => tok.nameToken === "WEED").map(icon => icon.iconToken));
    //     }
    // },[iconsTokens])
    //end just testing

    //all togheter one function on mount
    useEffect(() => {
        ssc.find('tokens', 'balances', { account:  userdata.username }, 100, 0, [], (err, result) => {
            if(err) return console.log('Error fetching on SSCjs',err);
            // console.log(result);
            if(result.length === 0){
                setNoTokens(true);
                //TODO here
                // we can use the sintax as symbol: { $in: ['SWAP.HIVE', 'ENG']} 
                // to get all the tokens on the user's list
                // when received so we may remove the "//tokens added now we can lookUp icons + set"
            }else{
                //set the user's token
                setTokens(result);
            }
        });
    },[])

    useEffect(() => {
        //tokens added now we can lookUp icons + set
        if(tokens.length > 0 && iconsTokens.length < tokens.length){
            tokens.map(item => {
                //find each icon
                console.log('Searching Icons.')
                ssc.find('tokens', 'tokens', { symbol: item.symbol }, 100, 0, [], (err, result) => {
                    if(err) return console.log('Error getting icon for token', err);
                    const metaData = JSON.parse(result[0].metadata);
                    const iconToken = metaData.icon;
                    addnewItem({ nameToken: item.symbol, iconToken: iconToken});
                })
            });
        }
    },[tokens]);

    ////////fetch requests as async functions
    async function getDataRPC(RPC = '', route, query) {
        axios.post(RPC + route, query)
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log("Error on RPC request", error);
        })
    };
    ////////END fetch requests

    //general functions/cb to make later on helpers
    function fixNumber(number, decPos){
        const n = Number(number).toFixed(decPos)
        return n.toString();
    }
    function addnewItem(item){
        // setBlocks(previousState => [...previousState, result.data.result ]);
        setIconsTokens(previuosState => [...previuosState, item]);
    }
    function getIcon(symbol){
        if(iconsTokens.length > 0){
            iconsTokens.filter(tok => tok.nameToken === "WEED");
        }
    }
    //end general functions/cb

    //testing the SSCJS library
    // const ssc = new SSC('https://api.hive-engine.com/rpc');
    //     ssc.stream((err, res) => {
	//     console.log(err, res);
    // });
    function getInfoUser(){
        // find first token for this user
        // ssc.findOne( 'tokens', 'balances', { account:  'theghost1980' }, (err, result) => {
        //     console.log(err, result);
        // });

        //get all tokens available
        // ssc.find('tokens', 'tokens', { }, 1000, 0, [], (err, result) => {
        //     console.log(err, result);
        // });

        ssc.find('tokens', 'balances', { account:  'theghost1980' }, 100, 0, [], (err, result) => {
            if(err) return console.log('Error fetching on SSCjs',err);
            console.log(result);
            //set the user's token
            setTokens(result);
        })
    }

    function addIconsTokens(){
        if(tokens.length > 0 && tokens){
            tokens.map(token => {
                console.log(token);
                ssc.find('tokens', 'tokens', { symbol: token.symbol }, 100, 0, [], (err, result) => {
                    if(err) return console.log('Error getting icon for token', err);
                    // console.log(result);
                    //set the user's token
                    const metaData = JSON.parse(result[0].metadata);
                    // console.log(metaData);
                    const iconToken = metaData.icon;
                    // console.log(iconToken);
                    addnewItem({ nameToken: token.symbol, iconToken: iconToken});
                })
            });
        }
    }

    function oneTokenData(name){
        const nameToken = name;
        //get contract info for one token
        ssc.find('tokens', 'tokens', { symbol: nameToken } , 1000, 0, [], (err, result) => {
            if(err) return console.log('Error fetching on SSCjs',err);
            console.log(result);
            //set the user's token
            const metaData = JSON.parse(result[0].metadata);
            console.log(metaData);
            const iconToken = metaData.icon;
            console.log(iconToken);
            addnewItem({ nameToken: nameToken, iconToken: iconToken});
        });
    }

    function processInput(value){
        const num = Number(value).toFixed(3);
        return String(num);
    }

    const onSubmit = async (data) => {
        if(data.amount <= 0) { return null };
        console.log(data);
        const toAccount = "honey-swap";
        // const memo = {"id":"ssc-mainnet-hive","json":{"contractName":"hivepegged","contractAction":"buy","contractPayload":{}}};
        const memo = "DepositN-112";
        const currency = "HIVE";
        const amount = processInput(data.amount);
        // TODO function to always return 3 decimal points
        // important
        if(action === "deposit"){
            //we make a depo
            const keyChain = await keychain(window, 'requestTransfer', userdata.username, toAccount, amount, memo, currency);
            const {data, success, msg, cancel, notActive} = keyChain;
            if(success){ 
                //do something on sucess of deposit.
                // reload the component????
            }else if(!cancel) {
                if(notActive) {
                    console.log('Please allow Keychain to access this website');
                } else {
                    console.log(msg);
                    console.log(keyChain);
                }
            }else if (cancel){
                //user cancelled so...
                console.log('Cancelled by User');
            }
        }else if(action === "withdraw"){
            //we make a withdraw
        }
    };

    return (
        <div className="walletCont">
            <ul className="ulActionsWallet">
                <li>
                    <button onClick={() => setAction('deposit')}>Top Up</button>
                    <Img fixed={data.depositIcon.childImageSharp.fixed} className="iconWalletAction" />
                </li>
                <li>
                    <button onClick={() => setAction('withdraw')}>Widthdraw</button>
                    <Img fixed={data.withdrawIcon.childImageSharp.fixed} className="iconWalletAction"  />
                </li>
                <div className="absInfoCont">
                    <Img fixed={data.infoIcon.childImageSharp.fixed} className="iconInfo" />
                    <div className="displayInfo">
                        <h3 className="xsmallMargin">Job a Board Info</h3>
                        <p className="xsmallMargin">Use the deposit button to import the desired amount of HIVE, it will automatically convert to SWAP.HIVE which is the currency used to create your own Tokens.</p>
                        <p className="xsmallMargin">The withdraw button will convert your SWAP.HIVE back to HIVE and return it to your HIVE wallet.</p>
                        <p className="xtraSmall">*There is a 1% fee when converting between HIVE and SWAP.HIVE</p>
                    </div>
                </div>
            </ul>
            {
                (action !== '') &&
                    <div className="actionContainer">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="standardRowDiv">
                                <p>Amount </p>
                                {/* <input type="text" className="inputValueNum" required pattern="[0-9.,]" /> */}
                                <input name="amount" ref={register({ pattern: /[0-9.]+/, required: true })} 
                                    className="inputValueNum"
                                    pattern="[0-9.]+"
                                    title="Only Numbers and Dots."
                                    defaultValue="0.000"
                                />
                                <p>to {action}</p>
                            </div>
                            {errors.amount && <p className="warningTextSmall centered">Please numbers Only!</p>}
                            <div className="standardRowDiv spaceEvenly marginBottom">
                                <button>Go! let's {action}</button>
                                <button onClick={() => setAction('')}>cancel</button>
                            </div>
                        </form>
                    </div>
            }
            {
                noTokens && 
                    <div className="standarDiv400h">
                        <p>Look like you have no balance yet.</p>
                        <p>TODO: possibly a loader of "counting money, i.e:cash machine, money flowing...."</p>
                        <p>Invoking Jobito down bellow....Help me Jobito!</p>
                        <Jobitoassistant helpmewith={"wallet"} />
                    </div>
            }
            {
                (tokens.length > 0 && iconsTokens.length > 0) && 
                    <ul className="ulTokenWallet">
                        {
                            tokens.map(token => {
                                return (
                                    <li key={`${token._id}`}>
                                        <div className="walletTokenCont">
                                            {
                                                (iconsTokens.length > 0) &&
                                                    <img src={iconsTokens.filter(tok => tok.nameToken === token.symbol).map(icon => icon.iconToken)} 
                                                        className="iconToken"
                                                    />
                                            }
                                            <p className="walletUserAmount">{token.symbol}: {fixNumber(token.balance,2)}</p>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
            }
            {
                !(tokens.length > 0 && iconsTokens.length > 0) && (!noTokens) &&
                    <Loader logginIn={true} />
            }
        </div>
    )
}

export default Userwallet;