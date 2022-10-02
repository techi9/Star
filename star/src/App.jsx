import {useRef, useState} from 'react'
import './App.css'
import Scene from "./components/starView/Scene";
import Controller from "./components/controller";

function App() {

    let calculateSceneSizes = {
        height: window.innerHeight / 100 * 85,
        width: window.innerWidth / 100 * 45
    }

    let colors = [
        'blue',
        'white',
        'yellow',
        'orange',
        'red',
        'brown'
    ]

    let [currentStarInd, setCurrentStarInd] = useState(0)
    let [flag, setFlag] = useState(false)

    let controllerRef = useRef()

    let restart = () => {
        setFlag(true)
        controllerRef.current.startButtonOnClick()
        if (currentStarInd === colors.length - 1){ setCurrentStarInd(0); return}
        setCurrentStarInd(++currentStarInd)
    }

    return (
        <div className="App">
            <div className="wrapper-left">
                <div className="star-view">
                    <Scene key={currentStarInd} flag={flag} color={colors[currentStarInd]} height={calculateSceneSizes.height} width={calculateSceneSizes.width}/>
                </div>
                <button onClick={restart}> Начать </button>
            </div>

            <div className="components">
                <Controller ref = {controllerRef}/>
            </div>
        </div>
    )
}

export default App
