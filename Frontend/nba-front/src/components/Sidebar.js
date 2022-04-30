import React, { Fragment } from 'react';

const Sidebar = (props) => {
    const [currentState, setCurrentState] = props.currentState;

    return <Fragment> 
        <div className="bg-gray-800 h-full pt-10 pl-5">
            <p className="text-white text-xl mb-3" 
                onClick={setCurrentState('Home')}>
                <i className="fa fa-home"></i> Home</p>
            <p className="text-white text-xl mb-3" 
                onClick={setCurrentState('New Query')}>
                <i className="fa fa-plus"></i> New Query</p>
            <p className="text-white text-xl" 
                onClick={setCurrentState('My Queries')}>
                <i className="fa fa-book"></i> My Queries</p>
        </div>  
    </Fragment>
}

export default Sidebar;