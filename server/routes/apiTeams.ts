import express from 'express';
import { ErrorClass } from '../errors/errorhandler';
import { PrismaClient } from '@prisma/client'; // clientti mukaan

const prisma : PrismaClient = new PrismaClient();

const apiTeamsRouter : express.Router = express.Router();

apiTeamsRouter.use(express.json());

apiTeamsRouter.delete("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     if (await prisma.team.count({
           where : {
                id : Number(req.params.id)
            }
        }))  {
        try {
                        // delete on toki delete
            await prisma.team.delete({
                where : {
                    id : Number(req.params.id)
                }
            });
                            // palautuksena taas näytetään kaikki
            res.json(await prisma.team.findMany());

        } catch (e : any) {
            next(new ErrorClass())
        }
    } else {
        next(new ErrorClass(400, "Virheellinen id"));
    }

});


apiTeamsRouter.put("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
        // täällä await sitten
    if (await prisma.team.count({ // lasketaan taas, että löytyy se yksi
        where : { // jossa tämä ehto
            id : Number(req.params.id)
        }
        })) {
        if (req.body.name?.length > 0) {

            try {
                                    // update on muokkaus
                await prisma.team.update({
                    where : { // jossa katotaan wherellä id
                        id : Number(req.params.id)
                    },
                    data : {  // sit taas data olio
                        name: req.body.name,
                        def: req.body.def,
                        speed: req.body.speed,
                        mat: req.body.mat,
                        rat: req.body.rat,
                        reactions: req.body.reactions,
                        motivation: req.body.motivation,
                        skill    : req.body.skill,
                        save     : req.body.save,
                        armourFront : req.body.armourFront,
                        armourSide: req.body.armourSide,
                        armourTop: req.body.armourTop,
                        type    : req.body.type,
                        faction : req.body.faction,
                        imgSide : req.body.imgSide,
                        imgTop  : req.body.imgTop,
                        effects : req.body.effects,
                        specials: req.body.specials,
                        desc    : req.body.desc,
                        order   : req.body.order,
                        weapons : req.body.weapons,
                        unit    : req.body.unit,
                        transport : req.body.transport,
                        transporting : req.body.transporting,
                        nickname: req.body.nickname,
                        target  : req.body.target,
                        cross   : req.body.cross,
                        points  : req.body.points,
                        height  : req.body.height,
                        width   : req.body.width,
                        game    : req.body.game,
                        horsepowers: req.body.horsepowers,
                        weight  : req.body.weight
                    }
                });
                        // palautetaan taas vastauksena kaikki
                res.json(await prisma.team.findMany());
        
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

apiTeamsRouter.post("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {
      console.log('received POST: ', req.body);
      if (req.body.name?.length > 0) {

        try {
            await prisma.team.create({
                data : { 
                    name: req.body.name,
                    def: req.body.def,
                    speed: req.body.speed,
                    mat: req.body.mat,
                    rat: req.body.rat,
                    reactions: req.body.reactions,
                    motivation: req.body.motivation,
                    skill    : req.body.skill,
                    save     : req.body.save,
                    armourFront : req.body.armourFront,
                    armourSide: req.body.armourSide,
                    armourTop: req.body.armourTop,
                    type    : req.body.type,
                    faction : req.body.faction,
                    imgSide : req.body.imgSide,
                    imgTop  : req.body.imgTop,
                    effects : req.body.effects,
                    specials: req.body.specials,
                    desc    : req.body.desc,
                    order   : req.body.order,
                    weapons : req.body.weapons,
                    unit    : req.body.unit,
                    transport : req.body.transport,
                    transporting : req.body.transporting,
                    nickname: req.body.nickname,
                    target  : req.body.target,
                    cross   : req.body.cross,
                    points  : req.body.points,
                    height  : req.body.height,
                    width   : req.body.width,
                    game    : req.body.game,
                    horsepowers: req.body.horsepowers,
                    weight  : req.body.weight
                }
            });
    
            res.json(await prisma.team.findMany());
    
        } catch (e : any) {
            next(new ErrorClass())
        }

    } else {
        next(new ErrorClass(400, "Virheellinen pyynnön body"));
    } 

});

apiTeamsRouter.get("/:id", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

     try {

        if (await prisma.team.count({
            where : {
                id : Number(req.params.id)
            }
        }) === 1) {
            res.json(await prisma.team.findUnique({
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

apiTeamsRouter.get("/", async (req : express.Request, res : express.Response, next : express.NextFunction) => {

    try {
        res.json(await prisma.team.findMany());
    } catch (e : any) {
        next(new ErrorClass());
    }
});

export default apiTeamsRouter;