var db = require('../routes/users.js');
var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var CryptoJS = require("crypto-js");

const cors = require('cors');

 
 
const connection = mysql.createConnection({
 host:"lit-database.crejo6jmuckg.us-east-1.rds.amazonaws.com",
 user:"admin",
 password:"password",
 port:"3306",
 database:"Odds"
});
connection.connect();
 
/* Route #1: GET home page. */
/* Request Path: “/” */
/* Request Parameters: N/A */
/* Query Parameters: N/A */
/* Response Parameters: title to display on the home page */
router.get('/', function(req, res, next) {
 res.render('index', { title: 'NBA Betting' });
});
/* Route #2: GETs the amount of money one would make or lose if they were to bet the full amount of the average money line */
/* Request Path: “/winbet?wager=” */
/* Request Parameters: N/A */
/* Query Parameters: wager, which indicates how much money is bet on each game */
/* Response Parameters: the results, which denote the profit from this betting strategy */
 
router.get('/winbet', function(req, res) {
 const wager = req.query.wager ? req.query.wager : 100
  console.log(wager)
 
     connection.query(`WITH OddsWin AS (
       SELECT O.TeamId as oti, O.GameId AS GameID, O.AverageLineML AS AverageLineML, O.Result, T.TeamId, T.Nickname AS Nickname
       FROM Odds O, Teams T
     WHERE T.TeamId = O.TeamId
     ), FindNumWins AS (
     SELECT OW.TeamId, (COUNT(*) * '${wager}') AS MoneyWon
     FROM OddsWin OW
     WHERE (OW.AverageLineML < 0) AND (OW.Result = 'W')
     GROUP BY (OW.TeamId)
     ), FindNumLosses AS (
       SELECT OW.TeamId, SUM(OW.AverageLineML) AS MoneyLost
     FROM OddsWin OW
     WHERE (OW.AverageLineML < 0) AND (OW.Result = 'L')
     GROUP BY (OW.TeamId)
     )
     SELECT W.TeamId, (W.MoneyWon + L.MoneyLost) AS NetMoneyEarned
     FROM FindNumWins W, FindNumLosses L
     WHERE (W.TeamId = L.TeamId)
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         res.json({results: results})
       }
     });
 
 
});
 
/* Route #3: GETs the standings at the end of the NBA Season for a given year */
/* Request Path: “/standings?year=” */
/* Request Parameters: N/A */
/* Query Parameters: wager, which indicates how much money is bet on each game and year which indicates which year we are referring to for the standings */
/* Response Parameters: the results, which are the standings sorted in order of wins  */
 
router.get('/standings', function(req, res) {
 const wager = req.query.wager ? req.query.wager : 100
 const year = req.query.year ? req.query.year : 2015
  console.log(wager)
 
     connection.query(`WITH GamesWonByHomeTeam AS (
       SELECT G.GameId AS GameId, G.HomeTeamID AS WinningTeam
   FROM Games G
       WHERE (G.HomeWin = 1) AND (G.GameDate LIKE '%${year}%')
   ), GamesWonByAwayTeam AS (
   SELECT G.GameId AS GameId, G.VisitorTeamID AS WinningTeam
   FROM Games G
       WHERE (G.HomeWin = 0) AND (G.GameDate LIKE '%${year}%')
   ), GamesWonByTeam AS (
   (SELECT *
   FROM (GamesWonByHomeTeam)
   UNION
   SELECT *
   FROM (GamesWonByAwayTeam))
   )
   SELECT T.Nickname, G.WinningTeam, COUNT(*) AS NumWins
   FROM Teams T, GamesWonByTeam G
   WHERE (T.TeamId = G.WinningTeam)
   GROUP BY (G.WinningTeam)
   ORDER BY NumWins DESC
   
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         res.json({results: results})
       }
     });
 
 
});
 
