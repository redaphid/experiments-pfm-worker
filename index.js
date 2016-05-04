var Redis = require('ioredis');
var uuid = require('uuid')

var emitterClient = new Redis();
var masterClient = new Redis();
var workerClient = new Redis();

masterClient.subscribe('point', function(){
  console.log('subscribed to point');
  masterClient.on('message', function(channel, message){
      console.log('got', message);
  });

  var data = uuid.v4()
  console.log(`emitting to point: ${data}`)
  emitterClient.publish('point', data)

})
