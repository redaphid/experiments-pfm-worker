'use strict'
var _         = require('lodash')
var Redis     = require('ioredis');
var dashdash  = require('dashdash');
var debug     = require('debug')('pfm:worker-master');

class PFMWorkerMaster {
  constructor(beginTopic, queue) {
      this.beginTopic = beginTopic;
      this.queue = queue;
  }

  start() {
    debug(`Listening on ${this.beginTopic} to add work to ${this.queue}`)
    this.client = new Redis();
    this.subscriber = new Redis();
    this.subscriber.subscribe(this.beginTopic);
    this.subscriber.on('message', (channel, message) => this.fillQueue(message));
  }

  fillQueue (message) {
    const jobs = JSON.parse(message);

    debug(`putting ${jobs.length} jobs into ${this.queue}`);

    this.client.lpush(this.queue, _.map(jobs, JSON.stringify))
      .then( ()=> this.getEmAll() )
  }

  getEmAll() {
    this.client.rpop(this.queue)
      .then( (job) => {
        debug('got job', JSON.stringify(job))
        if(!job){
          debug('no more work to do!');
          return;
        } this.getEmAll();
      })
  }

  queueJob (job) {
      console.log(`I was going to queue up ${job}, but I didn't.`);
  }
}

const options = doCliStuff();

const master = new PFMWorkerMaster(options.beginTopic, options.queue);

master.start();

function doCliStuff() {
  var cliParser = dashdash.createParser({options: [
    {
      names: ['begin-topic', 'b'],
      type: 'string',
      help: 'The name of the topic that indicates work is to be done'
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

  if(!options.begin_topic || !options.queue) {
    die();
  }

  function die() {
    console.error("You did something wrong.")
    console.error(cliParser.help());
    process.exit(-1);
  }

  return {queue: options.queue, beginTopic: options.begin_topic};
}
