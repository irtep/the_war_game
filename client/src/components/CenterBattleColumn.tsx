import React, { useContext, useEffect } from 'react';
import { FlamesContext } from '../context/FlamesContext';
import { draw } from '../functions/draw';
import {
  checkIfFromHere,
  FoundData,
  changePropsOfTeam,
  findTeamByLocation,
  findTeamById,
  startMovement,
  collisionCheck,
  callDice,
  resolveCollision,
  hasLineOfSight,
  distanceCheck
  //  doOrders
} from '../functions/battleFunctions';
import { GameObject, CollisionResponse, Team } from '../data/sharedInterfaces';
import { losBullet } from '../data/classes';
//import { chipClasses } from '@mui/material';

interface Canvas {
  w: number;
  h: number;
}
/*
type IntervalItem = {
  teamId: string;
  intervalId: NodeJS.Timer;
};

interface ClickedObject {
  action: string;
  team: string;
};
*/
const CenterBattleColumn: React.FC = (): React.ReactElement => {
  //const [intervals, setIntervals] = useState<IntervalItem[]>([]);
  //const [clicked, setClicked] = useState<ClickedObject>({action: '', team: ''});
  //const [intervalId, setIntervalId] = useState<any>(null);
  const scale: number = 15;
  const { gameObject,
    setGameObject,
    selected,
    setSelected,
    setHovered,
    isPaused,
    setMousePosition
    //   setSelectedOrder,
    //   selectedOrder
  } = useContext(FlamesContext);
  //const mutableGameObject = useRef<GameObject>({ ...gameObject }); // Declare mutableGameObject using useRef
  const canvasSize: Canvas = { w: 1300, h: 900 };
  const canvas = document.getElementById("battleCanvas") as HTMLCanvasElement;

  const centerBattleColumnStyle: React.CSSProperties = {
    flex: '1 0 70%',
    //backgroundColor: 'lightcoral', // Optional: Add background color for visualization
  };

  const handleHover = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {

      const tryToFind = findTeamByLocation(x, y, gameObject, scale);

      if (tryToFind !== null) {
        const whatTeam = findTeamById(tryToFind, gameObject);
        setHovered({ id: [tryToFind], type: 'team', all: whatTeam });
      }

    }

    setMousePosition({ x: x, y: y });

  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    //
    // Deploy phase
    //

    if (gameObject.status === 'deploy') {

      // if selected
      if (selected.id.length > 0) {

        selected.id.forEach((id: string) => {
          changePropsOfTeam(id, ['x', 'y'], [x, y], gameObject, setGameObject);
        });

        setSelected({ id: [], type: '' });
      } else {
        // if not selected yet

        const finding = findTeamByLocation(x, y, gameObject, scale);

        if (findTeamByLocation !== null) {
          setSelected({ id: [finding], type: 'team' });
        }

      }
    }

    //
    //          Battle phase
    //

    else if (gameObject.status === 'battle') {
      const playersUnit: FoundData = checkIfFromHere(gameObject[gameObject.player].units, x, y, scale);
      const opponentsUnit: FoundData = checkIfFromHere(gameObject[gameObject.opponent].units, x, y, scale);

      // if clicked is from your team
      if (playersUnit.found) {

        // order: listening, everyone else who was listening goes waiting
        setGameObject({
          ...gameObject,
          [gameObject.player]: {
            ...gameObject[gameObject.player],
            units: gameObject[gameObject.player].units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: any) =>
                team.uuid === playersUnit.id ? { ...team, order: 'listening', currentSpeed: 0 } : team.order === 'listening' ? { ...team, order: 'hold' } : team
              ),
            })),
          },
        });
        setSelected({ id: [playersUnit.id], type: 'team', all: playersUnit.all });
      }

      // if clicked is from opponent team and order is selected
      else if (opponentsUnit.found) {
        // who ever had listening gets selected order and target is uuid of that clicked opponent, clear selected
        const getSelected = findTeamById(selected.id[0], gameObject);
        console.log('found oppo: ', opponentsUnit);
        if (getSelected !== null) {
          // if attack order, goes as target
          if (getSelected.order === 'attack' ||
            getSelected.order === 'charge' ||
            getSelected.order === 'smoke attack' ||
            getSelected.order === 'smoke bombard' ||
            getSelected.order === 'bombard') {

            changePropsOfTeam(selected.id[0], ['target'], [opponentsUnit.id], gameObject, setGameObject);

          }
          else if (getSelected.order === 'move' || getSelected.order === 'reverse') {

            changePropsOfTeam(selected.id[0], ['target'], [{ x: x, y: y }], gameObject, setGameObject);

            startMovement(selected.id[0], setGameObject, gameObject, selected);

          } else { console.log(' else, ', getSelected); }
          // clear selected
          setSelected({ id: [], type: '', all: {} });
        }
      }

      // if clicked was not any team,
      else {
        const getSelected = findTeamById(selected.id[0], gameObject);
        //console.log('was not selected');
        // if move or bombards
        if (getSelected) {
          //console.log('found selected');
          if (getSelected.order === 'move' ||
            getSelected.order === 'reverse' ||
            getSelected.order === 'smoke bombard' ||
            getSelected.order === 'bombard') {
            //console.log('move, smoke or bombard');
            changePropsOfTeam(selected.id[0], ['target'], [{ x: x, y: y }], gameObject, setGameObject);
          }

          startMovement(selected.id[0], setGameObject, gameObject, selected);

        } else { console.log('not found'); }

        // clear selected
        setSelected({ id: [], type: '', all: {} });
      }

    }

  };

  useEffect(() => {
    if (gameObject.status === 'deploy' || gameObject.status === 'battle') {
      //console.log('calling draw as gameObject changed');
      draw(canvas, canvasSize, gameObject, selected);

    }

  }, [gameObject]);

  // Main game loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    /**
     *    BATTLE
     */

    if (gameObject.status === 'battle' && !isPaused && intervalId === null) {

      const attacksToResolve: any[] = []; // will be filled in interval

      // interval when game is not paused
      intervalId = setInterval(() => {
        setGameObject((prevGameObject: GameObject) => {
          const updatedGameObject = { ...prevGameObject };

          if (updatedGameObject.attacker && updatedGameObject.attacker.units) {
            updatedGameObject.attacker.units = updatedGameObject.attacker.units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: Team) => {

                /*
                 *  MOVE
                 */

                if (team && team.order === 'move' && team.target && (team.x !== team.target.x || team.y !== team.target.y)) {

                  const getMovement = team.moveToTarget();
                  const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');
                  return resolveCollision(team, getMovement, check);

                }

                /*
                 *  ATTACK
                 */

                else if (team && team.order === 'attack') {
                  console.log('attack detected', team);
                  if (typeof (team.target) === 'string') {

                    const target: Team = findTeamById(team.target, gameObject);
                    interface AttacksBox { inRange: boolean; hasLOS: boolean; attacks: any[]; }
                    let attacksBox: AttacksBox = {
                      inRange: false,
                      hasLOS: false,
                      attacks: []
                    }

                    // check if object is in weapon range
                    const checkDistance = distanceCheck({ x: team.x, y: team.y }, { x: target.x, y: target.y });

                    team.combatWeapons?.forEach((w: any) => {
                      console.log('comparing: ', w.combatRange, checkDistance);
                      if (checkDistance <= w.combatRange) {
                        console.log('on range of: ', w.name);
                        const attack = {
                          weapon: w,
                          origin: team,
                          object: target
                        };
                        attacksBox.attacks.push(attack);
                        attacksBox.inRange = true;
                      }
                    });

                    // check LOS to target if in range
                    if (attacksBox.inRange) {
                      losBullet.x = team.x; losBullet.y = team.y;
                      losBullet.target = { x: target.x, y: target.y };
                      losBullet.uuid = team.uuid; // loaning uuid to ignore shooters collision test

                      let collided = false;
                      // 360, because turning too "uses" i++
                      for (let i = 0; i < checkDistance + 360; i++) {
                          // nyt jää tekemään tätä, vaikka löytyy....
                        const getMovement = losBullet.moveToTarget();
                        if (getMovement === undefined) { console.log('gM und. at LOS check');}
                        const check: CollisionResponse = collisionCheck(gameObject, getMovement.updatedBullet, 'los');

                        if (check.collision) {
                          // need to get id of collided returned...
                          console.log('collision: ', check, losBullet.x, losBullet.y);
                          collided = true;
                          i = checkDistance+361
                          if (check.id === target.uuid) {
                            console.log('is target');
                            attacksBox.hasLOS = true;
                          } else {
                            console.log('collided with something else');
                          }

                          //return { ...team, order: 'wait' };
                        }

                        losBullet.x = getMovement.updatedBullet.x;
                        losBullet.y = getMovement.updatedBullet.y;
                      }
                    }

                    console.log('out of loop');
                    // if in range and in LOS, push to attacksToResolve
                    if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
                      console.log('pushing to attacks to resolve');
                      attacksBox.attacks.forEach( (a: any) => {
                        console.log('pushing: ', a);
                        attacksToResolve.push(a);
                        console.log('aTr: ', attacksToResolve);
                      });
                      console.log('returning team');
                      return { ...team, order: 'resolving attack' };
                    } else {
                      // if not in range (and LOS), move closer, if can
                      console.log('moving closer');
                      team.target = {x: target.x, y: target.y}
                      const getMovement = team.moveToTarget();
                      if (getMovement === undefined) { console.log('gM und. at moving when no los/range');}
                      const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');
                      
                      return resolveCollision(team, getMovement, check);
                    }
                    
                  } else {
                    console.log('target not string: ', typeof (team.target), team.target);
                    const findingTarget = findTeamByLocation(team.target.x, team.target.y, gameObject, scale);
                    console.log('returning back with original target: ', findingTarget);
                    return { ...team, target: findingTarget};
                  }

                }

                else if (team && team.order === 'bombard') {
                  return team;
                }

                else if (team && team.order === 'reverse') {
                  return team;
                }

                else if (team && team.order === 'charge') {
                  return team;
                }
                else if (team && team.order === 'hold') {
                  return team;
                }

                else if (team && team.order === 'reverse') {
                  return team;
                }
                else {
                  return team;
                }
              }),
            }));
          }

          if (updatedGameObject.defender && updatedGameObject.defender.units) {
            updatedGameObject.defender.units = updatedGameObject.defender.units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: any) => {
                if (team && team.order === 'move' && team.target && (team.x !== team.target.x || team.y !== team.target.y)) {

                  // make collision check:
                  const getMovement = team.moveToTarget();
                  const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');
                  return resolveCollision(team, getMovement, check);

                } else {
                  return team;
                }
              }),
            }));
          }
          // maybe here resolve attacks, because does not seem to work after
          console.log('attacksTbR inside setGameO: ', attacksToResolve);
          return updatedGameObject;
        }); // setGameObject ends here

        // resolve attacks might work from 
        console.log('attacksToBeResolved', attacksToResolve);

        // draw(canvas, canvasSize, gameObject, selected);
      }, 100);
    }

    return () => {
      if (intervalId !== null) {
        console.log('clearing interval');
        clearInterval(intervalId);
      }
    };
  }, [isPaused, gameObject, selected]);

  return (
    <div style={centerBattleColumnStyle}>

      {
        (gameObject.status === 'deploy') ?
          <>
            <button
              onClick={() => {
                setGameObject({
                  ...gameObject,
                  attacker: {
                    ...gameObject.attacker,
                    units: gameObject.attacker.units.map((unit: any, unitIndex: number) => ({
                      ...unit,
                      teams: unit.teams.map((team: any, teamIndex: number) => {
                        let newX = 50 + unitIndex * 100 + teamIndex * 50 + unit.id * 170;
                        let newY = 50;
                        if (unit.id > 3) {
                          newX = 100 + unitIndex * 100 + teamIndex * 50;
                          newY = 130
                        }
                        return { ...team, x: newX, y: newY, a: 180 };
                      }),
                    })),
                  },
                });
              }}
            >
              quickdepo A
            </button>

            <button
              onClick={() => {
                setGameObject({
                  ...gameObject,
                  defender: {
                    ...gameObject.defender,
                    units: gameObject.defender.units.map((unit: any, unitIndex: number) => ({
                      ...unit,
                      teams: unit.teams.map((team: any, teamIndex: number) => {
                        let newX = 50 + unitIndex * 100 + teamIndex * 50 + unit.id * 170;
                        let newY = 780;
                        if (unit.id > 3) {
                          newX = 100 + unitIndex * 100 + teamIndex * 50;
                          newY = 830
                        }
                        return { ...team, x: newX, y: newY };
                      }),
                    })),
                  },
                });
              }}
            >
              quickdepo D
            </button>

            <button
              onClick={() => {
                setGameObject({
                  ...gameObject,
                  status: 'battle'
                });
              }}
            >
              deployment ready
            </button>
          </> : <></>
      }
      {
        (gameObject.status === 'battle' && selected.id.length > 0 && (isPaused)) ?
          <>

            <button onClick={() => {
              changePropsOfTeam(selected.id[0], ['order'], ['hold'], gameObject, setGameObject)
            }}>
              hold
            </button>

            <button onClick={() => {
              changePropsOfTeam(selected.id[0], ['order'], ['move'], gameObject, setGameObject)
            }}>
              move
            </button>
            {/*
            <button onClick={() => {
              changePropsOfTeam(selected.id[0], ['order'], ['reverse'], gameObject, setGameObject)
            }}>
              reverse
            </button>
 */}
            <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['attack'], gameObject, setGameObject) }}>
              attack
            </button>

            {
              (selected.all.type !== 'gun') ?
                <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['charge'], gameObject, setGameObject) }}>
                  charge
                </button> : <></>
            }

            {
              (selected.all.type === 'infantry') ?
                <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['dig foxholes'], gameObject, setGameObject) }}>
                  dig foxholes
                </button> : <></>
            }

            {
              selected.all.combatWeapons.map((wepo: any, ix: number) => {
                return (
                  <span key={`arti: ${ix}`}>
                    {
                      (wepo.specials.includes('artillery')) ?
                        <>
                          <button onClick={() => { changePropsOfTeam(selected.id[0], ['order'], ['bombard'], gameObject, setGameObject) }}>
                            bombard
                          </button>
                        </> :
                        <></>
                    }
                  </span>
                )
              }
              )
            }
          </> : <></>
      }


      <br />
      <canvas
        id="battleCanvas"
        width={canvasSize.w}
        height={canvasSize.h}
        style={{
          position: "absolute",
          border: '1px solid black',
          background: "#9A7B4D",
          marginLeft: 0,
          marginRight: 0
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleHover}
      >
      </canvas>

    </div>);
};

export default CenterBattleColumn;

