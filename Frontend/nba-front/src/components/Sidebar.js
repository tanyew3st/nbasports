import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPlus,
  faDoorOpen,
  faBook,
  faUser,
  faBasketball,
  faPencil,
  faDollar,
  faCalendar,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = (props) => {
  const [currentState, setCurrentState] = props.currentState;
  const [loggedIn, setLoggedIn] = useState(false);

  const options = [
    {
      alias: "Home",
      name: "Home",
      icon: faHome,
      color: "text-white",
      href: "home",
    },
    {
      alias: "New Query",
      name: "New Query",
      icon: faPlus,
      color: "text-white",
      href: "newquery",
    },
    {
      alias: "My Queries",
      name: "My Queries",
      icon: faBook,
      color: "text-white",
    },
    {
      alias: "Team",
      name: "Team",
      icon: faBasketball,
      color: "text-gray-300",
    },
    {
      alias: "Strategy",
      name: "Strategy",
      icon: faHandshake,
      color: "text-gray-300",
    },
    {
      alias: "Form",
      name: "Form",
      icon: faPencil,
      color: "text-gray-300",
    },
    {
      alias: "Wage",
      name: "Wage",
      icon: faDollar,
      color: "text-gray-300",
    },
    {
      alias: "Date",
      name: "Date",
      icon: faCalendar,
      color: "text-gray-300",
    },
  ];

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setLoggedIn(localStorage.getItem("username"));
    }
  }, [localStorage]);

  const logout = () => {
    if (localStorage.getItem("username")) {
      setLoggedIn("");
      localStorage.removeItem("username");
    }

    window.location.href = "/login";
  };

  return (
    <Fragment>
      <div className="bg-gray-800 h-full pt-10 pl-5 overflow-y-none flex flex-col">
        <div>
          <div>
            <Link to="/home">
              <button
                className={`text-xl mb-3 hover:text-gray-300 ${
                  currentState === "Home" ? "text-green-400" : "text-white"
                }`}
                onClick={() => {
                  setCurrentState("Home");
                }}
              >
                <FontAwesomeIcon icon={faHome} /> Home
              </button>
            </Link>
          </div>
          <div>
            <Link to="/myqueries">
              <button
                className={`text-xl mb-3 hover:text-gray-300
                        ${
                          currentState === "Queries"
                            ? "text-green-400"
                            : "text-white"
                        }`}
                onClick={() => {
                  setCurrentState("Queries");
                }}
              >
                <FontAwesomeIcon icon={faBook} /> My Queries
              </button>
            </Link>
          </div>
          <div>
            <Link to="/newquery">
              <button
                className={`text-xl mb-3 
                        ${
                          currentState === "Team" ||
                          currentState === "Strategy" ||
                          currentState === "Wage" ||
                          currentState == "Date" ||
                          currentState === "Form"
                            ? "text-green-400"
                            : "text-white"
                        }`}
                onClick={() => {
                  setCurrentState("Team");
                }}
              >
                <FontAwesomeIcon icon={faPlus} /> New Query
              </button>
            </Link>
          </div>
          <div>
            <button
              className={`text-xl mb-3 ${
                currentState === "Team" ? "text-green-400" : "text-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faBasketball} /> Team
            </button>
          </div>
          <div>
            <button
              className={`text-xl mb-3 ${
                currentState === "Strategy" ? "text-green-400" : "text-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faHandshake} /> Strategy
            </button>
          </div>
          <div>
            <button
              className={`text-xl mb-3 ${
                currentState === "Form" ? "text-green-400" : "text-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faPencil} /> Forms
            </button>
          </div>
          <div>
            <button
              className={`text-xl mb-3 ${
                currentState === "Wage" ? "text-green-400" : "text-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faDollar} /> Wage
            </button>
          </div>
          <div>
            <button
              className={`text-xl mb-3 ${
                currentState === "Date" ? "text-green-400" : "text-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faCalendar} /> Date
            </button>
          </div>
        </div>
        <div className="align-bottom mt-auto mb-3">
          <div>
            {!loggedIn ? (
              <div>
                <Link to="/login">
                  <button
                    onClick={() => setCurrentState("Login")}
                    className={`text-xl mb-3 ${
                      currentState === "login" || currentState === "signup"
                        ? "text-green-400"
                        : "text-white hover:text-gray-300"
                    }`}
                  >
                    <FontAwesomeIcon icon={faUser} /> Login
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                <Link to="/newquery">
                  <button
                    onClick={() => setCurrentState("Team")}
                    className={`text-xl mb-3 text-white hover:text-gray-300`}
                  >
                    <FontAwesomeIcon icon={faUser} /> {loggedIn}
                  </button>
                </Link>
              </div>
            )}
            {loggedIn && (
              <div>
                <Link to="/home">
                  <button
                    onClick={logout}
                    className={`text-xl mb-3 ${
                      currentState === "login" || currentState === "signup"
                        ? "text-green-400"
                        : "text-white hover:text-gray-300"
                    }`}
                  >
                    <FontAwesomeIcon icon={faDoorOpen} /> Logout
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Sidebar;
