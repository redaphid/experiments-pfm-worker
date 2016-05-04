'use strict'
var Redis    = require('ioredis');
var uuid     = require('uuid');
var dashdash = require('dashdash');

class PFMEmitter {
  constructor(emitTopic) {
      this.emitTopic = emitTopic;
      this.client = new Redis();
  }

  emit(data) {
    this.client.publish(this.emitTopic, JSON.stringify(data))
      .then( () => this.client.quit())
  }
  
}

const options = doCliStuff();

const emitter = new PFMEmitter(options.emitTopic);

emitter.emit(options.data);

function doCliStuff() {
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

  const data = require(options.file);

  function die() {
    console.error("You did something wrong.")
    console.error(cliParser.help());
    process.exit(-1);
  }

  return {data, emitTopic: options.emit_topic};
}
