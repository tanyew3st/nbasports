import { faUser, faSearch, faLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    return <div className="h-full flex flex-col ml-10 mr-10">
            <div>
                <FontAwesomeIcon 
                    className="border-black p-4 mt-8 border-2 rounded-full w-child hover:text-green-400" 
                    icon={ faUser } size="3x" />
            </div>
            <div className="basis-1/4">
                <p className="text-5xl font-bold mt-16">
                    Login
                </p>
                <p className="text-2xl mt-4">Enter your username and password to see your saved queries. No account? <span className="underline-offset-4 underline text-green-400 hover:text-gray-800">Sign up!</span></p>
            </div>
            <div className="basis-3/4 mt-4">
                <div className="mb-2 mt-5">
                    <p className="font-bold text-2xl mb-4">Username</p>
                    <label className="relative block">
                        <span className="sr-only">Username</span>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                            <FontAwesomeIcon icon={ faUser }></FontAwesomeIcon>
                        </span>
                        <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} className="placeholder:italic placeholder:text-black block bg-white w-full border border-black rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1 sm:text-sm" placeholder="johnnya_123" type="text" name="username"/>
                    </label>                                        
                </div>
                <div className="mb-2 mt-5">
                    <p className="font-bold text-2xl mb-4">Password</p>
                    <label className="relative block">
                        <span className="sr-only">Password</span>
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                            <FontAwesomeIcon icon={ faLock }></FontAwesomeIcon>
                        </span>
                        <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} className="placeholder:italic placeholder:text-black block bg-white w-full border border-black rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1 sm:text-sm" placeholder="xyzabcd" type="text" name="password"/>
                    </label>                                        
                </div>
        </div>
    </div>

}

export default Login;