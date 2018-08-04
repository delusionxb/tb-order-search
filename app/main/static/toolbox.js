
const DEBUG = true;
let log = function() {
    if (DEBUG) {
        console.log.apply(console, arguments);
    }
};
