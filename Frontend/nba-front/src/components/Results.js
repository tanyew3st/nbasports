import { useEffect, useState } from "react";

const Results = () => {
    const query = window.location.href.split('query/')[1];
    const [results, setResults] = useState([]);
    
    useEffect(() => {
        fetch("http://localhost:3000/" + query)
            .then(results => results.json())
            .then(data => {setResults(data.results)})
    }, [query])
    return <div></div>
}

export default Results