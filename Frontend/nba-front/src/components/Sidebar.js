import React, { Fragment } from 'react';

const Sidebar = (props) => {
    const [currentState, setCurrentState] = props.currentState;
    const options = [
        {
            alias: "Home",
            icon: "fa fa-home",
            color: "text-white"
        },
        {
            alias: "New Query",
            icon: "fa fa-plus",
            color: "text-white"
        },
        {
            alias: "My Queries",
            icon: "fa fa-book",
            color: "text-white"
        },
    ]

    return <Fragment> 
        <div className="bg-gray-800 h-full pt-10 pl-5">
            {options.map((obj) => <div>
                <button className={`text-xl mb-3 ${currentState === obj.alias ? "text-green-400" : obj.color }`}
                onClick={() => setCurrentState(obj.alias)}>
                <i className={obj.icon}></i> {obj.alias}</button>
            </div>)}
        </div>  
    </Fragment>
}

export default Sidebar;