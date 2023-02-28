import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Page591 from "./Pages/Page591";
import PageDirect from "./Pages/PageDirect";
import PageFaceBook from "./Pages/PageFaceBook";
import PageMap from "./Pages/PageMap";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.Fragment>
    <Router>
      <Routes>
        <Route path="/page591" element={<Page591 />} />
        <Route path="/pageFB" element={<PageFaceBook />} />
        <Route path="/map" element={<PageMap />} />
        <Route path="/" element={<PageDirect />} />
      </Routes>
    </Router>
  </React.Fragment>
);
