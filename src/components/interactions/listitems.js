import React, { useState, useEffect } from 'react';
import { fecthDataRequest } from '../../utils/helpers';
import Notificationicon from '../icons/notificationicon';

// constants
const userEP = process.env.GATSBY_userEP;

// TODO later add the image for each person.
// We must find a faster way to handle this as by doing this here, it will take too much time to show the avatars
// also we must modify on BE:
// user.js -> add the avatar thumb as 60px w/h
//  -> modify the creation function, updates on usercontroller and auth.
// so we can handle a very small avatar per each user.
// maybe loading this on login at least for the user's this person is:
//  - following and from beeChat + store all those miniAvatar image url on LS.

/**
 * Display the danger icon. 
 * Note: Must set the "relativeDiv" class always!
 * @param {String} xclassCSS - Optional The css Extra class.
 * @param {Object} selectedItemCb - The function/CB to return the selected item to parents/components
 * @param {[Object]} items - The Array of objects to map and present.
 * @param {Object} unread - The unread array of objects that contain the unread messages if any.
 * @param {String} username - Username to pass on.
 * @param {String} toList - "chats","channels"
 */

const Listitems = (props) => {

    const { xclassCSS, items, selectedItemCb, username, toList, unread } = props;
    const [userList, setUserList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    // const ar = ['1','2','3'];
    // console.log(ar.find(item => lookUp(item,'0')));
    // console.log(ar.find(item => lookUp(item,'1')));

    //functions/CB
    // function addToUserList(_item){
    //     setUserList(prevState => [ ...prevState, _item]);
    // }

    const selectThisOne = (item) => {
        setSelectedId(item.id);
        selectedItemCb(item);
    }
    function lookUp(item, tofind){
        return String(item) === String(tofind); 
    }
    function returnOthers(item){
        if(toList === "chats"){
            const without = item.members.filter(item => item !== username);
            // console.log(without);
            return item.type === "dm" ? without.join(' ') : without[0] + `... +${without.length}` ;
        }
    }
    function returnOthersImg(userList){
        if(toList === "chats"){
            //fetch data from BE
            const headers = { 'filter': JSON.stringify({ username: { $in: [...userList]  } }),'query': JSON.stringify({ avatar: 1, username: 1})};
            getUserData(userEP+"jabUsersField",headers)
            .then(response => {
                console.log(response);
                if(response.status === "sucess"){
                    setUserList(response.result);
                }
            }).catch(error => console.log('Error fetching users fields BE.',error));
        }
    }
    /////data fecthing
    async function getUserData(url = '', headers = {}) {
        const response = await fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            headers: headers,
        });
        return response.json(); 
    };
    /////END data fetching
    //END functions/CB

    // on init
    useEffect(() => {
        if(items && toList === "chats"){
            const _userList = [];
            items.map(element => {
                element.members.map(subitem =>{
                    // console.log(subitem);
                    const found = _userList.find(item => lookUp(item,subitem));
                    // console.log(`${subitem} is ${found} typeof ${typeof found}`);
                    if(found === undefined){
                        _userList.push(subitem);
                    }
                })
            });
            returnOthersImg(_userList);
        }
    },[]);
    // END on init

    //On each change of state
    // useEffect(() => {
    //     if(userList.length > 0){
    //         console.log(userList);
    //         console.log(userList.find(user => user.username === 'theghost1980').avatar)
    //     }
    // },[userList]);
    // useEffect(() => {
    //     if(selectedId){
    //         console.log('SelectedID:',selectedId);
    //     }
    // }, [selectedId]);
    // END On each change of state
  
    return (
        <div>
            {
                (items && items.length > 0) &&
                <ul className="standardUlColPlain smallText">
                    {
                        items.map(item => {
                            if(toList === "chats"){
                                // const found = unread.find(conv => conv.id === item.id)
                                return (
                                    <li key={item.id} className={`standardLiHovered ${selectedId === item.id ? 'activeChat': null}`} onClick={() => selectThisOne(item)}>
                                        <div className="standardDivRowFullW">
                                            <p className="minimumMarginTB">{returnOthers(item)}</p>
                                            {
                                                unread && unread.length > 0 &&
                                                <span>
                                                    {unread.find(conv => conv.conversation_id === item.id) && <Notificationicon typeDiv={"notAbsolute"}/>}
                                                </span>
                                            }
                                        </div>
                                    </li>
                                )
                            }else if(toList === "channels"){
                                return (
                                    <li key={item.id} className="standardLiHovered">{JSON.stringify(item)}</li>
                                )
                            }
                        })
                    }
                </ul>
            }
        </div>
    )
}

export default Listitems;