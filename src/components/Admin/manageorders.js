import React, { useState, useEffect } from 'react';
import { check } from '../../utils/helpers';
import Tablinator from '../interactions/tablinator';
import Recordnator from '../interactions/recordnator';
import Loader from '../loader';
//constants
const adminEP = process.env.GATSBY_adminEP;
//end constants

const Manageorders = () => {
    const userdata = check();
    const [loadingData, setLoadingData] = useState(false);
    const [orders, setOrders] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    //to load on Init
    useEffect(() => {
        loadOrders();
    },[]);
    //END to load on Init

    //functions/CB
    function loadOrders(){
        setLoadingData(true);
        const resquestType = "GET";
        const headers = { 'x-access-token': userdata.token, 'schema': './Orders', 'filter': JSON.stringify({}), 'limit': 0, 'sort': JSON.stringify({ "null": null})};
        requestData(adminEP+"getRequest",resquestType, headers)
        .then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setOrders(response.result);
            }
            setLoadingData(false);
        }).catch(error => {
            console.log(`Error on request of a ${resquestType} to BE.`,error);
            setLoadingData(false);
        });
    }
    /////////DATA fecthing////////////
    async function requestData(url = '', resquestType, headers = {}) { 
        const response = await fetch(url, { method: resquestType, mode: 'cors', headers: headers,});
        return response.json(); 
    };
    //////////END DATA fecthing////////
    //END functions/CB
    return (
        <div className="standardContentMargin">
            <h2>Hi from Manage Orders</h2>
            <p>TODO: Maybe this section may include:</p>
            <ul>
                <li>List NFTs, CRUD NFTs</li>
                <li>Log NFTs activities and so on.</li>
            </ul>
            {
                loadingData &&
                <div className="standardDivRowFlex100pX100pCentered">
                    <Loader logginIn={loadingData}/>
                </div>
            }
            {
                orders &&
                <Tablinator 
                    items={orders}
                    clickedSubItemCB={(item) => setSelectedOrder(item)}
                    toShow={['username_employee', 'username_employer', 'status', 'category_job', 'createdAt']}
                />
            }
            {
                selectedOrder &&
                <Recordnator 
                    stylishOptions={{ xtraCssF: 'justBoldtext', xtraCssD: 'justbackgroundWhitish miniPaddingLeft'}}
                    closeCB={() => setSelectedOrder(null)}
                    item={selectedOrder}
                    toShow={[
                        { field:'username_employee', type: 'String', link: false },
                        { field:'username_employer', type: 'String', link: false },
                        { field:'status', type: 'String', link: false },
                        { field:'category_job', type: 'String', link: false },
                        { field:'createdAt', type: 'Date', link: false },
                        { field:'days_to_complete', type: 'Number', link: false },
                        { field:'job_id', type: 'String', link: false },
                        { field:'job_title', type: 'String', link: false },
                        { field:'job_type', type: 'String', link: false },
                        { field:'nft_amount', type: 'Number', link: false },
                        { field:'nft_id', type: 'Number', link: false },
                        { field:'nft_price_on_init', type: 'Number', link: false },
                        { field:'nft_symbol', type: 'String', link: false },
                        { field:'note', type: 'String', link: false },
                        { field:'special_requirements', type: 'String', link: false },
                        { field:'sub_category', type: 'String', link: false },
                        { field:'sub_total', type: 'Number', link: false },
                        { field:'extra_money', type: 'Number', link: false },
                        { field:'total_amount', type: 'Number', link: false },
                        { field:'tx_id', type: 'String', link: true, txLink: true },
                    ]}
                />
            }
        </div>
    )
}

export default Manageorders;