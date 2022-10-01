import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Scene from "./components/starView/Scene";
import Controller from "./components/controller";

function App() {

    let calculateSceneSizes = {
        height: window.innerHeight / 100 * 85,
        width: window.innerWidth / 100 * 45
    }

  return (
    <div className="App">
      <div className="star-view">
        <Scene height={calculateSceneSizes.height} width={calculateSceneSizes.width}/>
      </div>

       <div className="components">
            <Controller/>
       </div>
    </div>
  )
}

export default App
