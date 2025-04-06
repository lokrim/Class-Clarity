import "./index.css"
import logo from "./assets/logo-light.png"
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "./config/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import matchingQuery from "./queries/match_query.json"

function Matching(){

    const [studentName, setStudentName] = useState("");
    const [student, setStudent] = useState(null);
    const [match, setMatch] = useState(null);
    const [heading, setHeading] = useState("");
    const [para1, setPara1] = useState("");
    const [para2, setPara2] = useState("");
    const [logLabel, setLogLabel] = useState("");

    const extractFreeTimeSlots = (student) => {
        const freeSlots = new Set();
      
        for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday"]) {
          const activities = student[day] || [];
      
          for (const activity of activities) {
            if (activity.type?.toLowerCase() === "free") {
              const time = activity.time?.toLowerCase();
              if (["morning", "evening", "night"].includes(time)) {
                freeSlots.add(`${day}_${time}`);
              }
            }
          }
        }
        return freeSlots;
    };
    
    const findMatchingStudentByTimeSlot = (mainStudent, studentArray) => {
        const mainFreeSlots = extractFreeTimeSlots(mainStudent);
      
        for (const student of studentArray) {
          const otherFreeSlots = extractFreeTimeSlots(student);
      
          for (const slot of mainFreeSlots) {
            if (otherFreeSlots.has(slot)) {
              return student;
            }
          }
        }
        return null;
    };
      

    const findMatch = async () => {
        try{
            if (studentName == ""){
                return;
            }
            let name = studentName;
            let q = query(collection(db, "schedules"), where("name", "==", name));
            let querySnapshot = await getDocs(q);
            if (querySnapshot.empty){
                setLogLabel("Invalid entry. Please enter a valid student name");
                return;
            }
            const studentId = querySnapshot.docs[0].id;
            const studentData = querySnapshot.docs[0].data();
            setStudent(studentData);
            let courses = studentData.courses;
            let matches = [];
            q = query(collection(db, "schedules"), where("courses","array-contains-any",courses));
            querySnapshot = await getDocs(q);
            if (querySnapshot.empty){
                setLogLabel("No matches — Student has no shared courses with other users.");
                return;
            }
            querySnapshot.forEach((doc) => {
                if (doc.id !== studentId){
                    matches.push(doc.data());
                }
            });
            let tempMatch = findMatchingStudentByTimeSlot(studentData, matches);
            if (!tempMatch){
                setLogLabel("No matches — Student has no coinciding free time with other users.");
                return;
            }
            setMatch(tempMatch);

        }
        catch(error){
            console.error(error);
        }
    };

    const initPara1 = () => {
        let common = [];
        for (let course of student.courses){
            if (match.courses.includes(course)){
                common.push(course);
            }
        }
        if (common.length == 1){
            let string = `You both share an academic background, having ${common[0]} as a common university course.`
            setPara1(string);
        }
        else{
            let temp = '';
            common.forEach((course) => {
                temp += course + ', ';
            });
            temp = temp.substring(0, temp.length - 2);
            let string = `You both share an academic background, having ${temp} as common university courses.`
            setPara1(string);
        }
    };

    const initPara2 = async() => {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
        const prompt = JSON.stringify(matchingQuery) + JSON.stringify(student) + ' ' + JSON.stringify(match);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        setPara2(text);
    };

    useEffect(() => {
        if (student && match){
            setHeading(`You have matched with ${match.name}.`);
            initPara1();
            initPara2();
            setLogLabel("");
        }
    },[match]);

    return (
        <div> 
            <div className="h-20 flex mb-5 bg-[#f0f0f0]">
                <div className = 'flex items-center'>
                    <img className ='w-15 h-15 m-3' src={logo} alt="logo" />
                    <p className = 'text-[#717ACF] text-2xl font-bold'>Class Clarity</p>
                </div>
                <div className="text-red-600 flex items-center pl-36 font-medium">
                    {logLabel}
                </div>
                <div className = 'flex-1 flex justify-end items-center m-4'>
                    <Link to="/">
                        <button className="m-6 border-0 bg-[#717ACF] p-2 w-40 rounded text-[#ffffff] shadow-2xl cursor-pointer hover:opacity-50">Add Student</button>
                    </Link>
                    <Link to="/schedule">
                        <button className="m-6 border-0 bg-[#717ACF] p-2 w-40 rounded text-[#ffffff] shadow-2xl cursor-pointer hover:opacity-50">View Schedule</button>
                    </Link>
                    <Link to="/matching">
                    <button className="m-6 border-0 bg-[#717ACF] p-2 w-40 rounded text-[#ffffff] shadow-2xl cursor-pointer hover:opacity-50">Guided Matching</button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="w-350">
                    <div className="flex flex-col pt-4 pb-6">
                        <h1 className="text-4xl font-bold mb-2 text-[#0066ff]">Guided Matching</h1>
                        <p className="text-lg text-[#717ACF] pl-1">Please enter the name of the student you want to match</p>
                        <div>
                            <input className="border-2 border-[#717ACF] rounded p-1 w-90 mt-4 mb-3" 
                            type="text" 
                            placeholder="Enter name" 
                            value = {studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            />
                            <button className="border-0 bg-[#717ACF] p-1.5 w-26 rounded text-[#ffffff] m-2 shadow-2xl cursor-pointer hover:opacity-50" onClick={findMatch}>Submit</button>
                        </div>
                    </div>
                    <div className="border-2 border-[#717ACF] rounded p-5 w-350">
                        <div className="text-4xl m-2 mb-4 font-extrabold text-[#717ACF]">
                            {heading} 
                        </div>
                        <div>
                            <div className="text-3xl m-2 mb-4 font-medium text-[#0066ff]">
                                <div>{para1}</div>
                            </div> 
                            <div className="m-2 mb-4 text-xl text-gray-500">
                                <div>{para2}</div>
                            </div> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Matching;