import React, { useEffect, useContext } from 'react';
import FirstBattleRow from './FirstBattleRow';
import SecondBattleRow from './SecondBattleRow';
import { FlamesContext } from '../context/FlamesContext';
import { Army, Team } from '../data/sharedInterfaces';
import { createBattleMap, prepareWeapons } from '../functions/setupFunctions';

const Battle: React.FC = (): React.ReactElement => {
  const { terrains,
    setupObject,
    gameObject,
    setGameObject,
    armies,
    teams,
    weapons
  } = useContext(FlamesContext);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  };

  const createBattleArmies = (input: Army, attacker: boolean): Army => {

    let parsedArmy: Army = {
      user: '',
      name: '',
      faction: '',
      game: '',
      points: 0,
      units: []
    };

    for (let [key, value] of Object.entries(input)) {

      if (key === 'units') {

        parsedArmy.units = JSON.parse(value as string);

        parsedArmy.units.forEach((unit: any, i: number) => {

          unit.teams.forEach((team: any, h: number) => {
            console.log('team: ', team);
            // find team that has same name
            const foundFromDB: Team[] = teams.filter((t: Team) => t.name === team.team);
            //console.log('team from db ', );
            for (let [tkey, tvalue] of Object.entries(foundFromDB[0])) {
              if (tvalue !== '') {
                team[tkey] = tvalue;
              }
            }

            //console.log('fdb: ', foundFromDB);
            team.order = 'hold';
            team.shaken = false;
            team.stunned = false;
            team.x = 1000;
            team.y = 1000;
            team.a = 0;
            team.disabled = false;
            team.kills = [];
            team.tacticalNumber = String(i) + String(h);
            team.unit = '';
            if (attacker) {
              team.unit = 'a' + String(i);
              team.uuid = 'a' + String(i) + String(i) + String(h);
            } else {
              team.unit = 'd' + String(i);
              team.uuid = 'd' + String(i) + String(i) + String(h);
            }
            // experience bonuses
            switch (team.crew) {
              case 'veteran':
                team.rat = team.rat + 1;
                team.mat = team.mat + 1;
                team.reactions = team.reactions + 1;
                break;
              case 'elite':
                team.rat = team.rat + 1;
                team.mat = team.mat + 1;
                team.def = team.def + 1;
                team.reactions = team.reactions + 2;
                team.skill = team.skill + 1;
                break;
              case 'ace':
                team.rat = team.rat + 2;
                team.mat = team.mat + 2;
                team.def = team.def + 2;
                team.reactions = team.reactions + 3;
                team.skill = team.skill + 2;
                if (team.save > 0) {
                  team.save = team.save + 1;
                }
                break;
            };
            // weapons and reloads
            team.combatWeapons = prepareWeapons(team.weapons, weapons);
            // power/weight ratio
            team.motorPower = team.horsepowers / team.weight / 2;
            team.currentSpeed = 0;
            // methods:
            team.turningSpeed = team.motorPower * 1000; // 5 seems to ok... lets try this

            //
            team.stop = function () {
              this.currentSpeed = 0;
            };

            //
            team.disable = function () {
              this.disabled = true;
              this.order = '';
              this.currentSpeed = 0;
              this.speed = 0;
            };

            // reverse, not in use, gotta do later...
            /*
            team.reverse = function () {
              const normalizeAngle = (angle: number) => {
                return (angle % 360 + 360) % 360;
              };
            
              if (this.order === 'reverse' && typeof this.target.x === 'number' && typeof this.target.y === 'number') {
                const updatedTeam = { ...this };
                const dx = this.target.x - this.x;
                const dy = this.target.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
            
                updatedTeam.targetAngle = ((Math.atan2(dy, dx) * 180) / Math.PI) + 90;
            
                // normalize the angle to not mess turning
                if (updatedTeam.targetAngle < 0 || updatedTeam.targetAngle > 360) {
                  updatedTeam.targetAngle = normalizeAngle(updatedTeam.a);
                }
            
                const angleTolerance = 1;
            
                if (Math.abs(updatedTeam.targetAngle - updatedTeam.a) < angleTolerance) {
                  if (updatedTeam.currentSpeed === 0) { updatedTeam.currentSpeed = team.motorPower; }
                  updatedTeam.x -= (dx / distance) * updatedTeam.currentSpeed; // voi olla,
                  updatedTeam.y -= (dy / distance) * updatedTeam.currentSpeed; // että pitää olla "-"
                  updatedTeam.currentSpeed = updatedTeam.currentSpeed + team.motorPower * 5;
                  if (updatedTeam.currentSpeed > updatedTeam.speed / 25) { updatedTeam.currentSpeed = updatedTeam.speed / 25; }
                } else if (updatedTeam.targetAngle < updatedTeam.a) {
                  // need to turn right (reverse)
                  updatedTeam.a++;
                  updatedTeam.x -= (dx / distance) * (1 / 3);
                  updatedTeam.y -= (dy / distance) * (1 / 3);
                } else if (updatedTeam.targetAngle > updatedTeam.a) {
                  // need to turn left (reverse)
                  updatedTeam.a--;
                  updatedTeam.x -= (dx / distance) * (1 / 3);
                  updatedTeam.y -= (dy / distance) * (1 / 3);
                }
            
                if (distance < updatedTeam.currentSpeed) {
                  updatedTeam.target = '';
                  updatedTeam.order = 'hold';
                  updatedTeam.currentSpeed = 0;
                }
            
                // normalize the angle to not mess turning
                if (updatedTeam.a < 0 || updatedTeam.a > 360) {
                  updatedTeam.a = normalizeAngle(updatedTeam.a);
                }
            
                return updatedTeam;
              } else {
                console.log('Cannot reverse:', this.order, this.target);
                return { ...this };
              }
            }; */

            // move
            team.moveToTarget = function () {
              // Function to normalize an angle to be between 0 and 360 degrees
              const normalizeAngle = (angle: number): number => {
                // Calculate the modulo to wrap the angle within the range [0, 360)
                return (angle % 360 + 360) % 360;
              }

              if (/*this.order === 'move' && */ this && this.target &&
              typeof this.target.x === 'number' && typeof this.target.y === 'number' &&
              this.speed > 0 && this.stunned === false && this.shaken == false) {
                const updatedTeam = { ...this };
                const dx = this.target.x - this.x;
                const dy = this.target.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Calculate the angle based on the target position and add 90 degrees
                updatedTeam.targetAngle = ((Math.atan2(dy, dx) * 180) / Math.PI) + 90;

                // normalize the angle to not mess turning
                if (updatedTeam.targetAngle < 0 || updatedTeam.targetAngle > 360) {
                  updatedTeam.targetAngle = normalizeAngle(updatedTeam.a);
                }

                const angleTolerance = 1; // Adjust this value based on your tolerance requirements
                                          // could be less too, for example 0,5
                if (Math.abs(updatedTeam.targetAngle - updatedTeam.a) < angleTolerance) {
                  // facing target
                  if (updatedTeam.currentSpeed === 0) { updatedTeam.currentSpeed = team.motorPower }
                  updatedTeam.x += (dx / distance) * updatedTeam.currentSpeed;
                  updatedTeam.y += (dy / distance) * updatedTeam.currentSpeed;
                  updatedTeam.currentSpeed = updatedTeam.currentSpeed + team.motorPower * 10;
                  if (updatedTeam.currentSpeed > updatedTeam.speed / 15) { updatedTeam.currentSpeed = updatedTeam.speed / 15 }
                } else if (updatedTeam.targetAngle < updatedTeam.a) {
                  // need to turn left
                  updatedTeam.a--;
                  updatedTeam.x += (dx / distance) * (1 / 3);
                  updatedTeam.y += (dy / distance) * (1 / 3);
                } else if (updatedTeam.targetAngle > updatedTeam.a) {
                  // need to turn right
                  updatedTeam.a++;
                  updatedTeam.x += (dx / distance) * (1 / 3);
                  updatedTeam.y += (dy / distance) * (1 / 3);
                }

                if (distance < updatedTeam.currentSpeed) {
                  // Arrived at the target
                  updatedTeam.target = '';
                  updatedTeam.order = 'hold';
                  updatedTeam.currentSpeed = 0;
                }

                // normalize the angle to not mess turning
                if (updatedTeam.a < 0 || updatedTeam.a > 360) {
                  updatedTeam.a = normalizeAngle(updatedTeam.a);
                }

                return updatedTeam;
              } else {
                console.log('Cannot move:', this.order, this.target);

                return { ...this };
              }
            };

            // makes locations of corners
            team.setCorners = function (angle: number) {
              const scale = 15;
              const getRotatedTopLeftCornerOfRect = (x: number, y: number, width: number, height: number, angle: number) => {
                //console.log('gRtLCOR ', x, y, width, height, angle);

                const sin = (x: number) => {
                  return Math.sin(x / 180 * Math.PI);
                }

                const cos = (x: number) => {
                  return Math.cos(x / 180 * Math.PI);
                }

                var center = {
                  x: (x + width / 2),
                  y: (y + height / 2)
                };

                var vector = {
                  x: (x - center.x),
                  y: (y - center.y)
                };

                //console.log('vector: ',vector);
                var rotationMatrix = [[cos(angle), -sin(angle)], [sin(angle), cos(angle)]];

                var rotatedVector = {
                  x: vector.x * rotationMatrix[0][0] + vector.y * rotationMatrix[0][1],
                  y: vector.x * rotationMatrix[1][0] + vector.y * rotationMatrix[1][1]
                };

                return {
                  x: (center.x + rotatedVector.x),
                  y: (center.y + rotatedVector.y)
                };
              }

              const getAngleForNextCorner = (anc: any, vectorLength: any) => {
                var alpha = Math.acos(anc / vectorLength) * (180 / Math.PI);
                return 180 - alpha * 2;
              }

              const getVectorLength = (x: number, y: number, width: number, height: number) => {
                var center = {
                  x: x + width / 2,
                  y: y + height / 2
                };

                //console.log('center: ',center);
                var vector = {
                  x: (x - center.x),
                  y: (y - center.y)
                };
                return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
              }

              this.leftTopCorner = getRotatedTopLeftCornerOfRect(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale, angle);

              var vecLength = getVectorLength(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale);
              //console.log('vecLength: ',vecLength);

              angle = angle + getAngleForNextCorner(this.width / (2 * scale), vecLength);
              //console.log('angle: ',angle);
              this.rightTopCorner = getRotatedTopLeftCornerOfRect(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale, angle);

              angle = angle + getAngleForNextCorner(this.height / (2 * scale), vecLength);
              //console.log('angle: ',angle);
              this.rightBottomCorner = getRotatedTopLeftCornerOfRect(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale, angle);

              angle = angle + getAngleForNextCorner(this.width / (2 * scale), vecLength);
              //console.log('angle: ',angle);
              this.leftBottomCorner = getRotatedTopLeftCornerOfRect(this.x - this.width / (2 * scale), this.y - this.height / (2 * scale), this.width / scale, this.height / scale, angle);
            };

            // shows locations of corners
            team.getCorners = function () {
              return [this.leftTopCorner,
              this.rightTopCorner,
              this.rightBottomCorner,
              this.leftBottomCorner];
            };
          });
        });

      } else {
        parsedArmy[key] = value;
      }
    }

    return parsedArmy;
  };

  useEffect(() => {

    // pregame setup
    if (gameObject.status === 'preBattle') {

      const attackersArmy = armies.filter((army: Army) => army.name === setupObject.attacker);
      const defendersArmy = armies.filter((army: Army) => army.name === setupObject.defender);
      const selectedMap = terrains.filter((terrain: any) => terrain.name === setupObject.terrain);

      setGameObject({
        ...gameObject,
        attacker: createBattleArmies(attackersArmy[0], true),
        defender: createBattleArmies(defendersArmy[0], false),
        status: 'deploy',
        terrain: createBattleMap(selectedMap[0])
      });

    };

    //console.log(gameObject);
  }, [gameObject]);

  return (
    <div style={containerStyle}>
      <FirstBattleRow />
      <SecondBattleRow />
    </div>
  );
};

export default Battle;
