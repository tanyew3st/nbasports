var db = require("../routes/users.js");
var express = require("express");
var router = express.Router();
const mysql = require("mysql");
var CryptoJS = require("crypto-js");

const cors = require("cors");

var playerCacheCount = 0; //caching fields for teamnames
var finalJSON;

const connectionPool = mysql.createPool({
  connectionLimit: "100",
  host: "lit-database.crejo6jmuckg.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "password",
  port: "3306",
  database: "Odds",
});

/* Route #1: GETS the home page. */
/* Request Path: “/” */
/* Request Parameters: N/A */
/* Query Parameters: N/A */
/* Response Parameters: title to display on the home page */
router.get("/", function (req, res, next) {
  res.render("index", { title: "NBA Betting" });
});

/* Route #2: GETS the data for various betting strategies, when the user bets on the favored team winning over an interval   */
/* Request Path: “/favored*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager */
/* Query Parameters: Team, startDate, finalDate*/
/* Response Parameters: the results, which is the expected profit from this kind of bet on the favorite team each time for various wagers and betting strategies, along with the relevant game data */

router.get("/favored", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH OddsWin AS (
      SELECT O.TeamId as oti, O.GameId AS GameID, O.BetOnlineML AS BetOnlineML, O.Result, T.TeamId, T.Nickname AS Nickname
        FROM Odds O JOIN Teams T ON (T.TeamId = O.TeamId)
          WHERE O.Date >= '${startDate}' AND O.Date <= '${finalDate}'
      ), GameOdds AS (
         SELECT HOdds.GameId AS GameID, G.GameDate, HOdds.Nickname AS HomeTeam, AOdds.Nickname AS AwayTeam,
                HOdds.BetOnlineML AS HomeOdds, AOdds.BetOnlineML AS AwayOdds, HOdds.Result AS HomeResult
         FROM Games G JOIN OddsWin HOdds ON (HOdds.oti = G.HomeTeamId AND HOdds.GameID = G.GameID)
              JOIN OddsWin AOdds ON (AOdds.oti = G.VisitorTeamId AND AOdds.GameID = G.GameID)
      ), GameOddsWithFavored AS (
         (SELECT *, HomeTeam AS FavoredTeam
         FROM GameOdds
         WHERE (HomeOdds < 0))
         UNION
         (SELECT *, AwayTeam AS FavoredTeam
         FROM GameOdds
         WHERE (AwayOdds < 0))
      ), FavoredWins AS (
         SELECT GameId, GameDate AS Date, HomeTeam AS Home, AwayTeam AS Away, FavoredTeam AS Bet, HomeOdds, AwayOdds, 'W' AS Win
         FROM GameOddsWithFavored
         WHERE ((HomeResult = 'W' AND HomeOdds < 0) OR (HomeResult = 'L' AND AwayOdds < 0)) AND (FavoredTeam = '${team}')
      ), FavoredLosses AS (
         SELECT GameId, GameDate AS Date, HomeTeam AS Home, AwayTeam AS Away, FavoredTeam AS Bet, HomeOdds, AwayOdds, 'L' AS Win
         FROM GameOddsWithFavored
         WHERE ((HomeResult = 'W' AND HomeOdds > 0) OR (HomeResult = 'L' AND AwayOdds > 0)) AND (FavoredTeam = '${team}')
      ), UnionBoth AS (
         SELECT *
         FROM FavoredLosses
         UNION
         SELECT *
         FROM FavoredWins
      )
      SELECT *
      FROM UnionBoth
      ORDER BY Date;
   
     `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);

          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});
/* Route #3: GETS the data for various betting strategies, when the user bets on the underdog team winning over an interval   */
/* Request Path: “/unfavored/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters:  Team, startDate, finalDate */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the underdog team each time for various wagers and betting strategies, along with the relevant game data */
router.get("/unfavored", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH OddsWin AS (
      SELECT O.TeamId as oti, O.GameId AS GameID, O.BetOnlineML AS BetOnlineML, O.Result, T.TeamId, T.Nickname AS Nickname
      FROM Odds O JOIN Teams T ON (T.TeamId = O.TeamId)
      WHERE O.Date >= '${startDate}' AND O.Date <= '${finalDate}'
  ), GameOdds AS (
     SELECT HOdds.GameId AS GameID, G.GameDate, HOdds.Nickname AS HomeTeam, AOdds.Nickname AS AwayTeam, HOdds.BetOnlineML AS HomeOdds, AOdds.BetOnlineML AS AwayOdds, HOdds.Result AS HomeResult
     FROM Games G JOIN OddsWin HOdds ON (HOdds.oti = G.HomeTeamId AND HOdds.GameID = G.GameID) JOIN
         OddsWin AOdds ON (AOdds.oti = G.VisitorTeamId AND AOdds.GameID = G.GameID)
  ), GameOddsWithFavored AS (
     (SELECT *, AwayTeam AS UnfavoredTeam
     FROM GameOdds
     WHERE (HomeOdds < 0))
     UNION
     (SELECT *, HomeTeam AS UnfavoredTeam
     FROM GameOdds
     WHERE (AwayOdds < 0))
  ), UnfavoredWins AS (
     SELECT GameId, GameDate AS Date, HomeTeam AS Home, AwayTeam AS Away, UnfavoredTeam AS Bet, HomeOdds, AwayOdds, 'L' AS Win
     FROM GameOddsWithFavored
     WHERE ((HomeResult = 'W' AND HomeOdds < 0) OR (HomeResult = 'L' AND AwayOdds < 0)) AND UnfavoredTeam = '${team}'
  ), UnfavoredLosses AS (
     SELECT GameId, GameDate AS Date, HomeTeam AS Home, AwayTeam AS Away, UnfavoredTeam AS Bet, HomeOdds, AwayOdds, 'W' as Win
     FROM GameOddsWithFavored
     WHERE ((HomeResult = 'W' AND HomeOdds > 0) OR (HomeResult = 'L' AND AwayOdds > 0)) AND UnfavoredTeam = '${team}'
  ), UnionBoth AS (
     SELECT *
     FROM UnfavoredLosses
     UNION
     SELECT *
     FROM UnfavoredWins
  )
  SELECT *
  FROM UnionBoth
  ORDER BY Date;
      
     `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);

          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #4: GETS the data for various betting strategies, when the user bets on a team given that a player on that team scored a certain number of points in the last game   */
