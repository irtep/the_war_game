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

  interface Location {
    x: number,
    y: number
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
            team.order = 'wait'
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
                break;
              case 'elite':
                team.rat = team.rat + 1;
                team.mat = team.mat + 1;
                team.def = team.def + 1;
                team.reactions = team.reactions + 1;
                team.skill = team.skill + 1;
                break;
              case 'ace':
                team.rat = team.rat + 2;
                team.mat = team.mat + 2;
                team.def = team.def + 2;
                team.reactions = team.reactions + 2;
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
            team.turningSpeed = 5; // maybe all 1... maybe later will modificate this...Copy code
            team.moveToTarget = function () {
              if (this.order === 'move' && typeof this.target.x === 'number' && typeof this.target.y === 'number') {
                const updatedTeam = { ...this };

                // returns next location
                const getSpeeds = (rotation: any, speed: any) => {
                  const to_angles = Math.PI / 360;

                  return {
                    y: Math.sin(rotation * to_angles) * speed,
                    x: Math.cos(rotation * to_angles) * speed * -1,
                  };
                }

                const dx = this.target.x - this.x;
                const dy = this.target.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Calculate the angle based on the target position and add 90 degrees
                updatedTeam.targetAngle = ((Math.atan2(dy, dx) * 180) / Math.PI) + 90;

                const angleTolerance = 0.5; // Adjust this value based on your tolerance requirements

                if (Math.abs(updatedTeam.targetAngle - updatedTeam.a) < angleTolerance) {
                  updatedTeam.x += (dx / distance) * 1;
                  updatedTeam.y += (dy / distance) * 1;
                } else if (updatedTeam.targetAngle < updatedTeam.a) {
                  updatedTeam.a--;
                  updatedTeam.x += (dx / distance) * (1/3);
                  updatedTeam.y += (dy / distance) * (1/3);
                } else if (updatedTeam.targetAngle > updatedTeam.a) {
                  updatedTeam.a++;
                  updatedTeam.x += (dx / distance) * (1/3);
                  updatedTeam.y += (dy / distance) * (1/3);
                }

                if (distance < updatedTeam.speed) {
                  // Arrived at the target
                  updatedTeam.target = '';
                  updatedTeam.order = 'waiting';
                }

                return updatedTeam;
              } else {
                console.log('Cannot move:', this.order, this.target);

                return { ...this };
              }
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

    console.log(gameObject);
  }, [gameObject]);

  return (
    <div style={containerStyle}>
      <FirstBattleRow />
      <SecondBattleRow />
    </div>
  );
};

export default Battle;

/*
            team.moveToTarget = function () {
              if (this.order === 'move' && typeof this.target.x === 'number' && typeof this.target.y === 'number') {
                // Create a new object with the current values
                const updatedTeam = { ...this };
            
                // Calculate angle to the target
                const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            
                // Turn towards the target in discrete steps
                const angleDiff = angleToTarget - this.a;
                if (Math.abs(angleDiff) > this.turningSpeed) {
                  updatedTeam.a += (angleDiff > 0) ? this.turningSpeed : -this.turningSpeed;
                } else {
                  updatedTeam.a = angleToTarget;
                }
            
                // Accelerate until reaching maxSpeed (that is team.speed)
                if (updatedTeam.currentSpeed < this.speed) {
                  updatedTeam.currentSpeed += this.motorPower * 20;
                }
            
                // Calculate movement towards the target
                const deltaX = Math.cos(updatedTeam.a) * updatedTeam.currentSpeed;
                const deltaY = Math.sin(updatedTeam.a) * updatedTeam.currentSpeed;
            
                // Move towards the target
                updatedTeam.x += deltaX;
                updatedTeam.y += deltaY;
            
                // Check if the tank has reached the target
                const distanceToTarget = Math.sqrt((this.target.x - updatedTeam.x) ** 2 + (this.target.y - updatedTeam.y) ** 2);
                if (distanceToTarget < updatedTeam.currentSpeed) {
                  updatedTeam.order = 'waiting';
                  updatedTeam.target = '';
                  updatedTeam.currentSpeed = 0;
                  console.log(`Tank reached the target.`);
                }
            
                // Return the updated values without modifying the original object
                return updatedTeam;
              } else {
                console.log('Cannot move:', this.order, this.target);
            
                // If not moving, return the original values
                return { ...this };
              }
            };
      
          });
        });
*/

