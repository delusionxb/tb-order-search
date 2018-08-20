
// https://gist.github.com/FGRibreau/3655432
// https://stackoverflow.com/questions/12008120/console-log-timestamps-in-chrome
// https://stackoverflow.com/questions/14638018/current-time-formatting-with-javascript

(function(o){
  if(o.__ts__) {
      return;
  }

  let slice = Array.prototype.slice;
  ['log', 'debug', 'info', 'warn', 'error'].forEach(function(f){
    let _= o[f];
    o[f] = function(){
      let args = slice.call(arguments);
      // args.unshift(new Date().toISOString());
      args.unshift(new Date().toLocaleString());
      return _.apply(o, args);
    };
  });
  o.__ts__ = true;
})(console);


const DEBUG = true;
let log = function() {
    if (DEBUG) {
        console.log.apply(console, arguments);
    }
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
let printAjaxError = function(jqXHR, status, error) {
    log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGIN ERROR');
    log(`status: ${status}, error: ${error}, jqXHR:`);
    Object.keys(jqXHR).forEach(function(key) {
        let value = jqXHR[key];
        if (value !== undefined && typeof value !== 'function') {
            log(`${key}: ${JSON.stringify(value)}`);
        }
    });
};
