import React, { Component } from 'react';
import { Route, Outlet, Link, Routes, Navigate } from "react-router-dom";
import axios from 'axios';

import Signin from "./components/Signin";
import Home from "./components/Home";
import Devices from "./components/Devices";
import Register from "./components/Register";

class App extends Component {

  constructor(props)
  {
    super(props)

    //eventuella bindings:
    this.updateLoggedIn = this.updateLoggedIn.bind(this)
    this.signOut = this.signOut.bind(this)
    this.refreshToken = this.refreshToken.bind(this)

    this.state = {
      loggedIn: true
    }
  }

  componentDidMount()
  {
    this.updateLoggedIn()
  }

  refreshToken()
  {
    return new Promise((resolve, reject) => {
      axios.get(`http://localhost:5000/refreshToken`)
      .then(res => {
        resolve()
      }).catch(err => {
        console.log(err)

        this.setState({
          loggedIn: false
        })
        reject()
      })
    })
  }

  updateLoggedIn() //den här functionen kanske skulle bort helt -> vi behöver bara se till att en oinloggad användare inte kommer åt känslig data, dvs vi kan skydda routesen på servern istället, och ha en response-header som avgör om vi är inloggade eller inte efter varje request till servern
  {
    axios.get(`http://localhost:5000/isSignedIn`)
    .then(res => {
      this.setState({
        loggedIn: true
      })
    }).catch(err => {
      console.log(err)

      this.setState({
        loggedIn: false
      })
    })
  }

  signOut(event) {
    //event.preventDefault();

    axios.post(`http://localhost:5000/logout`)
    .then(res => {
      this.setState({
        loggedIn: false
      })
    }).catch(err => {
      console.log(err)
      
      this.updateLoggedIn()
    })
  }

  render() {
    return (
      <div>
          <h1>Tracker Web App</h1>
          {
              this.state.loggedIn ? 
              (
                <div>
                  <Link to="/home">Home</Link> |{" "}
                  <Link to="/devices">Devices</Link>
                </div>
              )
              :
              (
                <div>
                  <Link to="/signin">Sign in</Link> |{" "}
                  <Link to="/register">Register</Link>
                </div>
              )
          }
          <hr></hr>

        <Routes>
            <Route path="/signin" element=
            {
              this.state.loggedIn ?
              (
                <Navigate replace to="/home"/>
              )
              :
              (
                <Signin updateLoggedIn={this.updateLoggedIn}/>
              )
            }
            />
            <Route path="/register" element=
            {
              this.state.loggedIn ?
              (
                <Navigate replace to="/home"/>
              )
              :
              (
                <Register updateLoggedIn={this.updateLoggedIn}/>
              )
            }
            />
            <Route path="/home" element=
            {
              this.state.loggedIn ?
              (
                <Home/>
              )
              :
              (
                <Navigate replace to="/signin"/>
              )
            }
            />
            <Route path="/devices" element=
            {
              this.state.loggedIn ?
              (
                <Devices refreshToken={this.refreshToken}/>
              )
              :
              (
                <Navigate replace to="/signin"/>
              )
            }
            />
            <Route path="*" element={<Navigate replace to="/home"/>}/>
        </Routes>
        
        {
          this.state.loggedIn ? 
          (
            <div>
              <button onClick={this.signOut}>Sign out</button>
            </div>
          )
          :
          (
            <></>
          )
        }

        <Outlet />
      </div>
    );
  }
}

export default App;