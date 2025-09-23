const express =  require('express');
const app = express();
const soilRoute = require("./Route/soilRoute");
const weatherRoute = require("./Route/weatherData")
const cropRecommendation = require("./Route/crop");
const cropChatbot = require("./Route/cropChatbot");
const cookieParser = require('cookie-parser');
const cropPricePredictation = require('./Route/cropPricePredictation');
const cors = require('cors');

const  userAuthRouter = require("./Route/UserAuth");
const main = require("./config/db");
require('dotenv').config();

app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))
app.use(express.json());
app.use("/user", userAuthRouter)
app.use("/weather",weatherRoute)
app.use("/data",soilRoute);
app.use("/chat",cropChatbot);
app.use("/price",cropPricePredictation);
app.use("/crop",cropRecommendation);
const IntailizeConnection = async()=>{
    try{
         await Promise.all([
            main(), 
           
        ]);
        console.log("Data Base is Connected");
            app.listen(process.env.PORT,()=>{
                console.log("Lisiting at Port Number :"+process.env.PORT);
            })
    }catch(err){
        console.log("Error :"+err);
    }
}
IntailizeConnection();