/* Request Path: “/ifbetplayer*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: player, numPoints, team, startDate, endDate*/
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team with the player who scored for various wagers and betting strategies, along with the relevant game data */
router.get("/ifbetplayer", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const player = req.query.player ? req.query.player : "Stephen Curry";
  const numPoints = req.query.points ? req.query.points : 20;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
      SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
      FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
      WHERE O.Location = 'home'
   ), RenameAway AS (
      SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
      FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
      WHERE O.Location = 'away'
   ), BetTeamToTeamID AS (
       SELECT DISTINCT T.Nickname AS TeamName, T.TeamId AS TeamID
       FROM Players P JOIN Teams T ON P.TEAM_ID = T.TeamId
       WHERE T.Nickname = '${team}'
   ), JoinHomeAway AS (
       SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}' AS Bet, H.HomeOdds, A.AwayOdds, H.Win AS Win
       FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
       WHERE A.Date >= '${startDate}' AND A.Date <= '${finalDate}'
   ), AddPlayers AS (
       SELECT J.*, GD.PlayerName, GD.PTS As PointsScored
       FROM JoinHomeAway J JOIN BetTeamToTeamID B ON ((B.TeamName = J.Home OR B.TeamName = J.Away))
           JOIN GamesDetails GD ON (GD.TeamID = B.TeamID AND GD.GameID = J.GameID)
       WHERE GD.PlayerName = '${player}'
   ), WithPrevPoints AS (
       SELECT A.GameID, A.Date, A.Home, A.Away, A.Bet, A.HomeOdds, A.AwayOdds, A.Win, A.PointsScored, LAG(A.PointsScored) OVER (ORDER BY GameID)  AS PrevPoints
       FROM AddPlayers A
   )
   SELECT C.GameID, C.Date, C.Home, C.Away, C.Bet, C.HomeOdds, C.AwayOdds, C.Win
   FROM WithPrevPoints C
   WHERE (C.PrevPoints >= '${numPoints}');
   
     `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #5: GETS the data for various betting strategies, when the user bets on a team given that they are at home  */
/* Request Path: “/ifbethome */
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager */
/* Query Parameters: team, startDate, finalDate */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is home for various wagers and betting strategies, along with the relevant game data */
router.get("/ifbethome", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
      SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
      FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
      WHERE O.Location = 'home'
  ), RenameAway AS (
      SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
      FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
      WHERE O.Location = 'away'
  ), JoinHomeAway AS (
      SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}' AS Bet, H.HomeOdds, A.AwayOdds, IF(H.Home = '${team}', H.Win, A.Win) AS Win
      FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
  )
  SELECT *
  FROM JoinHomeAway J
  WHERE J.Home = '${team}' AND Date >='${startDate}' AND Date <= '${finalDate}'
  ORDER BY Date;
  
    
   
     `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #6: GETS the data for various betting strategies, when the user bets on a team given that they are away  */
