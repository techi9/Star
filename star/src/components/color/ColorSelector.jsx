import {Component} from "react";
import "./ColorSelector.css";

class ColorSelector extends Component{
    constructor(props) {
        super(props);
        this.setColor = this.props.setColor;  // call this.setColor(number) to set new color in program
    }

    // test how it works
    test = () => {
        this.setColor("green");
    }

    render() {
        return (  // here's your html (jsx)
            <div>
                <h1 onClick={this.test}>
                    Color selector
                </h1>
            </div>
        );
    }

}
export default ColorSelector