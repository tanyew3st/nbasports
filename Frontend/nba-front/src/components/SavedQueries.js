import React from 'react';

const SavedQueries = () => {
    useEffect(() => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"username": localStorage.getItem('username')})
        };

        fetch('http://localhost:3000/getqueries', requestOptions)
            .then(response => response.json())
            .then(data => 
                {
                    if (Object.keys(data).includes('error')) {
                        console.log(data);
                    } else {
                        console.log(data);
                        // window.location.href = "/login?success=true";
                    }
                }
            )
            .catch(error => {
                console.log("error");
            })
    }, []);

    return <Fragment>
        <div>
            <div className="w-1/2">

            </div>
            <div className="w-1/2">

            </div>
        </div>
    </Fragment>
}