/* Request Path: “/ifbetaway*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager */
/* Query Parameters: team, startDate, endDate */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is away for various wagers and betting strategies, along with the relevant game data */
router.get("/ifbetaway", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
      SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
      FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
      WHERE O.Location = 'home'
  ), RenameAway AS (
      SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
      FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
      WHERE O.Location = 'away'
  ), JoinHomeAway AS (
      SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away,  '${team}' AS Bet, H.HomeOdds, A.AwayOdds, IF(H.Home =  '${team}', H.Win, A.Win) AS Win
      FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
  )
  SELECT *
  FROM JoinHomeAway J
  WHERE J.Away =  '${team}' AND Date >='${startDate}' AND Date <= '${finalDate}'
  ORDER BY Date;
  
     `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);

          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #7: GETS all of the team names and nicknames like "Warriors, 76ers, etc."*/
/* Request Path: “/teamnames” */
/* Request Parameters: N/A
/* Query Parameters: N/A
/* Response Parameters: the results, which is the a list of all of the team names along with their nicknames*/
router.get("/teamnames", function (req, res) {
  if (playerCacheCount == 0) {
    connectionPool.getConnection(function (err, connection) {
      if (err) {
        connection.release();
        throw err;
      }
      connection.query(
        `SELECT DISTINCT CONCAT(t.CITY, ' ', t.Nickname) AS Fullname, t.Nickname AS Nickname
      FROM Teams t;
      `,
        function (error, results, fields) {
          if (error) {
            console.log(error);
            res.json({ error: error });
          } else if (results) {
            finalJSON = results;
            res.json({ results: results });
          }
          connection.release();
        }
      );
    });
    playerCacheCount++;
  } else {
    console.log(finalJSON);
    res.json({ results: finalJSON });
  }
});

/* Route #8: Reports to the backend the various forms and inputs for the betting strategies 
/* Request Path: /onload */
/* Request Parameters: N/A
/* Query Parameters: N/A
/* Response Parameters: the results, which is the a list of all of all the bets are their various inputs*/
router.get("/onload", function (req, res) {
  var obj = {
    "Bet Strategies": [
      {
        name: "Player Bet",
        description:
          "Gets the data for various betting strategies, when the user bets on a team given that a player on that team scored a certain number of points in the last game ",
        route: "ifbetplayer",
        form: {
          player: "player",
          points: "integer",
        },
      },
      {
        name: "Favored Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on the favored team winning over an interval",
        route: "favored",
        form: {},
      },
      {
        name: "Unfavored Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on the unfavored team winning over an interval",
        route: "unfavored",
        form: {},
      },
      {
        name: "Home Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on the home team winning over an interval",
        route: "ifbethome",
        form: {},
      },
      {
        name: "Away Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on the away team winning over an interval",
        route: "ifbetaway",
        form: {},
      },
      {
        name: "Zigzag Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on the home team winning after a loss over an interval. The zig zag theory works when a team is at home AND coming off a loss. This brings the odds up to 53%, which is enough to become profitable",
        route: "zigzag",
        form: {},
      },
      {
        name: "Heavy Favorite Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on the heavy favored team over an interval. Favorites win more often than not. That’s obvious. Heavy favorites win even more frequently, and that’s essentially what this strategy is based on. The idea is to back selections at very low odds, for the simple reason that they’re very likely to win.",
        route: "heavyfavorite",
        form: {
          Odds: "odds",
        },
      },
      {
        name: "Win Streak Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on a team on a win streak over an interval",
        route: "winstreak",
        form: {
          streak: "integer",
        },
      },
      {
        name: "Losing Streak Bet",
        description:
          " Gets the data for various betting strategies, when the user bets against a team on a losing streak over an interval",
        route: "losingstreak",
        form: {
          streak: "integer",
        },
      },
      {
        name: "Liked Team Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on a team they they like over an interval",
        route: "likedteam",
        form: {},
      },
      {
        name: "Home Recovery Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on a team that had a poor shooting performance in their previous game and are now at home over an interval. We’re looking for a team that’s playing at home who had a lousy offensive performance in the previous game. Look for teams with winning records who shot a much lower FG% than their average or scored fewer points than their typical points per game. Teams that fit this description have exceeded their expected point total and won against the spread 62% of the time.",
        route: "homerecovery",
        form: {},
      },
      {
        name: "Road Recovery Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on a road team that had a crushing loss and their previous game and are now favored on the road over an interval. You’ll need a team that’s favored to win despite playing on the road and who just suffered an embarrassing defeat. NBA teams that were just blown out by fifteen points or more tend to take out their frustrations on their next opponent, especially if it’s an underdog! When a team lost their previous game by fifteen or more and traveled to an underdog’s stadium for their next game, the road favorite has won roughly 64% of the time. At that winning percentage, you’ll need a team favored by less than -178 to find value.",
        route: "roadrecovery",
        form: {
          previousdefeatby: "integer",
        },
      },
      {
        name: "Blowout Bet",
        description:
          " Gets the data for various betting strategies, when the user bets on a team that won their previous game by a blowout and are favored again to win over an interval",
        route: "blowout",
        form: {
          previouswinby: "integer",
        },
      },
    ],
    "Wage Strategies": [
      {
        name: "Constant",
        description: "Betting the same amount of money, the wager, on each bet",
      },
      {
        name: "Doubling",
        description:
          "Betting double the amount of money of the previous wager, on each bet",
      },
      {
        name: "Increment",
        description: "Betting an incrementing amount of money on each wager",
      },
      {
        name: "Martingale",
        description:
          "Betting according to the classic Martingale Strategy where one doubles their bet at each round if a loss occurs",
      },
    ],
  };

  res.json(obj);
});

/* Route #9: Gets all of the names of the the players on a given team */
/* Request Path: “/playersonteam” */
/* Request Parameters: N/A
/* Query Parameters: Nickname of Team
/* Response Parameters: the results, which is the a list of all of the players on a given team*/
router.get("/playersonteam", function (req, res) {
  const team = req.query.team ? req.query.team : "Warriors";
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `SELECT DISTINCT p.PLAYER_NAME AS PlayerName
  FROM Players p JOIN Teams t ON p.TEAM_ID = t.TeamId
  WHERE NICKNAME = '${team}'
  ORDER BY p.PLAYER_NAME;
  `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #10: GETS the data for various betting strategies, when the user bets on a team given that they lost the game before and are at home now */
/* Request Path: “/zigzag/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager */
/* Query Parameters: team, startDate, endDate */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is home for various wagers and betting strategies, along with the relevant game data */
router.get("/zigzag", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'home'
     ), RenameAway AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'away'
     ), JoinHomeAway AS (
         SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}' AS Bet, H.HomeOdds, A.AwayOdds, H.Win AS Win
         FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
         WHERE H.Date >= '${startDate}' AND H.Date <= '${finalDate}' AND H.Home = '${team}'
     ), NumberedRows AS (
         SELECT ROW_NUMBER() OVER(ORDER BY Date) AS RowNumber, O.GameID, O.Date AS Date, O.Home, O.Away, O.HomeOdds, O.AwayOdds, O.Win
         FROM JoinHomeAway O
         ORDER BY O.Date ASC
     ), WithPrevPoints AS (
         SELECT A.GameID, A.Date, A.Home, A.Away, A.HomeOdds, A.AwayOdds, A.Win, LAG(A.Win) OVER (ORDER BY GameID) AS PrevWin
         FROM NumberedRows A
     )
     SELECT A.GameID, A.Date, A.Home, A.Away, A.Home AS Bet, A.HomeOdds, A.AwayOdds, A.Win
     FROM WithPrevPoints A
     WHERE A.PrevWin = "L";

      `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #11: GETS the data for various betting strategies, when the user bets on a team given that the team is a heavy favorite, specified by the odds  */
