import React, { Component } from 'react';
import { Navigate } from "react-router-dom";
import axios from 'axios';

class Signin extends Component {

  constructor (props)
  {
    super(props)

    //man måste binda sina functioner i constructorn
      //-> annars vet inte classen om att de finns!
    this.signIn = this.signIn.bind(this);

    this.state = {
      
    }
  }

  signIn(event) {
    event.preventDefault();
    
    axios.post(`http://localhost:5000/login`, {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    }).then(res => {
      this.props.updateLoggedIn();
    }).catch(err => {
      console.log(err)
    })
  }

  render() {
    return (
      <div>
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
    );
  }
}

export default Signin;