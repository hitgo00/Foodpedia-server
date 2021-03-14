const express = require('express')
     app = express()
     mongoose=require('mongoose')
     dotenv = require('dotenv');
     bodyParser=require("body-parser");
     methodOverride=require("method-override");

// Use
app.use(bodyParser.json()); 
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended:true}));

// env file config
dotenv.config();

// Connect to DB Atlas
mongoose.connect(process.env.DB_url,{useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true})
    .then(()=>{
        console.log('Connected to DB');
    })
    .catch(e =>{
        console.log('Database Error');
        console.log(e);
})

// Models / Schemas
const UserSchema = new mongoose.Schema({
	username:String,
	email:String,
	food_journal_items:[
        {
            food_name : String,
            image_url : String,
            created   : String,
            metadata  : String
        }
    ]
});
const User=mongoose.model("User",UserSchema);

// Routes ..
app.get('/',(req,res)=>{
    res.send(`<h1>FoodPedia</h1>`);
})

// For testing
app.post('/additem',(req,res)=>{
    // Add to the database
    const date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    console.log(req.body);
    const user = new User({
             username : 'hemang_test', // will be retrieved from the gid 
             email : req.query.email,
             food_journal_items : [
                {
                    food_name : req.body.food_name,
                    image_url : req.body.img_url,
                    created   : date,
                    metadata  : req.body.description           
                }
        ]
    });

    user.save((err,result)=>{
        if(err)res.send(err);
        else {
            console.log('FoodItem Added');
            res.send(result);
        }
    })
})

// Server Listening 
const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>console.log('Server has started'));