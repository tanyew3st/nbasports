import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect } from 'react';
import { faBasketball } from '@fortawesome/free-solid-svg-icons'

const Query = (props) => {

    const [currentState, setCurrentState] = props.currentState;

    useEffect(() => {
        fetch("http://localhost:3000/teamnames")
            .then((response) => {
                console.log(response.json());
            })
    }, []);

    return (              
        <div className="h-full flex flex-col ml-10 mr-10">
            <div>
                <FontAwesomeIcon className="border-black p-4 mt-8 border-2 rounded-full w-child" icon={ faBasketball } size="3x" />
            </div>
            <div className="basis-1/4">
                <p className="text-5xl font-bold mt-16">Select Your Team</p>
                <p className="text-2xl mt-4">Select your team! This will be the team all the bets and consequential strategies will be done on.</p>
            </div>
            <div className="basis-3/4">
                Bottom
            </div>
        </div>
    )
}

export default Query;