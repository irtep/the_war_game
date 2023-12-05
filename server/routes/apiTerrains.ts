import express from 'express';
import { ErrorClass } from '../errors/errorhandler';
import { PrismaClient } from '@prisma/client'; // clientti mukaan

const prisma : PrismaClient = new PrismaClient();

const apiTerrainsRouter : express.Router = express.Router();

apiTerrainsRouter.use(express.json());

apiTerrainsRouter.delete("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     if (await prisma.terrain.count({
           where : {
                id : Number(req.params.id)
            }
        }))  {
        try {
                        // delete on toki delete
            await prisma.terrain.delete({
                where : {
                    id : Number(req.params.id)
                }
            });
                            // palautuksena taas näytetään kaikki
            res.json(await prisma.terrain.findMany());

        } catch (e : any) {
            next(new ErrorClass())
        }
    } else {
        next(new ErrorClass(400, "Virheellinen id"));
    }

});


apiTerrainsRouter.put("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
        // täällä await sitten
    if (await prisma.terrain.count({ // lasketaan taas, että löytyy se yksi
        where : { // jossa tämä ehto
            id : Number(req.params.id)
        }
        })) {
        if (req.body.name?.length > 0) {

            try {
                                    // update on muokkaus
                await prisma.terrain.update({
                    where : { // jossa katotaan wherellä id
                        id : Number(req.params.id)
                    },
                    data : {  // sit taas data olio
                        name: req.body.name,
                        type: req.body.type,
                        houses: req.body.houses,
                        trees: req.body.trees,
                        waters: req.body.waters
                    }
                });
                        // palautetaan taas vastauksena kaikki
                res.json(await prisma.terrain.findMany());
        
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

apiTerrainsRouter.post("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
      console.log('received POST: ', req.body);
      if (req.body.name?.length > 0) {

        try {
            await prisma.terrain.create({
                data : { 
                    name: req.body.name,
                    type: req.body.type,
                    houses: req.body.houses,
                    trees: req.body.trees,
                    waters: req.body.waters
                }
            });
    
            res.json(await prisma.terrain.findMany());
    
        } catch (e : any) {
            next(new ErrorClass())
        }

    } else {
        next(new ErrorClass(400, "Virheellinen pyynnön body"));
    } 

});

apiTerrainsRouter.get("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     try {

        if (await prisma.terrain.count({
            where : {
                id : Number(req.params.id)
            }
        }) === 1) {
            res.json(await prisma.terrain.findUnique({
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

apiTerrainsRouter.get("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {
        res.json(await prisma.terrain.findMany());
    } catch (e : any) {
        next(new ErrorClass());
    }
});

export default apiTerrainsRouter;