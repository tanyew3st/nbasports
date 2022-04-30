import Sidebar from './Sidebar.js'
import Query from './Query.js'
import React, { Fragment, useState } from 'react'


const Container = () => {

    // this is going to have all the logic
    const [currentState, setCurrentState] = useState('Team');

    return <Fragment>
        <div className="flex flex-row h-full">
            <div className="basis-1/4 h-full">
                <Sidebar currentState={[currentState, setCurrentState]}>
                </Sidebar>
            </div>
            <div className="basis-3/4 h-full">
                <Query currentState={[currentState, setCurrentState]}></Query>
            </div>
        </div>
    </Fragment>;
}

export default Container;