/* Route #4: GETs the team that pulls off the most upsets */
/* Request Path: “/upsetteam” */
/* Request Parameters: N/A */
/* Query Parameters: N/A */
/* Response Parameters: the results, which is the team with the most upsets  */
router.get('/upsetteam', function(req, res) {
  console.log(req.query.page)
 
     connection.query(`WITH Year12 AS (
       SELECT O.Team AS Team, COUNT(*) AS TotalUpsets
       FROM Odds O
       WHERE O.Date LIKE '%2012%' AND O.AverageLineML > 0 AND O.Result = 'W'
       GROUP BY O.Team
       ORDER BY COUNT(*) DESC
       LIMIT 1
     ), Year13 AS (
       SELECT O.Team AS Team, COUNT(*) AS TotalUpsets
       FROM Odds O
       WHERE O.Date LIKE '%2013%' AND O.AverageLineML > 0 AND O.Result = 'W'
       GROUP BY O.Team
       ORDER BY COUNT(*) DESC
       LIMIT 1
     ), Year14 AS (
       SELECT O.Team AS Team, COUNT(*) AS TotalUpsets
       FROM Odds O
       WHERE O.Date LIKE '%2014%' AND O.AverageLineML > 0 AND O.Result = 'W'
       GROUP BY O.Team
       ORDER BY COUNT(*) DESC
       LIMIT 1
     ), Year15 AS (
       SELECT O.Team AS Team, COUNT(*) AS TotalUpsets
       FROM Odds O
       WHERE O.Date LIKE '%2015%' AND O.AverageLineML > 0 AND O.Result = 'W'
       GROUP BY O.Team
       ORDER BY COUNT(*) DESC
       LIMIT 1
     ),Year16 AS (
       SELECT O.Team AS Team, COUNT(*) AS TotalUpsets
       FROM Odds O
       WHERE O.Date LIKE '%2016%' AND O.AverageLineML > 0 AND O.Result = 'W'
       GROUP BY O.Team
       ORDER BY COUNT(*) DESC
       LIMIT 1
     ), Year17 AS (
       SELECT O.Team AS Team, COUNT(*) AS TotalUpsets
       FROM Odds O
       WHERE O.Date LIKE '%2017%' AND O.AverageLineML > 0 AND O.Result = 'W'
       GROUP BY O.Team
       ORDER BY COUNT(*) DESC
       LIMIT 1
     ), Year18 AS (
       SELECT O.Team AS Team, COUNT(*) AS TotalUpsets
       FROM Odds O
       WHERE O.Date LIKE '%2018%' AND O.AverageLineML > 0 AND O.Result = 'W'
       GROUP BY O.Team
       ORDER BY COUNT(*) DESC
       LIMIT 1
     ), Year19 AS (
       SELECT O.Team AS Team, COUNT(*) AS TotalUpsets
       FROM Odds O
       WHERE O.Date LIKE '%2019%' AND O.AverageLineML > 0 AND O.Result = 'W'
       GROUP BY O.Team
       ORDER BY COUNT(*) DESC
       LIMIT 1
     )
     SELECT 2012 AS Year, a.Team AS Team, a.TotalUpsets
     FROM Year12 a
     UNION
     SELECT 2013 AS Year, b.Team AS Team, b.TotalUpsets
     FROM Year13 b
     UNION
     SELECT 2014 AS Year, c.Team AS Team, c.TotalUpsets
     FROM Year14 c
     UNION
     SELECT 2015 AS Year, d.Team AS Team, d.TotalUpsets
     FROM Year15 d
     UNION
     SELECT 2016 AS Year, e.Team AS Team, e.TotalUpsets
     FROM Year16 e
     UNION
     SELECT 2017 AS Year, f.Team AS Team, f.TotalUpsets
     FROM Year17 f
     UNION
     SELECT 2018 AS Year, g.Team AS Team, g.TotalUpsets
     FROM Year18 g
     UNION
     SELECT 2019 AS Year, h.Team AS Team, h.TotalUpsets
     FROM Year19 h     
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         res.json({results: results})
       }
     });
 
 
});
/* Route #5: GETS the probability of a specified team winning after a loss */
/* Request Path: “/winafterloss?team=” */
/* Request Parameters: N/A */
/* Query Parameters: Team, which denotes the team that we want to find the probability for */
/* Response Parameters: the results, which is the probability that the specified team wins after a loss */
router.get('/winafterloss', function(req, res) {
 const wager = req.query.wager ? req.query.wager : 100
 const team = req.query.team ? req.query.team: 'Boston'
  console.log(wager)
 
     connection.query(`WITH NumberedRows AS (
       SELECT ROW_NUMBER() OVER(ORDER BY Date) AS RowNumber, O.Date AS Date, O.Team AS Team, O.Result AS Result
       FROM Odds O
       WHERE O.Team = '${team}'
       ORDER BY O.Date ASC
     ), CartesianProduct AS (
       SELECT A.Team AS Team, B.Result AS LastGameResult, A.Result AS NextGameResult
       FROM NumberedRows A,  NumberedRows B
       WHERE A.RowNumber = (B.RowNumber - 1) AND B.Result = "W"
     ), FindTotalWins AS (
       SELECT COUNT(*) AS TotalWins
       FROM CartesianProduct
     ), FindTotalNextWins AS (
       SELECT COUNT(*) AS TotalNextWins
       FROM CartesianProduct C
       WHERE C.NextGameResult = "W"
     )
     SELECT DISTINCT R.Team, (NW.TotalNextWins / TW.TotalWins) AS ProbabilityWinNext
     FROM NumberedRows R, FindTotalWins TW, FindTotalNextWins NW
    
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         res.json({results: results})
       }
     });
 
 
});

/* Route #6: GETS the data for various betting strategies, when the user bets on the favored team winning over an interval   */
/* Request Path: “/favored?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the */
/* Query Parameters: Team and Dates*/
/* Response Parameters: the results, which is the expected profit from this kind of bet on the favorite team each time for various wagers and betting strategies, along with the relevant game data */
 
router.get('/favored', function(req, res) {
 const betType = req.query.betType ? req.query.betType : "Constant"
 const wager = req.query.wager ? req.query.wager : 100
 const team = req.query.team? req.query.team : "Warriors"
 const startDate = req.query.start? req.query.start: "2012-10-30"
 const finalDate = req.query.end? req.query.end : "2019-04-10"
  console.log(wager)
 
     connection.query(`WITH OddsWin AS (
      SELECT O.TeamId as oti, O.GameId AS GameID, O.BetOnlineML AS ML, O.Result, T.TeamId, T.Nickname AS Nickname
        FROM Odds O, Teams T
      WHERE T.TeamId = O.TeamId
      ), GameOdds AS (
         SELECT HOdds.GameId AS GameID, G.GameDate, HOdds.Nickname AS HomeTeam, AOdds.Nickname AS AwayTeam, HOdds.ML AS HomeOdds, AOdds.ML AS AwayOdds, HOdds.Result AS HomeResult
         FROM OddsWin HOdds, Games G, OddsWin AOdds
         WHERE (HOdds.oti = G.HomeTeamId AND HOdds.GameID = G.GameID AND AOdds.oti = G.VisitorTeamId AND AOdds.GameID = G.GameID)
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
         WHERE ((HomeResult = 'W' AND HomeOdds < 0) OR (HomeResult = 'L' AND AwayOdds < 0))
      ), FavoredLosses AS (
         SELECT GameId, GameDate AS Date, HomeTeam AS Home, AwayTeam AS Away, FavoredTeam AS Bet, HomeOdds, AwayOdds, 'L' AS Win
         FROM GameOddsWithFavored
         WHERE ((HomeResult = 'W' AND HomeOdds > 0) OR (HomeResult = 'L' AND AwayOdds > 0))
      ), UnionBoth AS (
         SELECT *
         FROM FavoredLosses
         UNION
         SELECT *
         FROM FavoredWins
      )
      SELECT *
      FROM UnionBoth
      WHERE Date >= '${startDate}' AND Date <= '${finalDate}' AND Bet='${team}'
      ORDER BY Date;
      
      
      
   
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
       
         results = addingWage(results, betType, wager);
 
         res.json({results: results})
         
       }
     });
 
 
});
/* Route #7: GETS the data for various betting strategies, when the user bets on the underdog team winning over an interval   */
/* Request Path: “/unfavored?betType=&wager=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the */
/* Query Parameters: N/A */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the underdog team each time for various wagers and betting strategies, along with the relevant game data */
router.get('/unfavored', function(req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant"
  const wager = req.query.wager ? req.query.wager : 100
  const team = req.query.team? req.query.team : "Warriors"
  const startDate = req.query.start? req.query.start: "2012-10-30"
  const finalDate = req.query.end? req.query.end : "2019-04-10"
  console.log(wager)
 
     connection.query(`WITH OddsWin AS (
      SELECT O.TeamId as oti, O.GameId AS GameID, O.BetOnlineML AS ML, O.Result, T.TeamId, T.Nickname AS Nickname
      FROM Odds O, Teams T
      WHERE T.TeamId = O.TeamId
  ), GameOdds AS (
     SELECT HOdds.GameId AS GameID, G.GameDate, HOdds.Nickname AS HomeTeam, AOdds.Nickname AS AwayTeam, HOdds.ML AS HomeOdds, AOdds.ML AS AwayOdds, HOdds.Result AS HomeResult
     FROM OddsWin HOdds, Games G, OddsWin AOdds
     WHERE (HOdds.oti = G.HomeTeamId AND HOdds.GameID = G.GameID AND AOdds.oti = G.VisitorTeamId AND AOdds.GameID = G.GameID)
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
     WHERE ((HomeResult = 'W' AND HomeOdds < 0) OR (HomeResult = 'L' AND AwayOdds < 0))
  ), UnfavoredLosses AS (
     SELECT GameId, GameDate AS Date, HomeTeam AS Home, AwayTeam AS Away, UnfavoredTeam AS Bet, HomeOdds, AwayOdds, 'W' as Win
     FROM GameOddsWithFavored
     WHERE ((HomeResult = 'W' AND HomeOdds > 0) OR (HomeResult = 'L' AND AwayOdds > 0))
  ), UnionBoth AS (
     SELECT *
     FROM UnfavoredLosses
     UNION
     SELECT *
     FROM UnfavoredWins
  )
  SELECT *
  FROM UnionBoth
  WHERE Date >= '${startDate}' AND Date <= '${finalDate}' AND Bet ='${team}'
  ORDER BY Date;
  
      
      
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {

        results = addingWage(results, betType, wager);
        
        res.json({results: results})
 
       
        
       }
     });
 
 
});
 

