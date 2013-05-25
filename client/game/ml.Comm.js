
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
    this.socket.on('add_box', this.makeTrigger('add_box'));
    this.socket.on('failed'),
    function(message) {
      //try to reconnect
      that.connected();
    }
  },

  connected: function(){
    console.log("yeah")
    this.socket.emit('join', {});
  }
});