/* Request Path: “/heavyfavorite*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager */
/* Query Parameters: team, odds, startDate, and finalDate*/
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is a heavy favorite for various wagers and betting strategies, along with the relevant game data */
router.get("/heavyfavorite", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const odds = req.query.Odds ? req.query.Odds : -300;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH OddsWithTeamNames AS (
        SELECT O.TeamId as oti, O.GameId AS GameID, O.BetOnlineML AS BetOnlineML, O.Result, T.TeamId, T.Nickname AS Nickname
        FROM Odds O JOIN Teams T ON (T.TeamId = O.TeamId)
        WHERE O.Date >= '${startDate}' AND O.Date <= '${finalDate}'
    ), GameOdds AS (
        SELECT HOdds.GameId AS GameID, G.GameDate, HOdds.Nickname AS HomeTeam, AOdds.Nickname AS AwayTeam, HOdds.BetOnlineML AS HomeOdds, AOdds.BetOnlineML AS AwayOdds, HOdds.Result AS HomeResult
        FROM Games G JOIN OddsWithTeamNames HOdds ON (HOdds.GameID = G.GameID AND HOdds.oti = G.HomeTeamId)
            JOIN OddsWithTeamNames AOdds ON (AOdds.GameID = G.GameID AND AOdds.oti = G.VisitorTeamId)
    ), GameOddsWithFavored AS (
       (SELECT *, HomeTeam AS HeavyFavoredTeam
       FROM GameOdds
       WHERE (HomeOdds <= '${odds}'))
       UNION
       (SELECT *, AwayTeam AS HeavyFavoredTeam
       FROM GameOdds
       WHERE (AwayOdds <= '${odds}'))
    ), FavoredWins AS (
       SELECT GameId, GameDate, HomeTeam, AwayTeam, HeavyFavoredTeam, HomeOdds, AwayOdds, 'W' AS BetResult
       FROM GameOddsWithFavored
       WHERE ((HomeResult = 'W' AND HomeOdds < 0) OR (HomeResult = 'L' AND AwayOdds < 0)) AND HeavyFavoredTeam = '${team}'
    ), FavoredLosses AS (
       SELECT GameId, GameDate, HomeTeam, AwayTeam, HeavyFavoredTeam, HomeOdds, AwayOdds, 'L' AS BetResult
       FROM GameOddsWithFavored
       WHERE ((HomeResult = 'W' AND HomeOdds > 0) OR (HomeResult = 'L' AND AwayOdds > 0)) AND HeavyFavoredTeam = '${team}'
    ), UnionBoth AS (
       SELECT *
       FROM FavoredLosses
       UNION
       SELECT *
       FROM FavoredWins
    )
    SELECT GameID, GameDate AS Date, HomeTeam AS Home, AwayTeam as Away, HeavyFavoredTeam AS Bet, HomeOdds, AwayOdds, BetResult AS Win
    FROM UnionBoth
    ORDER BY GameDate;
    
   
     
    
      `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #12: GETS the data for various betting strategies, when the user bets on a team given the team is on a large winstreak */
/* Request Path: “/winstreak*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team, startDate, finalDate, and streak */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is on a winning streak for various wagers and betting strategies, along with the relevant game data */
router.get("/winstreak", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  const streak = req.query.streak ? req.query.streak : 2;
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'home'
     ), RenameAway AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'away'
     ), JoinHomeAway AS (
         SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}'  AS Bet, H.HomeOdds, A.AwayOdds, IF(H.Home = '${team}' , H.Win, A.Win) AS Win
         FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
         WHERE H.Date >= '${startDate}' AND H.Date <= '${finalDate}'
     ), CreateCount AS (
        SELECT o.GameID, o.Date, o.Home, o.Away, o.Bet, o.HomeOdds, o.AwayOdds, o.Win, IF(o.Win = 'W', 1, 0) AS StreakCounter
        FROM JoinHomeAway o
        WHERE o.Home = '${team}'  OR o.Away = '${team}' 
     ), AggregateStreakWins AS (
        SELECT c.GameID, c.Date, c.Home, c.Away, c.Bet, c.HomeOdds, c.AwayOdds, c.Win, SUM(StreakCounter) OVER (
            ORDER BY c.Date
            ROWS ${streak} PRECEDING
            ) AS AggregateStreak
        FROM CreateCount c
     ), ExclusiveOfCurrRow AS (
        SELECT c.GameID, c.Date, c.Home, c.Away, c.Bet, c.HomeOdds, c.AwayOdds, c.Win, IF(c.Win = 'W', c.AggregateStreak - 1, c.AggregateStreak) AS PriorWinStreak
        FROM AggregateStreakWins c
     )
     SELECT c.GameID, c.Date, c.Home, c.Away, c.Bet, c.HomeOdds, c.AwayOdds, c.Win
     FROM ExclusiveOfCurrRow c
     WHERE c.PriorWinStreak >= ${streak};
    
      
    
      `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #13: GETS the data for various betting strategies, when the user bets on a team given the team is on a large losing streak */
/* Request Path: “/winstreak*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team, startDate, finalDate, and streak */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is on a losing streak for various wagers and betting strategies, along with the relevant game data */
router.get("/losingstreak", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  const streak = req.query.streak ? req.query.streak : 2;
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'home'
     ), RenameAway AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'away'
     ), JoinHomeAway AS (
         SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}' AS Bet, H.HomeOdds, A.AwayOdds, IF(H.Home = '${team}', H.Win, A.Win) AS Win
         FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
         WHERE H.Date >= '${startDate}' AND H.Date <= '${finalDate}'
     ), CreateCount AS (
        SELECT o.GameID, o.Date, o.Home, o.Away, o.Bet, o.HomeOdds, o.AwayOdds, o.Win,
               IF(o.Win = 'L', 1, 0) AS StreakCounter
        FROM JoinHomeAway o
        WHERE o.Home = '${team}' OR o.Away = '${team}'
     ), AggregateStreakLose AS (
        SELECT c.GameID, c.Date, c.Home, c.Away, c.Bet, c.HomeOdds, c.AwayOdds, c.Win, SUM(StreakCounter) OVER (
            ORDER BY c.Date
            ROWS ${streak} PRECEDING
            ) AS AggregateStreak
        FROM CreateCount c
     ), ExclusiveOfCurrRow AS (
        SELECT c.GameID, c.Date, c.Home, c.Away, c.Bet, c.HomeOdds, c.AwayOdds, c.Win, IF(c.Win = 'L', c.AggregateStreak - 1, c.AggregateStreak) AS PriorLoseStreak
        FROM AggregateStreakLose c
     )
     SELECT c.GameID, c.Date, c.Home, c.Away, c.Bet, c.HomeOdds, c.AwayOdds, c.Win
     FROM ExclusiveOfCurrRow c
     WHERE c.PriorLoseStreak >= ${streak};
    
      
    
      `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #14: GETS the data for various betting strategies, when the user bets on a team given the user likes that team */
/* Request Path: “/likedteam */
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team, startDate, finalDate */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is liked by the user for various wagers and betting strategies, along with the relevant game data */
router.get("/likedteam", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'home'
    ), RenameAway AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'away'
    ), JoinHomeAway AS (
        SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}' AS Bet, H.HomeOdds, A.AwayOdds, IF(H.Home = '${team}', H.Win, A.Win) AS Win
        FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
    )
    SELECT * FROM JoinHomeAway J
    WHERE (J.Home = '${team}' OR J.Away = '${team}') AND J.Date <= '${finalDate}' AND J.Date >= '${startDate}';
    
      
    
      `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #15: GETS the data for various betting strategies, when the user bets on a team given that they just blew out a team in the game prior */
