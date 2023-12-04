import express from 'express';
import { ErrorClass } from '../errors/errorhandler';
import { PrismaClient } from '@prisma/client'; // clientti mukaan

const prisma : PrismaClient = new PrismaClient();

const apiWeaponsRouter : express.Router = express.Router();

apiWeaponsRouter.use(express.json());

apiWeaponsRouter.delete("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     if (await prisma.weapon.count({
           where : {
                id : Number(req.params.id)
            }
        }))  {
        try {
                        // delete on toki delete
            await prisma.weapon.delete({
                where : {
                    id : Number(req.params.id)
                }
            });
                            // palautuksena taas näytetään kaikki
            res.json(await prisma.weapon.findMany());

        } catch (e : any) {
            next(new ErrorClass())
        }
    } else {
        next(new ErrorClass(400, "Virheellinen id"));
    }

});


apiWeaponsRouter.put("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
        // täällä await sitten
    if (await prisma.weapon.count({ // lasketaan taas, että löytyy se yksi
        where : { // jossa tämä ehto
            id : Number(req.params.id)
        }
        })) {
        if (req.body.name?.length > 0) {

            try {
                                    // update on muokkaus
                await prisma.weapon.update({
                    where : { // jossa katotaan wherellä id
                        id : Number(req.params.id)
                    },
                    data : {  // sit taas data olio
                        name: req.body.name,
                        AT: req.body.AT,
                        FP: req.body.FP,
                        specials: req.body.specials,
                        firerate: req.body.firerate,
                        range: req.body.range,
                        game: req.body.game
                    }
                });
                        // palautetaan taas vastauksena kaikki
                res.json(await prisma.weapon.findMany());
        
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

apiWeaponsRouter.post("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
      console.log('received POST: ', req.body);
      if (req.body.name?.length > 0) {

        try {
            await prisma.weapon.create({
                data : { 
                    name: req.body.name,
                    AT: req.body.AT,
                    FP: req.body.FP,
                    specials: req.body.specials,
                    firerate: req.body.firerate,
                    range: req.body.range,
                    game: req.body.game
                }
            });
    
            res.json(await prisma.weapon.findMany());
    
        } catch (e : any) {
            next(new ErrorClass())
        }

    } else {
        next(new ErrorClass(400, "Virheellinen pyynnön body"));
    } 

});

apiWeaponsRouter.get("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     try {

        if (await prisma.weapon.count({
            where : {
                id : Number(req.params.id)
            }
        }) === 1) {
            res.json(await prisma.weapon.findUnique({
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

apiWeaponsRouter.get("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {
        res.json(await prisma.weapon.findMany());
    } catch (e : any) {
        next(new ErrorClass());
    }
});

export default apiWeaponsRouter;