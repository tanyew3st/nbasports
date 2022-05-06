import Sidebar from './Sidebar.js'
import Query from './Query.js'
import Home from './Home.js'
import Login from './Login.js'
import SavedQueries from './SavedQueries.js'
import React, { Fragment, useState } from 'react'


const Container = (props) => {

    // this is going to have all the logic
    const [currentState, setCurrentState] = props.currentState;

    return <Fragment>
        <div className="flex flex-row h-screen overflow-y-scroll">
            <div className="basis-1/4 h-full">
                <Sidebar currentState={[currentState, setCurrentState]}>
                </Sidebar>
            </div>
            <div className="basis-3/4 h-screen overflow-y-scroll">
                {currentState === "newquery" || currentState === "Team" || currentState === "Strategy" || currentState === "Wage" || currentState === "Form" || currentState === "Date" ? 
                    <Query currentState={[currentState, setCurrentState]}></Query>
                : (currentState === "Home" ? <Home currentState={[currentState, setCurrentState]}></Home> : <Fragment>{
                    currentState === "Login" ? <Login currentState={[currentState, setCurrentState]}></Login> : 
                    <Fragment>{currentState === "Queries" ? <SavedQueries currentState={[currentState, setCurrentState]}></SavedQueries> : <Fragment></Fragment>}</Fragment>}</Fragment>)} 
            </div>
        </div>
    </Fragment>;
}

export default Container;