/* Request Path: “/blowout */
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team, startDate, finalDate, previouswinby */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is coming off a huge win by margin for various wagers and betting strategies, along with the relevant game data */
router.get("/blowout", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  const previouswinby = req.query.previouswinby ? req.query.previouswinby : 15;
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'home'
     ), RenameAway AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'away'
     ), HSpread AS (
         SELECT H.*, O.BestLineSpread as HomeSpread
         FROM Odds O JOIN RenameHome H ON (H.GameID = O.GameID)
         WHERE (O.Location = 'home') AND (O.Date <= '${finalDate}') AND (O.Date >= '${startDate}')
     ), ASpread AS (
         SELECT A.*, O.BestLineSpread as AwaySpread
         FROM Odds O JOIN RenameAway A ON (A.GameID = O.GameID)
         WHERE (O.Location = 'away') AND (O.Date <= '${finalDate}') AND (O.Date >= '${startDate}')
     ), JoinHomeAway AS (
         SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}' AS Bet, H.HomeOdds, A.AwayOdds,
                IF(H.Home = '${team}', H.Win, A.Win) AS Win, IF (H.Home = '${team}', H.HomeSpread, A.AwaySpread) AS Spread
         FROM HSpread H JOIN ASpread A ON H.GameId = A.GameId
         WHERE (H.Home = '${team}' OR A.Away = '${team}')
     ), PointDifference AS (
         SELECT G.GameDate, G.GameID, ABS(G.HomePoints - G.AwayPoints) AS Difference
         FROM Games G
         WHERE (G.HomeTeamID IN (
             SELECT TeamId
             FROM Teams
             WHERE (Teams.Nickname = '${team}')
             ))
         OR (G.VisitorTeamID IN (
             SELECT TeamId
             FROM Teams
             WHERE (Teams.Nickname = '${team}')
             ))
     ), SpreadAndDif AS (
         SELECT J.Date, PD.GameID AS GameID, J.Home, J.Away, J.Bet,
                J.HomeODds, J.AwayOdds, J.Spread, J.Win, PD.Difference
         FROM PointDifference PD
                  JOIN JoinHomeAway J ON (PD.GameID = J.GameID)
         WHERE (J.Home = '${team}' OR J.Away = '${team}')
     ), PrevGames AS (
         SELECT *, LAG(Win, 1) OVER (ORDER BY GameID) AS PrevWin, LAG(Difference, 1) OVER (ORDER BY GameID) AS PrevDif
         FROM SpreadAndDif S
     )
     SELECT P.GameID, P.Date, P.Home, P.Away, P.Bet AS Bet, P.HomeOdds, P.AwayOdds,
            IF((P.Difference <= ABS(Spread) AND P.Win = 'W') OR P.Win = 'W', 'W', 'L') AS Win
     FROM PrevGames P
     WHERE (P.Home = '${team}' AND P.Spread <= '-10' AND P.PrevDif >= '${previouswinby}' AND P.PrevWin = 'W')
     
     
     `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #16: GETS the data for various betting strategies, when the user bets on a team given they shot poorly in the previous game and are now at home */
/* Request Path: “/homerecovery */
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team, startDate, finalDate */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is recovering from a poor shooting performance for various wagers and betting strategies, along with the relevant game data */
router.get("/homerecovery", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'home'
     ), RenameAway AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'away'
     ), JoinHomeAway AS (
         SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away,
                '${team}' AS Bet, H.HomeOdds, A.AwayOdds, IF(H.Home = '${team}', H.Win, A.Win) AS Win
         FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
         WHERE (H.Home = '${team}')
         AND (A.Date >= '${startDate}')
         AND (A.Date <= '${finalDate}')
         AND (H.Date >= '${startDate}')
         AND (H.Date <= '${finalDate}')
     ), GameInfo AS (
         SELECT G.GameDate, GameID, HomeTeamID, H.Nickname AS Home, HomePoints, VisitorTeamID, A.Nickname AS Away, HomeFGPCT,
                AwayFGPCT, AwayPoints
         FROM Games G JOIN Teams H ON (H.TeamId = G.HomeTeamID)
             JOIN Teams A ON (A.TeamId = G.VisitorTeamID)
     ), Data AS (
         SELECT G.GameID, IF(Home = '${team}', G.HomeFGPCT, G.AwayFGPCT) AS FGPCT, IF(Home = '${team}', G.HomePoints,
             G.AwayPoints) AS Points
         FROM GameInfo G
         WHERE (Home = '${team}' OR Away = '${team}')
     ), Stats AS (
         SELECT AVG(FGPCT) AS AvgFGPct, AVG(Points) AS AvgPoints, FORMAT(STD(FGPCT), 3) AS FGPctStDev,
                FORMAT(STD(Points), 3) AS PointsStDev
         FROM Data
     ), GamesWithData AS (
         SELECT J.GameID, J.Date, J.Home, J.Away, J.Bet, J.HomeOdds, J.AwayOdds, J.Win, D.FGPCT, D.Points
         FROM Data D JOIN JoinHomeAway J ON (D.GameID = J.GameID)
     ), GamesWithPrev AS (
         SELECT G.GameID, G.Date, G.Home, G.Away, G.Bet, G.HomeOdds, G.AwayOdds, G.Win, G.FGPCT, G.Points,
            LAG(G.FGPCT, 1) OVER (ORDER BY G.GameID) AS PrevFGPct, LAG(G.Points, 1) OVER (ORDER BY G.GameID) AS PrevPoints
         FROM GamesWithData G
     )
     SELECT G.GameID, G.Date, G.Home, G.Away, G.Bet, G.HomeOdds, G.AwayOdds, G.Win
     FROM GamesWithPrev G
     WHERE ((G.PrevFGPct <= ALL (
         SELECT (AvgFGPct - FGPctStDev)
         FROM Stats S)
     ) OR (G.PrevPoints <= ALL (
         SELECT (AvgPoints - PointsStDev)
         FROM Stats S)
     ))
     
     `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

