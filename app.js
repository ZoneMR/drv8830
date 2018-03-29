var i2c = require('i2c-bus'), i2c1 = i2c.openSync(1);
var sleep = require('sleep');


// Commands
const FAULT_CMD         = 0x01;

// Fault constants
const CLEAR_FAULT       = 0x80;
const FAULT             = 0x01;
const ILIMIT            = 0x10;
const OTS               = 0x08;
const UVLO              = 0x04;
const OCP               = 0x02;

// Direction bits
const FORWARD           = 0b00000010;
const REVERSE           = 0b00000001;
const HI_Z              = 0b00000000;
const BRAKE             = 0b00000011;

var address = 0x64;

var getFault = function() {

    var fault = {
        message: '',
        code: 0
    }

    var faultCode;
    try {
        i2c1.readByteSync(address, FAULT_CMD);
    } catch (e) {
        console.log(`Read fault failed: ${e}`)
    }
    
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

var clearFault = function() {
    var fault = getFault(address);
    if (fault.code) {
        try {
            var success = i2c1.writeByteSync(address, FAULT_CMD, CLEAR_FAULT);
            if (success) { return true; }
        } catch (e) {
            console.log(`Failed to clear faults: ${e}`)
        }
    }
    return false;
}

var drive = function(speed = 0, direction = undefined, checkFault = false) {
    // The speed should be 0-63.
    if (checkFault) { clearFault();}
    if (direction === undefined) {        
        direction = speed < 0;
        speed = Math.abs(speed);
        if (speed > 63) { speed = 63; }
        speed = speed << 2 ;
        if (direction) { speed |= FORWARD; }
        else           { speed |= REVERSE; }
    } else {
        speed = speed << 2 ;
        speed |= direction;
    }
    try {
        i2c1.writeByteSync(address, 0x00, speed);
    } catch (e){
        console.log('Drive command failed.')
    }
}

var brake = function() {
    try {
        drive(0, HI_Z);
    } catch (e) {
        console.log('Brake command failed.')
    }
}


var stop = function() {
    try {
        drive(0, BRAKE);
    } catch (e) {
        console.log('Brake command failed.')
    }
}

console.log(getFault().message);
var success = clearFault();

for (var i = 0; i < 63; i++){
    drive(i);
    sleep.msleep(50);
}
sleep.msleep(500);
for (var i = 63; i > 0; i--){
    drive(i);
    sleep.msleep(50);
}

// Drive forward full speed.
drive(63);
sleep.sleep(1);
// Hold idle
drive(0, HI_Z);
sleep.sleep(1);
// Drive reverse full speed.
drive(-63);
sleep.sleep(1);

// Brake, but continue forward.
brake(50);
sleep.sleep(1);

// Drive forward, but clear faults first.
drive(50, undefined, true);
sleep.sleep(1);

// Stop.
drive(0, BRAKE);
// OR
// stop();