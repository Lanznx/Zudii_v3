import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page591 from "./Pages/Page591";
import PageFaceBook from "./Pages/PageFaceBook";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.Fragment>
    <Router>
      <Routes>
        <Route path="/page591" element={<Page591 />} />
        <Route path="/pageFB" element={<PageFaceBook />} />
      </Routes>
    </Router>
  </React.Fragment>
);
