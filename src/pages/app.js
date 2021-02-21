import React from "react";
import { Router } from "@reach/router";
import Layout from '../components/layout';
// import Profile from "../components/Profile";
// import Login from "../components/Login";
import PrivateRoute from '../components/HOC/privateRoute';
import UserSettings from "../components/usersettings";
import UserLogin from "../components/userlogin";
import UserProfile from "../components/userprofile";
// import Status from "../components/Status"

const App = () => (
  <Layout>
    {/* <Status /> */}
    <Router>
      {/* <PrivateRoute path="/app/profile" component={Profile} /> */}
      <PrivateRoute path="/app/settings" component={UserSettings} />
      <PrivateRoute path="/app/profile" component={UserProfile} />
      <UserLogin path="/app/userlogin" />
    </Router>
  </Layout>
)

export default App