/* Route #17: GETS the data for various betting strategies, when the user bets on a team given they lost by a margin and their previous game and are now favored to win on the road */
/* Request Path: “/roadrecovery */
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team, startDate, finalDate, previousdefeatby */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is recovering from a bad loss in the previous game for various wagers and betting strategies, along with the relevant game data */
router.get("/roadrecovery", function (req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant";
  const wager = req.query.wager ? req.query.wager : 100;
  const team = req.query.team ? req.query.team : "Warriors";
  const startDate = req.query.start ? req.query.start : "2012-10-30";
  const finalDate = req.query.end ? req.query.end : "2019-04-10";
  const previousdefeatby = req.query.previousdefeatby
    ? req.query.previousdefeatby
    : 15;
  console.log(wager);
  connectionPool.getConnection(function (err, connection) {
    if (err) {
      connection.release();
      throw err;
    }
    connection.query(
      `WITH RenameHome AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'home' AND (O.Date >= '${startDate}') AND (O.Date  <= '${finalDate}')
     ), RenameAway AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'away' AND (O.Date >= '${startDate}') AND (O.Date  <= '${finalDate}')
     ), JoinHomeAway AS (
         SELECT H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}
     ' AS Bet, H.HomeOdds, A.AwayOdds,
                IF(H.Home = '${team}', H.Win, A.Win) AS Win
         FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
         WHERE (H.Home = '${team}' OR A.Away = '${team}')
     ), PointDifference AS (
         SELECT G.GameID, G.GameDate,
                ABS(G.HomePoints - G.AwayPoints) AS Difference, J.Win, J.Home, J.Away, J.Bet, J.HomeOdds, J.AwayOdds
         FROM Games G JOIN JoinHomeAway J ON (G.GameID = J.GameID)
         WHERE (G.HomeTeamID IN (
             SELECT TeamId
             FROM Teams
             WHERE (Teams.Nickname = '${team}')
             ))
         OR (G.VisitorTeamID IN (
             SELECT TeamId
             FROM Teams
             WHERE (Teams.Nickname = '${team}')
             ))
     ), PrevGame AS (
         SELECT *, LAG(GameID, 1) OVER (ORDER BY GameID) AS PrevGame, LAG(Win, 1) OVER (ORDER BY GameID) AS PrevWin,
                LAG(Difference, 1) OVER (ORDER BY GameID) AS PrevDif
         FROM PointDifference S
         WHERE (S.Away = '${team}')
     )
     SELECT P.GameID, P.GameDate AS Date, P.Home, P.Away, P.Bet, P.HomeOdds, P.AwayOdds, P.Win
     FROM PrevGame P
     WHERE (P.PrevDif >= '${previousdefeatby}' AND P.PrevWin = 'L')
     ORDER BY GameID
     
     
     `,
      function (error, results, fields) {
        if (error) {
          console.log(error);
          res.json({ error: error });
        } else if (results) {
          results = addingWage(results, betType, wager);
          res.json({ results: results });
        }
        connection.release();
      }
    );
  });
});

