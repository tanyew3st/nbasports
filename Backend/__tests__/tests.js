const { expect } = require("@jest/globals");
const supertest = require("supertest");
// const { number } = require("yargs");
const results = require("./results.json")
const router = require('../routes/index');

console.log(typeof router)

// **********************************
//         BASIC ROUTES TESTS
// **********************************

// jest.setTimeout(10000);

describe('Sanity test', () => {
  test('1 should equal 1', () => {
    expect(1).toBe(1)
  })
})

// test("GET / no parameters",  () => {
//   console.log('hey1')
//   const req = supertest(router).get("/")
//     .then(() => {
//       console.log('BRUH')
//     })
//   console.log('hey2')
//       // .expect(200)
//       // .then((response) => {
//       //   expect(1).toBe(1)
//       // });
// });

test("GET /favored?team=Hawks&wager=2000&start=2012-11-02&end=2012-11-02&betType=Constant Favored Constant",  () => {
  console.log("hello")  
   supertest(router).get("/favored?team=Hawks&wager=2000&start=2012-11-02&end=2012-11-02&betType=Constant")
      .expect(200)
      .then((response) => {
        expect(response.body[0].Date).toBe('2012-11-02')
      });
});

test("GET /unfavored?team=Celtics&wager=2965&start=2012-10-30&end=2012-10-31&betType=Doubling Unfavored Doubling",  () => {
  console.log("hello")  
   supertest(router).get("/favored?team=Hawks&wager=2000&start=2012-11-02&end=2012-11-02&betType=Constant")
      .expect(200)
      .then((response) => {
        expect(response.body[0].Date).toBe('2012-10-30')
      });
});

test("GET /ifbethome?team=Lakers&wager=6085&start=2018-10-30&end=2019-04-10&betType=Increment If Bet Home Increment",  () => {
  console.log("hello")  
   supertest(router).get("/ifbethome?team=Lakers&wager=6085&start=2018-10-30&end=2019-04-10&betType=Increment")
      .expect(200)
      .then((response) => {
        expect(response.body[0].GameDate).toBe('2018-10-31')
      });
});


test("GET /likedteam?team=Trail%20Blazers&wager=2110&start=2012-10-30&end=2019-04-10&betType=Martingale Liked Team Martingale",  () => {
  console.log("hello")  
   supertest(router).get("/likedteam?team=Trail%20Blazers&wager=2110&start=2012-10-30&end=2019-04-10&betType=Martingale")
      .expect(200)
      .then((response) => {
        expect(response.body[0].GameDate).toBe('2012-12-29')
      });
});

test("GET /heavyfavorite?team=Warriors&wager=2145&start=2012-10-30&end=2019-04-10&betType=Constant&Odds=-565 Heavy Favorite Constant",  () => {
  console.log("hello")  
   supertest(router).get("/heavyfavorite?team=Warriors&wager=2145&start=2012-10-30&end=2019-04-10&betType=Constant&Odds=-565")
      .expect(200)
      .then((response) => {
        expect(response.body[0].GameDate).toBe('2012-12-21')
      });
});