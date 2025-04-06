import React from "react"
import ReactDOM from "react-dom/client"
import './index.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Form from './form.jsx'
import Schedule from './schedule.jsx'
import Matching from "./matching.jsx";
import { db } from './config/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

function App(){

  const uploadStudentData = async (studentObj) => {
    try{
      const docRef = await addDoc(collection(db, "students"), {
        name: studentObj.name,
        courses: studentObj.courses,
        interests: studentObj.interests,
        chores: studentObj.chores,
      });
    }
    catch(error){
      console.error(error);
    }
  }

  return(
    <Router>
      <Routes>
        <Route path="/" element={<Form callback={uploadStudentData}/>} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/matching" element={<Matching />} />
      </Routes>
    </Router>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
