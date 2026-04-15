import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import CourseStudio from './CourseStudio';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/studio" element={<CourseStudio />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