/*
            team.moveToTarget = function () {
              if (this.order === 'move' && typeof this.target.x === 'number' && typeof this.target.y === 'number') {
                // Create a new object with the current values
                const updatedTeam = { ...this };
                let bestResult = 'forward';

                // returns next location
                const getSpeeds = (rotation: any, speed: any) => {
                  const to_angles = Math.PI / 360;

                  return {
                    y: Math.sin(rotation * to_angles) * speed,
                    x: Math.cos(rotation * to_angles) * speed * -1,
                  };
                }

                // radar checks, that checks what direction is the closest
                const radarCheckForward = (centerOfCar: Location, heading: number, speed: number): Location => {
                  const newSpeeds = getSpeeds(heading, speed);
                  return { x: centerOfCar.x + -newSpeeds.x, y: centerOfCar.y + newSpeeds.y };
                }

                const radarCheckLeft = (centerOfCar: Location, heading: number, turnRate: number, speed: number): Location => {
                  const newSpeeds = getSpeeds(heading -= turnRate, speed);
                  return { x: centerOfCar.x + -newSpeeds.x, y: centerOfCar.y + newSpeeds.y };
                }

                const radarCheckRight = (centerOfCar: Location, heading: number, turnRate: number, speed: number): Location => {
                  const newSpeeds = getSpeeds(heading += turnRate, speed);
                  return { x: centerOfCar.x + -newSpeeds.x, y: centerOfCar.y + newSpeeds.y };
                }

                // Distance check
                const distanceCheck = (fromWhere: Location, toWhere: Location) => {
                  const a = fromWhere.x - toWhere.x // x1 - x2;
                  const b = fromWhere.y - toWhere.y // y1 - y2;

                  const c = Math.sqrt(a * a + b * b);
                  return c;
                }

                // checks what would be the closest way to target
                const forwardTest = radarCheckForward({ x: this.x, y: this.y }, this.a, 5);
                const turnLeftTest = radarCheckLeft({ x: this.x, y: this.y }, this.a, this.turningSpeed, 5);
                const turnRightTest = radarCheckRight({ x: this.x, y: this.y }, this.a, this.turningSpeed, 5);

                const distanceIfForward = distanceCheck(forwardTest, this.target);
                const distanceIfLeft = distanceCheck(turnLeftTest, this.target);
                const distanceIfRight = distanceCheck(turnRightTest, this.target);

                // choose direction by checking where is the target
                if (distanceIfForward > distanceIfLeft) {
                  bestResult = 'turn left';
                }
                if (distanceIfForward > distanceIfRight) {
                  bestResult = 'turn right';
                }

                // Accelerate until reaching maxSpeed (that is team.speed)
                if (updatedTeam.currentSpeed < this.speed) {
                  updatedTeam.currentSpeed += this.motorPower * 10;
                }

                // execute wheel turning.
                switch (bestResult) {
                  case 'turn left':
                    updatedTeam.a = (this.a - this.turningSpeed + 360) % 360;
                    break;
                
                  case 'turn right':
                    updatedTeam.a = (this.a + this.turningSpeed) % 360;
                    break;
                }
                
                const speeds = getSpeeds(updatedTeam.a, updatedTeam.currentSpeed);
                console.log('best result: ', bestResult);
                // new location:
                updatedTeam.x += -speeds.x;
                updatedTeam.y += speeds.y;
                
                const distanceToTarget = distanceCheck({x: updatedTeam.x, y: updatedTeam.y}, {x: this.target.x, y: this.target.y});
                console.log('distance to target: ', distanceToTarget);
                if (distanceToTarget < 10) {
                  updatedTeam.order = 'wait';
                  updatedTeam.target = '';
                  updatedTeam.currentSpeed = 0;
                }
                return updatedTeam;
              } else {
                console.log('Cannot move:', this.order, this.target);

                // If not moving, return the original values
                return { ...this };
              }
            };
*/