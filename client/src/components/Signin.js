import React, { Component } from 'react';
import { Navigate } from "react-router-dom";
import axios from 'axios';

class Signin extends Component {

  constructor (props){
    super(props);

    this.redirectIfSignedIn = this.redirectIfSignedIn.bind(this);
    this.signIn = this.signIn.bind(this);
    this.content = 
    (
      <div id="container">
          <form onSubmit={this.signIn}>
            <label>
              Email:
              <input id="loginEmail" type="text" name="email"/>
              Password:
              <input id="loginPassword" type="password" name="password"/>
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
    )
  }

  componentWillMount()
  {
    this.redirectIfSignedIn()
  }

  redirectIfSignedIn(content)
  {
    axios.get(`http://localhost:5000/isSignedIn`)
    .then(res => {
      if(res.data)
      {
        this.content = (<Navigate replace to="/home"/>)
        this.forceUpdate()
      }
    })
  }

  signIn(event) {
    event.preventDefault();

    axios.post(`http://localhost:5000/login`, {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    })
    .then(res => {
      this.redirectIfSignedIn()
    })
  }

  render() {
    return (
      this.content
    );
  }
}

export default Signin;