import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StartMenu from './components/StartMenu';
import CreateStuff from './components/CreateStuff';
import BuildArmy from './components/BuildArmy';
import SetupGame from './components/SetupGame';

const App: React.FC = (): React.ReactElement => {

  return (
    <Router>
      <Routes>

        <Route
          path="/"
          element={
            <StartMenu
            />
          }
        />

        <Route
          path="/createstuff"
          element={
            <CreateStuff
            />
          }
        />

        <Route
          path="/buildarmy"
          element={
            <BuildArmy
            />
          }
        />

        <Route
          path="/setupgame"
          element={
            <SetupGame
            />
          }
        />

      </Routes>
    </Router>
  );
}

export default App;

// https://github.com/irtep/TheRockRally/blob/master/public/race/draw.js
