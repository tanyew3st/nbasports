import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import {
  faArrowRight,
  faHome,
  faPlus,
  faAward,
  faBook,
  faArrowLeft,
  faSearch,
  faBasketball,
  faPencil,
  faDollar,
  faCalendar,
  faHandshake,
  faHand,
} from "@fortawesome/free-solid-svg-icons";

const Query = (props) => {
  const [currentState, setCurrentState] = props.currentState;
  const [teams, setTeams] = useState([]);
  const [chosenTeam, setChosenTeam] = useState("");
  const [strategies, setStrategies] = useState([]);
  const [wageStrategies, setWageStrategies] = useState([]);
  const [wager, setWager] = useState(0);
  const [chosenWageStrategy, setChosenWageStrategy] = useState([]);
  const [chosenStrategy, setChosenStrategy] = useState({});
  const [players, setPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [startDate, setStartDate] = useState("2012-10-30");
  const [endDate, setEndDate] = useState("2019-04-10");

  const [formData, setFormData] = useState({});

  const { REACT_APP_BACKEND_URL } = process.env;

  const params = {
    Team: {
      title: "Team",
      subtitle:
        "Select your team! This will be the team all the bets and consequential strategies will be done on.",
      icon: faBasketball,
    },
    Strategy: {
      title: "Betting Strategy",
      subtitle:
        "This is the betting strategy that will be used to determine which games the simulator bets on!",
      icon: faHandshake,
    },
    Form: {
      title: "Additional Form",
      subtitle:
        "Your strategy requires the following additional forms. These will be used to fine tune when we bet and do not bet.",
      icon: faPencil,
    },
    Wage: {
      title: "Wage",
      subtitle:
        "Select the wage strategy that will be used to determine which games the simulator runs.",
      icon: faDollar,
    },
    Date: {
      title: "Date",
      subtitle:
        "Select the dates through which the simulator will run your bets!",
      icon: faCalendar,
    },
  };

  const handlePlayerChange = (event) => {
    setPlayerSearch(event.target.value.toLowerCase());
  };

  const runQuery = () => {
    let location = "";
    location += chosenStrategy["route"];
    location += "?team=";
    location += chosenTeam;
    location += "&wager=" + wager;
    location += "&start=" + startDate;
    location += "&end=" + endDate;
    location += "&betType=" + chosenWageStrategy["name"];
    for (const form of Object.keys(formData)) {
      location += "&" + form + `=${formData[form]}`;
    }
    window.location.href = "/query/" + location;
  };

  const findFields = () => {
    // also want to initialize the formData object

    if (Object.values(chosenStrategy.form).includes("player")) {
      fetch(`${REACT_APP_BACKEND_URL}/playersonteam?team=` + chosenTeam)
        .then((response) => response.json())
        .then((data) => {
          setPlayers(data.results);
        });
    }

    const f = {};
    for (const form of Object.keys(chosenStrategy.form)) {
      chosenStrategy.form[form] === "integer"
        ? (f[form] = 0)
        : chosenStrategy.form[form] === "odds"
        ? (f[form] = -100)
        : (f[form] = "");
      if (chosenStrategy.form[form] === "player") {
        f[form] = players[0]["PlayerName"];
      }
    }
    setFormData(f);
  };

  useEffect(() => {
    fetch(`${REACT_APP_BACKEND_URL}/teamnames`)
      .then((response) => response.json())
      .then((data) => {
        setTeams(data.results);
      });
    fetch(`${REACT_APP_BACKEND_URL}/onload`)
      .then((response) => response.json())
      .then((data) => {
        setStrategies(data["Bet Strategies"]);
        setWageStrategies(data["Wage Strategies"]);
      });
  }, []);

  return (
    <div className="h-full flex flex-col ml-10 mr-10">
      <div>
        <FontAwesomeIcon
          className="border-black p-4 mt-8 border-2 rounded-full w-child hover:text-green-400"
          icon={params[currentState].icon}
          size="3x"
        />
      </div>
      <div className="basis-1/4">
        <p className="text-5xl font-bold mt-16">{params[currentState].title}</p>
        <p className="text-2xl mt-4">{params[currentState].subtitle}</p>
      </div>
      <div className="basis-3/4 mt-4">
        {currentState === "Team" ? (
          <div>
            <div className="flex flex-wrap">
              {teams.map((team) => (
                <div>
                  {team.Nickname != chosenTeam ? (
                    <button
                      onClick={() => {
                        setChosenTeam(team.Nickname);
                      }}
                      className="border-black rounded-lg border-2 p-2 m-2"
                    >
                      <p className="hover:font-bold">{team.Fullname}</p>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setChosenTeam("");
                      }}
                      className="border-black bg-black rounded-lg border-2 p-2 m-2"
                    >
                      <p className="hover:font-bold text-green-400">
                        {team.Fullname}
                      </p>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <br></br>
            {chosenTeam !== "" ? (
              <button
                onClick={() => setCurrentState("Strategy")}
                className={`border-green-400 bg-green-400 border-2 m-2 mb-6 p-2 rounded-lg 
                            text-white hover:bg-white hover:text-green-400`}
              >
                Next Step: Strategy{" "}
                <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
              </button>
            ) : (
              ""
            )}
          </div>
        ) : currentState === "Strategy" ? (
          <div>
            <div className="flex flex-wrap">
              {strategies.map((strategy) => (
                <div>
                  <button
                    onClick={() => {
                      strategy["name"] === chosenStrategy["name"]
                        ? setChosenStrategy("")
                        : setChosenStrategy(strategy);
                    }}
                    className={`divide-y divide-black hover:divide-green-400 border-black hover:bg-black hover:text-green-400
                                                        rounded-lg border-2 p-2 m-2 ${
                                                          strategy["name"] ===
                                                          chosenStrategy["name"]
                                                            ? "bg-black text-white divide-white"
                                                            : ""
                                                        }`}
                  >
                    <p className="text-3xl mb-2 font-bold">
                      {strategy["name"]}
                    </p>
                    <p className="pt-2">{strategy["description"]}</p>
                  </button>
                  <br></br>
                </div>
              ))}
              <div className="flex flex-row space-x-4 mt-4">
                <button
                  onClick={() => {
                    setCurrentState("Team");
                  }}
                  className={`border-green-400 bg-green-400 border-2 mt-2 mb-6 p-2 rounded-lg 
                                        text-white hover:bg-white hover:text-green-400`}
                >
                  <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>{" "}
                  Previous Step: Teams
                </button>
                {Object.keys(chosenStrategy).length !== 0 ? (
                  <button
                    onClick={() => {
                      setCurrentState("Form");
                      findFields();
                    }}
                    className={`border-green-400 bg-green-400 border-2 m-2 mb-6 p-2 rounded-lg 
                                        text-white hover:bg-white hover:text-green-400`}
                  >
                    Next Step: Forms{" "}
                    <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
                  </button>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        ) : currentState === "Form" ? (
          <div className="mt-4">
            {Object.keys(chosenStrategy.form).map((f) => (
              <div>
                {chosenStrategy.form[f] === "player" ? (
                  <div className="mb-2">
                    <p className="font-bold text-3xl mb-4">{f}</p>
                    <label className="relative block">
                      <span className="sr-only">Search</span>
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
                      </span>
                      <input
                        id="player_search"
                        value={playerSearch}
                        onChange={handlePlayerChange}
                        className="placeholder:italic placeholder:text-black block bg-white w-full border border-black rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-green-400 focus:ring-green-400 focus:ring-1 sm:text-sm"
                        placeholder="Search Players"
                        type="text"
                        name="search"
                      />
                    </label>
                    <div>
                      <div className="flex mt-5 flex-wrap h-32 overflow-x-scroll border-green-400 border-2 p-2">
                        {players.map((player) => (
                          <div>
                            {player["PlayerName"]
                              .toLowerCase()
                              .includes(playerSearch.toLowerCase()) ? (
                              <button
                                onClick={() => {
                                  const prev = { ...formData };
                                  prev[f] = player["PlayerName"];
                                  setFormData(prev);
                                }}
                              >
                                <p
                                  className={`m-1 border-black rounded-md p-1 border-2 hover:font-bold ${
                                    formData[f] === player["PlayerName"]
                                      ? "text-green-400 bg-black"
                                      : ""
                                  }`}
                                >
                                  {player["PlayerName"]}
                                </p>
                              </button>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {chosenStrategy.form[f] === "integer" ? (
                      <div>
                        {/* if the chosen strategy is an integer field */}
                        <div className="mt-5">
                          <p className="font-bold text-3xl mb-4">{f}</p>
                          <div class="relative pt-1">
                            <input
                              type="range"
                              class="form-range
                                        text-green-400
                                        w-full
                                        accent-green-400
                                        border-none
                                        range-primary-green-400
                                        h-6
                                        p-0
                                        focus:outline-none focus:ring-0 focus:shadow-none
                                        "
                              id="customRange1"
                              value={formData[f]}
                              onChange={(event) => {
                                setFormData((prev) => {
                                  const newFormData = { ...prev };
                                  newFormData[f] = event.target.value;
                                  return newFormData;
                                });
                              }}
                              min={0}
                              max={150}
                              step={1}
                            />
                            <ul class="flex justify-between w-full">
                              <li class="flex justify-center relative font-bold text-xl ml-2">
                                <span class="absolute">0</span>
                              </li>
                              <li class="animate-pulse flex justify-center relative font-bold text-xl">
                                Current: {formData[f]}
                              </li>
                              <li class="flex justify-center relative font-bold text-xl mr-2">
                                <span class="absolute">150</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div>
                          {/* if the chosen strategy is an integer field */}
                          <div className="mt-5">
                            <p className="font-bold text-3xl mb-4">{f}</p>
                            <div class="relative pt-1">
                              <input
                                type="range"
                                class="form-range
                                            text-green-400
                                            w-full
                                            accent-green-400
                                            border-none
                                            range-primary-green-400
                                            h-6
                                            p-0
                                            focus:outline-none focus:ring-0 focus:shadow-none
                                            "
                                id="customRange1"
                                value={formData[f]}
                                onChange={(event) => {
                                  setFormData((prev) => {
                                    const newFormData = { ...prev };
                                    newFormData[f] = event.target.value;
                                    return newFormData;
                                  });
                                }}
                                min={-1000}
                                max={-100}
                                step={5}
                              />
                              <ul class="flex justify-between w-full pr-5 pl-5">
                                <li class="flex justify-center relative font-bold text-xl ml-2">
                                  <span class="absolute">-1000</span>
                                </li>
                                <li class="flex justify-center relative font-bold text-xl ml-2">
                                  <span class="absolute">-775</span>
                                </li>
                                <li class="animate-pulse flex justify-center relative font-bold text-xl">
                                  Current: {formData[f]}
                                </li>
                                <li class="flex justify-center relative font-bold text-xl mr-2">
                                  <span class="absolute">-325</span>
                                </li>
                                <li class="flex justify-center relative font-bold text-xl mr-2">
                                  <span class="absolute">-100</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-row space-x-4 mt-6">
              <button
                onClick={() => {
                  setCurrentState("Strategy");
                }}
                className={`border-green-400 bg-green-400 border-2 mt-2 mb-6 p-2 rounded-lg 
                                        text-white hover:bg-white hover:text-green-400`}
              >
                <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon> Previous
                Step: Strategy
              </button>
              {true ? (
                <button
                  onClick={() => {
                    setCurrentState("Wage");
                  }}
                  className={`border-green-400 bg-green-400 border-2 m-2 mb-6 p-2 rounded-lg 
                                        text-white hover:bg-white hover:text-green-400`}
                >
                  Next Step: Wage{" "}
                  <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          <div>
            {currentState === "Wage" ? (
              <div>
                <div className="flex flex-wrap">
                  {wageStrategies.map((strategy) => (
                    <div className="w-full">
                      <button
                        onClick={() => {
                          strategy["name"] === chosenWageStrategy["name"]
                            ? setChosenStrategy("")
                            : setChosenWageStrategy(strategy);
                        }}
                        className={`w-full divide-y divide-black hover:divide-green-400 border-black hover:bg-black hover:text-green-400
                                                        rounded-lg border-2 p-2 m-2 ${
                                                          strategy["name"] ===
                                                          chosenWageStrategy[
                                                            "name"
                                                          ]
                                                            ? "bg-black text-white divide-white"
                                                            : ""
                                                        }`}
                      >
                        <p className="text-3xl mb-2 font-bold">
                          {strategy["name"]}
                        </p>
                        <p className="pt-2">{strategy["description"]}</p>
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mt-5">
                    <p className="font-bold text-3xl mb-4">Choose a Wager</p>
                    <div class="relative pt-1">
                      <input
                        type="range"
                        class="form-range
                                    text-green-400
                                    w-full
                                    accent-green-400
                                    border-none
                                    range-primary-green-400
                                    h-6
                                    p-0
                                    focus:outline-none focus:ring-0 focus:shadow-none
                                    "
                        id="customRange1"
                        value={wager}
                        onChange={(event) => {
                          setWager(event.target.value);
                        }}
                        min={0}
                        max={10000}
                        step={5}
                      />
                      <ul class="flex justify-between w-full">
                        <li class="flex justify-center relative font-bold text-xl ml-2">
                          <span class="absolute">0</span>
                        </li>
                        <li class="flex justify-center relative font-bold text-xl ml-2">
                          <span class="absolute">2500</span>
                        </li>
                        <li class="flex justify-center relative font-bold text-xl">
                          Current: {wager}
                        </li>
                        <li class="flex justify-center relative font-bold text-xl ml-2">
                          <span class="absolute">7500</span>
                        </li>
                        <li class="flex justify-center relative font-bold text-xl mr-2">
                          <span class="absolute">10000</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <br></br>
                  <div className="flex flex-row space-x-4">
                    <button
                      onClick={() => {
                        setCurrentState("Form");
                      }}
                      className={`border-green-400 bg-green-400 border-2 mt-2 mb-6 p-2 rounded-lg 
                                        text-white hover:bg-white hover:text-green-400`}
                    >
                      <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>{" "}
                      Previous Step: Form
                    </button>
                    {Object.keys(chosenWageStrategy).length !== 0 ? (
                      <button
                        onClick={() => {
                          setCurrentState("Date");
                        }}
                        className={`border-green-400 bg-green-400 border-2 m-2 mb-6 p-2 rounded-lg 
                                        text-white hover:bg-white hover:text-green-400`}
                      >
                        Next Step: Date{" "}
                        <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
                      </button>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mt-2 flex space-x-10">
                  <input
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                    }}
                    min="2012-10-30"
                    max="2019-04-10"
                    className="w-1/2 accent-green-400 p-2 selection:bg-green-400 border-black border-2 focus:border-green-400 rounded-lg color-scheme-green-400"
                    type="date"
                  ></input>
                  <input
                    value={endDate}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                    }}
                    min={startDate}
                    max="2019-04-10"
                    className="w-1/2 accent-green-400 p-2 selection:bg-green-400 border-black border-2 focus:border-green-400 rounded-lg color-scheme-green-400"
                    type="date"
                  ></input>
                </div>
                <div className="flex flex-row space-x-4">
                  <button
                    onClick={() => {
                      setCurrentState("Form");
                    }}
                    className={`border-green-400 bg-green-400 border-2 mt-6 mb-6 p-2 rounded-lg 
                                text-white hover:bg-white hover:text-green-400`}
                  >
                    <FontAwesomeIcon icon={faArrowLeft}></FontAwesomeIcon>{" "}
                    Previous Step: Form
                  </button>
                  {Object.keys(chosenWageStrategy).length !== 0 ? (
                    <button
                      onClick={() => {
                        runQuery();
                      }}
                      className={`border-green-400 bg-green-400 border-2 mt-6 mb-6 p-2 rounded-lg 
                                text-white hover:bg-white hover:text-green-400`}
                    >
                      Run Query{" "}
                      <FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon>
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Query;
