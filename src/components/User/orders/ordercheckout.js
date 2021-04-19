import React, { useState, useEffect } from 'react';
//components
// TODO layout must transform itself as different layots
// - for check out should be minimal, like just logo and menu to avoid user "crazyness".
import Layout from '../../layout';
import { getStoredField } from '../../../utils/helpers';
import Btnswitch from '../../btns/btnswitch';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';

//contants
const nfthandlermongoEP = process.env.GATSBY_nfthandlermongoEP;

const Ordercheckout = (props) => {
    const token = getStoredField("token");
    // const { state } = props.location;
    // console.log(state);
    // const [jobSelected, setJobSelected] = useState(state);
    const [moreDetails, setMoreDetails] = useState(false);
    // const [order, setOrder] = useState({
    //     username_employer: String, //the ones who serves the order
    //     username_employee: String, //the ones who ask this gig/job
    //     note: String, //used for 'cancellation' or "anything else needed".
    //     nft_id: Number,
    //     nft_symbol: String,
    //     nft_price_on_init: Number, //respresent the price when the order was emitted. In case we may want to allow users to change prices on their nft later on without affecting on going orders.
    //     job_id: state._id,
    //     job_title: state.title, //used to check if maybe the user placed the same order twice.
    //     category_job: state.category,
    //     sub_category: state.sub_category,
    //     escrow_type: state.escrow_type, //could be 'system' or 'username'.
    //     job_type: state.job_type, //as employee or employeer, reference of this job (optional maybe)
    //     total_amount: Number, //in case we add later on extra features or quantity.
    //     tx_id: String, //as the txId of this transference when successfull as paid.
    //     createdAt: new Date().toString(),
    //     special_requirements: String, //if the employee needs more specifications.
    // });

    //Grapqhl queries
    const data = useStaticQuery(graphql`
        query{
            acceptedAll: file(relativePath: {eq: "accepted_cryptosJAB.png"}) {
                childImageSharp {
                    fixed(width: 200) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            keyChainLogo: file(relativePath: {eq: "keychain_logo.png"}) {
                childImageSharp {
                    fixed(width: 100) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
        }
    `);
    //end grapqhl queries

    //to load on init
    useEffect(() => {
        console.log('props on useeffect');
        console.log(props);
        //get the token price.
        // const query = { symbol: state.nft_symbol, account: null,};
        // console.log(query);
        // sendGETBEJustH(nfthandlermongoEP + "getNFTquery",query,0, { "null": null })
        // .then(response => {
        //     console.log(response);
        //     if(response.status === 'sucess' && response.result.length === 1){
        //         // we may add it to myHoldings
        //         updateOrderState("nft_price_on_init",response.result[0].price);
        //     }
        // }).catch(error => console.log('Error asking for NFTs on this user from DB, mongo.',error));
    }, []);
    //END to load on init

    // functions/CB
    const processSwitch = (cen) => {
        setMoreDetails(cen);
    }
    function updateOrderState(name,value){
        setOrder(prevState => { return {...prevState, [name]: value}});
    }
    //////data fecthing
    async function sendGETBEJustH(url = '', query = {},limit=Number,sortby = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'x-access-token': token,
                'query': JSON.stringify(query),
                'limit': limit,
                'sortby': JSON.stringify(sortby),
            },
        });
        return response.json(); 
    };
    //////END data fetching
    // END functions/CB
    return (
        // <Layout>
        <div>
            {/* <div className="businessPageCont">
                <h1>Checkout Page</h1>
                <h3>You have selected:</h3>
                <div className="standardDivRowFullW">
                    <div className="standardDiv30Percent">
                        <img src={jobSelected.images[0]} className="imageMedium"/>
                    </div>
                    <div className="standardDiv60Percent">
                        <p>Job/Gig Title:{jobSelected.title}</p>
                        <p>Category: {jobSelected.category}</p>
                        <p>To Pay: {jobSelected.paying_price} {jobSelected.nft_symbol} Tokens.</p>
                    </div>
                </div>
                <div className="justAligned">
                    <Btnswitch initialValue={false} title={"Add more details"} 
                        sideText={"Add specific details and customizations"}
                        btnAction={processSwitch}
                    />
                </div>
                {
                    moreDetails &&
                    <div>
                        <form className="formColFlex90p">
                            <label htmlFor="special_requirements">Special Requirements:</label>
                            <textarea name="special_requirements" onChange={(e) => updateOrderState(e.target.name,e.target.value)} 
                                placeholder="Feel free to add here all the special needs or requirements you may need"
                            />
                            <label htmlFor="note">Note for the Professional:</label>
                            <textarea name="note" onChange={(e) => updateOrderState(e.target.name,e.target.value)} 
                                placeholder="We recommend placing here special delivery dates or specific details"
                            />
                        </form>
                    </div>
                }
                {   order.nft_price_on_init &&
                    <div className="formColFlex90p justBorders justRounded marginsTB justMarginAuto">
                        <div className="marginRL standardDisplayJusSpaceAround">
                            <div className="standardDivFlexPlain">
                                <Img fixed={data.acceptedAll.childImageSharp.fixed} />
                                <p className="textNomarginXSmall">On JobAboard we take crypto, very much!</p>
                            </div>
                            <div className="marginBottom">
                                <h2>Total to Pay: {order.nft_price_on_init * jobSelected.paying_price} HIVE</h2>
                                <button className="justBackRed">Proceed with payment</button>
                            </div>
                        </div>
                    </div>
                }
                <div className="marginsTB justMarginAuto standardDivFlexPlain">
                    <Img fixed={data.keyChainLogo.childImageSharp.fixed} className="justBackBlack"/>
                    <p className="textNomarginXSmall">Payment powered by Hive Keychain.</p>
                </div>
            </div> */}
            </div>
        // {/* </Layout> */}
    )
}

export default Ordercheckout;