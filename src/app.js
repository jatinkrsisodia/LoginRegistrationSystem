require('dotenv').config({path:__dirname+'/../.env'})
const express = require ("express");

// console.log(process.env.PORT);

const app = express();
const port = process.env.PORT || 3000;
require("./db/conn");
const path = require("path");
const hbs = require("hbs");
const Register =require("./models/registers")
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const cookie = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

const staticPath = path.join(__dirname,"../public");
const templatePath = path.join(__dirname,"../templates/views");
const partialsPath = path.join(__dirname,"../templates/partials");

// console.log(path.join(__dirname));
app.use(express.static(staticPath));
app.set("view engine","hbs");

app.set("views",templatePath);

hbs.registerPartials(partialsPath);



app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/secret",auth,(req,res)=>{
    // console.log(`this is the cookie awesome${req.cookies.jwt}`)
    res.render("secret");
});
app.get("/logout",auth,async(req,res)=>{
    try{
        console.log(req.user);

        // single logut 

        // req.user.tokens = req.user.tokens.filter((curE)=>{
        //     return curE.token != req.token
        // })

        req.user.tokens = [];


        res.clearCookie("jwt");
           console.log("logout Successfully");
           await req.user.save();
           res.render("login");
    }catch(error){
        res.status(500).send((error));
    }
})
app.get("/register",(req,res)=>{
    res.render("register");
});
app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/register",async(req,res)=>{
 try{

    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if(password===cpassword){

        const data = {
            firstname : req.body.firstname,
            lastname  : req.body.lastname,
            email    :  req.body.email,
            gender   :   req.body.gender,
            phone   :   req.body.phone,
            age    :   req.body.age,
            password:  password,
            confirmpassword: cpassword
        }

        const registerEmployee= new Register(data)

        // password Hash 

        console.log("the success part"+ registerEmployee);

        const token =  await registerEmployee.generateAuthToken();
        console.log("this token part"+token);

        res.cookie("jwt",token,{
            expires:new Date (Date.now()+600000),
            httpOnly:true
        });
        console.log(cookie);

        const registerd =  await registerEmployee.save()
        console.log("this page"+registerd);
        res.status(201).render("index");
        
    }
    else{
        res.send("password are not matchig");
    }

 }catch(error){
    res.status(400).send(error);
    console.log(error);
 }
});

//  login check 




app.post("/login" ,async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        // console.log(email, password)

        const useremail = await Register.findOne({email:email});
        const isMatch = await bcrypt.compare(password,useremail.password);

        const token =  await useremail.generateAuthToken();
        console.log("this token part"+token);

        res.cookie("jwt",token,{
            expires:new Date (Date.now()+600000),
            httpOnly:true
        });
        
        // res.send(useremail);
        // console.log(useremail);
        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("invalid password details")
        }

    }catch{
                 res.status(400).send("invalid ligin deatails");
    }
})




app.listen(process.env.PORT,()=>{
    console.log(`listening to the port no : ${process.env.PORT}`);
});