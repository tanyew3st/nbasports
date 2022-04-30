import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faPlus, faBook, faBasketball, faPencil } from '@fortawesome/free-solid-svg-icons'

const Sidebar = (props) => {
    const [currentState, setCurrentState] = props.currentState;
    const options = [
        {
            alias: "Home",
            icon: faHome,
            color: "text-white"
        },
        {
            alias: "New Query",
            icon: faPlus,
            color: "text-white"
        },
        {
            alias: "My Queries",
            icon: faBook,
            color: "text-white"
        },
        {
            alias: "Team",
            icon: faBasketball,
            color: "text-gray-100"
        },
    ]

    return <Fragment> 
        <div className="bg-gray-800 h-full pt-10 pl-5">
            {options.map((obj) => <div>
                <button className={`text-xl mb-3 ${currentState === obj.alias ? "text-green-400" : obj.color }`}
                onClick={() => setCurrentState(obj.alias)}>
                <FontAwesomeIcon icon={ obj.icon } /> { obj.alias }</button>
            </div>)}
        </div>  
    </Fragment>
}

export default Sidebar;