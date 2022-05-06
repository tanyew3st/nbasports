import React, { Fragment, useEffect, useState } from 'react';

const SavedQueries = () => {
    const [queries, setQueries] = useState([]);
    const [strategies, setStrategies] = useState({});
    const [wageStrategies, setWageStrategies] = useState({});

    const [selectedQuery, setSelectedQuery] = useState({});

    useEffect(() => {
        if (!localStorage.getItem('username')) {
            window.location.href = "/login";
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"username": localStorage.getItem('username')})
        };

        fetch('http://localhost:3000/onload')
            .then(response => response.json())
            .then(data => 
                {   
                    const strats = {};
                    for (let obj of data["Bet Strategies"]) {
                        strats[obj["route"]] = {
                            "name": obj["name"],
                            "description": obj["description"],
                        }
                    }
                    
                    const wageStrats = {};
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
                        console.log(data);
                    } else {
                        for (const dat in data["queriesList"]) {
                            query.push(JSON.parse(data["queriesList"][dat]));
                            console.log(query[dat]["Strategy"])
                            // console.log(wageStrategies[query[dat]["Wage Strategy"]]);
                            query[dat]["Wage Strategy Description"] = 
                                wageStrategies[query[dat]["Wage Strategy"]]["description"]
                            query[dat]["Strategy Description"] = 
                                strategies[query[dat]["Strategy"]]["description"]   
                            query[dat]["Strategy Name"] = 
                                strategies[query[dat]["Strategy"]]["name"]   
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

    return <Fragment>
        {/* need reverse mappings and need to be able to  */}
        <div className="h-full flex flex-row">
            <div className="w-1/2 h-full p-12">
                <div className="w-full h-full border-black border-4 rounded-3xl divide-y divide-black">
                    <div>
                        <p className="text-black text-center font-bold p-2 text-3xl">Query</p>   
                    </div>
                    <div>

                    </div>
                </div>
            </div>
            <div className="w-1/2 p-12">
                {queries.map((query, i) => 
                    <Fragment>
                        {i}
                    </Fragment>
                )}
            </div>
        </div>
    </Fragment>
}

export default SavedQueries;