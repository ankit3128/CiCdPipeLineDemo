import express from "express";
import sum from "./sum.js";

const app = express();

const port= 8000;




app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
app.get("/home",async(req,res)=>{
   res.json({
    message:"welcome to my page"
   })
})
 app .get("/getSum/:a/:b", async(req,res)=>{
    const a= parseInt(req.params.a);
    const b = parseInt(req.params.b);
    const result = sum(a,b);
    res.json({
        result:result
    })
 })