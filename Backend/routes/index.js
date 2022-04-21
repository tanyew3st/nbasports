var express = require('express');
var router = express.Router();
const mysql = require('mysql');


const connection = mysql.createConnection({
  host:"lit-database.crejo6jmuckg.us-east-1.rds.amazonaws.com",
  user:"admin",
  password:"password",
  port:"3306",
  database:"Odds"
});
connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'NBA Betting' });
});

/* GET win bet with certain wager */
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

/* GET standings for a given year */
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

/* GET upset bet */
router.get('/upsetteam', function(req, res) {
  const wager = req.params.wager ? req.params.wager : 100
 
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


/* GET probability of win after loss bet */
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


/* GET most favored teams for a given year */
router.get('/favored', function(req, res) {
  const wager = req.query.wager ? req.query.wager : 100
  const year = req.query.year ? req.query.year : 2015
   console.log(wager)

      connection.query(`WITH SeasonOdds AS (
        SELECT G.Season, O.TeamID, T.Nickname, AVG(O.AverageLineML) AS Average
        FROM Games G, Odds O, Teams T
        WHERE (G.GameID = O.GameID) AND (T.TeamId = O.TeamID) AND (G.Season = '${year}')
        GROUP BY O.TeamId, G.Season
        ORDER BY Average ASC
     ), SeasonLowest5 AS (
        (SELECT S.Season, S.TeamID, S.Nickname, S.Average
        FROM SeasonOdds S
        WHERE (S.Season = '${year}')
        ORDER BY S.Average
        LIMIT 5)
     ), GamesWonByHomeTeam AS (
       SELECT G.GameId AS GameId, G.HomeTeamId AS WinningTeam
        FROM Games G
       WHERE (G.HomeWin = 1) AND (G.Season = '${year}')
     ), GamesWonByAwayTeam AS (
        SELECT G.GameId AS GameId, G.VisitorTeamId AS WinningTeam
        FROM Games G
       WHERE (G.HomeWin = 0) AND (G.Season = '${year}')
     ), GamesWonByTeam AS (
       (SELECT *
       FROM (GamesWonByHomeTeam)
       UNION
       SELECT *
        FROM (GamesWonByAwayTeam))
     ), SeasonTop5 AS (
        SELECT W.WinningTeam, T.Nickname, COUNT(*) AS NumWins
        FROM GamesWonByTeam W, Teams T
        WHERE (W.WinningTeam = T.TeamId)
        GROUP BY W.WinningTeam, T.Nickname
        ORDER BY NumWins DESC
        LIMIT 5
     ), Result AS (
        SELECT COUNT(*) AS NumLowestOddsInTop
        FROM SeasonTop5 T, SeasonLowest5 L
        WHERE (T.WinningTeam = L.TeamId)
     )
     SELECT *
     FROM Result
     
     
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


/* GET probability of a player going on a points hot streak */
router.get('/pointsstreak', function(req, res) {
  const wager = req.query.wager ? req.query.wager : 100
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
/* GET probability of a player scoring a certain number of points if the team wins  */
router.get('/carryingteam', function(req, res) {
  const wager = req.query.wager ? req.query.wager : 100
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

/* GET players who were consistent: scoring at least a half a standard deviation over the mean  */
router.get('/consistentplayers', function(req, res) {
  const wager = req.query.wager ? req.query.wager : 100
   console.log(wager)

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

/* GET players who were consistent: scoring at least a half a standard deviation over the mean  */
router.get('/steals', function(req, res) {
  const wager = req.query.wager ? req.query.wager : 100
   console.log(wager)

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



module.exports = router;
