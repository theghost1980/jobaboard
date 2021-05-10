import React, { useState, useEffect } from 'react';
import Img from 'gatsby-image';
import { useStaticQuery, graphql } from 'gatsby';
import Absscreenwrapper from '../../absscreenwrapper';
import Starsgiver from '../../interactions/starsgiver';
import Selectdropd from '../../interactions/selectdropd';
import Btninfo from '../../btns/btninfo';

// constants
const orderEP = process.env.GATSBY_orderEP;
//the issue reasons on Reported
const report_reasons = [
    { id: 'report-order-JAB-1', issue_reason: 'The time is up and I got no results', value: 'repOr-1' },
    { id: 'report-order-JAB-2', issue_reason: 'The other part has miss on completing the order as agreed or miss my notes/specifications', value: 'repOr-2'},
    { id: 'report-order-JAB-3', issue_reason: "I haven't received the tokens I was promised. I have recently checked on my Holdings.",  value: 'repOr-3'},
    { id: 'report-order-JAB-4', issue_reason: 'Other, specify', value: 'other', other: true},
];
const cancelled_reasons = [
    { id: 'cancelled-order-JAB-1', issue_reason: 'I am aware that cancelling the order before complexion, means I cannot ask for refunds.',  value: 'canOr-1'},
    { id: 'cancelled-order-JAB-2', issue_reason: 'I did this order by mistake or already done, I will contact the other part to agree for a refund.', value: 'canOr-2'},
    { id: 'cancelled-order-JAB-3', issue_reason: "The other part told me he/she cannot fullfill this order, so we will adjust the tokens later on.", value: 'canOr-3'},
    { id: 'cancelled-order-JAB-4', issue_reason: 'Other, specify', value: 'other', other: true},
];
const dictFields = [
    {
        action: 'Completed', //"Completed" 
        fields: [
            { title: "Comments", name: "comments", hasStar: false, type: 'textarea' }, //issue_reason(select), issue_note
            { title: "Overall Experience:", name: "stars_rated", hasStar: true },
        ],
    },
    {
        action: 'Reported', //"Reported" 
        fields: [
            { title: "Comments", name: "issue_note", hasStar: false, type: 'textarea' }, //issue_reason(select), issue_note
            { title: "Reason Report:", name: "issue_reason", hasStar: false, type: 'selectdropd', dataSelect: report_reasons },
        ],
    },
    {
        action: 'Cancelled', //"Cancelled" 
        fields: [
            { title: "Comments", name: "issue_note", hasStar: false, type: 'textarea' }, //issue_reason(select), issue_note
            { title: "Reason Report:", name: "issue_reason", hasStar: false, type: 'selectdropd', dataSelect: cancelled_reasons },
        ],
    },
];
const rateDef = [ { rated: 'So Poor', star: 1}, { rated: 'Kind of Poor', star: 2},{ rated: 'Regular', star: 3},{ rated: 'Good', star: 4},{ rated: 'Very Good', star: 5},];
// end constants

/**
 * Assign the project to an employee.
 * @param {String} xclassCSS - Extra CSS class if needed.
 * @param {function} btnAction - Call back to assign a value on each switch action
 * @param {Function} closeCB - call back to unmount the component.
 * @param {Object} orderSelected - mandatory as the order we want to manipulate.
 * @param {Object} userdata the data of user.
 * @param {String} _actionOrder as the order selected by user from parent.
 * @param {Function} cbOnSucess the cb to update data when operation done successfully.
 * @param {Boolean} devMode optional to debug on console.
 */

