import React, { Component } from 'react';

class Tracker extends Component {

    constructor()
    {
        super()

        //eventuella bindings:
        //...

        this.state = {
            
        }
    }

    render(){
        return(
            <div>
                <h3>{this.props.name}</h3>
                <p>Serial number: {this.props.serialNumber}</p>
                <p>Type: {this.props.type}</p>
                <p>Coords: ({this.props.long}, {this.props.lat})</p>
            </div>
        );
    } 
}

export default Tracker;