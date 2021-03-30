import React from "react";
import { Router } from "@reach/router";
import Layout from '../components/layout';
// import Profile from "../components/Profile";
// import Login from "../components/Login";
import PrivateRoute from '../components/HOC/privateRoute';
import PrivateRouteAdmin from '../components/HOC/privateRouteAdmin';
import UserSettings from "../components/usersettings";
import UserLogin from "../components/userlogin";
import UserProfile from "../components/userprofile";
import AdminPanel from '../components/adminpanel';
import Userwallet from '../components/User/userwallet';
import TokensUser from '../components/User/tokens';
import Userjobs from '../components/User/userjobs';
import Beechatfixed from "../components/BeeChat/beechatfixed";
// import Status from "../components/Status"

const App = () => (
    <Layout>
      {/* <Status /> */}
      <Router>
        {/* <PrivateRoute path="/app/profile" component={Profile} /> */}
        <PrivateRouteAdmin path="app/adminpanel" component={AdminPanel} />
        <PrivateRoute path="/app/settings" component={UserSettings} />
        <PrivateRoute path="/app/beechatfixed" component={Beechatfixed} />
        <PrivateRoute path="/app/profile" component={UserProfile} />
        <PrivateRoute path="/app/wallet" component={Userwallet} />
        <PrivateRoute path="/app/tokens" component={TokensUser} />
        <PrivateRoute path="/app/jobs" component={Userjobs} />
        <UserLogin path="/app/userlogin" />
      </Router>
    </Layout>
)

export default App