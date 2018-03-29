var i2c = require('i2c-bus'), i2c1 = i2c.openSync(1);
var sleep = require('sleep');


// Commands
const CLEAR_FAULT       = 0x80;
const FAULT_CMD        = 0x01;

// Fault constants
const FAULT             = 0x01;
const ILIMIT            = 0x10;
const OTS               = 0x08;
const UVLO              = 0x04;
const OCP               = 0x02;

// Direction bits
const FORWARD           = 0b00000010;
const REVERSE           = 0b00000001;
const BRAKE             = 0b00000010;
const HI_Z              = 0b00000011;

var address = 0x64;

var getFault = function(address) {

    var fault = {
        message: "",
        code: 0
    }

    var faultCode = i2c1.readByteSync(address, FAULT_CMD);
    fault.code = faultCode;

    if (faultCode !== 0) {
        fault.message = 'Unknown fault.';
        switch (faultCode){
            case FAULT:
                fault.message = 'Unknown fault.'
                break;
            case ILIMIT:
                fault.message = 'Extended current limit event'
                break;
            case OTS:
                fault.message = 'Over temperature.'
                break;
            case UVLO:
                fault.message = 'Undervoltage lockout.'
                break;
            case OCP:
                fault.message = 'Overcurrent lockout.'
                break;
            default:
                fault.message = 'Unknown fault.'
                break;
        }
        return fault;
    } else {
        fault.message = 'No fault';
        return fault;
    }
}

var clearFault = function(address) {
    var fault = getFault(address);
    if (fault.code) {
        var success = i2c1.writeByteSync(address, FAULT_CMD, CLEAR_FAULT);
        if (success) { return true; }
    }
    return false;
}

// var drive = function(address, direction, speed) {
//     // The speed should be 0-63.
//     if (speed > 63) { speed = 64; }
//     if (speed < 0)  { speed =  0; }
//     console.log(speed.toString(2));
//     speed = speed << 2 ;
//     console.log(direction.toString(2));
//     speed |= direction;
//     // if (speed < 0) { speed |= 0x01; }
//     // else           { speed |= 0x02; }

//     console.log(speed.toString(2));
//     i2c1.writeByteSync(address, 0x00, speed);
// }

var drive = function(address, speed) {
    // The speed should be 0-63.
    const direction = speed < 0;
    speed = Math.abs(speed);
    if (speed > 63) { speed = 63; }
    speed = speed << 2 ;
    if (direction) { speed |= 0x01; }
    else           { speed |= 0x02; }
    i2c1.writeByteSync(address, 0x00, speed);
}

var brake = function(address) {}

console.log(getFault(address).message);
var success = clearFault(address);


for (var i = 0; i < 64; i++){
    drive(address, i);
    sleep.msleep(50);
}

for (var i = 64; i > 0; i--){
    drive(address, i);
    sleep.msleep(50);
}


drive(address, BRAKE, 0);
