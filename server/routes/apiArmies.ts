import express from 'express';
import { ErrorClass } from '../errors/errorhandler';
import { PrismaClient } from '@prisma/client'; // clientti mukaan

const prisma : PrismaClient = new PrismaClient();

const apiArmiesRouter : express.Router = express.Router();

apiArmiesRouter.use(express.json());

apiArmiesRouter.delete("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     if (await prisma.army.count({
           where : {
                id : Number(req.params.id)
            }
        }))  {
        try {
                        // delete on toki delete
            await prisma.army.delete({
                where : {
                    id : Number(req.params.id)
                }
            });
                            // palautuksena taas näytetään kaikki
            res.json(await prisma.army.findMany());

        } catch (e : any) {
            next(new ErrorClass())
        }
    } else {
        next(new ErrorClass(400, "Virheellinen id"));
    }

});


apiArmiesRouter.put("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
        // täällä await sitten
    if (await prisma.army.count({ // lasketaan taas, että löytyy se yksi
        where : { // jossa tämä ehto
            id : Number(req.params.id)
        }
        })) {
        if (req.body.name?.length > 0) {

            try {
                                    // update on muokkaus
                await prisma.army.update({
                    where : { // jossa katotaan wherellä id
                        id : Number(req.params.id)
                    },
                    data : {  // sit taas data olio
                        user:    req.body.user,
                        name:    req.body.name,
                        faction: req.body.faction,
                        game:    req.body.game,
                        points:  req.body.points,
                        units:   req.body.units
                    }
                });
                        // palautetaan taas vastauksena kaikki
                res.json(await prisma.army.findMany());
        
            } catch (e : any) {
                next(new ErrorClass())
            }

        } else {
            next(new ErrorClass(400, "Virheellinen pyynnön body"));
        }
    } else {
        next(new ErrorClass(400, "Virheellinen id"));
    }

});

apiArmiesRouter.post("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
      console.log('received POST: ', req.body);
      if (req.body.name?.length > 0) {

        try {
            await prisma.army.create({
                data : { 
                    user:    req.body.user,
                    name:    req.body.name,
                    faction: req.body.faction,
                    game:    req.body.game,
                    points:  req.body.points,
                    units:   req.body.units
                }
            });
    
            res.json(await prisma.army.findMany());
    
        } catch (e : any) {
            next(new ErrorClass())
        }

    } else {
        next(new ErrorClass(400, "Virheellinen pyynnön body"));
    } 

});

apiArmiesRouter.get("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     try {

        if (await prisma.army.count({
            where : {
                id : Number(req.params.id)
            }
        }) === 1) {
            res.json(await prisma.army.findUnique({
                where : {
                    id : Number(req.params.id)
                }
            }))
        } else {
            next(new ErrorClass(400, "Virheelinen id"));
        }
        
    } catch (e: any) {
        next(new ErrorClass());
    }
});

apiArmiesRouter.get("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {
        res.json(await prisma.army.findMany());
    } catch (e : any) {
        next(new ErrorClass());
    }
});

export default apiArmiesRouter;