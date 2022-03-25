import React, { Component } from 'react';
import axios from 'axios';

import Tracker from "./Tracker";

class Devices extends Component {

    constructor(props)
    {
        super(props)

        //eventuella bindings:
        this.sendToggleActivationRequest = this.sendToggleActivationRequest.bind(this)
        this.getUserDevices = this.getUserDevices.bind(this)

        this.state = {
            devices: {
                trackers: []
            },
            activationTimer: 0,
            countDownFunctionIdentifier: null
        }
    }

    componentDidMount()
    {
        this.getUserDevices();
    }

    getUserDevices()
    {
        axios.get('http://localhost:5000/api/userDevices')
        .then(res => {
            this.setState({
                devices: res.data
            })
        }).catch(err => {
            console.log(err)

            if(err.response.status == 401)
            {
                this.props.refreshToken()
                .then(res => {
                    this.getUserDevices()
                }).catch(err => {
                    console.log(err)
                })
            }
        })
    }

    sendToggleActivationRequest()
    {
        if(this.state.activationTimer <= 0) //det ska inte gå att skicka en ny request om det redan finns en activation timer.
        {
            axios.post('http://localhost:5000/api/createToggleActivationRequest', {
                serialNumber: document.getElementById('deviceSerialNumberInput').value
            }).then(res => {
                //start activation timer
                this.setState({
                    activationTimer: 10,
                    countDownFunctionIdentifier: setInterval(() => {
                        this.setState({
                            activationTimer: this.state.activationTimer - 1
                        })

                        if(this.state.activationTimer <= 0)
                        {
                            this.getUserDevices();
                            clearInterval(this.state.countDownFunctionIdentifier)
                        }
                    }, 1000)
                })
            }).catch(err => {
                console.log(err)

                if(err.response.status == 401)
                {
                    this.props.refreshToken()
                    .then(res => {
                        this.sendToggleActivationRequest()
                    }).catch(err => {
                        console.log(err)
                    })
                }
            })
        }
    }

    render(){
        console.log(this.state)
        return(
            <div>
                    {this.state.devices.trackers.map((tracker) => (
                        <div>
                            <Tracker serialNumber={tracker.serialNumber} type={tracker.type} name={tracker.nickname} long={-1} lat={-1}/>
                            <hr></hr>
                        </div>
                    ))}
                <div>
                    <h3>Active/Deactivate device</h3>
                    <label>Serial Number:</label>
                    <input id="deviceSerialNumberInput" name="serialNumber"></input>
                    <button onClick={this.sendToggleActivationRequest}>Send</button>
                </div>
                {
                    this.state.activationTimer > 0 ?
                    (
                        <div>
                            <p style={{color: "red"}}>Press button on device before the timer reaches 0.</p>
                            <p>Timer: {this.state.activationTimer}</p>
                        </div>
                    )
                    :
                    (
                        <></>
                    )
                }
                
            </div>
        );
    } 
}

export default Devices;