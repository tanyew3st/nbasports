import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react';
import { faHome, faPlus, faBook, faBasketball, faPencil, faDollar, faCalendar, faHandshake, faHand } from '@fortawesome/free-solid-svg-icons'

const Query = (props) => {

    const [currentState, setCurrentState] = props.currentState;
    const [teams, setTeams] = useState({});

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
            "icon": faPencil
        }
    }

    useEffect(() => {
        fetch("http://localhost:3000/teamnames")
            .then(response => response.json())
            .then(data => {setTeams(data)});
    }, []);

    return ( 
        <div className="h-full flex flex-col ml-10 mr-10">
            <div>
                <FontAwesomeIcon className="border-black p-4 mt-8 border-2 rounded-full w-child" icon={ params[currentState].icon } size="3x" />
            </div>
            <div className="basis-1/4">
                <p className="text-5xl font-bold mt-16">
                    {params[currentState].title}
                </p>
                <p className="text-2xl mt-4">{params[currentState].subtitle}</p>
            </div>
            <div className="basis-3/4">
                {currentState == "Team" ? 
                    (<div></div>) : 
                    (<div></div>)}
            </div>
        </div>
    )
}

export default Query;