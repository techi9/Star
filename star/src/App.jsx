import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div className="star-view">
        <Scene height={calculateSceneSizes.height} width={calculateSceneSizes.width}/>
      </div>

       <div className="components">

       </div>
    </div>
  )
}

export default App
