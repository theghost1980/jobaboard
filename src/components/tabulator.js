import React from 'react';
//tab component
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
//end tab component

const Tabulator = (props) => {
    const { datatabs } = props;
    // console.log(datatabs);

    return (
        <div>
              <Tabs>
                <TabList>
                  {
                      datatabs.map(tab => {
                          return (
                                  <Tab>{tab.title}</Tab>
                          )
                      })
                  }
                </TabList>
                {
                      datatabs.map(tab => {
                          return (
                              <TabPanel>
                                     <div className="tabContainer" key={tab.id}>
                                        <p>{tab.title}</p>
                                        <p>{JSON.stringify(tab.data)}</p>
                                    </div>
                              </TabPanel>
                          )
                      })
                  }
            </Tabs>
        </div>
    )
}

export default Tabulator;