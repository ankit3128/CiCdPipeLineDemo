import sum from "./sum.js";
// test("sum of two numbers",()=>{
//     expect(sum(2,3)).toBe(5);
// });

describe("test for sum fnx",()=>{
    test("test for sum of two numbers",()=>{
        expect(sum(2,3)).toBe(5);
    }   )
    
    test("test for sum of two numbers",()=>{
        expect(sum(2,6)).toBe(8);
    }   )
})