import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react';
import { faArrowRight, faHome, faPlus, faBook, faBasketball, faPencil, faDollar, faCalendar, faHandshake, faHand } from '@fortawesome/free-solid-svg-icons'

const Query = (props) => {

    const [currentState, setCurrentState] = props.currentState;
    const [teams, setTeams] = useState([]);
    const [chosenTeam, setChosenTeam] = useState("");
    const [strategies, setStrategies] = useState([]);
    const [chosenStrategy, setChosenStrategy] = useState("");

    const params = {
        "Team": {
            "title": "Team",
            "subtitle": "Select your team! This will be the team all the bets and consequential strategies will be done on.",
            "icon": faBasketball
        }, 
        "Strategy": {
            "title": "Betting Strategy",
            "subtitle": "This is the betting strategy that will be used to determine which games the simulator bets on!",
            "icon": faHandshake
        }, 
        "Form": {
            "title": "Additional Form",
            "subtitle": "Your strategy requires the following additional forms. These will be used to fine tune when we bet and do not bet.",
            "icon": faPencil
        },
        "Wage": {
            "title": "Wage",
            "subtitle": "Select the wage strategy that will be used to determine which games the simulator runs.",
            "icon": faDollar
        },
        "Date": {
            "title": "Date",
            "subtitle": "Select the dates through which the simulator will run your bets!",
            "icon": faCalendar
        }
    }
    
    useEffect(() => {
        fetch("http://localhost:3000/teamnames")
            .then(response => response.json())
            .then(data => {
                setTeams(data.results);
            });
        fetch("http://localhost:3000/onload")
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setStrategies(data);
            });
    }, []);

    return ( 
        <div className="h-full flex flex-col ml-10 mr-10">
            <div>
                <FontAwesomeIcon 
                    className="border-black p-4 mt-8 border-2 rounded-full w-child hover:text-green-400" 
                    icon={ params[currentState].icon } size="3x" />
            </div>
            <div className="basis-1/4">
                <p className="text-5xl font-bold mt-16">
                    {params[currentState].title}
                </p>
                <p className="text-2xl mt-4">{params[currentState].subtitle}</p>
            </div>
            <div className="basis-3/4 mt-4">
                {currentState == "Team" ? 
                    (<div>
                        <div className="flex flex-wrap">
                            {teams.map((team => (
                                <div>
                                    {team.Nickname != chosenTeam ? 
                                        (<button onClick={ () => { setChosenTeam(team.Nickname) }} className="border-black rounded-lg border-2 p-2 m-2">
                                            <p className="hover:font-bold">{team.Fullname}</p>
                                        </button>) :
                                        (<button onClick={ () => { setChosenTeam("") }} className="border-black bg-black rounded-lg border-2 p-2 m-2">
                                            <p className="hover:font-bold text-green-400">{team.Fullname}</p>
                                        </button>)
                                    }   
                                </div>
                            )))}
                        </div>      
                    <br></br>
                    {chosenTeam !== "" ? <button onClick={ () => setCurrentState("Strategy")}
                        className={`border-green-400 bg-green-400 border-2 m-2 mb-6 p-2 rounded-lg 
                            text-white hover:bg-white hover:text-green-400`}>Next Step <FontAwesomeIcon icon={ faArrowRight } ></FontAwesomeIcon></button> : ""}
                    </div>
                    ) : currentState == "Strategy" ?
                        (<div>
                            <div className="flex flex-wrap">
                                {strategies.map((strategy => 
                                    (<div>
                                        <button onClick={ () => { setChosenTeam(strategy) }} className="border-black rounded-lg border-2 p-2 m-2">
                                            <p className="text-3xl font-bold hover:font-bold">{strategy["name"]}</p>
                                            <p>{strategy["description"]}</p>
                                        </button>
                                    </div>)
                                ))}
                            </div>
                        </div>) : 
                        (<div></div>)
                    }
            </div>
        </div>
    )
}

export default Query;