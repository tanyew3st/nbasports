import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUser } from "@fortawesome/free-solid-svg-icons";

const Home = (props) => {
  console.log(props.currentState);
  const [currentState, setCurrentState] = props.currentState;

  return (
    <div className="h-full w-full bg-black">
      <div className="pb-12 content-center justify-content-center p-32">
        <div className="content-center border-2 border-green-400 mr-10 ml-10 p-12">
          <p className="text-center text-white text-5xl">
            NBA Sports Betting Simulator
          </p>
        </div>
        <div className="flex space-x-5 w-full flex-row mr-10">
          <button
            onClick={() => {
              setCurrentState("Team");
            }}
            className="animate-pulse w-full text-center mt-10 hover:bg-transparent rounded-lg hover:text-green-400 text-black bg-green-400 border-2 border-green-400"
          >
            <Link to="/newquery">
              <p className="text-2xl p-2 pr-4 pl-4">
                <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon> New Query
              </p>
            </Link>
          </button>
          <button
            onClick={() => {
              setCurrentState("Login");
            }}
            className="text-center w-full mt-10 hover:bg-transparent rounded-lg hover:text-green-400 text-black bg-green-400 border-2 border-green-400"
          >
            <Link to="/login">
              <p className="text-2xl p-2 pr-4 pl-4">
                <FontAwesomeIcon icon={faUser}></FontAwesomeIcon> Login
              </p>
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
