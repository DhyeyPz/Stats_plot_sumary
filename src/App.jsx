import React from "react";

import Test5 from "./Test5";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import ChangePassword from "./pages/ChangePassword";
export default function App() {
  return (
      
              <div>
                {/* this is the test branch  */}
                {/* <Plot /> */}
                {/* <Plot3 /> */}
                {/* <Min_max_plot /> */}
                {/* <Min_max_summery /> */}
                {/* <Test /> */}
                {/* <Test2 /> */}
                {/* <Test3 /> */}
                {/* <Test4 /> */}
                <Test5 />
              </div>
          
        
  );
}
