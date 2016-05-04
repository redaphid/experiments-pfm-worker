var Redis    = require('ioredis');
var uuid     = require('uuid');
var dashdash = require('dashdash');

const die = () => {
  console.error("You did something wrong.")
  console.error(cliParser.help());
  process.exit(-1);
}

var cliParser = dashdash.createParser({options: [
  {
    names: ['emit-topic', 'e'],
    type: 'string',
    help: 'the name of the topic to emit'
  },
  {
    names: ['file', 'f'],
    type: 'string',
    help: 'a file containing data to process'
  }
]});

var options = {}
try {
  options = cliParser.parse(process.argv);
}
catch(error) {
  die();
}

if(!options.emit_topic || !options.file) {
  die();
}


//
//
// var emitterClient = new Redis();
//
//
// var file = _.last(process.argv)
//
// if(!file) {
//   console.error("Give me a file with data to add to the queue");
//   process.exit -1
// }
// var data = require(file)
//
// var emitterClient = new Redis();
//
//
// masterClient.subscribe('point', function(){
//   console.log('subscribed to point');
//   masterClient.on('message', function(channel, message){
//       console.log('got', message);
//   });
//
//   var data = uuid.v4()
//   console.log(`emitting to point: ${data}`)
//   emitterClient.publish('point', data)
//
// })
