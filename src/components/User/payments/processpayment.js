import React, { useState, useEffect } from 'react';
//hiveio/keychain
import { isKeychainInstalled } from '@hiveio/keychain';

// TODO but only if we really need it HS payments handling.
/**
 * Handles the payments done by transfer using Hive Key Chain || Hive Signer.
 * @param {function} cbOnProcessing - Call back to assign a return Object value when trying to process the payment.
 * @param {String} processUsing - Define "Hive Keychain" || "Hive Signer".
 * @param {Boolean} showValueDevMode - If true show on console the actual values when processing and logs.
 * @param {Object} toProcess - As { account: '', to: '', amount: 'Required to be with 3 decimals', memo: '', }.
 * @param {Object} jabFEE - Contains the definitions as jabFEE: {fee: string; currency: string;costInstance: string;costCurr: string;acceptedCur: string;}
 * @param {String} xtraClassCSS - Assign an extra class for this component css.
 */

const Processpayment = (props) => {
    const { cbOnProcessing, processUsing, showValueDevMode, toProcess, jabFEE, xtraClassCSS } = props;
    const [resultsOP, setResultsOP] = useState(showValueDevMode ? 'Initial Test Activated' : null );

    //to load on init
    useEffect(() => {
        if(!isKeychainInstalled){
            return alert('Please allow Hive Key Chain to access this website.\nSome steps you may follow:\n1. Check if extension installed.\n2.Click on it a couple times, to allow access on this web page.\n3.If not installed go to: https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep.');
        }else{
            if(showValueDevMode){ 
                console.log('Hive Key Chain installed.');
                console.log('About to process:');
                console.log(toProcess);
                console.log('Using as Fees & currency definitions:');
                console.log(jabFEE);
            };
            process(processUsing);
        }
    }, []);
    // END to load on init

    // to call on each state change
    useEffect(() => {
        if(resultsOP){
            cbOnProcessing(resultsOP);
        }
    }, [resultsOP]);
    // END to call on each state change
    //functions/CB
    function process(processUsing){
        if(processUsing === "Hive Keychain"){
            window.hive_keychain.requestTransfer(toProcess.account, toProcess.to, toProcess.amount.toString(), toProcess.memo, jabFEE.acceptedCur, function(result){
                const { message, success, error } = result;
                if(showValueDevMode){ 
                    console.log('=======Result on transfer=======');
                    console.log(result);
                };
                if(!success){
                    if(error !== "user_cancel"){
                        const { error, cause, data } = result.error;
                        if( cause.name && cause.name === "RPCError"){
                            // addStateOP({ state: 'Fatal Error', data: { error: JSON.stringify(result.error)} });
                            if(showValueDevMode){ console.log('Error RPCError,', message)};
                        }
                        // TODO send the log as well and register the event.
                        // TODO: ALL this process must finish presenting to user
                        // - A msg that "His/her funds are safe as we have registered it" & "Take note of the system log, in case support contacts you during the next 24 hrs."
                        // - A final msg as "You may continue doing the same operation and we will send your money back as soon as possible or contact support if any available".
                        // console.log('Error while transfering', message);
                        if(showValueDevMode){ console.log('Error while transfering,', message)};

                        //return result object as { status: 'failed', results: message }
                        setResultsOP({
                            status: 'failed', results: message,
                        });

                    }else if(error === "user_cancel"){
                        // addStateOP({ state: 'User cancelled before transfer.', data: { date: new Date().toString()} }); 
                        // console.log('User click on cancel!');
                        if(showValueDevMode){ console.log('User cancelled transfer.')};

                        //return result object as { status: 'cancelled_user', results: new Date().toString() }
                        setResultsOP({
                            status: 'cancelled_user', results: new Date().toString(),
                        });
                    }
                }else if (success){
                    const { type, memo, amount, currency, username } = result.data;
                    if( type === "transfer" && 
                        amount === toProcess.amount.toString() && 
                        memo === toProcess.memo 
                        && username === toProcess.account && currency === jabFEE.costCurr){ 
                    }
                    // addStateOP({ state: 'Sucess transferred funds', data: {} });
                    // console.log('Executed successfully. Now check to continue dev work!!!',result.result.id);
                    if(showValueDevMode){ console.log('Executed successfully.')};
                    // setTx({ txid: result.result.id, step: 1});

                    //return result object as { status: 'sucess', results: { txId: result.result.id } }
                    setResultsOP({
                        status: 'sucess', results: { txId: result.result.id, memo: memo },
                    });
                };
            });
        }
    }
    //END functions/CB
    

    return (
        <div>
        </div>
    )
}

export default Processpayment;