import "./index.css"
import logo from "./assets/logo-light.png"
import { Link } from "react-router-dom";
import { useState } from "react";

function Form({callback}){

    const [name, setName] = useState("");
    const [courseInput, setCourseInput] = useState("");
    const [interestedCourseInput, setInterestedInput] = useState("")
    const [choreInput, setChoreInput] = useState("");
    const [timeInput, setTimeInput] = useState("");
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [logLabel, setLogLabel] = useState("");

    const courseHandleKeyDown = (event) => {
        if (event.key === 'Enter' && courseInput.trim() !== ""){
            let course = {type:"course", val:courseInput};
            setSelectedCourses([...selectedCourses, course]);
            setCourseInput("");
        }
    }
    const interestedHandleKeyDown = (event) => {
        if (event.key === 'Enter' && interestedCourseInput.trim() !== ""){
            let course = {type:"interested", val:interestedCourseInput};
            setSelectedCourses([...selectedCourses, course]);
            setInterestedInput("");
        }
    }
    const choreHandleKeyDown = (event) => {
        if (event.key === 'Enter' && timeInput.trim() !== "" && choreInput.trim() !== ""){
            let chore = {type:"chore", val:choreInput, time:timeInput};
            setSelectedCourses([...selectedCourses, chore]);
            setChoreInput("");
            setTimeInput("");
        }
    }
    
    const submitStudent = () => {
        setLogLabel("");
        let studentCourse = []
        for (let obj of selectedCourses){
            if (obj.type === 'course'){
                studentCourse.push(obj.val);
            }
        }
        let studentInterest = []
        for (let obj of selectedCourses){
            if (obj.type === 'interested'){
                studentInterest.push(obj.val);
            }
        }
        let studentChores = []
        for (let obj of selectedCourses){
            if (obj.type === 'chore'){
                studentChores.push(obj.val);
            }
        }
        if (name == '' || studentCourse.length == 0 || studentInterest.length == 0 || studentChores.length == 0){
            setLogLabel("Please ensure all required fields are filled out correctly and try again.");
            return;
        }

        let student = {
            name : name,
            courses : studentCourse,
            interests : studentInterest,
            chores : studentChores,
        }
        callback(student);
        setCourseInput("");
        setInterestedInput("");
        setChoreInput("");
        setTimeInput("");
        setSelectedCourses([]);
    }


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
                <div>
                    <div className="flex flex-col pt-4 pb-6">
                            <h1 className="text-4xl font-bold mb-2 text-[#0066ff]">Welcome to Class Clarity</h1>
                            <p className="text-lg text-[#717ACF] pl-1">Please fill out the form below to add a student</p>
                    </div>
                    <div className="flex">
                        <div className="flex justify-center">
                            <div className="flex flex-col">

                                <label className="text-lg text-[#717ACF] pl-1">Name</label>
                                <input className="border-2 border-[#717ACF] rounded p-1 m-1" 
                                    type="text" 
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />

                                <label className="pt-4 text-lg text-[#717ACF] pl-1">University Courses</label>
                                <input className="border-2 border-[#717ACF] rounded p-1 m-1" 
                                    type="text" 
                                    placeholder="Enter Course"
                                    onChange={e => setCourseInput(e.target.value)} 
                                    value={courseInput} 
                                    onKeyDown={courseHandleKeyDown}
                                />
                                
                                <label className="pt-4 text-lg text-[#717ACF] pl-1">Interested Courses</label>
                                <input className="border-2 border-[#717ACF] rounded p-1 m-1" 
                                    type="text" 
                                    placeholder="Enter Course"
                                    onChange={e => setInterestedInput(e.target.value)} 
                                    value={interestedCourseInput} 
                                    onKeyDown={interestedHandleKeyDown}
                                />

                                <label className="pt-4 text-lg text-[#717ACF] pl-1">Chores</label>

                                <div className="flex flex-row">
                                    <input className="border-2 border-[#717ACF] rounded p-1 m-1 pr-20" type="text" placeholder="Enter Chore" 
                                        value = {choreInput}
                                        onChange={e => setChoreInput(e.target.value)}
                                    />
                                    <input className="border-2 border-[#717ACF] rounded p-1 m-1 w-27" type="text" placeholder="Time" 
                                        onChange={e => setTimeInput(e.target.value)} 
                                        value={timeInput} 
                                        onKeyDown={choreHandleKeyDown}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center ml-8">
                            <div className="flex flex-col w-96">

                                <label className="text-lg text-[#717ACF] pl-1">Selected</label>
                                <div className="border-2 border-[#717ACF] rounded p-1 m-1 pb-60 flex flex-wrap">
                                    {selectedCourses.map((course,index) => {
                                        if (course.type === 'course'){
                                            return <p key={index} className="bg-violet-600 rounded-2xl text-amber-50 w-fit p-2 m-1 text-center">
                                                    {course.val}
                                                </p>
                                        }
                                        else if (course.type === 'interested'){
                                            return <p key={index} className="bg-blue-600 rounded-2xl text-amber-50 w-fit p-2 m-1 text-center">
                                                    {course.val}
                                                </p>
                                        }
                                        else if (course.type === 'chore'){
                                            return <p key={index} className="bg-gray-300 rounded-2xl text-amber-50 w-fit p-2 m-1 text-center">
                                                    {course.val + " - " + course.time}
                                                </p>
                                        }
                                    })}
                                </div>

                                <div className="flex flex-row justify-center">
                                    <button className="border-0 bg-[#717ACF] p-2 w-40 rounded text-[#ffffff] m-2 shadow-2xl cursor-pointer hover:opacity-50"
                                        onClick={submitStudent}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Form;