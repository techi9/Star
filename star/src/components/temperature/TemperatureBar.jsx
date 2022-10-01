import {Component} from "react";
import "./TemperatureBar.css";

class TemperatureBar extends Component{
    constructor(props) {
        super(props);
        this.setTemperature = this.props.setTemperature;  // call this.setTemperature(number) to set new color in program
    }

    // test how it works
    test = () => {
        this.setTemperature(17);
    }

    render() {
        return (  // here's your html (jsx)
            <div>
                <h1 onClick={this.test}>
                    Temperature selector
                </h1>
            </div>
        );
    }

}
export default TemperatureBar