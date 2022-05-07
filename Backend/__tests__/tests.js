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

test("GET / no parameters", async () => {
  console.log('hey1')
  const req = await supertest(router).get("/")
    .then(() => {
      console.log('BRUH')
    })
  console.log('hey2')
      // .expect(200)
      // .then((response) => {
      //   expect(1).toBe(1)
      // });
});

// test("GET /favored?team=Hawks&wager=2000&start=2012-11-02&end=2012-11-02&betType=Constant no parameters", async () => {
//   console.log("hello")  
//   await supertest(router).get("/favored?team=Hawks&wager=2000&start=2012-11-02&end=2012-11-02&betType=Constant")
//       .expect(200)
//       .then((response) => {
//         expect(response.body[0].GameId).toBe(21200018)
//       });
// });