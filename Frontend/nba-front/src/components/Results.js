import { useEffect, useState, Fragment } from "react";
import Sidebar from "./Sidebar.js";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import queryString from "query-string";

const Results = (props) => {
  const query = window.location.href.split("query/")[1];
  const [results, setResults] = useState([{ unkown: "" }]);
  const [view, setView] = useState("table");
  const [hideWins, setHideWins] = useState(false);
  const [hideLosses, setHideLosses] = useState(false);
  const [money, setMoney] = useState([]);
  const [num, setNum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationNumber, setAnimationNumber] = useState(0);
  const [finalWinnings, setFinalWinnings] = useState(0);
  const [currentState, setCurrentState] = props.currentState;
  const [saved, setSaved] = useState(false);

  const { REACT_APP_BACKEND_URL } = process.env;

  let inter;

  const saveQuery = () => {
    if (!localStorage.getItem("username")) {
      window.location.href = "/login";
    }

    const beg = window.location.href.split("query/")[1];
    const finalStrategy = beg.split("?")[0];
    const [_, ending] = window.location.href.split("?");
    let params = queryString.parse(ending);
    const newObj = {};
    newObj["Wage Strategy"] = params["betType"];
    delete params["betType"];
    newObj["End Date"] = params["end"];
    delete params["end"];
    newObj["Start Date"] = params["start"];
    delete params["start"];
    newObj["Wager"] = params["wager"];
    delete params["wager"];
    newObj["Team"] = params["team"];
    delete params["team"];
    newObj["Forms"] = params;
    newObj["Strategy"] = finalStrategy;
    newObj["Final Winnings"] = finalWinnings;
    newObj["Query"] = beg;

    if (!localStorage.getItem("username")) {
      window.location.href = "/login";
    }

    const postObj = {
      query: JSON.stringify(newObj),
      username: localStorage.getItem("username"),
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postObj),
    };

    fetch(`${REACT_APP_BACKEND_URL}/savequery`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (Object.keys(data).includes("error")) {
          alert("There was an error");
        } else {
        }

        setSaved(true);
      })
      .catch((error) => {
        alert("error");
      });
  };

  const stepTowards = (finalWinnings) => {
    setAnimationNumber((prev) => {
      if (
        (prev >= finalWinnings && finalWinnings >= 0) ||
        (prev <= finalWinnings && finalWinnings < 0)
      ) {
        clearInterval(inter);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
        return finalWinnings;
      } else {
        return prev + finalWinnings / 500;
      }
    });
  };

  let config = {
    labels: num,
    legend: false,
    datasets: [
      {
        label: "Total Winnings",
        data: money,
        fill: true,
        borderColor: "black",
        pointBackgroundColor: function (context) {
          var index = context.dataIndex;
          return results[index]["Win"] === "W"
            ? "rgb(74 222 128)"
            : "rgb(0,0,0)";
        },
        pointClass: "animate-pulse",
      },
    ],
  };

  const keys = [
    "Index",
    "Date",
    "Home",
    "Home Odds",
    "Away",
    "Away Odds",
    "Win",
    "Team Bet On",
    "Wager",
    "Winnings",
    "Total Winnings",
  ];

  useEffect(() => {
    fetch(REACT_APP_BACKEND_URL + "/" + query)
      .then((results) => results.json())
      .then((data) => {
        const money = [];
        const num = [];
        let i = 1;

        if (!data.results || data.results.length === 0) {
          alert("No Games Returned!");
          window.location.href = "/newquery";
          return;
        }

        const finalWinnings =
          data.results[data.results.length - 1]["totalwinnings"];
        setFinalWinnings(finalWinnings);
        setResults(data.results);
        for (const result of data.results) {
          money.push(result["totalwinnings"]);
          num.push(i);
          i++;
        }
        setMoney(money);
        setNum(num);
        inter = setInterval(() => {
          stepTowards(finalWinnings);
        }, 10);
      });
  }, [query]);

  return (
    <div>
      {loading ? (
        <div className="bg-black h-screen w-screen content-center">
          <h1
            className={`text-green-400 text-6xl font-bold text-center h-screen justify-content-center p-96`}
          >
            ${animationNumber.toFixed(3)}
          </h1>
        </div>
      ) : (
        <div className="flex flex-row h-screen overflow-y-scroll">
          <div className="basis-1/4 h-full">
            <Sidebar currentState={props.currentState}></Sidebar>
          </div>
          <div className="basis-3/4 h-full overflow-y-scroll">
            <div className="h-3/12 mb-8">
              <p className="text-5xl text-center font-bold m-10">Results</p>
              <div className="flex flex-row">
                <div className="ml-4 w-1/2">
                  <button
                    onClick={() => setView("table")}
                    className={`border-black border-2 text-xl w-full rounded-l-lg ${
                      view === "table" ? "bg-black text-green-400" : ""
                    }`}
                  >
                    Table
                  </button>
                </div>
                <div className="mr-4 w-1/2">
                  <button
                    onClick={() => {
                      setView("graph");
                    }}
                    className={`border-black border-2 text-xl w-full rounded-r-lg ${
                      view === "graph" ? "bg-black text-green-400" : ""
                    }`}
                  >
                    Graph
                  </button>
                </div>
              </div>
              <div className="flex flex-row mt-5">
                <div className="ml-4 w-1/2">
                  <button
                    onClick={() =>
                      setHideWins((prev) => {
                        return !prev;
                      })
                    }
                    className={`border-black border-2 text-xl w-full rounded-l-lg ${
                      hideWins ? "bg-black text-green-400" : ""
                    }`}
                  >
                    Hide Wins
                  </button>
                </div>
                <div className="mr-4 w-1/2">
                  <button
                    onClick={() =>
                      setHideLosses((prev) => {
                        return !prev;
                      })
                    }
                    className={`border-black border-2 text-xl w-full rounded-r-lg ${
                      hideLosses ? "bg-black text-green-400" : ""
                    }`}
                  >
                    Hide Losses
                  </button>
                </div>
              </div>
              <div className="flex flex-row mt-5">
                <div className="ml-4 w-1/2">
                  <Link to="/newquery">
                    <button
                      onClick={() => setCurrentState("Team")}
                      className={`border-black border-2 text-xl w-full rounded-l-lg hover:bg-black hover:text-green-400`}
                    >
                      New Query{" "}
                    </button>
                  </Link>
                </div>
                <div className="mr-4 w-1/2">
                  {!saved ? (
                    <button
                      onClick={saveQuery}
                      className={`border-black border-2 text-xl w-full rounded-r-lg hover:bg-black hover:text-green-400`}
                    >
                      Save Query
                    </button>
                  ) : (
                    <button
                      className={`border-black border-2 text-xl w-full rounded-r-lg hover:bg-black hover:text-green-400`}
                    >
                      Saved!
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="basis-1/2 m-4">
              {view === "table" ? (
                <table className="overflow-x-scroll table-fixed width-screen">
                  <thead>
                    <tr>
                      {keys.map((key) => (
                        <th className="border-black border-2 p-2">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, i) => (
                      <Fragment>
                        {(result["Win"] === "W" && !hideWins) ||
                        (result["Win"] === "L" && !hideLosses) ? (
                          <tr
                            className={`overflow-y-scroll border-black border-2 ${
                              result["Win"] === "W"
                                ? "bg-green-100"
                                : "bg-white"
                            }`}
                          >
                            <td className="border-black border-2 p-2 text-center">
                              {i + 1}
                            </td>
                            {/* <td className="border-black border-2 p-2 text-center">{result["GameID"]}</td> */}
                            <td className="border-black border-2 p-2 text-center">
                              {result["Date"]}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["Home"]}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["HomeOdds"]}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["Away"]}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["AwayOdds"]}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["Win"]}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["Bet"]}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["wager"]}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["amountwon"].toFixed(3)}
                            </td>
                            <td className="border-black border-2 p-2 text-center">
                              {result["totalwinnings"].toFixed(3)}
                            </td>
                          </tr>
                        ) : (
                          <tr></tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>
                  <Line data={config} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
