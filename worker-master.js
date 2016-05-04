'use strict'
var _         = require('lodash')
var Redis     = require('ioredis');
var dashdash  = require('dashdash');

class PFMWorkerMaster {
  constructor(subscribeTopic, queue) {
      this.subscribeTopic = subscribeTopic;
      this.queue = queue;
  }

  start() {
    console.log('starting up');
    this.client = new Redis();
    this.subscriber = new Redis();
    this.subscriber.subscribe(this.subscribeTopic);
    this.subscriber.on('message', (channel, message) => this.fillQueue(message));
  }

  fillQueue (message) {
    const jobs = JSON.parse(message);
    console.log(`putting ${jobs.length} jobs into ${this.queue}`);
    this.client.lpush(this.queue, _.map(jobs, JSON.stringify))
      .then( ()=> this.getEmAll() )
  }

  getEmAll() {
    this.client.rpop(this.queue)
      .then( (job) => {
        console.log('got job', JSON.parse(job))
        if(job) this.getEmAll();
      })
  }

  queueJob (job) {
      console.log(`I was going to queue up ${job}, but I didn't.`);
  }
}

const options = doCliStuff();

const master = new PFMWorkerMaster(options.subscribeTopic, options.queue);

master.start();

function doCliStuff() {
  var cliParser = dashdash.createParser({options: [
    {
      names: ['subscribe-topic', 's'],
      type: 'string',
      help: 'the name of the topic to subscribe'
    },
    {
      names: ['queue', 'q'],
      type: 'string',
      help: 'the name of the work queue to fill'
    }
  ]});

  var options = {}
  try {
    options = cliParser.parse(process.argv);
  }
  catch(error) {
    die();
  }

  if(!options.subscribe_topic || !options.queue) {
    die();
  }

  function die() {
    console.error("You did something wrong.")
    console.error(cliParser.help());
    process.exit(-1);
  }

  return {queue: options.queue, subscribeTopic: options.subscribe_topic};
}
