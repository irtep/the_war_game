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
  distanceCheck,
  determineSide
  //  doOrders
} from '../functions/battleFunctions';
import { GameObject, CollisionResponse, Team } from '../data/sharedInterfaces';
import { losBullet } from '../data/classes';
//import { chipClasses } from '@mui/material';

interface Canvas {
  w: number;
  h: number;
}

interface AttacksBox {
  inRange: boolean;
  hasLOS: boolean;
  attacks: any[];
  inCover: boolean;
  distance: number;
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

        // order: listening, everyone else who was listening goes holding
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
      const refreshRate: number = 100;
      let attacksToResolve: any[] = []; // will be filled in interval

      // interval when game is not paused
      intervalId = setInterval(() => {

        setGameObject((prevGameObject: GameObject) => {
          const updatedGameObject = { ...prevGameObject };

          // resolve shooting
          if (updatedGameObject.attacksToResolve) {
            // sort by origin.reactions
            updatedGameObject.attacksToResolve.sort((a, b) => a.origin.reactions - b.origin.reactions);

            updatedGameObject.attacksToResolve.forEach((shooting: any) => {
              if (shooting.object.disabled === true) {
                shooting.origin.order = 'hold';
              } else {
                if (shooting.weapon.reload >= shooting.weapon.firerate &&
                  shooting.origin.shaken === false && shooting.origin.stunned === false) {
                  const attacker = shooting.origin;
                  const target = shooting.object;
                  let hitDice = callDice(12);
                  let hitHelpers = 0;
                  let defHelpers = 0;
                  let armourSofteners = 0;
                  let armourHardeners = 0;
                  let concealed = false;

                  // empty the gun
                  shooting.weapon.reload = 0;

                  // if far away or close
                  if (shooting.distance < 100) {
                    console.log('point blank');
                    hitHelpers++;
                    armourSofteners++;
                  }
                  if (shooting.distance > 241) {
                    console.log('long distance');
                    defHelpers++;
                    if (!shooting.weapon.specials.includes('HEAT')) {
                      console.log('does not have heat');
                      armourHardeners++;
                    } else { console.log('has HEAT') }
                  }

                  // if concealed
                  updatedGameObject.terrain.trees.forEach((t: any) => {
                    const distance = distanceCheck(
                      { x: target.x, y: target.y },
                      { x: t.x, y: t.y }
                    );
                    //console.log('distance to tree: ', distance);
                    if (distance < 40) {
                      console.log('concealed by trees', distance, target.width);
                      concealed = true;
                    }
                  });
                  updatedGameObject.smokes?.forEach((t: any) => {
                    const distance = distanceCheck(
                      { x: target.x, y: target.y },
                      { x: t.x, y: t.y }
                    );
                    console.log('distance to smoke: ', distance);
                    if (distance < 5 + target.width + t.s) {
                      console.log('concealed by smoke');
                      concealed = true;
                    }

                  });

                  // if aiming:
                  if (attacker.order === 'hold') { hitHelpers++; }
                  // if moving:
                  if (target.order === 'move') { defHelpers++; }
                  // if concealed:
                  if (concealed) { defHelpers++; }

                  console.log('shooter: ', shooting.origin);
                  console.log('object: ', shooting.object);
                  const finalHitScore = hitDice + shooting.origin.rat + hitHelpers;
                  const finalDefScore = shooting.object.def + defHelpers;
                  console.log(`final hit: ${finalHitScore} dice ${hitDice} skill: ${shooting.origin.rat} mod+: ${hitHelpers} mod-: ${defHelpers}`);
                  console.log('def of object: ', shooting.object.def, ' + ', defHelpers, '=', finalDefScore);

                  if (finalHitScore >= finalDefScore) {
                    console.log('target is hit!');

                    if (shooting.object.type === 'tank') {
                      // check where object is hit.
                      const distanceToLeftTop: number = distanceCheck(
                        { x: shooting.origin.x, y: shooting.origin.y },
                        { x: shooting.object.leftTopCorner.x, y: shooting.object.leftTopCorner.y }
                      );
                      const distanceToRightTop: number = distanceCheck(
                        { x: shooting.origin.x, y: shooting.origin.y },
                        { x: shooting.object.rightTopCorner.x, y: shooting.object.rightTopCorner.y }
                      );
                      const distanceToLeftBottom: number = distanceCheck(
                        { x: shooting.origin.x, y: shooting.origin.y },
                        { x: shooting.object.leftBottomCorner.x, y: shooting.object.leftBottomCorner.y }
                      );
                      const distanceToRightBottom: number = distanceCheck(
                        { x: shooting.origin.x, y: shooting.origin.y },
                        { x: shooting.object.rightBottomCorner.x, y: shooting.object.rightBottomCorner.y }
                      );
                      // make distance checks to all corners, and decide by that
                      const distances: Record<string, number> = {
                        distanceToLeftTop: distanceToLeftTop,
                        distanceToRightTop: distanceToRightTop,
                        distanceToLeftBottom: distanceToLeftBottom,
                        distanceToRightBottom: distanceToRightBottom
                      };

                      const tankSide: string = determineSide(distances);
                      console.log('side is: ', tankSide);
                      let armourAffected = shooting.object.armourFront;
                      if (tankSide === 'side') {
                        armourAffected = shooting.object.armourSide
                        console.log('side armour: ', shooting.object.armourSide);
                      }
                      if (tankSide === 'back') {
                        armourAffected = shooting.object.armourSide;
                        armourSofteners++;
                      }

                      console.log('target is tank', armourAffected);
                      const armorDice = callDice(6);
                      const finalArmour = armorDice + armourHardeners + armourAffected;
                      const finalPenetration = shooting.weapon.AT + armourSofteners;
                      console.log(`armour: ${finalArmour} (dice: ${armorDice} + mod+ ${armourHardeners} + armour: ${armourAffected})`);
                      console.log(`pene: ${finalPenetration} at: ${shooting.weapon.AT} mod+ ${armourSofteners}`);

                      if (finalArmour === finalPenetration) {
                        console.log('glancing hit!');
                        const firePowerDice = callDice(6);
                        if (firePowerDice >= shooting.weapon.FP) {
                          const randomDice = callDice(6);
                          switch (randomDice) {
                            case 1:
                              console.log('track damage');
                              shooting.object.speed = shooting.object.speed - 10;
                              if (shooting.object.speed < 0) { shooting.object.speed = 0 }
                              break;
                            case 2:
                              console.log('engine damage');
                              shooting.object.motorPower = shooting.object.motorPower / 2;
                              break;
                            case 3:
                              console.log('crew shaken');
                              shooting.object.shaken = true;
                              shooting.object.combatWeapons.forEach((wep: any) => {
                                wep.reload = 0;
                              });
                              break;
                            case 4:
                              console.log('crew stunned');
                              shooting.object.stunned = true;
                              shooting.object.combatWeapons.forEach((wep: any) => {
                                wep.reload = 0;
                              });
                              break;
                            case 5:
                              console.log('immobilized');
                              shooting.object.speed = 0;
                              shooting.object.currentSpeed = 0;
                              break;
                            case 6:
                              console.log('weapons damaged');
                              shooting.object.combatWeapons.forEach((wep: any) => {
                                wep.firerate = wep.firerate * 2;
                              });
                              break;
                            default: console.log('glancing dice not found!', randomDice);
                          };
                        } else {
                          console.log('no damage!');
                        }
                      } else if (finalArmour < finalPenetration) {
                        console.log('penetrating hit!');
                        const firePowerDice = callDice(6);

                        if (firePowerDice >= shooting.weapon.FP) {
                          console.log('destroyed!');
                          shooting.object.disable();
                          shooting.origin.kills.push(shooting.object.name);
                        } else {
                          const randomDice = callDice(6);
                          console.log('dice roll: ', randomDice);
                          switch (randomDice) {
                            case 1:
                              console.log('track damage');
                              shooting.object.speed = shooting.object.speed - 10;
                              if (shooting.object.speed < 0) { shooting.object.speed = 0 }
                              break;
                            case 2:
                              console.log('engine damage');
                              shooting.object.motorPower = shooting.object.motorPower / 2;
                              break;
                            case 3:
                              console.log('crew shaken');
                              shooting.object.order = 'shaken';
                              shooting.object.combatWeapons.forEach((wep: any) => {
                                wep.reload = 0;
                              });
                              break;
                            case 4:
                              console.log('crew stunned');
                              shooting.object.order = 'stunned';
                              shooting.object.combatWeapons.forEach((wep: any) => {
                                wep.reload = 0;
                              });
                              break;
                            case 5:
                              console.log('immobilized');
                              shooting.object.speed = 0;
                              shooting.object.currentSpeed = 0;
                              break;
                            case 6:
                              console.log('weapons damaged');
                              shooting.object.combatWeapons.forEach((wep: any) => {
                                wep.firerate = wep.firerate * 2;
                              });
                              break;
                            default: console.log('glancing dice not found!', randomDice);
                          };
                        }
                      }
                    } else {
                      console.log('target is infantry or gun');
                      const saveDice = callDice(6);

                      if (saveDice >= shooting.object.save) {
                        console.log('save ok, team saved!', saveDice);
                      } else {
                        console.log('save failed: ', saveDice);
                        shooting.object.disable();
                        shooting.origin.kills.push(shooting.object.name);
                      }
                    }

                  } else {
                    console.log('shooting missed!');
                  }
                } else {
                  //console.log('cant fire. ', shooting.weapon.reload, ' / ', shooting.weapon.firerate);
                }
              }

            });
          }

          // Reset attacksToResolve
          attacksToResolve = [];

          if (updatedGameObject.attacker && updatedGameObject.attacker.units) {

            updatedGameObject.attacker.units = updatedGameObject.attacker.units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: Team) => {

                /**
                 * HOLD
                 */

                if (team && team.order === 'hold' &&
                  team.disabled === false &&
                  team.stunned === false &&
                  team.shaken === false) {

                  let attacksBox: AttacksBox = {
                    inRange: false,
                    hasLOS: false,
                    attacks: [],
                    inCover: false,
                    distance: 0
                  }
                  //console.log('found holder...');
                  // check if any team is at weapons range
                  updatedGameObject.defender.units.forEach((du: any) => {

                    du.teams.forEach((dt: any) => {

                      if (dt.disabled === false) {
                        const checkDistance: number = distanceCheck(
                          { x: team.x, y: team.y },
                          { x: dt.x, y: dt.y }
                        );
                        team.combatWeapons?.forEach((weapon: any) => {

                          if (weapon.combatRange > checkDistance &&
                            (!weapon.specials.includes('artillery')) &&
                            weapon.AT > dt.armourSide) {

                            //console.log('holder ', team.name, ' on range! ');
                            //console.log('on range of: ', weapon.name);
                            const attack = {
                              weapon: weapon,
                              origin: team,
                              object: dt
                            };
                            attacksBox.inRange = true;
                            // if in range, shoot
                            // check LOS to target if in range
                            if (attacksBox.inRange) {
                              losBullet.x = team.x; losBullet.y = team.y;
                              losBullet.target = { x: dt.x, y: dt.y };
                              losBullet.uuid = team.uuid; // loaning uuid to ignore shooters collision test

                              // 360, because turning too "uses" i++
                              for (let i = 0; i < checkDistance + 360; i++) {
                                const getMovement = losBullet.moveToTarget();
                                if (getMovement === undefined) { console.log('gM und. at LOS check'); }
                                const check: CollisionResponse = collisionCheck(gameObject, getMovement.updatedBullet, 'los');

                                if (check.collision) {
                                  // need to get id of collided returned...
                                  //console.log('collision: ', check, losBullet.x, losBullet.y);
                                  i = checkDistance + 361
                                  if (check.id === dt.uuid) {
                                    //console.log('is target');
                                    attacksBox.hasLOS = true;
                                    attacksBox.distance = checkDistance;
                                    attacksBox.attacks.push(attack);
                                  } else {
                                    //console.log('collided with something else');
                                  }
                                }
                                losBullet.x = getMovement.updatedBullet.x;
                                losBullet.y = getMovement.updatedBullet.y;
                              }
                            }
                            //console.log('out of loop');
                            // if in range and in LOS, push to attacksToResolve
                            if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
                              //console.log('pushing to attacks to resolve');
                              attacksBox.attacks.forEach((a: any) => {
                                //console.log('pushing: ', a);
                                attacksToResolve.push(a);
                                //console.log('aTr: ', attacksToResolve);
                              });
                            }
                          }
                        })
                      }

                    });
                  });

                  // else, return team.
                }

                if (team.disabled === false &&
                  team.stunned === false &&
                  team.shaken === false &&
                  team.speed > 0) {
                  /*
                   *  MOVE
                   */

                  if (team && team.order === 'move' && team.target &&
                    (team.x !== team.target.x || team.y !== team.target.y)) {

                    const getMovement = team.moveToTarget();
                    const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');
                    return resolveCollision(team, getMovement, check);

                  }

                  /*
                   *  ATTACK
                   */

                  else if (team && team.order === 'attack') {
                    //console.log('attack detected', team);
                    if (typeof (team.target) === 'string') {

                      const target: Team = findTeamById(team.target, gameObject);

                      let attacksBox: AttacksBox = {
                        inRange: false,
                        hasLOS: false,
                        attacks: [],
                        inCover: false,
                        distance: 0
                      }

                      // check if object is in weapon range
                      const checkDistance = distanceCheck({ x: team.x, y: team.y }, { x: target.x, y: target.y });

                      team.combatWeapons?.forEach((w: any) => {
                        //console.log('comparing: ', w.combatRange, checkDistance);
                        if (checkDistance < w.combatRange &&
                          w.AT > target.armourSide &&
                          (!w.specials.includes('artillery'))) {
                          //console.log('on range of: ', w.name);
                          const attack = {
                            weapon: w,
                            origin: team,
                            object: target
                          };
                          attacksBox.inRange = true;

                          // check LOS to target if in range
                          if (attacksBox.inRange) {
                            losBullet.x = team.x; losBullet.y = team.y;
                            losBullet.target = { x: target.x, y: target.y };
                            losBullet.uuid = team.uuid; // loaning uuid to ignore shooters collision test

                            // 360, because turning too "uses" i++
                            for (let i = 0; i < checkDistance + 360; i++) {
                              const getMovement = losBullet.moveToTarget();
                              if (getMovement === undefined) { console.log('gM und. at LOS check'); }
                              const check: CollisionResponse = collisionCheck(gameObject, getMovement.updatedBullet, 'los');

                              if (check.collision) {
                                // need to get id of collided returned...
                                //console.log('collision: ', check, losBullet.x, losBullet.y);
                                i = checkDistance + 361
                                if (check.id === target.uuid) {
                                  //console.log('is target');
                                  attacksBox.attacks.push(attack);
                                  attacksBox.hasLOS = true;
                                  attacksBox.distance = checkDistance;
                                } else {
                                  //console.log('collided with something else');
                                }

                              }

                              losBullet.x = getMovement.updatedBullet.x;
                              losBullet.y = getMovement.updatedBullet.y;
                            }
                          }
                        }
                      });

                      //console.log('out of loop');
                      // if in range and in LOS, push to attacksToResolve
                      if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
                        //console.log('pushing to attacks to resolve');
                        attacksBox.attacks.forEach((a: any) => {
                          //console.log('pushing: ', a);
                          attacksToResolve.push(a);
                          //console.log('aTr: ', attacksToResolve);
                        });
                        //console.log('returning team');
                        return team;
                      } else {
                        // if not in range (and LOS), move closer, if can
                        //console.log('moving closer');
                        team.target = { x: target.x, y: target.y }
                        const getMovement = team.moveToTarget();
                        if (getMovement === undefined) { console.log('gM und. at moving when no los/range'); }
                        const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');

                        return resolveCollision(team, getMovement, check);
                      }

                    } else {
                      //console.log('target not string: ', typeof (team.target), team.target);
                      const findingTarget = findTeamByLocation(team.target.x, team.target.y, gameObject, scale);
                      //console.log('returning back with original target: ', findingTarget);
                      return { ...team, target: findingTarget };
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

                  else {
                    return team;
                  }
                } else {
                  // disabled, but could still return it, so it does change to undefined.
                  return team;
                }
              }),
            }));
          }

          if (updatedGameObject.defender && updatedGameObject.defender.units) {
            updatedGameObject.defender.units = updatedGameObject.defender.units.map((unit: any) => ({
              ...unit,
              teams: unit.teams.map((team: Team) => {

                /**
                 * HOLD
                 */

                if (team && team.order === 'hold' &&
                  team.disabled === false &&
                  team.stunned === false &&
                  team.shaken === false) {

                  let attacksBox: AttacksBox = {
                    inRange: false,
                    hasLOS: false,
                    attacks: [],
                    inCover: false,
                    distance: 0
                  }

                  // check if any team is at weapons range
                  updatedGameObject.attacker.units.forEach((du: any) => {

                    du.teams.forEach((dt: any) => {
                      if (dt.disabled === false) {
                        const checkDistance: number = distanceCheck(
                          { x: team.x, y: team.y },
                          { x: dt.x, y: dt.y }
                        );
                        team.combatWeapons?.forEach((weapon: any) => {
                          if (weapon.combatRange > checkDistance &&
                            weapon.AT > dt.armourSide &&
                            (!weapon.specials.includes('artillery'))) {

                            //console.log('holder ', team.name, ' on range! ');
                            //console.log('on range of: ', weapon.name);
                            const attack = {
                              weapon: weapon,
                              origin: team,
                              object: dt
                            };
                            attacksBox.inRange = true;
                            // if in range, shoot
                            // check LOS to target if in range
                            if (attacksBox.inRange) {
                              losBullet.x = team.x; losBullet.y = team.y;
                              losBullet.target = { x: dt.x, y: dt.y };
                              losBullet.uuid = team.uuid; // loaning uuid to ignore shooters collision test

                              // 360, because turning too "uses" i++
                              for (let i = 0; i < checkDistance + 360; i++) {
                                const getMovement = losBullet.moveToTarget();
                                if (getMovement === undefined) { console.log('gM und. at LOS check'); }
                                const check: CollisionResponse = collisionCheck(gameObject, getMovement.updatedBullet, 'los');

                                if (check.collision) {
                                  // need to get id of collided returned...
                                  //console.log('collision: ', check, losBullet.x, losBullet.y);
                                  i = checkDistance + 361
                                  if (check.id === dt.uuid) {
                                    //console.log('is target');
                                    attacksBox.attacks.push(attack);
                                    attacksBox.hasLOS = true;
                                    attacksBox.distance = checkDistance;
                                  } else {
                                    //console.log('collided with something else');
                                  }
                                }
                                losBullet.x = getMovement.updatedBullet.x;
                                losBullet.y = getMovement.updatedBullet.y;
                              }
                            }
                            //console.log('out of loop');
                            // if in range and in LOS, push to attacksToResolve
                            if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
                              //console.log('pushing to attacks to resolve');
                              attacksBox.attacks.forEach((a: any) => {
                                //console.log('pushing: ', a);
                                attacksToResolve.push(a);
                                //console.log('aTr: ', attacksToResolve);
                              });
                            }
                          } else {
                            //console.log('not in range: ', checkDistance, ' vs ', team.combatWeapons);
                          }
                        })
                      }

                    });
                  });

                  // else, return team.
                }

                if (team.disabled === false &&
                  team.stunned === false &&
                  team.shaken === false &&
                  team.speed > 0) {
                  /*
                   *  MOVE
                   */

                  if (team && team.order === 'move' && team.target &&
                    (team.x !== team.target.x || team.y !== team.target.y)) {

                    const getMovement = team.moveToTarget();
                    const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');
                    return resolveCollision(team, getMovement, check);

                  }

                  /*
                   *  ATTACK
                   */

                  else if (team && team.order === 'attack') {
                    //console.log('attack detected', team);
                    if (typeof (team.target) === 'string') {

                      const target: Team = findTeamById(team.target, gameObject);

                      let attacksBox: AttacksBox = {
                        inRange: false,
                        hasLOS: false,
                        attacks: [],
                        inCover: false,
                        distance: 0
                      }

                      // check if object is in weapon range
                      const checkDistance = distanceCheck({ x: team.x, y: team.y }, { x: target.x, y: target.y });

                      team.combatWeapons?.forEach((w: any) => {
                        //console.log('comparing: ', w.combatRange, checkDistance);
                        if (checkDistance < w.combatRange &&
                          w.AT > target.armourSide &&
                          (!w.specials.includes('artillery'))) {
                          //console.log('on range of: ', w.name);
                          const attack = {
                            weapon: w,
                            origin: team,
                            object: target
                          };
                          attacksBox.inRange = true;
                          // check LOS to target if in range
                          if (attacksBox.inRange) {
                            losBullet.x = team.x; losBullet.y = team.y;
                            losBullet.target = { x: target.x, y: target.y };
                            losBullet.uuid = team.uuid; // loaning uuid to ignore shooters collision test

                            // 360, because turning too "uses" i++
                            for (let i = 0; i < checkDistance + 360; i++) {
                              const getMovement = losBullet.moveToTarget();
                              if (getMovement === undefined) { console.log('gM und. at LOS check'); }
                              const check: CollisionResponse = collisionCheck(gameObject, getMovement.updatedBullet, 'los');

                              if (check.collision) {
                                // need to get id of collided returned...
                                //console.log('collision: ', check, losBullet.x, losBullet.y);
                                i = checkDistance + 361
                                if (check.id === target.uuid) {
                                  //console.log('is target');
                                  attacksBox.attacks.push(attack);
                                  attacksBox.hasLOS = true;
                                  attacksBox.distance = checkDistance;
                                } else {
                                  //console.log('collided with something else');
                                }
                              }
                              losBullet.x = getMovement.updatedBullet.x;
                              losBullet.y = getMovement.updatedBullet.y;
                            }
                          }

                        }
                      });
                      //console.log('out of loop');
                      // if in range and in LOS, push to attacksToResolve
                      if (attacksBox.attacks.length > 0 && (attacksBox.hasLOS)) {
                        //console.log('pushing to attacks to resolve');
                        attacksBox.attacks.forEach((a: any) => {
                          //console.log('pushing: ', a);
                          attacksToResolve.push(a);
                          //console.log('aTr: ', attacksToResolve);
                        });
                        //console.log('returning team');
                        return team;
                      } else {
                        // if not in range (and LOS), move closer, if can
                        //console.log('moving closer');
                        team.target = { x: target.x, y: target.y }
                        const getMovement = team.moveToTarget();
                        if (getMovement === undefined) { console.log('gM und. at moving when no los/range'); }
                        const check: CollisionResponse = collisionCheck(gameObject, getMovement, 'move');

                        return resolveCollision(team, getMovement, check);
                      }

                    } else {
                      //console.log('target not string: ', typeof (team.target), team.target);
                      const findingTarget = findTeamByLocation(team.target.x, team.target.y, gameObject, scale);
                      //console.log('returning back with original target: ', findingTarget);
                      return { ...team, target: findingTarget };
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

                  else {
                    return team;
                  }
                } else {
                  // disabled, but could still return it, so it does change to undefined.
                  return team;
                }
              }),
            }));
          }

          // reload guns, shakes, stuns etc.
          updatedGameObject.attacker.units.forEach((u: any) => {
            u.teams.forEach((t: Team) => {

              if (t.disabled === false) {

                // reload
                t.combatWeapons?.forEach((w: any) => {
                  if (w.reload < w.firerate && t.disabled === false &&
                    t.shaken === false && t.stunned === false) {
                    w.reload = w.reload + refreshRate / 3;
                    if (w.reload > w.firerate) {
                      w.reload = w.firerate;
                    }
                  }
                });

                // shake of shakes
                if (t.shaken) {
                  const motivationTest = callDice(12);
                  const skillTest = callDice(6);
                  if (motivationTest < t.motivation && skillTest < t.skill) {
                    console.log('out of shake. dices: ', motivationTest, skillTest, 'vs: ', t.motivation, t.skill);
                    t.shaken = false;
                  }
                }

                // shake of stuns
                if (t.stunned) {
                  const motivationTest = callDice(12);
                  const skillTest = callDice(6);
                  if (motivationTest < t.motivation && skillTest < t.skill) {
                    console.log('out of stun, still shaken. dices: ', motivationTest, skillTest, 'vs: ', t.motivation, t.skill);
                    t.shaken = true;
                    t.stunned = false;
                  }
                }
              }
            });
          });
          updatedGameObject.defender.units.forEach((u: any) => {
            u.teams.forEach((t: Team) => {

              if (t.disabled === false) {

                // reload
                t.combatWeapons?.forEach((w: any) => {
                  if (w.reload < w.firerate && t.disabled === false &&
                    t.shaken === false && t.stunned === false) {
                    w.reload = w.reload + refreshRate / 3;
                    if (w.reload > w.firerate) {
                      w.reload = w.firerate;
                    }
                  }
                });

                // shake of shakes
                if (t.shaken) {
                  console.log('shaken: ', t.uuid);
                  const motivationTest = callDice(12);
                  const skillTest = callDice(6);
                  if (motivationTest < t.motivation && skillTest < t.skill) {
                    console.log('out of shake. dices: ', motivationTest, skillTest, 'vs: ', t.motivation, t.skill);
                    t.shaken = false;
                  }
                }

                // shake of stuns
                if (t.stunned) {
                  console.log('stunned: ', t.uuid);
                  const motivationTest = callDice(12);
                  const skillTest = callDice(6);
                  if (motivationTest < t.motivation && skillTest < t.skill) {
                    console.log('out of stun, still shaken. dices: ', motivationTest, skillTest, 'vs: ', t.motivation, t.skill);
                    t.shaken = true;
                    t.stunned = false;
                  }
                }
              }
            });
          });

          //console.log('attacksTbR inside setGameO: ', attacksToResolve);
          return { ...updatedGameObject, attacksToResolve };
        }); // setGameObject ends here

        // resolve attacks might work from 
        //console.log('attacksToBeResolved', attacksToResolve);
        //console.log('go: ', gameObject);

        // draw(canvas, canvasSize, gameObject, selected);
      }, refreshRate);
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