/* Route #8: GETS the probability of a specified player scoring a certain amount of points after they already scored that number in the game prior */
/* Request Path: “/pointsstreak?player=&numPoints=” */
/* Request Parameters: N/A
/* Query Parameters: player, which denotes the player in question, and numPoints which denotes the number of points in question
/* Response Parameters: the results, which is the probability of the specified player scoring a certain amount of points after they already scored that number in the game prior */
router.get('/pointsstreak', function(req, res) {
 const player = req.query.player ? req.query.player: 'Stephen Curry'
 const numPoints = req.query.points ? req.query.points: 20
  console.log(wager)
 
     connection.query(`WITH NumberedRows AS (
       SELECT ROW_NUMBER() OVER(ORDER BY GameID) AS RowNumber, G.GameID AS GameID, G.TeamID AS TeamID, G.PlayerName AS Name, G.Pts As Points
       FROM GamesDetails G
       WHERE G.PlayerName = '${player}'
       ORDER BY G.GameID ASC
      ), CartesianProduct AS (
       SELECT A.Name AS Name, B.Points AS LastPoints, A.Points AS NextPoints
       FROM NumberedRows A,  NumberedRows B
       WHERE A.RowNumber = (B.RowNumber - 1) AND (B.Points > '${numPoints}')
      ), NumScoresAtLeast AS (
         SELECT COUNT(*) AS More
         FROM CartesianProduct CP
         WHERE (CP.NextPoints > '${numPoints}')
      ), Total AS (
         SELECT COUNT(*) AS Total
         FROM CartesianProduct CP
      )
      SELECT (N.More / T.Total)
      FROM NumScoresAtLeast N, Total T
     
    
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         res.json({results: results})
       }
     });
 
 
});
/* Route #9: GETS the probability of a specified player scoring a certain amount of points given that the team won */
/* Request Path: “/carryingteam?player=&numPoints=” */
/* Request Parameters: N/A
/* Query Parameters: player, which denotes the player in question, and numPoints which denotes the number of points in question
/* Response Parameters: the results, which is the probability of a specified player scoring a certain amount of points given that the team won */
router.get('/carryingteam', function(req, res) {
 const player = req.query.player ? req.query.player: 'Stephen Curry'
 const numPoints = req.query.points ? req.query.points: 20
  console.log(wager)
 
     connection.query(`WITH TotalPlayerPoints AS (
       SELECT TeamId, PlayerId, PlayerName, SUM(Pts) AS TotalPoints
       FROM GamesDetails
       GROUP BY TeamId, PlayerId, PlayerName
   ),
   HighestScoringPlayers AS (
       SELECT H.TeamId, H.PlayerId, H.PlayerName AS PlayerName, H.TotalPoints
       FROM TotalPlayerPoints H
       WHERE TotalPoints = (
           SELECT MAX(T.TotalPoints)
           FROM TotalPlayerPoints T
           WHERE (T.TeamId = H.TeamId)
       )
   ), GamesWonByHomeTeam AS (
     SELECT G.GameId AS GameId, G.HomeTeamId AS WINNING_TEAM
       FROM Games G
     WHERE (G.HomeWin = 1)
   ), GamesWonByAwayTeam AS (
       SELECT G.GameId AS GameId, G.VisitorTeamId AS WINNING_TEAM
       FROM Games G
     WHERE (G.HomeWin = 0)
   ), GamesWonByTeam AS (
     (SELECT *
     FROM (GamesWonByHomeTeam)
     UNION
     SELECT *
       FROM (GamesWonByAwayTeam))
   ), GamesScoredMore AS (
       SELECT H.PlayerId, COUNT(*) AS ScoredMore, H.PlayerName
       FROM GamesDetails D, GamesWonByTeam G, HighestScoringPlayers H
       WHERE (D.GameId = G.GameId) AND (D.PlayerId = H.PlayerId) AND (D.Pts > '${numPoints}')
       GROUP BY H.PlayerId
   ), GamesPlayedIn AS (
     SELECT H.PlayerId, COUNT(*) AS Total, H.PlayerName
       FROM GamesDetails D, GamesWonByTeam G, HighestScoringPlayers H
       WHERE (D.GameId = G.GameId) AND (D.PlayerId = H.PlayerId)
       GROUP BY H.PlayerId
   )
   SELECT M.PlayerId, M.ScoredMore, P.Total, (M.ScoredMore / P.Total) AS Pct, M.PlayerName
   FROM GamesScoredMore M, GamesPlayedIn P
   WHERE (M.PlayerId = P.PlayerId)
  
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         res.json({results: results})
       }
     });
 
 
});
 
