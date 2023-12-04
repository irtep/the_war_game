import express from 'express';
import path from 'path';
import apiTeamsRouter from './routes/apiTeams';
import apiWeaponsRouter from './routes/apiWeapons';
//import apiUsersRouter from './routes/apiUsers';
import errorhandler from './errors/errorhandler';
//import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 
import cors from 'cors';

dotenv.config(); 

const app : express.Application = express();

const port : number = Number(process.env.PORT);

app.use(cors({origin : "http://localhost:3000"}))
/*
const checkToken = (req : express.Request, res : express.Response, next : express.NextFunction) => {
    
    try {

        let token : string = req.headers.authorization!.split(" ")[1];

        res.locals.user = jwt.verify(token, String(process.env.ACCESS_TOKEN_KEY));

        next();

    } catch (e: any) {
        console.log(e);
        res.status(401).json({});
    }

}*/

app.use(express.static(path.resolve(__dirname, "public")));

//app.use("/api/auth", apiAuthRouter);

//app.use("/api/credentials", checkToken, apiCredentialsRouter);

app.use("/api/teams", apiTeamsRouter);
app.use("/api/weapons", apiWeaponsRouter);

app.use(errorhandler);

app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {

    if (!res.headersSent) {
        res.status(404).json({ viesti : "invalid route"});
    }

    next();
});

app.listen(port, () => {

    console.log(`Server online on port : ${port}`);    

});

// npm start
// npx prisma studio
// muutoksen jälkeen: npx prisma migrate dev --name init
// https://github.com/xamk-so2/soveltava-harjoitustyo-dpera005xamk/tree/main