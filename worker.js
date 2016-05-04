'use strict'
var _         = require('lodash')
var Redis     = require('ioredis');
var dashdash  = require('dashdash');
var debug     = require('debug')('pfm:worker');

class PFMWorkerMaster {
  constructor(emitTopic, queue) {
      this.emitTopic = emitTopic;
      this.queue = queue;
  }

  start() {
    debug('starting up');
    this.client = new Redis();
  }

  getEmAll() {
    this.client.rpop(this.queue)
      .then( (rawJob) => {
        if(!rawJob) {
          debug('no more work to do!');
          process.exit(0);
        }
        const job = JSON.parse(rawJob);
        debug('got job', JSON.stringify(job))
        getEmAll();
      })
  }
}

const options = doCliStuff();

const master = new PFMWorkerMaster(options.emitTopic, options.queue);

master.start();

function doCliStuff() {
  var cliParser = dashdash.createParser({options: [
    {
      names: ['finished-topic', 'f'],
      type: 'string',
      help: 'the name of the topic to emit when work is finished (optional)'
    },
    {
      names: ['queue', 'q'],
      type: 'string',
      help: 'the name of the work queue to fill'
    }
  ]});

  try {
    const options = cliParser.parse(process.argv);
    if(!options.queue) die();    

    return {queue: options.queue, finishedTopic: options.finished_topic};
  }
  catch(error) {
    die();
  }

  function die() {
    console.error("You did something wrong.")
    console.error(cliParser.help());
    process.exit(-1);
  }
}
