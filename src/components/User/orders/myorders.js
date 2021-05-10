import React, { useEffect, useState } from 'react';
import { getStoredField, formatDateTime, check } from '../../../utils/helpers';
import Btnoutlink from '../../btns/btnoutlink';
import Loader from '../../loader';
import Orderoptions from './ordersoptions';
import Btnprint from '../../btns/btnprint';
import Starsgiver from '../../interactions/starsgiver';

import Menuhover from '../../interactions/menuhover';

//constants
const orderEP = process.env.GATSBY_orderEP;
// TODO take this on .env file
const jabFEE = { fee: "0.002", currency: "HIVE", costInstance: "0.001", costCurr: "HIVE", acceptedCur: "HIVE"};
const optionsOrdersMenu = [
    {title: 'Options For This Order', cbProp: 'manageCat', subMenu: [ 'Mark as Completed', 'Report this Order', 'Cancel this Order'],},
]

const Myorders = () => {
    const userdata = check();

    const [myOrders, setMyOrders] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionOrder, setActionOrder] = useState("");

    //To load in onit
    useEffect(() => {
        setLoadingData(true);
        getOrders();
    }, []);
    //END to load on init

    //FUnctions/CB
    function getOrders(){
        const query = { username_employer: userdata.username};
        const queryOr = { $or: [ { username_employer: userdata.username }, { username_employee: userdata.username } ] }
        getDataWH(orderEP+"getOrderquery", queryOr, 0, { "null": null})
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setMyOrders(response.result);
                setLoadingData(false);
            }else{
                setLoadingData(false);
            }
        }).catch(error => {
            console.log('Error getting orders BE',error);
            setLoadingData(false);
        });
    }
    const setMenuAction = (item) => {
        switch (item) {
            case "Mark as Completed":
                if(selectedOrder.status === "Completed"){ return alert('That order has been already set as Completed.')};
                if(selectedOrder.status === "Reported"){ return alert('That order has been already set as Reported.\nPlease wait until our support staff contacts you with details.')};
                if(selectedOrder.status === "Cancelled"){ return alert('That order has been already set as Cancelled.\nWe invite you to make new Orders!')};
                setActionOrder("Completed");
                break;
            case "Report this Order":
                if(selectedOrder.status === "Reported"){ return alert('That order has been already set as Reported.\nPlease wait until our support staff contacts you with details.')};
                if(selectedOrder.status === "Cancelled"){ return alert('That order has been already set as Cancelled.\nWe invite you to make new Orders!')};
                setActionOrder("Reported");
                break;
            case "Cancel this Order":
                if(selectedOrder.status === "Cancelled" || selectedOrder.status === "Reported"){ return alert('That order has been already set as Cancelled.\nWe invite you to make new Orders!.')};
                setActionOrder("Cancelled");
                break;
            default:
                break;
        }
    }
    ///////data fetching
    async function getDataWH(url = '',query = {}, limit = Number, sortby) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                'x-access-token': userdata.token,
                'query': JSON.stringify(query),
                'limit': limit,
                'sortby': JSON.stringify(sortby),
            },
        });
        return response.json(); 
    };
    ///////END data fetching
    //END Functions/CB

    return (
        <div className="manageOrdersContainer">
            <h2>My Orders</h2>
            {
                loadingData &&
                <div className="standardDivRowFlex100pX100pCentered miniMarginTB">
                    <Loader logginIn={true} typegif={"spin"} />
                </div>
            }
            {
                !loadingData && !myOrders &&
                <p>You don't have any orders yet. Go JAB some JABers!</p>
            }
            {
                myOrders && !loadingData &&
                <div className="smallText">
                    <table className="tablePortPublic">
                        <tbody>
                        <tr className="trTablePortP">
                            <th>__TxID__</th>
                            <th>Status</th>
                            <th>Username Employer</th>
                            <th>Username Employee</th>
                            <th>Job/Gig Type</th>
                            <th>Paid</th>
                            <th>Created At</th>
                        </tr>
                    {
                    myOrders.map(order => {
                    return (
                            <tr key={order._id} className="trTableWhite standardLiHovered" onClick={() => setSelectedOrder(order)}>
                                <td>
                                    <Btnoutlink link={`/jabexplorer?tx_id=${order.tx_id}`}
                                        textLink={String(order.tx_id).substring(0,4)+".."}
                                    />
                                </td>
                                <td>{order.status}</td>
                                <td>{order.username_employer}</td>
                                <td>{order.username_employee}</td>
                                <td>{order.job_type}</td>
                                <td>{order.total_amount} in {jabFEE.acceptedCur}</td>
                                <td>{formatDateTime(order.createdAt)}</td>
                            </tr>
                            )
                        })
                    }
                    </tbody>
                    </table>
                    {
                        selectedOrder &&
                        <div>
                            <div className="aInlineFlexPlain justSpaceAround justWidth100per">
                                <h2>Order Details</h2>
                                <Menuhover clickedSubItemCB={setMenuAction} items={optionsOrdersMenu} />
                                {
                                    actionOrder !== '' &&
                                    <Orderoptions userdata={userdata} xclassCSS={"justWidth200"} orderSelected={selectedOrder} devMode={true} 
                                        cbOnSucess={() => getOrders()} _actionOrder={actionOrder}
                                        closeCB={() => setActionOrder("")}
                                    /> 
                                }
                            </div>
                            <hr></hr>
                            <div className="standardDiv60Percent relativeDiv">
                                <Btnprint classCSS={"justAbsolutePos scaleHovered standardDivFlexPlain justRight30pTop10p justBorders justRounded"}/>
                                <h2>Order ID: {selectedOrder._id}</h2>
                                <h3>Order TxId on payment: 
                                    <Btnoutlink link={`/jabexplorer?tx_id=${selectedOrder.tx_id}`}
                                        textLink={selectedOrder.tx_id}
                                    />
                                </h3>
                                <h3>Status: {selectedOrder.status}</h3>
                                <p>Job/Gig Title: {selectedOrder.job_title}</p>
                                <p>JABer on this Gig/Job: {selectedOrder.username_employee}</p>
                                <p>Category: {selectedOrder.category_job}</p>
                                <p>NFT used for this Order: {selectedOrder.nft_symbol}.</p>
                                {
                                    selectedOrder.nft_amount ? <p>Nft payed on this order: {selectedOrder.nft_amount}</p>
                                        :   <p>Made on previuos version :|</p>
                                }
                                <p>Total payed: {selectedOrder.total_amount} in {jabFEE.acceptedCur}</p>
                                {
                                    selectedOrder.days_to_complete ?
                                    <p>Days to complete: {selectedOrder.days_to_complete}.</p>
                                    : <p className="warningTextSmall">Warning. This Job/Gig do not have Days to complete, review this with the provider and make a note if possible, before processing it.</p>
                                }
                                {
                                    selectedOrder.special_requirements
                                    && <p>Special Needs: {selectedOrder.special_requirements}</p>
                                }
                                {
                                    selectedOrder.note
                                    && <p>Note: {selectedOrder.note}</p>
                                }
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default Myorders;