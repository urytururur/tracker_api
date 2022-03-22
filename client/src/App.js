import React, { Component } from 'react';
import { Route, Outlet, Link, Routes, Navigate } from "react-router-dom";

import Signin from "./components/Signin";
import Home from "./components/Home";
import Welcome from "./components/Welcome";

class App extends Component {

  render() {
    return (
      <>
        <div>
          <h1>Tracker Web App</h1>
            <Link to="/signin">Sign in</Link> |{" "}
            <Link to="/home">Home</Link> |{" "}
            <Link to="/welcome">Welcome</Link> |{" "}
          <Outlet />
        </div>
        <Routes>
          <Route path="signin" element={<Signin/>}/>
          <Route path="home" element={<Home/>}/>
          <Route path="welcome" element={<Welcome name="Torbjörn"/>}/>
        </Routes>
      </>
    );
  }
}

export default App;