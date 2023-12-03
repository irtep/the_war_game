import express from 'express';
import path from 'path';
import apiTeamsRouter from './routes/apiTeams';
//import apiAuthRouter from './routes/apiAuth';
//import apiUsersRouter from './routes/apiUsers';
import errorhandler from './errors/errorhandler';
//import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 

dotenv.config(); 

const app : express.Application = express();

const portti : number = Number(process.env.PORT);
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

app.use(errorhandler);

app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {

    if (!res.headersSent) {
        res.status(404).json({ viesti : "invalid route"});
    }

    next();
});

app.listen(portti, () => {

    console.log(`Server online on port : ${portti}`);    

});

// npm start
// npx prisma studio