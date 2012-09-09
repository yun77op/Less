app.define('app', function() {

  function Settings(name, defaults) {
    this.settings = {};
    this.subscriptions = {};
    this.name = name;
    this.defaults = defaults;
  }

  var p = Settings.prototype;


  // init settings from localStorage
  p.initialize = function(defaults) {
    var self = this;
    if(window.localStorage) {
      var val = window.localStorage[this.name];
      if (val) {
        this.settings = JSON.parse(val);
        for (var path in this.settings) {
          this.notify(path, this.settings[path]);
        }
      } else {
        this.settings = {};
        this.flatten(defaults || this.defaults);
      }
    } else {
      throw new Error("We really need localStorage!");
    }
    _.bindAll(this, 'persist');
    //lazily, once one minute.
    window.setInterval(this.persist, 60 * 1000);
    window.addEventListener('beforeunload', function() {
      if (!Settings.cancelPersist) {
        self.persist();
      }
    });
  };

  // save to localStorage
  p.persist = function() {
    window.localStorage[this.name] = JSON.stringify(this.settings);
  };

  p.notify = function(path, value) {
    if(this.subscriptions[path]) {
      this.subscriptions[path].forEach(function(cb) {
        cb(value);
      });
    }
  };

  p.subscribe = function(path, cb) {
    if(!this.subscriptions[path])
      this.subscriptions[path] = {};
    if(!this.subscriptions[path][key])
      this.subscriptions[path] = [];
    this.subscriptions[path].push(cb);
  };
  
  p.flatten = function(obj, prefix, overwrite) {
    var value, path;
    if (arguments.length == 2 && typeof prefix == 'boolean') {
      overwrite = prefix;
      prefix = null;
    }
    for (var i in obj) {
      value = obj[i];
      path = prefix ? prefix + '.' + i : i;
      if (typeof value == 'object') {
        this.flatten(value, path, overwrite);
      } else {
        if (this.settings[path] !== undefined && !overwrite) {
          continue;
        }
        this.set(path, value);
      }
    }
  };

  p.get = function(path) {
    if (arguments.length > 1) {
      path = Array.prototype.join.call(arguments, '.');
    }
    return this.settings[path];
  };
  
  // set a key in a namespace
  p.set = function(path, value) {
    if (this.settings[path] === value) { return; }
    this.settings[path] = value;
    this.notify(path, value);
  };

  var settings = new Settings('settings');

  return {
    Settings: Settings,
    settings: settings
  };
});