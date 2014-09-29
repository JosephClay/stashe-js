var utils = require('./utils'),

	/**
	 * Our main in-memory storage,
	 * hidden from everyone by using
	 * cache instance ids at a top-level
	 * @type {Object{id:{}}}
	 */
	cache = {},

	deepAccess = function(ref, keys) {
		var idx = 0,
			// don't want the last key,
			// that's our value
			length = keys.length - 1,
			key;
		for (; idx < length; idx++) {
			key = keys[idx];

			// ensure the chain exists
			ref = ref[key] || (ref[key] = {});
		}

		return ref;
	};

module.exports = {
	ref: function(inst) {
		return cache[inst._id] || (cache[inst._id] = {});
	},

	flush: function(inst) {
		return (cache[inst._id] = {});
	},

	get: function(ref, key) {
		// simple access
		return ref[utils.safe(key)];
	},

	getDeep: function(ref, keys) {
		keys = utils.safeDeep(keys);
		ref = deepAccess(ref, keys);

		// access the ref of the last key
		return ref[keys[keys.length - 1]];
	},

	set: function(ref, key, value) {
		return (ref[utils.safe(key)] = value);
	},

	setDeep: function(ref, keys, value) {
		keys = utils.safeDeep(keys);
		ref = deepAccess(ref, keys);

		// save the value to the last key
		return (ref[keys[keys.length - 1]] = value);
	},

	remove: function(ref, key) {
		delete ref[utils.safe(key)];
	},

	removeDeep: function(ref, keys) {
		keys = utils.safeDeep(keys);
		ref = deepAccess(ref, keys);

		var key = keys[keys.length - 1];
		delete ref[key];
	}
};