/* Route #10: GETS the players in the league who are consistent, scoring over half a standard deviation above the mean */
/* Request Path: “/consistentplayers” */
/* Request Parameters: N/A
/* Query Parameters: N/A
/* Response Parameters: the results, the players in the league who are consistent, scoring over half a standard deviation above the mean */
router.get('/consistentplayers', function(req, res) {
 
     connection.query(`WITH StdDevPoints AS (
       SELECT (STD(G.PTS) / 2) AS HalfStdDev, AVG(G.PTS) AS AvgPts
       FROM GamesDetails G
     ), StdDevAboveAvg AS (
       SELECT (st.HalfStdDev + st.AvgPts) AS Threshold
       FROM StdDevPoints st
     ), FindRelevantPlayers AS (
       SELECT P.GameID AS GameID, P.TeamID AS TeamID, P.PlayerName AS PlayerName, P.PTS AS Points
       FROM GamesDetails P
       WHERE P.PTS >= ALL (SELECT s.Threshold FROM StdDevAboveAvg s)
     ), SortedGames AS (
       SELECT G.GameDate AS GameDate, G.SEASON AS Season, RP.PlayerName AS PlayerName, RP.Points AS POINTS
       FROM Games G, FindRelevantPlayers RP
       WHERE G.GameID = RP.GameID AND (RP.TeamID = G.HomeTeamID)
       ORDER BY G.GameDate ASC
     ), CountNumTimesOverStg AS (
        SELECT SG.Season, SG.PlayerName, COUNT(*) AS NumTimesOverStdAvg
        FROM SortedGames SG
        GROUP BY SG.Season, SG.PlayerName
        ORDER BY SG.Season
     ), FindBestCount AS (
        SELECT CS.Season AS Season, MAX(CS.NumTimesOverStdAvg) AS Count
        FROM CountNumTimesOverStg CS
        GROUP BY CS.Season
     )
     SELECT S1.Season, S1.PlayerName, S2.Count
     FROM CountNumTimesOverStg S1, FindBestCount S2
     WHERE S1.Season = S2.Season AND S1.NumTimesOverStdAvg = S2.Count;
    
  
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         res.json({results: results})
       }
     });
 
 
});
 
/* Route #11: GETS a statistic that illustrates how the total number of points changes with the number of steals */
/* Request Path: “/steals” */
/* Request Parameters: N/A
/* Query Parameters: N/A
/* Response Parameters: the results, which is an average of all the points for each amount of steals */
 
router.get('/steals', function(req, res) {
 
     connection.query(`with steal_per_game_team as (
       select GameId, TeamId as Team, sum(g.PTS) as Points, sum(g.STL) as Steals from
       GamesDetails g
       group by GameId, TeamId
   ), steals_opponent_scores_home as (
       select g.GameID, AwayPoints as Opponent_Points, s.Team, s.Steals
       from Games g
                join steal_per_game_team s on g.GameID = s.GameID and
                                              (g.HomeTeamID = s.Team)
   ), steals_opponent_scores_away as (
       select g.GameID, HomePoints as Opponent_Points, s.Team, s.Steals
       from Games g join steal_per_game_team s on g.GameID = s.GameID and
                                                  (g.VisitorTeamID = s.Team)
   ), home_team_steal_avg as (
       select 1, Steals, avg(Opponent_Points) as Avg_Points
       from steals_opponent_scores_home
       group by Steals
   ), away_team_steal_avg as (
       select 2, Steals, avg(Opponent_Points) as Avg_Points
       from steals_opponent_scores_away
       group by Steals
   ), agg_table as (
           (select * from home_team_steal_avg)
           union
           (select * from away_team_steal_avg)
   ) select steals, avg(Avg_Points) as Average_points from agg_table
       group by steals
  
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         res.json({results: results})
       }
     });
 
 
});
 
/* Route #12: GETS the data for various betting strategies, when the user bets on a team given that a player on that team scored a certain number of points in the last game   */
/* Request Path: “/ifbetplayer?betType=&wager=&player=&numPoints=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the */
/* Query Parameters: player, which denotes the player we are casing on, numPoints, which denotes the number of points scored by the player in the year before, team, which denotes the team the player is on */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team with the player who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/ifbetplayer', function(req, res) {
 const betType = req.query.betType ? req.query.betType : "Constant"
 const wager = req.query.wager ? req.query.wager : 100
 const player = req.query.player ? req.query.player: 'Stephen Curry'
 const numPoints = req.query.points ? req.query.points: 20
 const team = req.query.team ? req.query.team: 'Warriors'
 const startDate = req.query.start? req.query.start: "2012-10-30"
  const finalDate = req.query.end? req.query.end : "2019-04-10"
   console.log(wager)
 
     connection.query(`WITH HomeTeam AS (
      SELECT O.Date AS Date, '${team}' AS BettedTeam, GD.PTS as PTS, GD.PlayerName AS PlayerName, t.Nickname AS HomeTeam, O.BetOnlineML AS HomeOdds, O.Result AS BettedResult, O.GameID AS GameID, O.AverageLineML AS BettedAverageLineML
      FROM Odds O JOIN GamesDetails GD ON O.GameID = GD.GameID JOIN Teams t ON t.TeamId = O.TeamId
      WHERE O.Location = 'Home' AND GD.PlayerName = '${player}'
      ORDER BY O.Date ASC
     ), AwayTeam AS (
      SELECT O.Date AS Date, '${team}' AS BettedTeam, GD.PTS as PTS, GD.PlayerName AS PlayerName, t.Nickname AS AwayTeam, O.BetOnlineML AS AwayOdds, O.Result AS BettedResult, O.GameID AS GameID, O.AverageLineML AS BettedAverageLineML
      FROM Odds O JOIN GamesDetails GD ON O.GameID = GD.GameID JOIN Teams t ON t.TeamId = O.TeamId
      WHERE O.Location = 'Away' AND GD.PlayerName = '${player}'
      ORDER BY O.Date ASC
     ), PlayerToTeam AS (
        SELECT DISTINCT p.PLAYER_NAME AS PlayerName, o.Team AS Team
        FROM Players p JOIN Odds o ON p.TEAM_ID = o.TeamId JOIN Teams T ON o.TeamId = T.TeamId
        WHERE p.PLAYER_NAME = '${player}' AND T.Nickname = '${team}'
     ), UnionHomeAway AS (
        SELECT A.Date, A.BettedTeam, A.PTS, A.GameID, A.PlayerName, H.HomeTeam, A.AwayTeam, A.BettedResult, H.HomeOdds, A.AwayOdds
        FROM HomeTeam H JOIN AwayTeam A ON H.GameID = A.GameID AND H.PlayerName = A.PlayerName
        WHERE H.PlayerName = '${player}' AND EXISTS (SELECT * FROM PlayerToTeam)
     ), NumberedRows AS (
        SELECT ROW_NUMBER() OVER(ORDER BY O.Date) AS RowNumber, O.GameID, O.Date AS Date, '${team}' AS BettedTeam, O.PTS as PTS, O.PlayerName AS PlayerName, O.HomeTeam AS HomeTeam,
             O.AwayTeam AS AwayTeam, O.BettedResult AS BettedResult, O.HomeOdds, O.AwayOdds
        FROM UnionHomeAway O
        ORDER BY O.Date
     ), CartesianProduct AS (
        SELECT A.GameID, A.Date, A.HomeTeam AS Home, A.AwayTeam AS Away, A.BettedTeam AS Bet, A.HomeOdds, A.AwayOdds, A.BettedResult AS Win
        FROM NumberedRows A,  NumberedRows B
        WHERE A.RowNumber = (B.RowNumber - 1) AND B.PTS >= '${numPoints}'
     )
     SELECT *
     FROM CartesianProduct
     WHERE Date >= '${startDate}' AND Date <= '${finalDate}';
     
      
   
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         
         results = addingWage(results, betType, wager)
         res.json({results: results})
       
        
       }
     });
 
 
});
 
/* Route #13: GETS the data for various betting strategies, when the user bets on a team given that they are at home  */
/* Request Path: “/ifbethome?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the */
/* Query Parameters: team, which denotes the team that we are betting on when they are at home */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is home who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/ifbethome', function(req, res) {
 const betType = req.query.betType ? req.query.betType : "Constant"
 const wager = req.query.wager ? req.query.wager : 100
 const team = req.query.team ? req.query.team: 'Warriors'
 const startDate = req.query.start? req.query.start: "2012-10-30"
  const finalDate = req.query.end? req.query.end : "2019-04-10"
   console.log(wager)
   
     connection.query(`WITH RenameHome AS (
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
  
    
   
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         results = addingWage(results, betType, wager)
         res.json({results: results})
       }
         
     });
 
 
});
 
