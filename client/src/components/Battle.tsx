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
            team.motorPower = team.horsepowers / team.weight;
            team.currentSpeed = 0;
            // methods:
            team.turningSpeed = 5; // maybe all 1... maybe later will modificate this...Copy code
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
            /**
             *     intervalId: null, // Store the interval ID

    moveToTarget: function () {
        if (this.order === 'move' && this.target) {
            // Calculate angle to the target
            const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);

            // Turn towards the target in discrete steps
            const angleDiff = angleToTarget - this.a;
            if (Math.abs(angleDiff) > this.turningSpeed) {
                this.a += (angleDiff > 0) ? this.turningSpeed : -this.turningSpeed;
            } else {
                this.a = angleToTarget;
            }

            // Accelerate until reaching maxSpeed
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += this.acceleration;
            }

            // Calculate movement towards the target
            const deltaX = Math.cos(this.a) * this.currentSpeed;
            const deltaY = Math.sin(this.a) * this.currentSpeed;

            // Move towards the target
            this.x += deltaX;
            this.y += deltaY;

            // Check if the tank has reached the target
            const distanceToTarget = Math.sqrt((this.target.x - this.x) ** 2 + (this.target.y - this.y) ** 2);
            if (distanceToTarget < 1) { // You can adjust the threshold as needed
                this.order = 'waiting';
                console.log(`Tank reached the target. Order changed to 'waiting'. Stopping the interval.`);
                clearInterval(this.intervalId);
            }
        }
    }
};

// Example usage
team.order = 'move';
team.target = { x: 300, y: 300 };

// Start the interval and store the interval ID
team.intervalId = setInterval(() => {
    team.moveToTarget();
    console.log(`Tank position: (${team.x}, ${team.y}), Heading: ${team.a.toFixed(2)}, Speed: ${team.currentSpeed.toFixed(2)}, Order: ${team.order}`);
}, 250);
             */

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