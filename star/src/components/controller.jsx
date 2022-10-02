import {Component, createRef, useRef} from "react";
import ColorSelector from "./color/ColorSelector";
import TemperatureBar from "./temperature/TemperatureBar";
import "./controller.css";
import A from "../assets/cards/A.png";
import G from "../assets/cards/G.png";
import K from "../assets/cards/K.png";
import L from "../assets/cards/L.png";
import O from "../assets/cards/O.png";
import T from "../assets/cards/T.png"

class Controller extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cardPath: "",
            color: '',
            currentTemperature: 0
        }

        this.temperatureRef = createRef()

    }

    setColor = (color) => {
        console.log('color selector = '+color)
        this.setState({
            color: color
        })
        this.temperatureRef.current.setColorShine(color);

    }

    setTemperature = (temperature) => {
        console.log('temperature selector = '+temperature)
        this.setState({
            currentTemperature: temperature
        })

    }

    showResult = () => {
        if(this.state.currentTemperature === 0) {
            return "";
        }
        let cardPath;
        switch (this.state.color) {
            case 'blue': cardPath = O; break;
            case 'white': cardPath = A; break;
            case 'yellow': cardPath = K; break;
            case 'orange': cardPath = G; break;
            case 'red': cardPath = L; break;
            case 'brown': cardPath = T; break;
            default:
                cardPath = '';
        }
        this.setState({cardPath: cardPath})

    }

    startButtonOnClick = () => {
        console.log("IN CONTROLLER - on click");
        this.setState({
            color: ""
        })
    }
    
    close = () => {
        this.setState({
            cardPath: "",
            color: '',
            currentTemperature: 0
        })
    }


    render() {
        return (
            <>
             <div className="controller">
                 <h3>1. Определите цвет звезды:</h3>
                <ColorSelector setColor={this.setColor}/>
                 <h3> 2. Определите температуру звезды: </h3>
                 <TemperatureBar ref = {this.temperatureRef} setTemperature={this.setTemperature}/>
                 <button id="results-button" onClick={this.showResult}>Узнать класс звезды</button>
                 { this.state.cardPath !== '' ? <div className="card">
                     <div class='end'>
                         <img src={this.state.cardPath} alt=""/>
                         <button onClick={this.close}> Закрыть</button>
                     </div>

                 </div>: ''}

             </div>
            </>
        );
    }

}


export default Controller
