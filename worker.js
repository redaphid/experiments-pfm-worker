'use strict'
var _         = require('lodash')
var Redis     = require('ioredis');
var dashdash  = require('dashdash');
var debug     = require('debug')('pfm:worker');

const FINISHED_MESSAGE = JSON.stringify(['some', 'random', 'bullshit']);

class PFMWorker {
  constructor(finishedTopic, queue) {
      debug(`new PFMWorker on ${queue}`);
      if(finishedTopic) debug(`will broadcast to ${finishedTopic} when finished.`);
      this.finishedTopic = finishedTopic;
      this.queue = queue;
  }

  start() {
    debug('starting up');
    this.client = new Redis();
    this.work();
  }

  work() {
    this.client.rpop(this.queue)
      .then( (rawJob) => {
        if(!rawJob) return this.finish();
        const job = JSON.parse(rawJob);
        debug('got job', job);
        this.work();
      });
  }

  finish() {
    debug('finished!')
    if(!this.finishedTopic) process.exit(0);

    if(this.finishedTopic) {
      debug(`telling everyone I've finished on topic: ${this.finishedTopic}`);
      this.client.publish(this.finishedTopic, FINISHED_MESSAGE).then( () => process.exit(0) );
    }
  }
}

const options = doCliStuff();

const worker = new PFMWorker(options.finishedTopic, options.queue);

worker.start();

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
