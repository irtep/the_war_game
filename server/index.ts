import express from 'express';
import path from 'path';
import apiOstoksetRouter from './routes/apiOstokset';
import virhekasittelija from './errors/virhekasittelija';

const app : express.Application = express();

const portti : number = Number(process.env.PORT) || 3005;

app.use(express.static(path.resolve(__dirname, "public")));

app.use("/api/ostokset", apiOstoksetRouter);

app.use(virhekasittelija);

app.use((req : express.Request, res : express.Response, next : express.NextFunction) => {

    if (!res.headersSent) {
        res.status(404).json({ viesti : "Virheellinen reitti"});
    }

    next();
});

app.listen(portti, () => {

    console.log(`Palvelin käynnistyi porttiin : ${portti}`);    

});

// prisma asennus ja käyttö:
/**
 * npm install prisma --save-dev
 * sitten client
 * npm install @prisma/client
 * npx prisma init // eli kun se on package.jsonissa, niin sitä voi käyttää npx komennolla
 * sitten syntyi prisma kansio,
 * siellä on aluksi vain schema.prisma
 * lisäksi tuli juuren .env
 * asenna vs codessa prisma
 * 
 * prisman schemassa:
 * client, se ok
 * sitten vaihdetaan datasourcee, eli mitä käytetään tietolähteenä
 * tehdään tässä vaiheessa sql litellä, eli siitä slqlite, tuohon "provider" kohtaan
 * se urli, niin se tulee tuolta .env kohdasta, siellähän se DATABASEURL on
 * mutta vaihdetaan nyt tässä tehtävässä: "file:./data.db", mitä käytetään tietokantana tässä
 * tee modeli, eli esim sen mukaan mitä tässä esimerkin prismassa
 * 
 * Kun skema valmis, niin tee migraatio:
 * npx prisma migrate dev --name init // init vaan nimi, voi olla vaikka eka tms.
 * nyt tuli migrations kansio, jossa se "nimi" ja sitten migration.sql, jossa sama
 * asia sql:nä. Jonka voi käyttää vaikka dumbbina oikeaan tietokantaan.
 * data.db syntyi myös, joka tietokanta.
 * prisma studio:
 * npx prisma studio // joka aukasee local hostiin hallintatyökalun, jossa näkyy modeli esim.
 * ja siellä siihen voi syötellä ja hallita. click ostos, sitten vaikka dd record, niin jo
 * voit laitella kaikkee. jos teet migraten uudelleen, niin se sitten tekee uuden db:n
 * eli vanhat entryt häviää. tämä myös teki node_modulesiin prisma clientin. Eli jos 
 * muutat prisman schemaa, niin: npx prisma generate, niin tulee muutokset käyttöön.
 * 
 * Eli ikäänkuin oman modelsin tilalla käytetään tota prismaa.
 * Prisman dokumentointi: https://www.prisma.io/docs/
 * 
 
 */