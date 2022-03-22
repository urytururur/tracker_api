import React, { Component } from 'react';

class Welcome extends Component {
    constructor()
    {
        super()
        this.state = {
            name: "Torbjörn"
        }
    }

    changeName(name)
    {
        this.setState({
            name: name
        })
    }

    render(){
        return(
            <div>
                <h1>Welcome {this.state.name}!</h1>
                <button onClick={() => this.changeName()}>Change name</button>
            </div>
        );
    } 
  }

export default Welcome;