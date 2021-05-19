import React, { useState, useEffect } from 'react';
import { check } from '../../utils/helpers';
import Menuhover from '../interactions/menuhover';
import Loader from '../loader';

//constants
const types_noti = [
    { id: 'noti-1', type: 'Urgent', },
    { id: 'noti-2', type: 'Normal', },
];
const userEP = process.env.GATSBY_userEP;
const adminEP = process.env.GATSBY_adminEP;
const notiEP = process.env.GATSBY_notiEP;
const itemsMenu = [
    {title: 'Sending', cbProp: 'manageNotis', subMenu: [ 'Send Notification', 'Update Notification'],},
    {title: 'Templates', cbProp: 'manageNotiTemplates', subMenu: [ 'Edit Templates']},
]
const devMode = true;
//END constants

const Managenotis = () => {
    const userdata = check();
    const [notification, setNotification] = useState({
        type: '',
        title: '',
        createdAt: new Date(),
        content: '',
        opened: false,
        username: '',
        user_can_delete: false,
        made_by: userdata.username, 
    });
    const [notifications, setNotifications] = useState(null);
    const [users, setUsers] = useState(null);
    const [option, setOption] = useState('');
    const initialResultOp = { status: '', message: ''};
    const [resultOP, setResultOP] = useState(initialResultOp);
    const [loadingData, setLoadingData] = useState(false);

    //functions/CB
    function updateState(name,value){
        setNotification(prevState => { return {...prevState, [name]: value }});
    }
    function getUsers(){
        setLoadingData(true);
        const headers = { 'x-access-token': userdata.token };
        dataRequest(userEP, "GET", headers, null).then(response => {
            if(devMode) console.log(response);
            if(response.length > 0){ setUsers(response);}
            setLoadingData(false);
        })
        .catch(err => {
            console.log('Error while fetching data from BE', err);
            setLoadingData(false);
        })
    }
    const sendNoti = (event) => {
        event.preventDefault();
        setLoadingData(true);
        const formdata = new FormData();
        formdata.append("data", JSON.stringify(notification));
        const operation = option === 'Send Notification' ? 'create' : 'update';
        if(devMode) console.log('About to send', { notification: notification, pnoti: JSON.stringify(notification)});
        const headers = {'x-access-token': userdata.token, 'operation': operation, 'noti_id': null};
        dataRequest(notiEP+"handleNotification", "POST", headers, formdata).then(response => {
            if(devMode) console.log(response);
            setResultOP(response);
            setLoadingData(false);
        }).catch(error => {
            if(devMode){ 
                console.log('Error fetching noti.', error);
                setLoadingData(false);
            };
        })
    }
    const clearAll = () => {
        setResultOP(initialResultOp);
        setOption('');
    }
    ///data fetching
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/json', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/json', headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching
    //END functions/CB

    //to load on init
    useEffect(() => {
        getUsers();
    },[]);
    //END to load on init

    return (
        <div> 
            <Menuhover items={itemsMenu} clickedSubItemCB={(opt) => setOption(opt)} xtraclassCSS={"jusBordersRounWhiteBack"}/>
        {
            loadingData && <div className="standardDivRowFlex100pX100pCentered"><Loader logginIn={loadingData} /></div>
        }
        {
            resultOP.status !== '' && !loadingData &&
            <div className="standardDivFlexPlain2 justWidth90  justMarginAuto">
                <h2>Result: {resultOP.status}</h2>
                <p>BE says:</p>
                <p>{resultOP.message}</p>
                <button className="justWidth100" onClick={clearAll}>Ok</button>
            </div>
        }
        {    option === 'Send Notification' && !loadingData &&
            <div className="standardDivFlexPlain2 justWidth90  justMarginAuto">
                <div className="standardContentMargin">
                    <form className="formVertFlex justRounded justBorders" onSubmit={sendNoti}>
                        <label htmlFor="type">Type</label>
                        <select name="type" onChange={(e) => updateState(e.target.name, e.target.value)} required>
                            <option defaultValue=""></option>
                            {
                                types_noti.map(noti => {
                                    return (
                                        <option key={noti.id} value={noti.type}>{noti.type}</option>
                                    )
                                })
                            }
                        </select>
                        <label htmlFor="title">Title</label>
                        <input name="title" onChange={(e) => updateState(e.target.name, e.target.value)} required />
                        <label htmlFor="content">Content</label>
                        <textarea name="content" onChange={(e) => updateState(e.target.name, e.target.value)} required />
                        <label htmlFor="username">Username</label>
                        {
                            users &&
                            <select name="username" onChange={(e) => updateState(e.target.name, e.target.value)} required>
                                <option defaultValue=""></option>
                            {
                                users.map(user => {
                                    return (
                                        <option key={user._id} value={user.username}>{user.username} type: {user.usertype}</option>
                                    )
                                })
                            }
                            </select>
                        }
                        <label htmlFor="user_can_delete">User can delete</label>
                        <input type="checkbox" name="user_can_delete" onChange={(e) => updateState(e.target.name, e.target.checked)} 
                            defaultChecked={false} 
                        />
                        <div className="standardDivRowFullW justSpaceEvenly">
                            <button onClick={() => setOption('')}>cancel</button>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </div>    
        }

        </div>
    )
}

export default Managenotis;
