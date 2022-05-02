import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.js";
import Query from "./Query.js";

const Results = (props) => {
    const query = window.location.href.split('query/')[1];
    const [results, setResults] = useState([{"unkown": ""}]);
    
    useEffect(() => {
        fetch("http://localhost:3000/" + query)
            .then(results => results.json())
            .then(data => {setResults(data.results)})
    }, [query])

    return (<div>
        <div className="flex flex-row h-screen overflow-y-scroll">
            <div className="basis-1/4 h-full">
                <Sidebar currentState={props.currentState}>
                </Sidebar>
            </div>
            <div className="basis-3/4 h-screen overflow-y-scroll">
                <table className="overflow-x-scroll m-4">
                    <thead>
                        <tr>{Object.keys(results[0]).map(key => <th>{key}</th>)}</tr>
                    </thead>
                    <tbody>
                        {results.map(result => 
                        <tr>
                            {Object.keys(result).map(key => 
                            <td>
                                {result[key]}
                            </td>)}
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    </div>)
}

export default Results