import { useGameLoop } from './game/GameLoop';
import { GameCanvas } from './components/GameCanvas';
import { Toolbar } from './components/Toolbar';
import { useGameStore } from './game/GameState';
import { InfoPanel } from './components/InfoPanel';
import './App.css';

function App() {
  // Initialize Game Loop
  useGameLoop();

  const money = useGameStore((state) => state.money);
  const tick = useGameStore((state) => state.tick);
  const paused = useGameStore((state) => state.paused);
  const togglePause = useGameStore((state) => state.togglePause);

  return (
    <div className="app-container">
      <GameCanvas />

      <div className="ui-overlay">
        <div className="top-bar">
          <h1>TrainWebSim</h1>
          <div className="stats">
            <span>Money: ${money.toLocaleString()}</span>
            <span>Tick: {tick}</span>
            <button onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button>
            <button onClick={useGameStore.getState().saveGame}>Save</button>
            <button onClick={useGameStore.getState().loadGame}>Load</button>
          </div>
        </div>
        <Toolbar />
        <InfoPanel />
      </div>
    </div>
  );
}

export default App;
