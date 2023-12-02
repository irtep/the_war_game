import express from 'express';
import { Virhe } from '../errors/virhekasittelija';
import { PrismaClient } from '@prisma/client'; // clientti mukaan

const prisma : PrismaClient = new PrismaClient();
// eli verrattuna edelliseen, niin korvataan se oma classi, tällä prismaClientillä

const apiOstoksetRouter : express.Router = express.Router();

apiOstoksetRouter.use(express.json());

apiOstoksetRouter.delete("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     if (await prisma.ostos.count({
           where : {
                id : Number(req.params.id)
            }
        }))  {
        try {
                        // delete on toki delete
            await prisma.ostos.delete({
                where : {
                    id : Number(req.params.id)
                }
            });
                            // palautuksena taas näytetään kaikki
            res.json(await prisma.ostos.findMany());

        } catch (e : any) {
            next(new Virhe())
        }
    } else {
        next(new Virhe(400, "Virheellinen id"));
    }

});


apiOstoksetRouter.put("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
        // täällä await sitten
    if (await prisma.ostos.count({ // lasketaan taas, että löytyy se yksi
        where : { // jossa tämä ehto
            id : Number(req.params.id)
        }
        })) {
        if (req.body.tuote?.length > 0 && (req.body.poimittu === true || req.body.poimittu === false)) {

            try {
                                    // update on muokkaus
                await prisma.ostos.update({
                    where : { // jossa katotaan wherellä id
                        id : Number(req.params.id)
                    },
                    data : {  // sit taas data olio
                        tuote : req.body.tuote,
                        poimittu : req.body.poimittu
                    }
                });
                        // palautetaan taas vastauksena kaikki
                res.json(await prisma.ostos.findMany());
        
            } catch (e : any) {
                next(new Virhe())
            }

        } else {
            next(new Virhe(400, "Virheellinen pyynnön body"));
        }
    } else {
        next(new Virhe(400, "Virheellinen id"));
    }

});

apiOstoksetRouter.post("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
 
      if (req.body.tuote?.length > 0) {

        try {
                                // create lisää uuden
            await prisma.ostos.create({
                data : { // vaatii taas tämän objektin, jonka ominaisuus data
                        // saa kätevästi sen default id:n, joka jakaa sen automaattisesti
                    tuote : req.body.tuote,
                    poimittu : Boolean(req.body.poimittu)
                }
            });
    
            res.json(await prisma.ostos.findMany());
    
        } catch (e : any) {
            next(new Virhe())
        }

    } else {
        next(new Virhe(400, "Virheellinen pyynnön body"));
    } 

});

apiOstoksetRouter.get("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     try {
                                // count palauttaa tietueiden määrän
        if (await prisma.ostos.count({
            where : { // vähän niinkuin sql:ssä, käytetään where rajausta
                id : Number(req.params.id)
            }
        }) === 1) { // eli, jos countti on 1
            res.json(await prisma.ostos.findUnique({
                where : {
                    id : Number(req.params.id)
                }
            }))
        } else {
            next(new Virhe(400, "Virheelinen id"));
        }
        
    } catch (e: any) {
        next(new Virhe());
    }
    

});
                            // async toimii prismassa
apiOstoksetRouter.get("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {               // prisma.(mallin nimi).komento
        res.json(await prisma.ostos.findMany());
    } catch (e : any) {
        next(new Virhe());
    }

});

export default apiOstoksetRouter;