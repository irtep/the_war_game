import { CollisionResponse, GameObject, Team } from "../data/sharedInterfaces";
import { callDice, distanceCheck } from "./helpFunctions";

export const collisionCheck = (gameObject: GameObject, team: any, action: string): CollisionResponse => {
    const collisionResponse: CollisionResponse = {
        collision: false,
        withWhat: '',
        id: undefined
    };
    // set corners of team:
    //console.log('getting corners for ', team);
    team.setCorners(team.a);

    function pointInPoly(verties: any, testx: any, testy: any) {
        var i;
        var j;
        var c: any = 0;
        var nvert = verties.length;

        for (i = 0, j = nvert - 1; i < nvert; j = i++) {

            if (((verties[i].y > testy) != (verties[j].y > testy)) && (testx < (verties[j].x - verties[i].x) * (testy - verties[i].y) / (verties[j].y - verties[i].y) + verties[i].x))
                c = !c;
        }
        return c;
    }

    function testCollision(rect1: any, rect2: any) {
        var collision = false;

        rect1.getCorners().forEach((corner: any) => {
            var isCollided = pointInPoly(rect2.getCorners(), corner.x, corner.y);

            if (isCollided) collision = true;
        });

        return collision;
    }

    function checkRectangleCollision(rect: any, rect2: any) {

        if (testCollision(rect, rect2)) return true;

        else if (testCollision(rect2, rect)) return true;

        return false;
    }

    const runArray = (arr: any[], type: string) => {
        arr.map((t: any) => {

            if (type === 'teams') {

                if (team.uuid !== t.uuid) {
                    t.setCorners(t.a);
                    const colCheck = checkRectangleCollision(team, t);

                    if (colCheck === true) {
                        //const cornerit = team.getCorners();
                        //console.log(`teams: ${team.uuid} vs ${t.uuid}`);
                        //console.log(`corners 1: ${cornerit[0].x}`);
                        collisionResponse.id = t.uuid;
                        collisionResponse.collision = true;
                        collisionResponse.withWhat = 'team';
                    }

                };
            }

            else if (type === 'houses') {
                t.setCorners(0); // houses always have 0 angle, maybe later need to change.
                const colCheck = checkRectangleCollision(team, t);

                if (colCheck === true) {
                    //console.log('is house');
                    collisionResponse.collision = true;
                    collisionResponse.withWhat = 'house';
                }
            }

            else if (type === 'trees') {
                t.setCorners(0); // trees always have 0 angle, maybe later need to change.
                const colCheck = checkRectangleCollision(team, t);

                if (colCheck === true) {
                    //console.log('is tree');
                    collisionResponse.collision = true;
                    collisionResponse.withWhat = 'tree';
                }
            }

            else if (type === 'waters') {
                t.setCorners(0); // waters always have 0 angle, maybe later need to change.
                const colCheck = checkRectangleCollision(team, t);

                if (colCheck === true) {
                    //console.log('is water');
                    collisionResponse.collision = true;
                    collisionResponse.withWhat = 'water';
                }
            }

            else if (type === 'smokes') {
                
                const distance = distanceCheck(team, t);

                if (distance < t.size + 10) {
                    //console.log('is water');
                    collisionResponse.collision = true;
                    collisionResponse.withWhat = 'smoke';
                    console.log('smoke collision, shooter, looker: ', team.uuid);
                }
            }

        });
    }

    // check step by step, to be more efficent, first attackers
    if (action !== 'cover') {
        gameObject.attacker.units.forEach((u: any) => {
            runArray(u.teams, 'teams');
        });
    }
    // action === cover is not used at the moment..
    if (collisionResponse.collision === false && action !== 'cover') {
        gameObject.defender.units.forEach((u: any) => {
            runArray(u.teams, 'teams');
        });
    };

    if (collisionResponse.collision === false && action !== 'cover') {
        runArray(gameObject.terrain.houses, 'houses');
    }

    if (collisionResponse.collision === false && action !== 'los' && action !== 'cover') {
        runArray(gameObject.terrain.waters, 'waters');
    }

    if (collisionResponse.collision === false && action !== 'los') {
        runArray(gameObject.terrain.trees, 'trees');
    }

    if (collisionResponse.collision === false && action === 'los') {
        runArray(gameObject.smokes, 'smokes');
    }

    //console.log('responding: ', collisionResponse);
    return collisionResponse;
};

export const resolveCollision = (
    noMovement: Team,
    withMovement: Team,
    check: CollisionResponse
  ) => {
    if (check.collision) {
  
      if (check.withWhat === 'team' || check.withWhat === 'house' || check.withWhat === 'water') {
        return noMovement;
      }
  
      else if (check.withWhat === 'tree') {
        // need to make a cross check, if ok, can advance, if not does not advance
        const crossCheck: number = callDice(6);
  
        if (crossCheck >= noMovement.cross) {
          //console.log('cross ok', crossCheck, ' vs ', noMovement.cross);
          return withMovement;
        } else {
          //console.log('cross failed: ', crossCheck, ' vs ', noMovement.cross);
          return noMovement;
        }
      }
  
    } else {
      return withMovement;
    }
  }