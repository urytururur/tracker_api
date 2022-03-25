import React, { Component } from 'react';
import axios from 'axios';

class Register extends Component {

    constructor()
    {
        super()

        //eventuella bindings:
        this.signIn = this.signIn.bind(this)

        this.state = {
            
        }
    }

    signIn(event) {
        event.preventDefault();
        
        axios.post(`http://localhost:5000/signup`, {
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value
        }).then(res => {
            axios.post(`http://localhost:5000/login`, {
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value
            }).then(res => {
                this.props.updateLoggedIn();
            }).catch(err => {
                console.log(err)
            })
        }).catch(err => {
            console.log(err)
        })
    }

    render(){
        return(
            <div>
                <form onSubmit={this.signIn}>
                    <label>
                        Email:
                        <input id="registerEmail" type="text" name="email"/>
                        Password:
                        <input id="registerPassword" type="password" name="password"/>
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    } 
}

export default Register;