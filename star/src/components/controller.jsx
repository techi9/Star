import {Component} from "react";
import ColorSelector from "./color/ColorSelector";
import TemperatureBar from "./temperature/TemperatureBar";
import "./controller.css";

class Controller extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentColor: 'white',
            currentTemperature: 0
        }
    }

    setColor = (color) => {

        this.setState({
            color: color
        })

    }

    setTemperature = (temperature) => {

        this.setState({
            currentTemperature: temperature
        })

    }

    render() {
        return (
            <>
                <div className="debug">
                    Selected color: {this.state.color}
                    <br/>
                    Selected Temp: {this.state.currentTemperature}
                </div>
             <div className="controller">
                <ColorSelector setColor={this.setColor}/>
                 <TemperatureBar setTemperature={this.setTemperature}/>
             </div>
            </>
        );
    }

}


export default Controller
