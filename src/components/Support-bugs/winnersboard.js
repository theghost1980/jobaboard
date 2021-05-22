import React, { useState, useEffect } from 'react';
import { check } from '../../utils/helpers';
import Absscreenwrapper from '../absscreenwrapper';
import Loader from '../loader';
import Btncollapse from '../../components/btns/btncollapse';
import Btnoutlink from '../btns/btnoutlink';

//constants
const notiEP = process.env.GATSBY_notiEP;
const userEP = process.env.GATSBY_userEP;
//END constants

const Winnersboard = (props) => {
    const { closeCB } = props;
    const userdata = check();
    const [users, setUsers] = useState(null);
    const [tickets, setTickets] = useState(null);
    const [topUsers, setTopUsers] = useState(null); //the ones has submitted more bugs. More changes to win! :D
    const [loadingData, setLoadingData] = useState(true);
    const [showRules, setShowRules] = useState(false);

    //load on init
    useEffect(() => {
        const h = { 'x-access-token': userdata.token, 'query': JSON.stringify({}), 'filter': JSON.stringify({}) };
        dataRequest(userEP+"jabUsersField", "GET", h, null)
        .then(response => { 
            if(response.status === 'sucess'){ setUsers(response.result) };
            console.log(response);
        })
        .catch(err => {console.log('Error while fetching data from BE', err)});

        const headers = {'x-access-token': userdata.token, 'query': JSON.stringify({ 'filter': {}, 'limit': 0, 'sortby': {}}) }; //
        dataRequest(userEP+"getSupportTicket", "GET", headers, null).then(response => {
            console.log(response);
            if(response.status === 'sucess'){
                setTickets(response.result);
            }
            setLoadingData(false);
        }).catch(error => {
            console.log('Error getting tickets.', error);
            setLoadingData(false);
        });
    },[]);
    //END load on init

    //on each state change
    useEffect(() => {
        if(tickets && users){
            const top_contib = tickets.reduce(function (acc, curr) {
                if (typeof acc[curr.username] === 'undefined') {
                    acc[curr.username] = 1;
                } else {
                    acc[curr.username] += 1;
                }
            return acc;
            }, {});
            console.log(top_contib);
            const arrayTop = [];
            Object.entries(top_contib).forEach(([key,value]) => {
                console.log(`key: ${key}, value: ${value}`);
                arrayTop.push({ username: key, tickets: value, _id: users.find(user => user.username === key)._id, avatar: users.find(user => user.username === key).avatar })
            })
            console.log(arrayTop)
            setTopUsers(arrayTop.sort(compare).slice(0,15));
        }
    },[tickets, users]);
    //END each state change

    //functions/CB
    function compare(a, b) {
        if ( Number(a.tickets) < Number(b.tickets) ){ return 1 }; //a.tickets,b.tickets
        if ( Number(a.tickets) > Number(b.tickets) ){ return -1 };
        return 0;
    }
    ///data fetching
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/json', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/json', headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching
    //END functions/CB

    return (
        <Absscreenwrapper xtraClass={"justifyFlexStart"}>
            <div className="standardFlexColBordered whiteBack justWidth90 justRounded justTop100p relativeDiv">
                {
                    loadingData && <div className="standardDivRowFlex100pX100pCentered marginsTB"><Loader logginIn={loadingData}/></div>
                } 
                {
                    !loadingData && topUsers && topUsers.length > 0 &&
                    <div className="standardContentMargin textColorContrast2 justDisplayFlexColumn">
                        <h1 className="textAlignedCenter">Leading on Contribution Top 15</h1>
                        <p>The top 5 users will get a Splinterlands card package</p>
                        <p>The rest of top 15 users will get a HIVE gift.</p>
                        <ul className="justBordersRoundedMarginB standardUlColPlain2">
                            {
                                topUsers.map((topuser, index) => {
                                    return (
                                        <li key={`${topuser._id}`}>
                                            <div className="standardDivRowFullW spaceEvenly xtraMiniMarginTB4p">
                                                <img src={topuser.avatar} className="miniImageJobs" />
                                                <p>N.{index + 1}</p>
                                                <p>{topuser.username} has submitted: {topuser.tickets} Ticket{topuser.tickets !== 1 ? 's' : null }</p>
                                            </div>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <div className="standardDivRowFullW justiAlig">
                            <p>Show me the Rules</p>
                            <Btncollapse xclassCSS={"miniMarginLeft"} toogleValue={showRules} btnAction={() => setShowRules(!showRules)}/>
                        </div>
                        {
                            showRules &&
                            <div>
                                <p className="normalTextSmall">Rules: We will be checking on each ticket submitted. It must:</p>
                                <ul className="normalTextSmall">
                                    <li>Has the appropiate information about the bug/suggestion.</li>
                                    <li>Better the explanation, more chances to get accepted.</li>
                                    <li>Any kind if abuse or innapropiate messages or images sent, will banned you from the competition.</li>
                                </ul>
                            </div>
                        }
                        <button className="marginsTB justWidth100 justMarginAuto" onClick={() => closeCB()}>Ok</button>
                    </div>
                }
            </div>    
        </Absscreenwrapper>
    )
}

export default Winnersboard;