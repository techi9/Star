import {Component} from "react";
import "./TemperatureBar.css";

class TemperatureBar extends Component{
    constructor(props) {
        super(props);
        this.setTemperature = this.props.setTemperature;  // call this.setTemperature(number) to set new color in program
        this.state = {
            widthProgress: 0,
            widthCursor: 75,
        }
        this.colorShine = 'yellow';
        this.indexProgress = 0;
        this.indexCursor = 75;
        this.progressTemperature = {
            'dark-blue': '72',
            'blue': '65',
            'light-blue': '60',
            'white': '53',
            'light-yellow': '45',
            'yellow': '40',
            'orange': '33',
            'red': '27',
            'dark-red': '20',
            'brown': '13'
        }
        this.temperature = {
            'dark-blue': [80000],
            'blue': [40000,80000],
            'light-blue': [20000,40000],
            'white': [10000,20000],
            'light-yellow': [7000,10000],
            'yellow': [6000,7000],
            'orange': [4500,6000],
            'red': [3000,4500],
            'dark-red': [2000,3000],
            'brown': [1500,2000]
        }

        let audioPath = "../../public/sounds/loadTemperature.wav";
        this.audio = new Audio(audioPath);
    }

    // test how it works
    setColorShine = (color) => {
        this.colorShine = color;
    }

    reset = () => {
        clearInterval(this.idProgress);
        clearInterval(this.idCursor);
        this.setState({
            widthProgress: 0,
            widthCursor: 75
        })
        this.flag = true;
        this.indexProgress = 0;
        this.indexCursor = 75;
    }

    cursorStatus = () => {
        let num = this.progressTemperature[this.colorShine];
        let step = (75 - num) / 45;
       if (this.state.widthCursor >= num) {

            this.indexCursor -= step;
            this.setState({widthCursor: this.indexCursor});
       } else {
           clearInterval(this.idCursor);
           this.setTemperature(this.temperature[this.colorShine])
       }
    }

    progressStatus = () => {
        if (this.state.widthProgress >= 100) {
            clearInterval(this.idProgress);
            clearInterval(this.idCursor);
        } else {
            // if(this.audio)
            //     this.audio.stop();
            this.indexProgress++;
            this.setState({widthProgress: this.indexProgress});
        }
    }

    start = () => {
        this.audio.play();
        this.reset();
        this.idProgress = setInterval(this.progressStatus,80);
        this.idCursor = setInterval(this.cursorStatus,100);
    }

    render() {
        return (  // here's your html (jsx)
            <div className="wrapper">
                {/*<div className="progress">*/}
                {/*    <div className="progress_line-bg">*/}
                {/*        <div className="progress_line" id="progress_line" style={{width: this.state.widthProgress+'%'}}>*/}
                {/*            <b>*/}
                {/*                {*/}
                {/*                    this.state.widthProgress * 1 + '%'*/}
                {/*                }*/}
                {/*            </b>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className="temperature">
                    <div className="cursor" id="cursor" style={{
                        height: this.state.widthCursor+'%'
                    }}></div>
                </div>
                <button className="btn-grad" type="button" onClick={this.start}>Измерить</button>
            </div>
        );
    }

}
export default TemperatureBar