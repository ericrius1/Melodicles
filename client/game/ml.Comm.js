ml.Comm = new Class({
  extend: EventEmitter,
  makeTrigger: function(evt) {
    var that = this;
    return function(message) {
      that.trigger.call(that, evt, message);
    }
  },

  destruct: function() {
    //Todo: Seend server destruct message
  },


  construct: function(options) {
    options = jQuery.extend({
      server: 'localhost: 8080'
    }, options);

    options.server = options.server;

    var that = this;

    this.socket = io.connect(options.server);

    this.socket.on('join', this.makeTrigger('join'));

    this.socket.on('failed'),

    function(message) {
      //try to reconnect
      that.connected();
    }

    this.socket.on('add_object', this.makeTrigger('add_object'));

    this.socket.on('object list', this.makeTrigger('object list'));
  },

  connected: function() {
    this.socket.emit('join', {});
  },

  addObject: function(position) {
    console.log(position);
    this.socket.emit('add_object', {
      position: position
    });
  }
});