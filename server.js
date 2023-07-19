const express = require('express');
const app = express();
const  db=require('./db/connect.js');
const cors=require('cors');
const Joi= require('joi');
const bodyParser = require('body-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const cookieParser = require('cookie-parser')





app.use(express.json());
app.use(cors({
    origin : ["https://wonderful-mandazi-3c1585.netlify.app"],
    methods:["GET" , "POST"],
    credentials:true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
      key:"userId",
      secret:"NACHIKETH",
      resave: false,
      saveUninitialized:false,
      cookie:{
        expires:60*60*24*1000
      }
}));

app.get('/',(req,res)=>{
      res.send("The FireFlix server is running")
})

app.post('/register',async (req,res)=>{
    const email=req.body.email;
    const username=req.body.username;
    let userpassword=req.body.userpassword;

     bcrypt.hash(userpassword,saltRounds,(err, hash)=>{

        if(err){
            res.json({"Error message": err});
        }
        userpassword = hash;

        db.query("INSERT INTO users (username,userpassword,email) VALUES (?,?,?)",[username,userpassword,email],(err,result1)=>{
           
                if(err){
                 res.send(err);
                }else{
                   res.send(result1);
                }
            });

    });

})

app.get('/login',async (req,res)=>{
    console.log("session of get login",req.session.user);
    if(req.session.user){
        res.send({loggedIn:true,user:req.session.user})
    }else{
        res.send({loggedIn:false});
    }
})


app.post('/login',async (req,res)=>{
    
    const email = req.body.email;
    const userpassword = req.body.userpassword;
     
     db.query(`SELECT * FROM users WHERE email ='${email}'`,(err,ans)=>{
    
        if(err){
         res.send({"there is been a error!!":err});
        }
        if(Object.keys(ans).length)
        {
           bcrypt.compare(userpassword,ans[0].userpassword,(error,isValid)=>{
            if(isValid){
                req.session.user = ans;
                console.log("session of post login",req.session.user);
                res.send(ans);
            }else{

                res.json({"message":"Wrong password and username combination!!!"});
            }
            })
        }else{

            res.status(401).send({"message":"User dosent exists"}); 
        }
    });
})


//Subscription APIs
//1 - Get user subscription
//Todo:
//  - get  the selected subscription in ui
// app.get('/user/:userId/subscription', (req, res) => {
//     db.query("SELECT email FROM subscription WHERE email=? AND subscription_status=true",[req.params['userId']],(err,ans)=>{
//         if(err){
//              res.send("there is been a error!!");
//             }
//         console.log(ans.length);
//             if(ans.length)
//             {
//                res.status(200).send(ans);
//             }else{
//                 res.status(404).send('Not Found!!');
//             }
//         });
// })

//2 - Insert new subscription in DB
app.post('/user/subscribe',(req,res)=>{
    //console.log(req.body.email,req.body.plan_id);
    const plan_id=req.body.plan_id;
    const email=req.body.email;
    db.query("insert into subscription (email,plan_id,sub_status) values (?,?,?)",[email,plan_id,"inActive"],(err,ans)=>{
        if(err){
         res.send("there is been a error!!");
        }
    //console.log(ans);
        if(ans)
        {
           res.status(200).send(ans);
        }else{
            res.status(401).send('error !!');
        }
    });
})

// 3 - Subscription update!
app.put('/user/subscriptionUpdate',(req,res)=>{
    const plan_id=req.body.plan_id;
    const email=req.body.email;
    //delete previous subscription!
    db.query("Update subscription set plan_id=? where email=?",[plan_id,email],(err,ans)=>{
        if(err){
         res.send("there is been a error!!");
        }
    //console.log(ans.length);
        if(ans)
        {
           res.status(200).send("User Subscription is updated");
        }else{
            res.status(401).send('error !!');
        }
    });
})


app.post('/user/payment',(req,res)=>{
    //console.log(req.body.email,req.body.plan_id);
    const payment_type=req.body.payment_type;
    const email=req.body.email;
    console.log(payment_type);
    console.log(email);
    db.query("insert into payment (email,payment_type,payment_name) values (?,?,?)",[email,payment_type,'check'],(err,_ans)=>{
        if(err){
         res.send("there is been a error!!");
        }
    //console.log(ans);
    db.query("Update subscription set sub_status=? where email=?",["Active",email],(err1,ans1)=>{
        if(err1){
         res.send("there is been a error!!");
        }
    console.log(ans1.length);
        res.status(200).send('UPDATED!!');
    });
    //    res.status(200).send('inserted');
         
    });
   
})

app.put('/user/deleteaccount',(req,res)=>{
    const plan_id=req.body.plan_id;
    const email=req.body.email;
    //delete previous subscription!
    db.query("delete from  users where email=?",[email],(err,ans)=>{
        if(err){
         res.send("there is been a error!!");
        }
    //console.log(ans.length);
        if(ans)
        {
           res.status(200).send("the account has been deleted!!!");
        }else{
            res.status(401).send('error !!');
        }
    });
})

app.listen(3001,"0.0.0.0",()=>{
    console.log('listening !!!');
});