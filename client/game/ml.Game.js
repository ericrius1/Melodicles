ml.Game = new Class({
  extend: EventEmitter,

  defaults: $.extend({}, ml.config),

  construct: function(options) {
    this.options = jQuery.extend({}, this.defaults, options);
    console.log("new game");
    //this.init();
  },

  init: function() {

    container = document.createElement('div');
    document.body.appendChild(container);

    this.comm = new ml.Comm({
      server: this.options.comm.server
    });
    console.log("test")
    this.comm.on('join', this.handleJoin);
    this.comm.connected();
  },

  handleJoin: function(message){
    console.log("waaah");
  }
});