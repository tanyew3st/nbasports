import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faPlus, faBook, faBasketball, faPencil, faDollar, faCalendar, faHandshake } from '@fortawesome/free-solid-svg-icons'

const Sidebar = (props) => {
    const [currentState, setCurrentState] = props.currentState;
    const options = [
        {
            alias: "Home",
            name: "Home",
            icon: faHome,
            color: "text-white",
            href: "home"
        },
        {
            alias: "New Query",
            name: "New Query",
            icon: faPlus,
            color: "text-white",
            href: "newquery"
        },
        {
            alias: "My Queries",
            name: "My Queries",
            icon: faBook,
            color: "text-white"
        },
        {
            alias: "Team",
            name: "Team",
            icon: faBasketball,
            color: "text-gray-300"
        },
        {
            alias: "Strategy",
            name: "Strategy",
            icon: faHandshake,
            color: "text-gray-300"
        },
        {
            alias: "Form",
            name: "Form",
            icon: faPencil,
            color: "text-gray-300"
        },
        {
            alias: "Wage",
            name: "Wage",
            icon: faDollar,
            color: "text-gray-300"
        },
        {
            alias: "Date",
            name: "Date",
            icon: faCalendar,
            color: "text-gray-300"
        },
    ]

    return <Fragment> 
        <div className="bg-gray-800 h-full pt-10 pl-5">
            {options.map((obj) => <div>
                <button className={`text-xl mb-3 ${currentState === obj.alias ? "text-green-400" : obj.color }`}
                onClick={() => {
                    setCurrentState(obj.alias);

                }}>
                <FontAwesomeIcon icon={ obj.icon } /> { obj.alias }</button>
            </div>)}
        </div>  
    </Fragment>
}

export default Sidebar;