const Orderoptions = (props) => {
    const { xclassCSS, btnAction, orderSelected, devMode, userdata, cbOnSucess, _actionOrder, closeCB } = props;
    const [actionOrder, setActionOrder] = useState(_actionOrder); //as "report", "cancel", ""
    const [resultOp, setResultOp] = useState(null);
    const [orderdata, setOrderdata] = useState(null);
    const [review, setReview] = useState({
        username_reviewed: orderSelected.username_employer, //the one who receive the review.
        username_reviewer: orderSelected.username_employee, //the one who did the review.
        order_id: orderSelected._id,
        days_to_complete: orderSelected.days_to_complete,
        days_completed: getDaysUntilNow(orderSelected.createdAt), //TODO
        // time_complexion: Date, //TODO
        job_id: orderSelected.job_id,
        job_title: orderSelected.job_title,
        category_job: orderSelected.category_job,
        stars_rated: null, //as the score the employer gives at complexion.
        // image_review: File, //TODO
        comments: null,
        createdAt: new Date(),
    });
    const [executeAction, setExecuteAction] = useState({
        action: actionOrder, //"Completed","Reported","Cancelled". 
        fields: dictFields.find(fields => fields.action === actionOrder),
        requesType: "POST",
        epUrl: orderEP+"updateOrderStatus",
        headers: null,
    });
    const [validationError, setValidationError] = useState(false);

    const data = useStaticQuery(graphql`
        query{
            closeIcon: file(relativePath: {eq: "decline.png"}) {
                childImageSharp {
                    fixed(width: 20) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            reportIcon: file(relativePath: {eq: "report-white.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            checkIcon: file(relativePath: {eq: "checked-white.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            } 
            cancelIcon: file(relativePath: {eq: "delete-white.png"}) {
                childImageSharp {
                    fixed(width: 25) {
                        ...GatsbyImageSharpFixed_withWebp
                    }
                }
            }
            
        }
    `);
    //end grapqhl queries

    // const clicked = () => {
    //     btnAction();
    // };

    //to load on each change of state
    // useEffect(() => {
    //     if(devMode && order){
    //         console.log('Changes on order:', order);
    //     }
    // },[order]);
    useEffect(() => {
        if(devMode && actionOrder === 'Completed'){
            if(review){ console.log('Changes on review:', review) };
        }
    },[review]);
    useEffect(() => {
        if(devMode){
            if(orderdata){ console.log('Changes on orderdata:', orderdata) };
        }
    },[orderdata]);
    useEffect(() => {
        if(validationError){
            if(devMode){ console.log('Setting validationError to false in 2 sec.') };
            setTimeout(() => setValidationError(false), 2000);
        }
    },[validationError]);
    useEffect(() => {
        if(executeAction.headers){
            const formdataObj = actionOrder === "Completed" ? review : orderdata;
            const formdata = new FormData();
            const testData = {};
            Object.entries(formdataObj).forEach(([key, value]) => {
                if(key === "stars_rated"){
                    value = JSON.stringify(value);
                }
                formdata.append(key, value);
                testData[key] = value;
            });
            if(devMode){ console.log('About to process:', { executeAction: executeAction, bodyData: formdataObj, testData: testData, });};
            dataRequest(executeAction.epUrl, executeAction.requesType, executeAction.headers, formdata)
            .then(response => {
                if(devMode) {console.log(response)};
                if(response.status === 'sucess'){
                    setResultOp(response);
                    if(cbOnSucess){ cbOnSucess() };
                }
            }).catch(error => console.log(`Error marking order as ${actionOrder}.`, error));
        }
    },[executeAction]);
    //END to load on each change of state

    //funtions/CB
    function getDaysUntilNow(createdAt){
        const now = new Date();
        const createdAtTs = (new Date(createdAt)).getTime();
        const nowTs = now.getTime();
        const diffMs = Math.abs(createdAtTs - nowTs);
        const daysDiff = Math.round( diffMs / (1000 * 60 * 60 * 24));
        if(devMode){
            console.log(`now: ${now}`); 
            console.log(`daysDiff: ${daysDiff}`);
        }
        return daysDiff;
    }
    const processAction = (event) => {
        event.preventDefault();
        if(actionOrder === "Completed" && (review.stars_rated === null || review.comments === "")){
            return setValidationError(true);
        }
        if(actionOrder === "Reported" || actionOrder === "Cancelled"){
            if( !orderdata || !(orderdata.hasOwnProperty("issue_reason")) || orderdata.issue_reason === "" || !(orderdata.hasOwnProperty("issue_note")) || orderdata.issue_note === "" ){
                return setValidationError(true);
            }
        }
        const headers = { 'x-access-token': userdata.token, 'status': actionOrder, 'id_order': orderSelected._id };
        if(devMode){ console.log('Headers set as:', headers)};
        updateState("executeAction", "headers", headers);
    }
    function updateState(state,name,value){
        if(state === 'Reported' || state === 'Cancelled'){
            setOrderdata(prevState => { return { ...prevState, [name]: value }});
        }else if(state === 'Completed'){
            setReview(prevState => { return { ...prevState, [name]: value }});
        }else if(state === 'executeAction'){
            setExecuteAction(prevState => { return { ...prevState, [name]: value }});
        }
    }
    const setAction = (action) => {
        if(orderSelected.status !== action){
            const answer = window.confirm(`You are about to Mark this order as ${action}, do we continue?`);
            if(answer){
                setActionOrder(action)
                setShowForm(true);
                // updateOrder("status",action);
            };
        }else{
            alert(`This order status is already marked as ${action}, please choose another one.`);
        }
    }
    const resetAll = () => {
        setActionOrder("");
        setResultOp(null);
        closeCB();
    }
    ///data fecthing
    async function dataRequest(url, requesType, headers, formdata){
        const response = formdata ? fetch(url, { method: requesType, headers: headers, body: formdata,}) 
                                        : fetch(url, { method: requesType, headers: headers,});
        return (await response).json();
    }
    ///END data fecthing
    //END functions/CB

    return (
        <div className={`${xclassCSS} marginLeft`}>
            {/* <ul className="justBackRed standardUlRow justRounded">
                <li className="standardLiHovered" title="Update Order Status" onClick={() => setAction("Completed")}>
                    <Img fixed={data.checkIcon.childImageSharp.fixed} />
                </li>
                <li className="standardLiHovered" title="Report Issue" onClick={() => setAction("Reported")}>
                    <Img fixed={data.reportIcon.childImageSharp.fixed} />
                </li>
                <li className="standardLiHovered" title="Cancel Order" onClick={() => setAction("Cancelled")}>
                    <Img fixed={data.cancelIcon.childImageSharp.fixed} />
                </li>
            </ul> */}
            {
                (actionOrder !== "") &&
                <Absscreenwrapper xtraClass={"justiAlig"}>
                        <div className="standardDivRow90W whiteBack justMinHeight300px justAligned">
                        {   !resultOp &&
                        <form className="formVertFlex standardContentMarginLR" onSubmit={processAction}>
                            <div className="standardDivRowFullW">
                                <p>To mark this order as {actionOrder}, please fill the Information bellow.</p>
                                <Btninfo size={"mini"} msg={"Please review your comments & ratings very honestly and carefully, as once set, the only way to modify it is by a special request to JAB."}/>
                            </div>
                            {
                                executeAction.fields.fields.map(field => {
                                    return ( 
                                        <div key={`${field.name}-JAB-div-Orders`}>
                                            {
                                                field.type === 'textarea' &&
                                                <div className="formVertFlex">
                                                    <label htmlFor={field.name}>{field.title}</label>
                                                    <textarea type="text" key={`${field.name}`} name={field.name} onChange={(e) => updateState(actionOrder, e.target.name, e.target.value)} />
                                                </div>
                                            }
                                            {
                                                field.hasStar && 
                                                <div className="formVertFlex">
                                                    <label htmlFor={field.name}>{field.title}</label>
                                                    <Starsgiver name={field.name}  rateDef={rateDef} starCB={(item) => updateState(actionOrder, field.name, item)} />
                                                </div>
                                            }
                                            {
                                                field.type === 'selectdropd' &&
                                                <div className="formVertFlex">
                                                    <label htmlFor={field.name}>{field.title}</label>
                                                    <Selectdropd 
                                                        selectList={field.dataSelect} 
                                                        field={actionOrder}  
                                                        labelText={`Reason to mark this order as ${actionOrder}`}
                                                        field={"issue_reason"}
                                                        clickCB={(item) => updateState(actionOrder, item.field, item.value)}
                                                    />
                                                </div>
                                            }
                                        </div>
                                    )
                                })
                            }
                            {/* <label htmlFor="comments">Comments</label>
                            <textarea name="comments" type="text" onChange={(e)=> updateState("review", e.target.name, e.target.value)} 
                                required pattern="[\w\d\s]{1,200}" title="Letters, Numbers, Symbols and whitespace only. Max length of 200 characters please."
                            />
                            <label htmlFor="stars">Overall Experience:</label>
                            <Starsgiver name="stars"
                                rateDef={[
                                    { rated: 'So Poor', star: 1},
                                    { rated: 'Kind of Poor', star: 2},
                                    { rated: 'Regular', star: 3},
                                    { rated: 'Good', star: 4},
                                    { rated: 'Very Good', star: 5},
                                ]}
                                starCB={(star) => updateState("review", "stars", star.star)}
                            />
                            <input type="file" onClick={() => alert('Todo!')} />
                            <Selectdropd 
                                selectList={cancelled_reasons}
                                field={"reason"}
                                devMode={false}
                                labelText={`Reason to mark this order as ${actionOrder}`}
                                clickCB={(item) => console.log('From dropd:', item)}
                            /> */}
                            {
                                validationError && <p className="textAlignedCenter warningTextSmall">Please fill all the fields!</p>
                            }
                            <div className="standardDisplayJusSpaceAround marginsTB justHeight35p">
                                <button type="button" onClick={resetAll}>cancel</button>
                                <button type="submit">Submit</button>
                            </div>
                        </form>
                    }
                    {
                        resultOp &&
                        <div className="justiAlig standardDiv80Auto justMargin0auto">
                            <h1>{resultOp.message ? resultOp.message : `Order Status Updated as ${actionOrder}.`}</h1>
                            <p>If the order has been marked as Reported, our staff will review it as soon as possible nad we will get back to you.</p>
                            <p>You may close this window.</p>
                            <button type="button" onClick={resetAll}>Close</button>
                        </div>
                    }
                    </div>
                </Absscreenwrapper>
            }
        </div>
    )
}

export default Orderoptions;


// {
//     "status": "to Complete",
//     "_id": "60901bd753787e001513830f",
//     "username_employer": "theghost1980",
//     "username_employee": "workerjab1",
//     "note": "order.nft_amount order.nft_amount order.nft_amount order.nft_amount",
//     "nft_id": 189,
//     "nft_symbol": "SEXY",
//     "nft_amount": 3,
//     "nft_price_on_init": 1,
//     "job_id": "607da8892d0f76001520c8e1",
//     "job_title": "Phone call and verifications SIM for poor people of third world countries. Cheap!",
//     "days_to_complete": 2,
//     "category_job": "Lifestyle",
//     "sub_category": "Greeting Cards & Videos",
//     "escrow_type": "system",
//     "job_type": "employee",
//     "sub_total": 3,
//     "extra_money": 0.3,
//     "total_amount": 3.3,
//     "tx_id": "cacdb437876b1faba75bc4cb2b86264cfb503eeb",
//     "createdAt": "2021-05-03T15:50:00.000Z",
//     "special_requirements": "order.nft_amount",
//     "__v": 0
// }