//a function that cases on the betting strategy that the user selects and assigns betting values to each game based on what the user selected
function addingWage(results, betType, wager) {
  count = 0;
  winnings = 0;
  if (betType == "Constant") {
    for (let i = 0; i < results.length; i++) {
      results[i].wager = wager;
      if (results[i].Win == "W") {
        if (results[i].Bet == results[i].Home) {
          if (results[i].HomeOdds < 0) {
            winnings = (-100 / results[i].HomeOdds) * wager + winnings;
            results[i].amountwon = (-100 / results[i].HomeOdds) * wager;
            results[i].totalwinnings = winnings;
          } else {
            winnings = (results[i].HomeOdds / 100) * wager + winnings;
            results[i].amountwon = (results[i].HomeOdds / 100) * wager;
            results[i].totalwinnings = winnings;
          }
        } else {
          if (results[i].AwayOdds < 0) {
            winnings = (-100 / results[i].AwayOdds) * wager + winnings;
            results[i].amountwon = (-100 / results[i].AwayOdds) * wager;
            results[i].totalwinnings = winnings;
          } else {
            winnings = (results[i].AwayOdds / 100) * wager + winnings;
            results[i].amountwon = (results[i].AwayOdds / 100) * wager;
            results[i].totalwinnings = winnings;
          }
        }
      } else {
        winnings = winnings - wager;
        results[i].amountwon = -wager;
        results[i].totalwinnings = winnings;
      }
      count++;
    }
  } else if (betType == "Increment") {
    for (let i = 0; i < results.length; i++) {
      results[i].wager = wager * (count + 1);
      if (results[i].Win == "W") {
        if (results[i].Bet == results[i].Home) {
          if (results[i].HomeOdds < 0) {
            winnings =
              (-100 / results[i].HomeOdds) * (wager * (count + 1)) + winnings;
            results[i].amountwon =
              (-100 / results[i].HomeOdds) * (wager * (count + 1));
            results[i].totalwinnings = winnings;
          } else {
            winnings =
              (results[i].HomeOdds / 100) * (wager * (count + 1)) + winnings;
            results[i].amountwon =
              (results[i].HomeOdds / 100) * (wager * (count + 1));
            results[i].totalwinnings = winnings;
          }
        } else {
          if (results[i].AwayOdds < 0) {
            winnings =
              (-100 / results[i].AwayOdds) * (wager * (count + 1)) + winnings;
            results[i].amountwon =
              (-100 / results[i].AwayOdds) * (wager * (count + 1));
            results[i].totalwinnings = winnings;
          } else {
            winnings =
              (results[i].AwayOdds / 100) * (wager * (count + 1)) + winnings;
            results[i].amountwon =
              (results[i].AwayOdds / 100) * (wager * (count + 1));
            results[i].totalwinnings = winnings;
          }
        }
      } else {
        winnings = winnings - wager * (count + 1);
        results[i].amountwon = -(wager * (count + 1));
        results[i].totalwinnings = winnings;
      }
      count++;
    }
  } else if (betType == "Doubling") {
    for (let i = 0; i < results.length; i++) {
      results[i].wager = wager * (2 * (count + 1));
      if (results[i].Win == "W") {
        if (results[i].Bet == results[i].Home) {
          if (results[i].HomeOdds < 0) {
            winnings =
              (-100 / results[i].HomeOdds) * (wager * (2 * (count + 1))) +
              winnings;
            results[i].amountwon =
              (-100 / results[i].HomeOdds) * (wager * (2 * (count + 1)));
            results[i].totalwinnings = winnings;
          } else {
            winnings =
              (results[i].HomeOdds / 100) * (wager * (2 * (count + 1))) +
              winnings;
            results[i].amountwon =
              (results[i].HomeOdds / 100) * (wager * (2 * (count + 1)));
            results[i].totalwinnings = winnings;
          }
        } else {
          if (results[i].AwayOdds < 0) {
            winnings =
              (-100 / results[i].AwayOdds) * (wager * (2 * (count + 1))) +
              winnings;
            results[i].amountwon =
              (-100 / results[i].AwayOdds) * (wager * (2 * (count + 1)));
            results[i].totalwinnings = winnings;
          } else {
            winnings =
              (results[i].AwayOdds / 100) * (wager * (2 * (count + 1))) +
              winnings;
            results[i].amountwon =
              (results[i].AwayOdds / 100) * (wager * (2 * (count + 1)));
            results[i].totalwinnings = winnings;
          }
        }
      } else {
        winnings = winnings - wager * (2 * (count + 1));
        results[i].amountwon = -(wager * (2 * (count + 1)));
        results[i].totalwinnings = winnings;
      }
      count++;
    }
  } else if ((betType = "Martingale")) {
    for (let i = 0; i < results.length; i++) {
      if (i != 0) {
        if (results[i - 1].Win == "L") {
          results[i].wager = 2 * results[i - 1].wager;
        } else {
          results[i].wager = wager;
        }
      } else {
        results[i].wager = wager;
      }

      if (results[i].Win == "W") {
        if (results[i].Bet == results[i].Home) {
          if (results[i].HomeOdds < 0) {
            winnings =
              (-100 / results[i].HomeOdds) * results[i].wager + winnings;
            results[i].amountwon =
              (-100 / results[i].HomeOdds) * results[i].wager;
            results[i].totalwinnings = winnings;
          } else {
            winnings =
              (results[i].HomeOdds / 100) * results[i].wager + winnings;
            results[i].amountwon =
              (results[i].HomeOdds / 100) * results[i].wager;
            results[i].totalwinnings = winnings;
          }
        } else {
          if (results[i].AwayOdds < 0) {
            winnings =
              (-100 / results[i].AwayOdds) * results[i].wager + winnings;
            results[i].amountwon =
              (-100 / results[i].AwayOdds) * results[i].wager;
            results[i].totalwinnings = winnings;
          } else {
            winnings =
              (results[i].AwayOdds / 100) * results[i].wager + winnings;
            results[i].amountwon =
              (results[i].AwayOdds / 100) * results[i].wager;
            results[i].totalwinnings = winnings;
          }
        }
      } else {
        winnings = winnings - results[i].wager;
        results[i].amountwon = -results[i].wager;
        results[i].totalwinnings = winnings;
      }
      count++;
    }
  }

  return results;
}

