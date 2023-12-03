import express from 'express';

export class ErrorClass extends Error {
    status : number
    viesti : string
    constructor(status? : number, viesti? : string) {
        super();
        this.status = status || 500;
        this.viesti = viesti || "Unexpected error on server.";
    }

}

const errorhandler = (err : ErrorClass, req : express.Request, res : express.Response, next : express.NextFunction) => {

    res.status(err.status).json({virhe : err.viesti});

    next();

}

export default errorhandler;