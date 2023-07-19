const express= require('express');
const mysql=require('mysql2');

const app = express();

const urlDB = "mysql://root:dHERmcfc9mc4JdYiY9GA@containers-us-west-207.railway.app:5888/railway"
let dbConnection = mysql.createConnection(urlDB)

module.exports=dbConnection;