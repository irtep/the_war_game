import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StartMenu from './components/StartMenu';
import CreateUnit from './components/CreateUnit';

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
          path="/createunit"
          element={
            <CreateUnit
            />
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
