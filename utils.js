var id = 0;

/**
 * From Sizzle.js `createCache()`:
 * Use (key + ' ') to avoid collision
 * with native prototype properties.
 * @param {String} key
 * @returns {String}
 * @private
 */
var safe = function(key) {
    return key + ' ';
};

/**
 * Reverse of safe. Removes the ' '
 * from the end of the key
 * @param  {String} key
 * @return {String}
 */
var unsafe = function(key) {
    var len = key.length,
        lastChar = key[len - 1];
    return lastChar === ' ' ? key.substr(0, key.length -1) : key;
};

/**
 * Takes a stored object with safe keys
 * and "unsafes" the keys, giving back a clone
 * of the object with the correct keys
 * @param  {Object} base stored cache
 * @return {Object}      clone
 */
var unsafeObj = function(base) {
    var clone = {},
        key, ref;
    for (key in base) {
        ref = base[key];

        if (ref !== null && ref !== undefined && 
            typeof (ref) === 'object' &&
            !Array.isArray(ref)
        ) {
            // nested object, recursively unsafe the object
            clone[unsafe(key)] = unsafeObj(ref);
        
        } else {
            // primitive case: e.g. boolean, number, string etc...
            clone[unsafe(key)] = ref;
        }
    }
    return clone;
};

module.exports = {
	safe: safe,
    unsafe: unsafeObj,

    id: function() {
        return id++;
    },

    slice: (function(slice) {

        return function(obj) {
            return slice.call(obj);
        };

    }(Array.prototype.slice)),

    size: function(obj) {
        return Array.isArray(obj) ? obj.length : Object.keys(obj).length;
    },

    safeDeep: function(keys) {
        return keys.map(function(key) {
            return safe(key);
        });
    }
};