/* Route #18: Add a user to the DynamoDB Table */
router.post("/adduser", function (req, res) {
  var userName = req.body.username;
  db.lookup(userName, function (err, data) {
    if (data) {
      res.json({ error: "This username is taken." });
    } else {
      var passWord = req.body.password;
      var fullname = "" + req.body.firstname + " " + req.body.lastname;
      var emailAddress = req.body.emailaddress;

      if (
        userName == undefined || userName == "" ||
        passWord == undefined || passWord == "" ||
        fullname == undefined || fullname == "" ||
        emailAddress == undefined || emailAddress == ""
      ) {
        res.json({ error: "An input was empty or inefficient. Try again!" });
      } else if (req.body.firstname.length < 1) {
        res.json({ error: "Not a valid first name!" });
      } else if (req.body.lastname.length < 1) {
        res.json({ error: "Not a valid last name!" });
      } else if (userName.length < 8) {
        res.json({ error: "Username must be at least 8 characters long!" });
      } else if (passWord.length < 8) {
        res.json({ error: "Password must be at least 8 characters long!" });
      } else if (!(/(.+)@(.+){2,}\.(.+){2,}/.test(emailAddress))) {
        res.json({ error: "The Email Address was malformed. Try again!" });
      } else {
        var hashedPassword = CryptoJS.SHA256(passWord).toString();
        db.addUser(
          userName,
          hashedPassword,
          fullname,
          emailAddress,
          function (err, data) {
            {
              if (err) {
                console.log(err);
              } else {
                res.json({ username: userName });
              }
            }
          }
        );
      }
    }
  });
});

/* Route #19: Check that a user is in the DynamoDB Table, and then check if the password matches */
router.post("/login", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  db.lookup(username, function (err, data) {
    if (err) {
      res.json({ error: "An input was empty or inefficient. Try again!" });
    } else if (data) {
      var hashedPassword = CryptoJS.SHA256(password).toString();
      if (data == hashedPassword) {
        res.json({ username: username });
      } else {
        res.json({ error: "You entered the password incorrectly. Try again!" });
      }
    } else {
      res.json({ error: "This username does not exist. Try again!" });
    }
  });
});

/* Route #20: Add a query to the DynamoDB Table */
router.post("/savequery", function (req, res) {
  var username = req.body.username;
  var query = req.body.query;
  if (username != undefined) {
    db.addQuery(username, query, function (err, data) {
      console.log(data);
      res.json({ query: "Saved!" });
    });
  }
});

/* Route #21: Get queries from a particular user from the DynamoDB Table */
router.post("/getqueries", function (req, res) {
  var username = req.body.username;
  if (username != undefined) {
    db.queriesofuser(username, function (err, data) {
      const queries = [];
      if (data != undefined && data != null) {
        for (var l = 0; l < data.length; l++) {
          queries.push(data[l].query.S);
        }
        res.json({ queriesList: queries });
      } else {
        res.json({ queriesList: "You have no queries saved!" });
      }
    });
  }
});

module.exports = router;
