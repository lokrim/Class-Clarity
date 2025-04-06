import "./index.css"
import logo from "./assets/logo-light.png"
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "./config/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState } from "react";
import tableQuery from "./queries/table_init_query.json";

function Schedule(){

    const [tableData, setTableData] = useState(null);
    const [inputName, setInputName] = useState("");
    const [logLabel, setLogLabel] = useState("");

    const cleanPromptOutput = (string) => {
        let processed = string.trim();
        let start = processed.indexOf('{');
        let end = processed.lastIndexOf('}');
        return processed.substring(start, end + 1);
    }

    const getStudentByName = async() => {
        try{
            let name = inputName;
            const q = query(collection(db, "students"), where("name", "==", name));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const studentData = querySnapshot.docs[0].data();
                return studentData;
              } else {
                setLogLabel("Invalid entry. Please enter a valid student name");
                return null;
              }
        }
        catch(error){
            console.error(error);
            return null;
        }
    }

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
    async function initNewStudent (){
        try{

            let studentData = await getStudentByName();
            if (!studentData){
                return null;
            }
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
            const prompt = JSON.stringify(tableQuery) + " INPUT: " + JSON.stringify(studentData);
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            let processed = cleanPromptOutput(text);
            const obj = JSON.parse(processed);
            setTableData(obj);
            const docRef = await addDoc(collection(db,"schedules"),transformSchedule(obj,studentData));
        }
        catch(error){
            console.error(error);
        }
    }

    const getActivityStyle = (type) => {
        switch(type){
            case "course":
                return "text-blue-500 font-medium"
            case "interest":
                return "text-green-500 font-medium"
            case "chore":
                return "text-red-500 font-medium";
            case "free":
                return "text-gray-500 font-medium";
            default:
                return "text-black font-medium";
        }
    }

    const transformSchedule = (schedule, details) => {
        const transformed = {
          name: details.name,
          courses: details.courses,
          interests: details.interests,
          chores: details.chores,
        };
      
        for (const [day, timeSlots] of Object.entries(schedule)) {
          if (["name"].includes(day)) continue;
      
          transformed[day] = [];
      
          for (const [time, activities] of Object.entries(timeSlots)) {
            activities.forEach(([activity, type]) => {
              transformed[day].push({ activity, type, time });
            });
          }
        }
        return transformed;
    };
      
    const revertSchedule = (transformed) => {
        const reverted = {
            name: transformed.name,
        };
        for (const [key, value] of Object.entries(transformed)) {
            if (["name", "courses", "interests", "chores"].includes(key)) continue;
            reverted[key] = {
            morning: [],
            evening: [],
            night: [],
            };
            value.forEach(({ activity, type, time }) => {
            if (reverted[key][time]) {
                reverted[key][time].push([activity, type]);
                }
            });
        }
        return reverted;
    };
    
    const tableInit = async () => {
        setLogLabel("");
        try{
            let name = inputName;
            const q = query(collection(db, "schedules"), where("name", "==", name));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const studentData = revertSchedule(querySnapshot.docs[0].data());
                setTableData(studentData);
            } 
            else {
                initNewStudent();
            }
        }
        catch(error){
            console.error(error);
        }
    };
          

    return(
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
                    <div className="flex flex-col pt-4 pb-1">
                        <h1 className="text-4xl font-bold mb-2 text-[#0066ff]">Semester Schedule</h1>
                        <p className="text-lg text-[#717ACF]">Please enter the name of the student to view their schedule</p>
                        <div>
                            <input className="border-2 border-[#717ACF] rounded p-1 w-90 mt-4 mb-3" 
                            type="text" 
                            placeholder="Enter name" 
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            />
                            <button className="border-0 bg-[#717ACF] p-1.5 w-26 rounded text-[#ffffff] m-2 shadow-2xl cursor-pointer hover:opacity-50" onClick={tableInit}>Submit</button>
                        </div>
                    </div>
                    <div className="flex flex-col mt-5">
                        <table className="bg-blue-50 border-3 border-[#717ACF] w-350 h-100">
                            <thead>
                                <tr className="bg-violet-200 text-[#8f6cbe]">
                                    <th className="w-60 py-4 border-3 border-[#717ACF]">Time</th>
                                    <th className="w-60 py-4 border-3 border-[#717ACF]">Monday</th>
                                    <th className="w-60 py-4 border-3 border-[#717ACF]">Tuesday</th>
                                    <th className="w-60 py-4 border-3 border-[#717ACF]">Wednesday</th>
                                    <th className="w-60 py-4 border-3 border-[#717ACF]">Thursday</th>
                                    <th className="w-60 py-4 border-3 border-[#717ACF]">Friday</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-8 py-3 border-2  border-white text-center text-[#931cc3]">Morning</td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.morning?.[0]?.[1])}`}>
                                            {tableData?.monday.morning[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.morning?.[1]?.[1])}`}>
                                            {tableData?.monday.morning[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.morning?.[2]?.[1])}`}>
                                            {tableData?.monday.morning[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.morning?.[0]?.[1])}`}>
                                            {tableData?.tuesday.morning[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.morning?.[1]?.[1])}`}>
                                            {tableData?.tuesday.morning[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.morning?.[2]?.[1])}`}>
                                            {tableData?.tuesday.morning[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.morning?.[0]?.[1])}`}>
                                            {tableData?.wednesday.morning[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.morning?.[1]?.[1])}`}>
                                            {tableData?.wednesday.morning[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.morning?.[2]?.[1])}`}>
                                            {tableData?.wednesday.morning[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.morning?.[0]?.[1])}`}>
                                            {tableData?.thursday.morning[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.morning?.[1]?.[1])}`}>
                                            {tableData?.thursday.morning[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.morning?.[2]?.[1])}`}>
                                            {tableData?.thursday.morning[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                    <div className={`m-1 ${getActivityStyle(tableData?.friday?.morning?.[0]?.[1])}`}>
                                            {tableData?.friday.morning[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.friday?.morning?.[1]?.[1])}`}>
                                            {tableData?.friday.morning[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.friday?.morning?.[2]?.[1])}`}>
                                            {tableData?.friday.morning[2][0]}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#931cc3]">Afternoon</td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.evening?.[0]?.[1])}`}>
                                            {tableData?.monday.evening[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.evening?.[1]?.[1])}`}>
                                            {tableData?.monday.evening[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.evening?.[2]?.[1])}`}>
                                            {tableData?.monday.evening[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.evening?.[0]?.[1])}`}>
                                            {tableData?.tuesday.evening[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.evening?.[1]?.[1])}`}>
                                            {tableData?.tuesday.evening[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.evening?.[2]?.[1])}`}>
                                            {tableData?.tuesday.evening[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.evening?.[0]?.[1])}`}>
                                            {tableData?.wednesday.evening[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.evening?.[1]?.[1])}`}>
                                            {tableData?.wednesday.evening[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.evening?.[2]?.[1])}`}>
                                            {tableData?.wednesday.evening[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.evening?.[0]?.[1])}`}>
                                            {tableData?.thursday.evening[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.evening?.[1]?.[1])}`}>
                                            {tableData?.thursday.evening[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.evening?.[2]?.[1])}`}>
                                            {tableData?.thursday.evening[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                    <div className={`m-1 ${getActivityStyle(tableData?.friday?.evening?.[0]?.[1])}`}>
                                            {tableData?.friday.evening[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.friday?.evening?.[1]?.[1])}`}>
                                            {tableData?.friday.evening[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.friday?.evening?.[2]?.[1])}`}>
                                            {tableData?.friday.evening[2][0]}
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#931cc3]">Night</td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.night?.[0]?.[1])}`}>
                                            {tableData?.monday.night[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.night?.[1]?.[1])}`}>
                                            {tableData?.monday.night[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.monday?.night?.[2]?.[1])}`}>
                                            {tableData?.monday.night[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.night?.[0]?.[1])}`}>
                                            {tableData?.tuesday.night[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.night?.[1]?.[1])}`}>
                                            {tableData?.tuesday.night[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.tuesday?.night?.[2]?.[1])}`}>
                                            {tableData?.tuesday.night[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.night?.[0]?.[1])}`}>
                                            {tableData?.wednesday.night[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.night?.[1]?.[1])}`}>
                                            {tableData?.wednesday.night[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.wednesday?.night?.[2]?.[1])}`}>
                                            {tableData?.wednesday.night[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.night?.[0]?.[1])}`}>
                                            {tableData?.thursday.night[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.night?.[1]?.[1])}`}>
                                            {tableData?.thursday.night[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.thursday?.night?.[2]?.[1])}`}>
                                            {tableData?.thursday.night[2][0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-3 border-2 border-white text-center text-[#0066ff]">
                                    <div className={`m-1 ${getActivityStyle(tableData?.friday?.night?.[0]?.[1])}`}>
                                            {tableData?.friday.night[0][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.friday?.night?.[1]?.[1])}`}>
                                            {tableData?.friday.night[1][0]}
                                        </div>
                                        <div className={`m-1 ${getActivityStyle(tableData?.friday?.night?.[2]?.[1])}`}>
                                            {tableData?.friday.night[2][0]}
                                        </div>
                                    </td>
                                </tr>
                                
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Schedule;