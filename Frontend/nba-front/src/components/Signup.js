import { faUser, faDoorOpen, faLock, fa1, fa2, faPencil, faShoppingBag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'

const Signup = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [incorrect, setIncorrect] = useState("");
    const [currentState, setCurrentState] = props.currentState;

    const submitInfo = () => {
        console.log("submitting info");
    }

    return <Fragment>
        <div className="h-full flex flex-col ml-10 mr-10">
            <div>
                <FontAwesomeIcon 
                    className={`border-black p-4 mt-8 border-2 rounded-full w-child ${incorrect ? "text-red-700 animate-pulse" : "hover:text-green-400"} `} 
                    icon={ faPencil } size="3x" />
            </div>
            <div className="basis-1/4">
                <p className="text-5xl font-bold mt-16">
                    Sign Up
                </p>
                <p onClick={() => setCurrentState("Login")} className="text-2xl mt-4">Enter the below information to create an account with us. Already have an account? <span className="underline-offset-4 underline text-green-400 hover:text-gray-800"><Link to="/login"> Log in!</Link></span></p>
            </div>
            <div className="basis-3/4 mt-4">
                <div className="mb-2 mt-5">
                    <p className="font-bold text-2xl mb-4">First Name</p>
                    <label className="relative block">
                        <span className="sr-only">First Name</span>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FontAwesomeIcon icon={ fa1 }></FontAwesomeIcon>
                        </span>
                        <input id="fname" value={fname} onChange={(event) => setFname(event.target.value)} className="placeholder:italic placeholder:text-black block bg-white w-full border border-black rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1 sm:text-sm" placeholder="Johnny" type="text" name="fname"/>
                    </label>                                        
                </div>
                <div className="mb-2 mt-5">
                    <p className="font-bold text-2xl mb-4">Last Name</p>
                    <label className="relative block">
                        <span className="sr-only">Last Name</span>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FontAwesomeIcon icon={ fa2 }></FontAwesomeIcon>
                        </span>
                        <input id="lname" value={lname} onChange={(event) => setLname(event.target.value)} className="placeholder:italic placeholder:text-black block bg-white w-full border border-black rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1 sm:text-sm" placeholder="Appleseed" type="text" name="lname"/>
                    </label>                                        
                </div>
                <div className="mb-2 mt-5">
                    <p className="font-bold text-2xl mb-4">Username</p>
                    <label className="relative block">
                        <span className="sr-only">Username</span>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FontAwesomeIcon icon={ faUser }></FontAwesomeIcon>
                        </span>
                        <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} className="placeholder:italic placeholder:text-black block bg-white w-full border border-black rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1 sm:text-sm" placeholder="johnnya_123" type="text" name="username"/>
                    </label>                                        
                </div>
                <div className="mb-2 mt-5">
                    <p className="font-bold text-2xl mb-4">Password</p>
                    <label className="relative block">
                        <span className="sr-only">Password</span>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <FontAwesomeIcon icon={ faLock }></FontAwesomeIcon>
                        </span>
                        <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} className="placeholder:italic placeholder:text-black block bg-white w-full border border-black rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1 sm:text-sm" placeholder="xyzabcd" type="password" name="password"/>
                    </label>                                        
                </div>
                <div className="w-full mt-9 mb-9">
                    <button onClick={submitInfo} className="p-1 w-full text-xl border-2 border-black hover:text-green-400 hover:bg-white bg-green-400 hover:border-green-400 rounded-lg"><FontAwesomeIcon icon={ faShoppingBag }></FontAwesomeIcon> Sign Up</button>
                </div>  
        </div>
    </div>
    </Fragment>
}

export default Signup;