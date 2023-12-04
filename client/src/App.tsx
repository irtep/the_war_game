import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StartMenu from './components/StartMenu';
import CreateStuff from './components/CreateStuff';

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

      </Routes>
    </Router>
  );
}

export default App;
