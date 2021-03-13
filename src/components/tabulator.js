import React, { useState, useEffect } from 'react';
//tab component
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
//end tab component
//components,jsx
import Friendlist from './BeeChat/friendlist';
import Friendrequests from './BeeChat/friendrequests';
import Conversations from './BeeChat/conversations';
import Channels from './BeeChat/channels';
import Settings from './BeeChat/settings';

const Tabulator = (props) => {

    const [selected, setSelected] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);

    const { datatabs } = props;
    console.log(datatabs);

    useEffect(() => {
        if(selected){
            console.log(selected);
        }
        if(datatabs[4].data.dm){
            console.log("Dm present");
            setDataLoaded(true);
        }else{
            console.log("Dm NOT present");
            setDataLoaded(false);
        }
    },[selected,datatabs])

    return (
        <div>
              <Tabs>
                <TabList>
                  {
                      datatabs.map(tab => {
                          return (
                                <Tab onClick={() => setSelected(tab.title)}>
                                    {tab.title}
                                </Tab>
                          )
                      })
                  }
                </TabList>
                {
                    dataLoaded &&
                        <>  
                            <TabPanel key={`${datatabs[0].id}-tabPanel`}>
                                <div className="tabContainer" key={`${datatabs[0].id}-tabContainer`}>
                                    <Friendlist data={datatabs[0].data} />
                                </div>
                            </TabPanel>
                            <TabPanel key={`${datatabs[1].id}-tabPanel`}>
                                <div className="tabContainer" key={`${datatabs[1].id}-tabContainer`}>
                                    <Friendrequests data={datatabs[1].data} />
                                </div>
                            </TabPanel>
                            <TabPanel key={`${datatabs[2].id}-tabPanel`}>
                                <div className="tabContainer" key={`${datatabs[2].id}-tabContainer`}>
                                    <Channels data={datatabs[2].data} />
                                </div>
                            </TabPanel>
                            <TabPanel key={`${datatabs[3].id}-tabPanel`}>
                                <div className="tabContainer" key={`${datatabs[3].id}-tabContainer`}>
                                    <Conversations data={datatabs[3].data} />
                                </div>
                            </TabPanel>
                            <TabPanel key={`${datatabs[4].id}-tabPanel`}>
                                <div className="tabContainer" key={`${datatabs[4].id}-tabContainer`}>
                                    <Settings data={datatabs[4].data} />
                                </div>
                            </TabPanel>
                        </>
                }
            </Tabs>
        </div>
    )
}

export default Tabulator;