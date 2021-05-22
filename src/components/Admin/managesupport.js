import React, { useState, useEffect } from 'react';
import { check } from '../../utils/helpers';
import Loader from '../loader';
import Tablinator from '../interactions/tablinator';
import Recordnator from '../interactions/recordnator';
import Sliderjobimages from '../User/jobs/subcomponents/sliderjobimages';

//constants
const userEP = process.env.GATSBY_userEP;
const adminEP = process.env.GATSBY_adminEP;
const notiEP = process.env.GATSBY_notiEP;
//END constants

const Managesupport = () => {
    const userdata = check();
    const [tickets, setTickets] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [selected, setSelected] = useState(null);

    //functions/CB
    function loadTickets(){
        const headers = {'x-access-token': userdata.token, 'query': JSON.stringify({ 'filter': {}, 'limit': 0, 'sortby': {}}) }; //
        dataRequest(userEP+"getSupportTicket", "GET", headers, null).then(response => {
            console.log(response);
            if(response.status === 'sucess'){ setTickets(response.result);}
            setLoadingData(false);
        }).catch(error => {
            console.log('Error getting tickets.', error);
            setLoadingData(false);
        });
    }
    ///data fetching
    async function dataRequest(url = '', requestType, headers, formdata) {
        const response =    !formdata   ? fetch(url, { method: requestType, contentType: 'application/json', headers: headers,})
                                        : fetch(url, { method: requestType, contentType: 'application/json', headers: headers, body: formdata});
        return (await response).json(); 
    };
    ///END data fetching
    //END functions/CB

    //load on init
    useEffect(() => { loadTickets();},[]);
    //END load on init

    return (
        <div>
            { loadingData && <div className="standardDivRowFlex100pX100pCentered marginsTB"><Loader logginIn={loadingData}/></div> }
            {
                !loadingData && tickets &&
                <Tablinator 
                    clickedSubItemCB={(item) => setSelected(item)}
                    items={tickets}
                    toShow={['username','usertype','ticket_type','solved','createdAt']}
                    pagination={{ perPage: 15, controls: false }}
                />
            } 
            {
                !loadingData && selected &&
                <Sliderjobimages 
                    job={selected}
                    size={"big"}
                    devMode={true}
                    xclassCSS={selected.images && selected.images.length > 0 ? "justMinHeight300px" : null}
                    hideDefault={true}
                />
            }
            {
                !loadingData && selected && (!selected.images || selected.images.length === 0) &&
                <p>Ticket has no images.</p>
            }
            {
                selected && !loadingData &&
                <Recordnator 
                    closeCB={() => setSelected(null)}
                    item={selected}
                    toShow={[
                        { field:'username', type: 'String', link: false,},
                        { field:'usertype', type: 'String', link: false,},
                        { field:'ticket_type', type: 'String', link: false,},
                        { field:'solved', type: 'Boolean', link: false,},
                        { field:'category_support', type: 'String', link: false,},
                        { field:'ref_id', type: 'String', link: false,},
                        { field:'issue_description', type: 'String', link: false,},
                        { field:'issue_note', type: 'String', link: false,},
                        { field:'createdAt', type: 'Date', link: false,},
                        { field:'updatedAt', type: 'Date', link: false,},
                    ]}
                />
            }
        </div>
    )
}

export default Managesupport;