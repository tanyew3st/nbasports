
var express = require('express');
var router = express.Router();
const mysql = require('mysql');

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
/* Request Path: “/favored?betType=&wager=*/
/* Request Parameters: betType and wager, which denotes the betting strategy and the */
/* Query Parameters: N/A */
/* Response Parameters: the results, which is the expected profit from this kind of bet on the favorite team each time for various wagers and betting strategies, along with the relevant game data */
 
router.get('/favored', function(req, res) {
 const betType = req.query.betType ? req.query.betType : "Constant"
 const wager = req.query.wager ? req.query.wager : 100
  console.log(wager)
 
     connection.query(`WITH OddsWin AS (
       SELECT O.TeamId as oti, O.GameId AS GameID, O.AverageLineML AS AverageLineML, O.Result, T.TeamId, T.Nickname AS Nickname
           FROM Odds O, Teams T
       WHERE T.TeamId = O.TeamId
       ), GameOdds AS (
           SELECT HOdds.GameId AS GameID, G.GameDate, HOdds.Nickname AS HomeTeam, AOdds.Nickname AS AwayTeam, HOdds.AverageLineML AS HomeOdds, AOdds.AverageLineML AS AwayOdds, HOdds.Result AS HomeResult
           FROM OddsWin HOdds, Games G, OddsWin AOdds
           WHERE (HOdds.oti = G.HomeTeamId AND HOdds.GameID = G.GameID AND AOdds.oti = G.VisitorTeamId AND AOdds.GameID = G.GameID)
       ), GameOddsWithFavored AS (
           (SELECT *, HomeTeam AS FavoredTeam
           FROM GameOdds
           WHERE (HomeOdds < 0))
           UNION
           (SELECT *, AwayTeam AS FavoredTeam
           FROM GameOdds
           WHERE (AwayTeam < 0))
       ), FavoredWins AS (
           SELECT GameId, GameDate, HomeTeam, AwayTeam, FavoredTeam, HomeOdds, AwayOdds, 1 AS FavoredWins
           FROM GameOddsWithFavored
           WHERE ((HomeResult = 'W' AND HomeOdds < 0) OR (HomeResult = 'L' AND AwayOdds < 0))
       ), FavoredLosses AS (
           SELECT GameId, GameDate, HomeTeam, AwayTeam, FavoredTeam, HomeOdds, AwayOdds, 0 AS FavoredWins
           FROM GameOddsWithFavored
           WHERE ((HomeResult = 'W' AND HomeOdds > 0) OR (HomeResult = 'L' AND AwayOdds > 0))
       )
       SELECT *
       FROM FavoredLosses
       UNION
       SELECT *
       FROM FavoredWins
      
   
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         let winnings = 0;
         count = 0;
 
         if (betType == "Constant")
         {
         for (let i = 0; i  < results.length; i++)
         {
            if (results[i].FavoredWins == 1)
            {
               if (results[i].HomeOdds < 0)
               {
                  
                    winnings = ((-100 / (results[i].HomeOdds)) * wager) + winnings
                    if (count % 100 == 0)
                    {
                    console.log(winnings);
                    }
               }
               else if (results[i].AwayOdds < 0)
               {
                   winnings = ((-100 / (results[i].AwayOdds)) * wager) + winnings
                   if (count % 100 == 0)
                    {
                    console.log(winnings);
                    }
               }
             
            }
            else
            {
                 winnings = winnings - wager
                 if (count % 100 == 0)
                    {
                    console.log(winnings);
                    }
            }
            count++;
         }
         }
         else if (betType == "Increment")
         {
           for (let i = 0; i  < results.length; i++)
           {
              if (results[i].FavoredWins == 1)
              {
                 if (results[i].HomeOdds < 0)
                 {
                    
                      winnings = ((-100 / (results[i].HomeOdds)) * (wager * (count + 1))) + winnings
                      if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].AwayOdds < 0)
                 {
                     winnings = ((-100 / (results[i].AwayOdds)) * (wager * (count + 1))) + winnings
                     if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings - (wager * (count + 1))
                   if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
         else if (betType == "Doubling")
         {
           for (let i = 0; i  < results.length; i++)
           {
              if (results[i].FavoredWins == 1)
              {
                 if (results[i].HomeOdds < 0)
                 {
                    
                      winnings = ((-100 / (results[i].HomeOdds)) * (wager * (2 *  (count + 1)))) + winnings
                      if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].AwayOdds < 0)
                 {
                     winnings = ((-100 / (results[i].AwayOdds)) *  (wager * (2 *  (count + 1)))) + winnings
                     if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings -  (wager * (2 *  (count + 1)))
                   if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
 
         res.json({winnings: winnings, results: results})
         console.log(winnings)
 
       
        
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
  console.log(wager)
 
     connection.query(`WITH OddsWin AS (
       SELECT O.TeamId as oti, O.GameId AS GameID, O.AverageLineML AS AverageLineML, O.Result, T.TeamId, T.Nickname AS Nickname
           FROM Odds O, Teams T
       WHERE T.TeamId = O.TeamId
       ), GameOdds AS (
           SELECT HOdds.GameId AS GameID, G.GameDate, HOdds.Nickname AS HomeTeam, AOdds.Nickname AS AwayTeam, HOdds.AverageLineML AS HomeOdds, AOdds.AverageLineML AS AwayOdds, HOdds.Result AS HomeResult
           FROM OddsWin HOdds, Games G, OddsWin AOdds
           WHERE (HOdds.oti = G.HomeTeamId AND HOdds.GameID = G.GameID AND AOdds.oti = G.VisitorTeamId AND AOdds.GameID = G.GameID)
       ), GameOddsWithFavored AS (
           (SELECT *, AwayTeam AS UnfavoredTeam
           FROM GameOdds
           WHERE (HomeOdds < 0))
           UNION
           (SELECT *, HomeTeam AS UnfavoredTeam
           FROM GameOdds
           WHERE (AwayTeam < 0))
       ), UnfavoredWins AS (
           SELECT GameId, GameDate, HomeTeam, AwayTeam, UnfavoredTeam, HomeOdds, AwayOdds, 0 AS UnfavoredLosses
           FROM GameOddsWithFavored
           WHERE ((HomeResult = 'W' AND HomeOdds < 0) OR (HomeResult = 'L' AND AwayOdds < 0))
       ), UnfavoredLosses AS (
           SELECT GameId, GameDate, HomeTeam, AwayTeam, UnfavoredTeam, HomeOdds, AwayOdds, 1 as UnfavoredWins
           FROM GameOddsWithFavored
           WHERE ((HomeResult = 'W' AND HomeOdds > 0) OR (HomeResult = 'L' AND AwayOdds > 0))
       )
       SELECT *
       FROM UnfavoredLosses
       UNION
       SELECT *
       FROM UnfavoredWins
      
      
      
   
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         let winnings = 0;
         count = 0;
 
         if (betType == "Constant")
         {
         for (let i = 0; i  < results.length; i++)
         {
            if (results[i].UnfavoredWins == 1)
            {
               if (results[i].HomeOdds < 0)
               {
                  
                    winnings = ((-100 / (results[i].HomeOdds)) * wager) + winnings
                    if (count % 100 == 0)
                    {
                    console.log(winnings);
                    }
               }
               else if (results[i].AwayOdds < 0)
               {
                   winnings = ((-100 / (results[i].AwayOdds)) * wager) + winnings
                   if (count % 100 == 0)
                    {
                    console.log(winnings);
                    }
               }
             
            }
            else
            {
                 winnings = winnings - wager
                 if (count % 100 == 0)
                    {
                    console.log(winnings);
                    }
            }
            count++;
         }
         }
         else if (betType == "Increment")
         {
           for (let i = 0; i  < results.length; i++)
           {
              if (results[i].UnfavoredWins == 1)
              {
                 if (results[i].HomeOdds < 0)
                 {
                    
                      winnings = ((-100 / (results[i].HomeOdds)) * (wager * (count + 1))) + winnings
                      if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].AwayOdds < 0)
                 {
                     winnings = ((-100 / (results[i].AwayOdds)) * (wager * (count + 1))) + winnings
                     if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings - (wager * (count + 1))
                   if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
         else if (betType == "Doubling")
         {
           for (let i = 0; i  < results.length; i++)
           {
              if (results[i].UnfavoredWins == 1)
              {
                 if (results[i].HomeOdds < 0)
                 {
                    
                      winnings = ((-100 / (results[i].HomeOdds)) * (wager * (2 *  (count + 1)))) + winnings
                      if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].AwayOdds < 0)
                 {
                     winnings = ((-100 / (results[i].AwayOdds)) *  (wager * (2 *  (count + 1)))) + winnings
                     if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings -  (wager * (2 *  (count + 1)))
                   if (count % 100 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
 
         res.json({winnings: winnings, results: results})
         console.log(winnings)
 
       
        
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
 const team = req.query.team ? req.query.team: 'Golden State'
   console.log(wager)
 
     connection.query(`WITH HomeTeam AS (
       SELECT O.Date AS Date, '${team}' AS BettedTeam, GD.PTS as PTS, GD.PlayerName AS PlayerName, O.Team AS HomeTeam, O.Opponent AS AwayTeam, O.Result AS BettedResult, O.GameID AS GameID, O.AverageLineML AS BettedAverageLineML
       FROM Odds O JOIN GamesDetails GD ON O.GameID = GD.GameID
       WHERE O.Team = '${team}' AND O.Location = 'Home'
       ORDER BY O.Date ASC
     ), AwayTeam AS (
       SELECT O.Date AS Date, '${team}' AS BettedTeam, GD.PTS as PTS, GD.PlayerName AS PlayerName,O.Opponent AS HomeTeam, O.Team AS AwayTeam, O.Result AS BettedResult, O.GameID AS GameID, O.AverageLineML AS BettedAverageLineML
       FROM Odds O JOIN GamesDetails GD ON O.GameID = GD.GameID
       WHERE O.Team ='${team}' AND O.Location = 'Away'
       ORDER BY O.Date ASC
     ), UnionHomeAway AS (
         SELECT *
         FROM HomeTeam H
         WHERE H.PlayerName = '${player}'
         UNION
         SELECT *
         FROM AwayTeam A
         WHERE A.PlayerName = '${player}'
     ), NumberedRows AS (
         SELECT ROW_NUMBER() OVER(ORDER BY O.Date) AS RowNumber, O.Date AS Date, '${team}' AS BettedTeam, O.PTS as PTS, O.PlayerName AS PlayerName, O.HomeTeam AS HomeTeam,
              O.AwayTeam AS AwayTeam, O.BettedResult AS BettedResult, O.GameID AS GameID, O.BettedAverageLineML AS BettedAverageLineML
         FROM UnionHomeAway O
         ORDER BY O.Date
     ), CartesianProduct AS (
       SELECT A.Date, A.BettedTeam AS BettedTeam, A.HomeTeam, A.AwayTeam, A.BettedAverageLineML, A.BettedResult AS BetResult
       FROM NumberedRows A,  NumberedRows B
       WHERE A.RowNumber = (B.RowNumber - 1) AND B.PTS >= '${numPoints}'
     )
     SELECT *
     FROM CartesianProduct;
    
      
   
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         let winnings = 0;
         count = 0;
        
         if (betType == "Constant")
         {
         for (let i = 0; i  < results.length; i++)
         {
            if (results[i].BetResult == "W")
            {
               if (results[i].BettedAverageLineML < 0)
               {
                  
                    winnings = ((-100 / (results[i].BettedAverageLineML)) * wager) + winnings
                    if (count % 1 == 0)
                    {
                    console.log(winnings);
                    }
                   
               }
               else if (results[i].BettedAverageLineML > 0)
               {
                   winnings = ((results[i].BettedAverageLineML / (100)) * wager) + winnings
                   if (count % 1 == 0)
                    {
                    console.log(winnings);
                    }
               }
             
            }
            else
            {
                 winnings = winnings - wager
                 if (count % 1 == 0)
                    {
                    console.log(winnings);
                    }
            }
            count++;
         }
         }
         else if (betType == "Increment")
         {
           for (let i = 0; i  < results.length; i++)
           {
             if (results[i].BetResult == "W")
              {
               if (results[i].BettedAverageLineML < 0)
                 {
                    
                   winnings = ((-100 / (results[i].BettedAverageLineML)) * (wager * (count + 1))) + winnings
                      if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].BettedAverageLineML > 0)
                 {
                   winnings = ((results[i].BettedAverageLineML / (100)) * (wager * (count + 1))) + winnings
                     if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings - (wager * (count + 1))
                   if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
         else if (betType == "Doubling")
         {
           for (let i = 0; i  < results.length; i++)
           {
             if (results[i].BetResult == "W")
              {
               if (results[i].BettedAverageLineML < 0)
                 {
                    
                   winnings = ((-100 / (results[i].BettedAverageLineML)) * (wager * (2 *  (count + 1)))) + winnings
                      if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].BettedAverageLineML > 0)
                 {
                   winnings = ((results[i].BettedAverageLineML / (100)) *  (wager * (2 *  (count + 1)))) + winnings
                     if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings -  (wager * (2 *  (count + 1)))
                   if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
 
         res.json({winnings: winnings, results: results})
         console.log(winnings)
       
 
       
        
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
   console.log(wager)
   
     connection.query(`SELECT G.GameDate, G.GameID, G.HomeWin, O.BestLineML AS Odds
     FROM Games G JOIN Odds O ON (G.GameID = O.GameID)
     WHERE G.HomeTeamID IN (
         SELECT TeamId
         FROM Teams
         WHERE (Nickname = '${team}')) AND (O.Location = 'home')
         ORDER BY (G.GameDate)
    
   
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         let winnings = 0;
         count = 0;
        
         if (betType == "Constant")
         {
         for (let i = 0; i  < results.length; i++)
         {
            if (results[i].HomeWin == 1)
            {
               if (results[i].Odds < 0)
               {
                  
                    winnings = ((-100 / (results[i].Odds)) * wager) + winnings
                    if (count % 1 == 0)
                    {
                    console.log(winnings+"ODDS: "+results[i].Odds);
                    }
                   
               }
               else if (results[i].Odds > 0)
               {
                   winnings = ((results[i].Odds / (100)) * wager) + winnings
                   if (count % 1 == 0)
                    {
                    console.log(winnings);
                    }
               }
             
            }
            else
            {
                 winnings = winnings - wager
                 if (count % 1 == 0)
                    {
                    console.log(winnings);
                    }
            }
            count++;
         }
         }
         else if (betType == "Increment")
         {
           for (let i = 0; i  < results.length; i++)
           {
             if (results[i].HomeWin == 1)
              {
               if (results[i].Odds < 0)
                 {
                    
                   winnings = ((-100 / (results[i].Odds)) * (wager * (count + 1))) + winnings
                      if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].Odds > 0)
                 {
                   winnings = ((results[i].Odds / (100)) * (wager * (count + 1))) + winnings
                     if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings - (wager * (count + 1))
                   if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
         else if (betType == "Doubling")
         {
           for (let i = 0; i  < results.length; i++)
           {
             if (results[i].HomeWin == 1)
              {
               if (results[i].Odds < 0)
                 {
                    
                   winnings = ((-100 / (results[i].Odds)) * (wager * (2 *  (count + 1)))) + winnings
                      if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].Odds > 0)
                 {
                   winnings = ((results[i].Odds / (100)) *  (wager * (2 *  (count + 1)))) + winnings
                     if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings -  (wager * (2 *  (count + 1)))
                   if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
 
         res.json({winnings: winnings, results: results})
         console.log(winnings)
         console.log(count)
 
       
        
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
   console.log(wager)
 
     connection.query(`SELECT G.GameDate, G.GameID, G.HomeWin AS AwayLose, O.BestLineML AS Odds
     FROM Games G JOIN Odds O ON (G.GameID = O.GameID)
     WHERE G.VisitorTeamID IN (
         SELECT TeamId
         FROM Teams
         WHERE (Nickname = '${team}')) AND (O.Location = 'away')
         ORDER BY G.GameDate
     `, function(error, results, fields) {
       if (error) {
         console.log(error)
         res.json({error: error})
       }
       else if (results) {
         let winnings = 0;
         count = 0;
        
         if (betType == "Constant")
         {
         for (let i = 0; i  < results.length; i++)
         {
            if (results[i].AwayLose == 0)
            {
               if (results[i].Odds < 0)
               {
                  
                    winnings = ((-100 / (results[i].Odds)) * wager) + winnings
                    if (count % 1 == 0)
                    {
                    console.log(winnings);
                    }
                   
               }
               else if (results[i].Odds > 0)
               {
                   winnings = ((results[i].Odds / (100)) * wager) + winnings
                   if (count % 1 == 0)
                    {
                    console.log(winnings);
                    }
               }
             
            }
            else
            {
                 winnings = winnings - wager
                 if (count % 1 == 0)
                    {
                    console.log(winnings);
                    }
            }
            count++;
         }
         }
         else if (betType == "Increment")
         {
           for (let i = 0; i  < results.length; i++)
           {
             if (results[i].AwayLose== 0)
              {
               if (results[i].Odds < 0)
                 {
                    
                   winnings = ((-100 / (results[i].Odds)) * (wager * (count + 1))) + winnings
                      if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].Odds > 0)
                 {
                   winnings = ((results[i].Odds / (100)) * (wager * (count + 1))) + winnings
                     if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings - (wager * (count + 1))
                   if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
         else if (betType == "Doubling")
         {
           for (let i = 0; i  < results.length; i++)
           {
             if (results[i].AwayLose== 0)
              {
               if (results[i].Odds < 0)
                 {
                    
                   winnings = ((-100 / (results[i].Odds)) * (wager * (2 *  (count + 1)))) + winnings
                      if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
                 else if (results[i].Odds > 0)
                 {
                   winnings = ((results[i].Odds / (100)) *  (wager * (2 *  (count + 1)))) + winnings
                     if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
                 }
               
              }
              else
              {
                   winnings = winnings -  (wager * (2 *  (count + 1)))
                   if (count % 1 == 0)
                      {
                      console.log(winnings);
                      }
              }
              count++;
           }
         }
 
         res.json({winnings: winnings, results: results})
         console.log(winnings)
         console.log(count)
 
       
        
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
 
 
 
 
module.exports = router;
 

