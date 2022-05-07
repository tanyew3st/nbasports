import React, { Fragment, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

const SavedQueries = () => {
    const [queries, setQueries] = useState([]);
    const [strategies, setStrategies] = useState({});
    const [wageStrategies, setWageStrategies] = useState({});

    const [selectedQuery, setSelectedQuery] = useState(-1);

    useEffect(() => {
        if (!localStorage.getItem('username')) {
            window.location.href = "/login";
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"username": localStorage.getItem('username')})
        };

        const strats = {};
        const wageStrats = {};

        fetch('http://localhost:3000/onload')
            .then(response => response.json())
            .then(data => 
                {   
                    for (let obj of data["Bet Strategies"]) {
                        strats[obj["route"]] = {
                            "name": obj["name"],
                            "description": obj["description"],
                        }
                    }
                    
                    for (let obj of data["Wage Strategies"]) {
                        wageStrats[obj["name"]] = {
                            "description": obj["description"],
                        }
                    }

                    setStrategies(strats);
                    setWageStrategies(wageStrats);
                }
            )
            .catch(error => {
                console.log(error);
            })

        fetch('http://localhost:3000/getqueries', requestOptions)
            .then(response => response.json())
            .then(data => 
                {   
                    const query = [];
                    if (Object.keys(data).includes('error')) {
                    } else {
                        for (const dat in data["queriesList"]) {
                            query.push(JSON.parse(data["queriesList"][dat]));
                            query[dat]["Wage Strategy Description"] = 
                                wageStrats[query[dat]["Wage Strategy"]]["description"];
                            query[dat]["Strategy Description"] = 
                                strats[query[dat]["Strategy"]]["description"];  
                            query[dat]["Strategy Name"] = 
                                strats[query[dat]["Strategy"]]["name"];
                            if (Object.keys(query[dat]["Forms"]).length > 0) {
                                for (const form of Object.keys(query[dat]["Forms"])) {
                                    query[dat][form] = query[dat]["Forms"][form];
                                }
                            }
                            delete query[dat]["Forms"];
                        }

                        console.log(query);
                    }

                    setQueries(query);
                }
            )
            .catch(error => {
                console.log(error);
            })
    }, []);

    if (selectedQuery !== -1) {
        console.log(Object.keys(queries[selectedQuery]));
    }

    return <Fragment>
        {/* need reverse mappings and need to be able to  */}
        <div className="h-full flex flex-row">
            <div className="w-1/2 h-full p-6 pr-3 pl-12">
                <div className="w-full h-full border-black border-4 rounded-3xl divide-y divide-black">
                    <div>
                        <p className="text-black text-center font-bold p-2 text-3xl">Query <button onClick={() => {window.location.href = `http://localhost:8000/query/${queries[selectedQuery]["Query"]}`}} className="content-center"><FontAwesomeIcon icon={ faArrowRight }></FontAwesomeIcon></button></p>   
                    </div>
                    {selectedQuery === -1 ? <Fragment>
                        <p className="p-2 text-center font-bold text-lg">Select a Query!</p>
                    </Fragment> : 
                        <div className="p-2">
                            {(Object.keys(queries[selectedQuery]).map((key) => {<p>hello world</p>}))}
                            {(Object.keys(queries[selectedQuery])).map((k, i) => {
                                return <Fragment>
                                    <p className="text-black p-1 pl-2 pr-2 overflow-y-hidden mr-2"><span className="text-green-600 font-bold">{k}</span>: {queries[selectedQuery][k]}</p>
                                </Fragment>
                            })}
                        </div>}
                </div>
            </div>
            <div className="w-1/2 p-6 pl-3 pr-12 overflow-y-scroll">
                {queries.map((_, i) => 
                    <Fragment>
                        <div className="w-full">
                            <button onClick={ () => { selectedQuery === i ? setSelectedQuery(-1) : setSelectedQuery(i) }} 
                                            className={`w-full divide-y divide-black hover:divide-green-400 border-black hover:bg-black hover:text-green-400
                                                        rounded-lg border-2 p-2 m-2 ${selectedQuery === i ? "bg-black text-white divide-white" : ""}`}>
                                            <p className="text-3xl mb-2 font-bold">{queries[i]["Strategy Name"]}</p>
                                            <div>
                                                <p className="pt-2"><span className="font-bold">Wage Strategy:</span>{queries[i]["Wage Strategy"]}</p>
                                                <p className="pt-2"><span className="font-bold">Team:</span>{queries[i]["Team"]}</p>
                                            </div>
                                </button>
                        </div>
                    </Fragment>
                )}
            </div>
        </div>
    </Fragment>
}

export default SavedQueries;