/* Route #14: GETS the data for various betting strategies, when the user bets on a team given that they are away  */
/* Request Path: “/ifbethome?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the */
/* Query Parameters: team, which denotes the team that we are betting on when they are at home */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is away who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/ifbetaway', function(req, res) {
 const betType = req.query.betType ? req.query.betType : "Constant"
 const wager = req.query.wager ? req.query.wager : 100
 const team = req.query.team ? req.query.team: 'Warriors'
 const startDate = req.query.start? req.query.start: "2012-10-30"
 const finalDate = req.query.end? req.query.end : "2019-04-10"
   console.log(wager)
 
     connection.query(`WITH RenameHome AS (
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
  
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
        
        results = addingWage(results, betType, wager)
 
         res.json({results: results})
         
 
       
        
       }
     });
 
 
});

/* Route #15: GETS all of the team names and nicknames like "Warriors, 76ers, etc."*/
/* Request Path: “/teamnames” */
/* Request Parameters: N/A
/* Query Parameters: N/A
/* Response Parameters: the results, which is the a list of all of the team names along with their nicknames*/
router.get('/teamnames', function(req, res) {


      connection.query(`SELECT DISTINCT CONCAT(t.CITY, ' ', t.Nickname) AS Fullname, t.Nickname AS Nickname
      FROM Teams t;
      `, function(error, results, fields) {
        if (error) {
          console.log(error)
          res.json({error: error})
        }
        else if (results) {
          res.json({results: results})
        }
      });
  
  
 });

 /* Route #16: Reports to the backend the various forms and inputs for the betting strategies 
/* Request Path: /onload */
/* Request Parameters: N/A
/* Query Parameters: N/A
/* Response Parameters: the results, which is the a list of all of all the bets are their various inputs*/
router.get('/onload', function(req, res) {
  
  var obj = {
    "Bet Strategies" :
    [{
    "name": "Player Bet",
    "description": "Gets the data for various betting strategies, when the user bets on a team given that a player on that team scored a certain number of points in the last game ",
    "route": "ifbetplayer",
    "form" :
    {
        "player"    : "player",
        "points"         : "integer"
    }}, {
      "name": "Favored Bet",
      "description": " Gets the data for various betting strategies, when the user bets on the favored team winning over an interval",
      "route": "favored",
      "form" :
      {
      },}, {
        "name": "Unfavored Bet",
        "description": " Gets the data for various betting strategies, when the user bets on the unfavored team winning over an interval",
        "route": "unfavored",
        "form" :
        {
        },}, {
          "name": "Home Bet",
          "description": " Gets the data for various betting strategies, when the user bets on the home team winning over an interval",
          "route": "ifbethome",
          "form" :
          {
          },}, 
          {
            "name": "Away Bet",
            "description": " Gets the data for various betting strategies, when the user bets on the away team winning over an interval",
            "route": "ifbetaway",
            "form" :
            {
            },}, 
            {
              "name": "Zigzag Bet",
              "description": " Gets the data for various betting strategies, when the user bets on the home team winning after a loss over an interval",
              "route": "zigzag",
              "form" :
              {
              },}, 
              {
                "name": "Heavy Favorite Bet",
                "description": " Gets the data for various betting strategies, when the user bets on the heavy favored team over an interval",
                "route": "heavyfavorite",
                "form" :
                {
                  "Odds"    : "odds",
              },}, 
              {
                "name": "Win Streak Bet",
                "description": " Gets the data for various betting strategies, when the user bets on a team on a win streak over an interval",
                "route": "winstreak",
                "form" :
                {
                },},
                {
                  "name": "Losing Streak Bet",
                  "description": " Gets the data for various betting strategies, when the user bets on a team on a losing streak over an interval",
                  "route": "losingstreak",
                  "form" :
                  {
                  },},
                  {
                    "name": "Liked Team Bet",
                    "description": " Gets the data for various betting strategies, when the user bets on a team they they like over an interval",
                    "route": "likedteam",
                    "form" :
                    {
                    },},
                    {
                      "name": "Home Recovery Bet",
                      "description": " Gets the data for various betting strategies, when the user bets on a team that had a poor shooting performance in their previous game and are now at home over an interval",
                      "route": "homerecovery",
                      "form" :
                      {
                      },}], 
    "Wage Strategies" :
    [{
      "name": "Constant",
      "description": "Betting the same amount of money, the wager, on each bet",   
    }, 
    {
      "name": "Double Increment",
      "description": "Betting double the amount of money of the previous wager, on each bet",   
    },
    {
      "name": "Increment",
      "description": "Betting an incrementing amount of money on each wager",   
    },
    {
      "name": "Martingale",
      "description": "Betting according to the classic Martingale Strategy where one doubles their bet at each round if a loss occurs",   
    }
  ]
  }
      
 
  res.json(obj);

});
 
/* Route #17: Gets all of the names of the the players on a given team */
/* Request Path: “/playersonteam” */
/* Request Parameters: N/A
/* Query Parameters: Nickname of Team
/* Response Parameters: the results, which is the a list of all of the players on a given team*/
router.get('/playersonteam', function(req, res) {

  const team = req.query.team ? req.query.team: 'Warriors'
  connection.query(`SELECT DISTINCT p.PLAYER_NAME AS PlayerName
  FROM Players p JOIN Teams t ON p.TEAM_ID = t.TeamId
  WHERE NICKNAME = '${team}'
  ORDER BY p.PLAYER_NAME;
  `, function(error, results, fields) {
    if (error) {
      console.log(error)
      res.json({error: error})
    }
    else if (results) {
      res.json({results: results})
    }
  });


});

/* Route #18: GETS the data for various betting strategies, when the user bets on a team given that they lost the game before and are at home  */
/* Request Path: “/zigzag?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the */
/* Query Parameters: team and dates, which denotes the team that we are betting on when they are at home after a loss */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is home who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/zigzag', function(req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant"
  const wager = req.query.wager ? req.query.wager : 100
  const team = req.query.team ? req.query.team: 'Warriors'
  const startDate = req.query.start? req.query.start: "2012-10-30"
   const finalDate = req.query.end? req.query.end : "2019-04-10"
    console.log(wager)
    
      connection.query(`WITH RenameHome AS (
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
    ), NumberedRows AS (
        SELECT ROW_NUMBER() OVER(ORDER BY Date) AS RowNumber, O.GameID, O.Date AS Date, O.Home, O.Away, O.HomeOdds, O.AwayOdds, O.Win
        FROM JoinHomeAway O
        WHERE O.Home =  '${team}'
        ORDER BY O.Date ASC
    ), CartesianProduct AS (
        SELECT A.GameID, A.Date, A.Home, A.Away, A.Home AS Bet, A.HomeOdds, A.AwayOdds, A.Win
        FROM NumberedRows A,  NumberedRows B
        WHERE A.RowNumber = (B.RowNumber - 1) AND B.Win = "L"
    )
    SELECT *
    FROM CartesianProduct
    WHERE Date >= '${startDate}' AND Date <=  '${finalDate}'
    ORDER BY Date;
    
   
     
    
      `, function(error, results, fields) {
        if (error) {
          console.log(error)
          res.json({error: error})
        }
        else if (results) {
          results = addingWage(results, betType, wager)
          res.json({results: results})
        }
          
      });
  
  
 });

 /* Route #19: GETS the data for various betting strategies, when the user bets on a team given the team is a heavy favorite, specified by the odds  */
/* Request Path: “/heavyfavorite?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the */
/* Query Parameters: team, odds, and dates, which denotes the team that we are betting on when they are at home after a loss */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is home who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/heavyfavorite', function(req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant"
  const wager = req.query.wager ? req.query.wager : 100
  const odds = req.query.Odds ? req.query.Odds : -300
  const team = req.query.team ? req.query.team: 'Warriors'
  const startDate = req.query.start? req.query.start: "2012-10-30"
   const finalDate = req.query.end? req.query.end : "2019-04-10"
    console.log(wager)
    
      connection.query(`WITH OddsWithTeamNames AS (
        SELECT O.TeamId as oti, O.GameId AS GameID, O.BetOnlineML AS ML, O.Result, T.TeamId, T.Nickname AS Nickname
        FROM Odds O, Teams T
        WHERE T.TeamId = O.TeamId
    ), GameOdds AS (
        SELECT HOdds.GameId AS GameID, G.GameDate, HOdds.Nickname AS HomeTeam, AOdds.Nickname AS AwayTeam, HOdds.ML AS HomeOdds, AOdds.ML AS AwayOdds, HOdds.Result AS HomeResult
        FROM OddsWithTeamNames HOdds, Games G, OddsWithTeamNames AOdds
        WHERE (HOdds.oti = G.HomeTeamId AND HOdds.GameID = G.GameID AND AOdds.oti = G.VisitorTeamId AND AOdds.GameID = G.GameID)
    ), GameOddsWithFavored AS (
       (SELECT *, HomeTeam AS HeavyFavoredTeam
       FROM GameOdds
       WHERE (HomeOdds <='${odds}'))
       UNION
       (SELECT *, AwayTeam AS HeavyFavoredTeam
       FROM GameOdds
       WHERE (AwayOdds <= '${odds}'))
    ), FavoredWins AS (
       SELECT GameId, GameDate, HomeTeam, AwayTeam, HeavyFavoredTeam, HomeOdds, AwayOdds, 'W' AS BetResult
       FROM GameOddsWithFavored
       WHERE ((HomeResult = 'W' AND HomeOdds < 0) OR (HomeResult = 'L' AND AwayOdds < 0))
    ), FavoredLosses AS (
       SELECT GameId, GameDate, HomeTeam, AwayTeam, HeavyFavoredTeam, HomeOdds, AwayOdds, 'L' AS BetResult
       FROM GameOddsWithFavored
       WHERE ((HomeResult = 'W' AND HomeOdds > 0) OR (HomeResult = 'L' AND AwayOdds > 0))
    ), UnionBoth AS (
       SELECT *
       FROM FavoredLosses
       UNION
       SELECT *
       FROM FavoredWins
    )
    SELECT GameID, GameDate AS Date, HomeTeam AS Home, AwayTeam as Away, HeavyFavoredTeam AS Bet, HomeOdds, AwayOdds, BetResult AS Win
    FROM UnionBoth
    WHERE GameDate >= '${startDate}' AND GameDate <= '${finalDate}' AND HeavyFavoredTeam = '${team}'
    ORDER BY GameDate;
    
    
   
     
    
      `, function(error, results, fields) {
        if (error) {
          console.log(error)
          res.json({error: error})
        }
        else if (results) {
          results = addingWage(results, betType, wager)
          res.json({results: results})
        }
          
      });
  
  
 });

 /* Route #20: GETS the data for various betting strategies, when the user bets on a team given the team is on a large winstreak, specified by the odds  */
/* Request Path: “/winstreak?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team and dates, which denotes the team that we are betting on */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is winning and who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/winstreak', function(req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant"
  const wager = req.query.wager ? req.query.wager : 100
  const team = req.query.team ? req.query.team: 'Warriors'
  const startDate = req.query.start? req.query.start: "2012-10-30"
   const finalDate = req.query.end? req.query.end : "2019-04-10"
    console.log(wager)
    
      connection.query(`
      
    
      `, function(error, results, fields) {
        if (error) {
          console.log(error)
          res.json({error: error})
        }
        else if (results) {
          results = addingWage(results, betType, wager)
          res.json({results: results})
        }
          
      });
  
  
 });

  /* Route #21: GETS the data for various betting strategies, when the user bets on a team given the team is on a large losing streak, specified by the odds  */
/* Request Path: “/losingstreak?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team, streak, and dates, which denotes the team that we are betting on */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is losing and who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/losingstreak', function(req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant"
  const wager = req.query.wager ? req.query.wager : 100
  const team = req.query.team ? req.query.team: 'Warriors'
  const startDate = req.query.start? req.query.start: "2012-10-30"
   const finalDate = req.query.end? req.query.end : "2019-04-10"
    console.log(wager)
    
      connection.query(`
      
    
      `, function(error, results, fields) {
        if (error) {
          console.log(error)
          res.json({error: error})
        }
        else if (results) {
          results = addingWage(results, betType, wager)
          res.json({results: results})
        }
          
      });
  
  
 });

  /* Route #22: GETS the data for various betting strategies, when the user bets on a team given the that they like that team, specified by the odds  */
/* Request Path: “/likedteam?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team, and dates, which denotes the team that we are betting on */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is liked by the user and who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/likedteam', function(req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant"
  const wager = req.query.wager ? req.query.wager : 100
  const team = req.query.team ? req.query.team: 'Warriors'
  const startDate = req.query.start? req.query.start: "2012-10-30"
   const finalDate = req.query.end? req.query.end : "2019-04-10"
    console.log(wager)
    
      connection.query(`WITH RenameHome AS (
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
    
      
    
      `, function(error, results, fields) {
        if (error) {
          console.log(error)
          res.json({error: error})
        }
        else if (results) {
          results = addingWage(results, betType, wager)
          res.json({results: results})
        }
          
      });
  
  
 });

  /* Route #23: GETS the data for various betting strategies, when the user bets on a team given they shot poorly in the previous game and are now at home, specified by the odds  */
/* Request Path: “/homerecovery?betType=&wager=&team=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the wager*/
/* Query Parameters: team and dates, which denotes the team that we are betting on */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the team that is recovering from a poor shooting performance and who scored for various wagers and betting strategies, along with the relevant game data */
router.get('/homerecovery', function(req, res) {
  const betType = req.query.betType ? req.query.betType : "Constant"
  const wager = req.query.wager ? req.query.wager : 100
  const team = req.query.team ? req.query.team: 'Warriors'
  const startDate = req.query.start? req.query.start: "2012-10-30"
   const finalDate = req.query.end? req.query.end : "2019-04-10"
    console.log(wager)
    
      connection.query(`WITH RenameHome AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Home, O.BetOnlineML AS HomeOdds, O.BetOnlineSpread as HomeSpread, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'home'
    ), RenameAway AS (
        SELECT O.GameID, O.Date, O.Location, T.Nickname AS Away, O.BetOnlineML AS AwayOdds, O.BetOnlineSpread as AwaySpread, O.Result AS Win
        FROM Odds O JOIN Teams T ON O.TeamID = T.TeamId
        WHERE O.Location = 'away'
    ), JoinHomeAway AS (
        SELECT ROW_NUMBER() OVER (ORDER BY H.GameID) AS RowNum, H.GameID, A.Date, H.Home AS Home, A.Away AS Away, '${team}' AS Bet, H.HomeOdds, A.AwayOdds, IF(H.Home = '${team}', H.Win, A.Win) AS Win
        FROM RenameHome H JOIN RenameAway A ON H.GameId = A.GameId
        WHERE (H.Home = '${team}')
    ), GameInfo AS (
        SELECT G.GameDate, GameID, HomeTeamID, H.Nickname AS Home, HomePoints, VisitorTeamID, A.Nickname AS Away, HomeFGPCT, AwayFGPCT, HomeFG3PCT, AwayFG3PCT, AwayPoints
        FROM Games G JOIN Teams H ON (H.TeamId = G.HomeTeamID)
            JOIN Teams A ON (A.TeamId = G.VisitorTeamID)
    ), Data AS (
        SELECT G.GameID, IF(Home = '${team}', G.HomeFGPCT, G.AwayFGPCT) AS FGPCT, IF(Home = '${team}', G.HomePoints, G.AwayPoints) AS Points
        FROM GameInfo G
        WHERE (Home = '${team}' OR Away = '${team}')
    ), Stats AS (
        SELECT AVG(FGPCT) AS AvgFGPct, AVG(Points) AS AvgPoints, FORMAT(STD(FGPCT), 3) AS FGPctStDev, FORMAT(STD(Points), 3) AS PointsStDev
        FROM Data
    )
    SELECT J.GameID, Date, Home, Away, Bet, HomeOdds, AwayOdds, Win
    FROM JoinHomeAway J JOIN Data D ON (J.GameID = D.GameID)
    WHERE (D.FGPCT <=  ALL (
        SELECT (AvgFGPct - FGPctStDev)
        FROM Stats S
    )) AND (D.Points <=  ALL (
        SELECT (AvgPoints - PointsStDev)
        FROM Stats S
    ))
      AND EXISTS (
        SELECT *
        FROM JoinHomeAway J2
        WHERE (J2.RowNum = J.RowNum + 1) AND (J2.Win = 'W')
    )
    
    
      
    
      `, function(error, results, fields) {
        if (error) {
          console.log(error)
          res.json({error: error})
        }
        else if (results) {
          results = addingWage(results, betType, wager)
          res.json({results: results})
        }
          
      });
  
  
 });


function addingWage(results, betType, wager)
{
  count = 0;
  winnings = 0;
  if (betType == "Constant")
         {
         for (let i = 0; i  < results.length; i++)
         {
            results[i].wager = wager;
            if (results[i].Win == "W")
            {
               if (results[i].Bet == results[i].Home)
               {
                if (results[i].HomeOdds < 0)
                {
                   
                     winnings = ((-100 / (results[i].HomeOdds)) * wager) + winnings
                     results[i].amountwon = ((-100 / (results[i].HomeOdds)) * wager);
                     results[i].totalwinnings = winnings;
                    
                }
                else
                {
                  winnings = ((results[i].HomeOdds / (100)) * wager) + winnings
                  results[i].amountwon = ((results[i].HomeOdds / (100)) * wager);
                  results[i].totalwinnings = winnings;

                }
               }
               else
               {
                if (results[i].AwayOdds < 0)
                {
                   
                     winnings = ((-100 / (results[i].AwayOdds)) * wager) + winnings
                     results[i].amountwon = ((-100 / (results[i].AwayOdds)) * wager);
                     results[i].totalwinnings = winnings;
                    
                }
                else
                {
                  winnings = ((results[i].AwayOdds / (100)) * wager) + winnings
                  results[i].amountwon = ((results[i].AwayOdds / (100)) * wager);
                  results[i].totalwinnings = winnings;

                }
               }
            }
            else
            {
                 winnings = winnings - wager
                 results[i].amountwon = -wager;
                results[i].totalwinnings = winnings;
            }
            count++;
         }
         }
         else if (betType == "Increment")
         {
           for (let i = 0; i  < results.length; i++)
           {
            results[i].wager = (wager * (count + 1));
            if (results[i].Win == "W")
            {
               if (results[i].Bet == results[i].Home)
               {
                if (results[i].HomeOdds < 0)
                {
                   
                     winnings = ((-100 / (results[i].HomeOdds)) * (wager * (count + 1))) + winnings
                     results[i].amountwon = ((-100 / (results[i].HomeOdds)) * (wager * (count + 1)));
                     results[i].totalwinnings = winnings;
                    
                }
                else
                {
                  winnings = ((results[i].HomeOdds / (100)) *(wager * (count + 1))) + winnings
                  results[i].amountwon = ((results[i].HomeOdds / (100)) * (wager * (count + 1)));
                  results[i].totalwinnings = winnings;

                }
               }
               else
               {
                if (results[i].AwayOdds < 0)
                {
                   
                     winnings = ((-100 / (results[i].AwayOdds)) * (wager * (count + 1))) + winnings
                     results[i].amountwon = ((-100 / (results[i].AwayOdds)) * (wager * (count + 1)));
                     results[i].totalwinnings = winnings;
                    
                }
                else
                {
                  winnings = ((results[i].AwayOdds / (100)) * (wager * (count + 1))) + winnings
                  results[i].amountwon = ((results[i].AwayOdds / (100)) * (wager * (count + 1)));
                  results[i].totalwinnings = winnings;

                }
               }
            }
            else
            {
                 winnings = winnings - (wager * (count + 1))
                 results[i].amountwon = -(wager * (count + 1));
                results[i].totalwinnings = winnings;
            }
            count++;
         }
         }
         else if (betType == "Doubling")
         {
           for (let i = 0; i  < results.length; i++)
           {
            results[i].wager = (wager * (2 *  (count + 1)));
            if (results[i].Win == "W")
            {
               if (results[i].Bet == results[i].Home)
               {
                if (results[i].HomeOdds < 0)
                {
                   
                     winnings = ((-100 / (results[i].HomeOdds)) * (wager * (2 *  (count + 1)))) + winnings
                     results[i].amountwon = ((-100 / (results[i].HomeOdds)) * (wager * (2 *  (count + 1))));
                     results[i].totalwinnings = winnings;
                    
                }
                else
                {
                  winnings = ((results[i].HomeOdds / (100)) * (wager * (2 *  (count + 1)))) + winnings
                  results[i].amountwon = ((results[i].HomeOdds / (100)) * (wager * (2 *  (count + 1))));
                  results[i].totalwinnings = winnings;

                }
               }
               else
               {
                if (results[i].AwayOdds < 0)
                {
                   
                     winnings = ((-100 / (results[i].AwayOdds)) * (wager * (2 *  (count + 1)))) + winnings
                     results[i].amountwon = ((-100 / (results[i].AwayOdds)) * (wager * (2 *  (count + 1))));
                     results[i].totalwinnings = winnings;
                    
                }
                else
                {
                  winnings = ((results[i].AwayOdds / (100)) * (wager * (2 *  (count + 1)))) + winnings
                  results[i].amountwon = ((results[i].AwayOdds / (100)) * (wager * (2 *  (count + 1))));
                  results[i].totalwinnings = winnings;

                }
               }
            }
            else
            {
                 winnings = winnings - (wager * (2 *  (count + 1)))
                 results[i].amountwon = -(wager * (2 *  (count + 1)));
                results[i].totalwinnings = winnings;
            }
            count++;
         }
         }
         else if (betType = "Martingale")
         {
          for (let i = 0; i  < results.length; i++)
          {
           
            if (i != 0)
            {
            if (results[i-1].Win == "L")
            {
               results[i].wager = (2 * results[i-1].wager)
            }
            else
            {
              results[i].wager = wager;
            }
            }
            else
            {
              results[i].wager = wager;
            }
            
           if (results[i].Win == "W")
           {
              if (results[i].Bet == results[i].Home)
              {
               if (results[i].HomeOdds < 0)
               {
                  
                    winnings = ((-100 / (results[i].HomeOdds)) * (results[i].wager)) + winnings
                    results[i].amountwon = ((-100 / (results[i].HomeOdds)) * (results[i].wager));
                    results[i].totalwinnings = winnings;
                   
               }
               else
               {
                 winnings = ((results[i].HomeOdds / (100)) * (results[i].wager)) + winnings
                 results[i].amountwon = ((results[i].HomeOdds / (100)) * (results[i].wager)) ;
                 results[i].totalwinnings = winnings;

               }
              }
              else
              {
               if (results[i].AwayOdds < 0)
               {
                  
                    winnings = ((-100 / (results[i].AwayOdds)) * (results[i].wager)) + winnings
                    results[i].amountwon = ((-100 / (results[i].AwayOdds)) * (results[i].wager));
                    results[i].totalwinnings = winnings;
                   
               }
               else
               {
                 winnings = ((results[i].AwayOdds / (100)) * (results[i].wager)) + winnings
                 results[i].amountwon = ((results[i].AwayOdds / (100)) * (results[i].wager))
                 results[i].totalwinnings = winnings;

               }
              }
           }
           else
           {
                winnings = winnings - (results[i].wager)
                results[i].amountwon = -(results[i].wager);
               results[i].totalwinnings = winnings;
           }
           count++;

         }
        }

         return results;
}

/* Route #24: Add a user to the DynamoDB Table */
router.post('/adduser', function(req, res) {
    var userName = req.body.username;
    db.lookup(userName, function(err, data) {
       if (data)
       {
          res.json({error: "This username is taken."})
       }
       else {
          var passWord = req.body.password;
          var fullname = ""+req.body.firstname+" "+req.body.lastname;
          var emailAddress = req.body.emailaddress;
          if (userName == undefined || passWord == undefined|| fullname == undefined || emailAddress == undefined )
			    {
				      res.json({error: "An input was empty or inefficient. Try again!"})
			    }
          else {
            var hashedPassword = CryptoJS.SHA256(passWord).toString()
            db.addUser(userName, hashedPassword, fullname, emailAddress, function(err, data) {
            {
                if (err)
                {
                  console.log(err);
                }
                else{
                  res.json({username: "username"})
                }
                
            }
          });
          }
       }
    })

});
 
module.exports = router;
 

