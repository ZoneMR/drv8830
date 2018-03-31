'use strict';
var i2c = require('i2c-bus'), i2c1 = i2c.openSync(1);
var sleep = require('sleep');
var drv8830 = require('./drv8830');

const motorAddressOne = 0x64;

var motor1 = new drv8830(motorAddressOne, i2c1);

motor1.drive(-63);
sleep.msleep(500);
motor1.stop();


// console.log(getFault().message);
// var success = clearFault();

// for (var i = 0; i < 63; i++){
//     drive(i);
//     sleep.msleep(50);
// }
// sleep.msleep(500);
// for (var i = 63; i > 0; i--){
//     drive(i);
//     sleep.msleep(50);
// }

// // Drive forward full speed.
// drive(63);
// sleep.sleep(1);
// // Hold idle
// drive(0, HI_Z);
// sleep.sleep(1);
// // Drive reverse full speed.
// drive(-63);
// sleep.sleep(1);

// // Brake, but continue forward.
// brake(50);
// sleep.sleep(1);

// // Drive forward, but clear faults first.
// drive(50, undefined, true);
// sleep.sleep(1);

// // Stop.
// drive(0, HI_Z);
// // OR
// // stop();