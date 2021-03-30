// import axios from 'axios';

export const isBrowser = () => typeof window !== "undefined";

//sending nft logs to BE
//the main idea is being able to send the data on each transaction
// we must record:
// let's use an object as:
// {
//     txID: "", //may be as timestamp|username|currentStep
//     op: "", // may be i.e createNFT|nftToken(the object)|quantity
//     totalSteps: "" // 8
//     result: "" //success if had any results.
//     error: "true/false" // if user cancelled or any other error.
//     descError: "" // a brief desc of the error if possible.
// }
// as soon as the OP begins, start sending.
// as soon as received on BE, add new record(just token verification needed)
export function fecthDataBE(data = { txID: "", op: "", totalSteps: "", result: "", error: "", descError: ""},EpUrl, token){
    if(data.txID !== "" && EpUrl !== ""){
        postFetch(`${EpUrl}`, token, data)
            .then(response => { console.log(response)})
            .catch(err => console.log('Error fecthing from logger.',err));
        
    }
}

export async function postFetch(url = '', token, data) {
    const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache', 
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'x-access-token': `${token}` 
    },
    //   redirect: 'follow', // manual, *follow, error
    //   referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: new URLSearchParams(data),
    });
    return response.json(); 
};