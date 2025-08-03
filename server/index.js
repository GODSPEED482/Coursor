const express = require("express")
const app = express()
const port  = 5000

app.get("/",function(req,res){
    res.send("Welcome to Backend PORT. You can find the APIs and their functionalities below :  ")
})
app.listen(port,()=>{
    console.log("server running on : " + `http://localhost:${port}`)
})