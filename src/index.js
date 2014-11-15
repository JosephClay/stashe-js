var utils = require('./utils'),
    store = require('./store'),
    NAME = 'stashe-js';

function Cache(id) {
    var self = this;

    self._id = id === undefined ? utils.id() : id;

    self._flushes = self._reads = self._writes = self._deletes = 0;

    // proxies for set
    self.store = self.put = self.set.bind(self);

    // proxies for remove
    self.del = self.remove = self.remove.bind(self);

    // proxies for flush
    self.clear = self.flush.bind(self);
}

Cache.create = function(id) {
    return new Cache(id);
};

Cache.prototype = {
    constructor: Cache,

    id: function(id) {
        var self = this;

        // just getting the id. that's safe
        if (id === undefined) { return self._id; }

        // trying to set the id, but there
        // is data set in the cache
        if (self.size()) {
            console.warn(NAME + ' - id change will orphan data');
        }

        return (self._id = id);
    },

    has: function(key) {
        return this.get(key) !== undefined;
    },

    exists: function(key) {
        var value = this.get(key);
        return value !== undefined && value !== null;
    },

    size: function() {
        return utils.size(store.ref(this));
    },

    stats: function() {
        var self = this;
        return {
            id:      self._id,
            keys:    self.size(),
            flushes: self._flushes,
            reads:   self._reads,
            writes:  self._writes,
            deletes: self._deletes
        };
    },

    getOrSet: function(key, fn) {
        var self = this,
            args = arguments;

        if (args.length > 2) {
            key = utils.slice(args);
            fn = key.pop();
        }

        var result;
        if ((result = self.get(key)) === undefined) {
            var value = fn();
            self.set(key, value);
            return value;
        }

        return result;
    },

    get: function(key) {
        var self = this;

        self._reads++;

        var ref = store.ref(self),
            args = arguments,
            argVars = args.length > 1 ? utils.slice(args) : null;

        return argVars ? store.getDeep(ref, argVars) : Array.isArray(key) ? store.getDeep(ref, key) : store.get(ref, key);
    },

    set: function(key, value) {
        var self = this;

        self._writes++;

        var ref = store.ref(self),
            args = arguments,
            argVars = args.length > 2 ? utils.slice(args) : null,
            result = argVars ? store.setDeep(ref, argVars, argVars.pop()) : Array.isArray(key) ? store.setDeep(ref, key, value) : store.set(ref, key, value);

        return self;
    },

    remove: function(key) {
        var self = this;

        self._deletes++;

        var ref = store.ref(self),
            args = arguments,
            argVars = args.length > 1 ? utils.slice(args) : null,
            result = argVars ? store.removeDeep(ref, argVars) : Array.isArray(key) ? store.removeDeep(ref, key) : store.remove(ref, key);

        return self;
    },

    flush: function() {
        var self = this;

        self._flushes++;
        self._reads = self._writes = self._deletes = 0;

        store.flush(self);

        return self;
    },

    toString: function() {
        var msg = NAME + ' - ',
            stats = this.stats();
        Object.keys(stats).forEach(function(name) {
            msg += (name + ': ' + stats[name] + ', ');
        });
        return msg;
    },

    toJSON: function() {
        return utils.unsafe(store.ref(this));
    }
};

module.exports = Cache;