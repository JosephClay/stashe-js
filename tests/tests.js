var _ = require('lodash'),
    stashe = require('../src/index');

exports['construct instance'] = function(test) {

    test.ok(stashe.create, 'create does not exists');
    test.ok(_.isFunction(stashe.create), 'create is not a function');
    test.ok(_.isFunction(stashe.constructor), 'constructor is not defined');

    test.done();
};

exports['ensure properties'] = function(test) {
    var cache = stashe.create();

    [
        '_id',
        '_flushes',
        '_reads',
        '_writes',
        '_deletes'
    ].forEach(function(key) {
        test.ok(_.isNumber(cache[key]), key + ' is not set');
    });

    [
        'store',
        'put',
        'set',
        'del',
        'remove',
        'clear',
        'flush',
        'toString',
        'toJSON'
    ].forEach(function(key) {
        test.ok(_.isFunction(cache[key]), key + ' is a missing method');
    });

    test.done();
};

exports['get/set'] = function(test) {
    var cache = stashe.create();

    test.ok(cache.get('foo') === undefined, 'cache returns incorrect values for unset keys');
    test.ok(cache.set('foo', 1) === cache, 'setting is not chainable');
    test.ok(cache.get('foo') === 1, 'a set key does not return the correct value');
    cache.set('foo', 2);
    test.ok(cache.get('foo') === 2, 'a set key is unable to change value');

    cache.set('undef', undefined);
    test.ok(cache.get('undef') === undefined, 'not able to set undefiend');
    cache.set('null', null);
    test.ok(cache.get('null') === null, 'not able to set null');
    cache.set('str', 'foo');
    test.ok(_.isString(cache.get('str')), 'not able to set a string');
    cache.set('number', 0);
    test.ok(cache.get('number') === 0, 'not able to set a number');
    cache.set('array', []);
    test.ok(_.isArray(cache.get('array')), 'not able to set an array');
    cache.set('object', {});
    test.ok(_.isObject(cache.get('object')), 'not able to set an object');
    cache.set('func', function() {});
    test.ok(_.isFunction(cache.get('func')), 'not able to set a function');
    cache.set('infin', Infinity);
    test.ok(cache.get('infin') === Infinity, 'not able to set infinity');
    cache.set('nan', NaN);
    test.ok(isNaN(cache.get('nan')), 'not able to set NaN');
    cache.set('regex', /a/);
    test.ok(_.isRegExp(cache.get('regex')), 'not able to set a regex');
    cache.set('bool', true);
    test.ok(cache.get('bool') === true, 'not able to set a boolean');
    cache.set('date', new Date());
    test.ok(_.isDate(cache.get('date')), 'not able to set a date');

    var arr = [ 1 ];
    cache.set('populated_array', arr);
    test.deepEqual(cache.get('populated_array'), arr, 'not able to set a populated array');
    arr.push(2);
    test.deepEqual(cache.get('populated_array'), arr, 'arrays do not share a reference after being cached');

    var obj = { a: 1 };
    cache.set('populated_object', obj);
    test.deepEqual(cache.get('populated_object'), obj, 'not able to set a populated object');
    obj.b = 1;
    test.deepEqual(cache.get('populated_object'), obj, 'objects do not share a reference after being cached');

    var f = function() { return 1; };
    cache.set('populated_func', f);
    test.ok(f() === 1, 'test function does not return 1');
    test.ok(cache.get('populated_func')() === 1, 'functions stored do not return the correct value');

    test.done();
};

exports['get/set deep'] = function(test) {
    var cache = stashe.create();

    cache.set(['foo', 'bar'], 1);
    test.deepEqual(cache.toJSON(), { 'foo': { 'bar': 1 } }, 'cannot set a value via an array');
    test.ok(cache.get([ 'foo', 'bar' ]) === 1, 'cannot get a value via an array');

    test.deepEqual(cache.toJSON(), { 'foo': { 'bar': 1 } }, 'cached keys are not deeply nested');

    var cache2 = stashe.create();
    cache2.set('bar', 'baz', 1);
    test.deepEqual(cache2.toJSON(), { 'bar': { 'baz': 1 } }, 'cannot set a value via multiple params');
    test.ok(cache2.get('bar', 'baz') === 1, 'cannot get a value via multiple params');

    test.done();
};

exports['shallow vs deep'] = function(test) {
    var cache = stashe.create();

    cache.set('foo', 1);
    cache.set(['foo', 'bar'], 2);
    test.ok(cache.get(['foo', 'bar']) !== 2, 'deep overwrites shallow');

    test.done();
};

exports['flush tests'] = function(test) {
    var cache = stashe.create();

    cache.set('foo', 1);
    cache.set(['bar', 'baz'], 1);
    test.ok(cache.get('foo') === 1, 'cache did not contain initial data to flush');
    test.ok(cache.get(['bar', 'baz']) === 1, 'cache did not contain initial deep data to flush');

    cache.flush();

    test.ok(_.isEmpty(cache.toJSON()), 'cache is not empty');
    test.ok(cache.get('foo') === undefined, 'cache did not remove key successfully');
    test.ok(cache.get(['bar', 'baz']) === undefined, 'cache did not remove deep key successfully');

    test.done();
};

exports['id get/set'] = function(test) {
    var cache = stashe.create();

    test.ok(_.isNumber(cache.id()), 'cache does not have an initial id');
    test.ok(cache.id() !== 0, 'inital cache should not be zero');
    test.ok(!!cache.id(), 'inital cache should not be falsy');

    test.ok(cache.id(999) === 999, 'setting an id does not return the new id');
    test.ok(cache.id() === 999, 'setting an id did not override private id');

    cache.id('foo');
    test.ok(cache.id() === 'foo', 'a string cannot be set as an id');

    test.done();
};

exports['toJSON/toString'] = function(test) {
    var cache = stashe.create();

    test.ok(_.isObject(cache.toJSON()), 'toJSON does not return an object');
    test.ok(_.isString(cache.toString()), 'toString does not return a string');

    test.done();
};

exports['key conflict'] = function(test) {
    var cache = stashe.create();

    cache.set('keys', 0);
    test.ok(cache.get('keys') === 0, 'can get a keyword (Object.keys)');
    test.ok(_.isFunction(Object.keys), 'keyword has not overridden root object property (Object.keys)');

    test.done();
};

exports['instance conflicts'] = function(test) {
    var cache1 = stashe.create(),
        cache2 = stashe.create();

    cache1.set('foo', 1);
    test.ok(cache2.get('foo') === undefined, 'caching a value in one cache is available in another');

    test.done();
};

exports['remove tests'] = function(test) {
    var cache = stashe.create();

    cache.set('foo', 1);
    cache.remove('foo');
    test.ok(cache.get('foo') === undefined, 'unable to remove a value after being set');

    cache.set('foo', 'bar', 1);
    cache.remove('foo', 'bar');
    test.ok(cache.get('foo', 'bar') === undefined, 'unable to remove a deep value after being set');

    cache.set(['bar', 'baz'], 1);
    cache.remove(['bar', 'baz']);
    test.ok(cache.get(['bar', 'baz']) === undefined, 'unable to remove a deep value via array after being set');

    test.done();
};

exports['get or set conditionally'] = function(test) {
    var cache = stashe.create();

    var result = cache.getOrSet('foo', function() { return 1; });
    test.ok(result === 1, 'getOrSet does not return the set value');
    test.ok(cache.get('foo') === 1, 'getOrSet set its value when set destination is undefined');

    cache.getOrSet('foo', function() { return 2; });
    test.ok(cache.get('foo') === 1, 'getOrSet overrides already stored value (1)');

    cache.set('foo', null);
    cache.getOrSet('foo', function() { return 2; });
    test.ok(cache.get('foo') === null, 'getOrSet overrides already stored value (null)');

    cache.getOrSet([ 'bar' ], function() { return 2; });
    test.ok(cache.get('bar') === 2, 'getOrSet cannot take array first param');

    cache.getOrSet('baz', 'bar', 'foo', function() { return 3; });
    test.ok(cache.get('baz', 'bar', 'foo') === 3, 'getOrSet cannot take multiple params');

    cache.getOrSet('foobarbaz', function() { return; });
    test.ok(cache.get('foobarbaz') === undefined, 'getOrSet cannot handle passed function returning undefined');

    test.done();
};

exports['utility tests'] = function(test) {
    var cache = stashe.create();

    test.ok(cache.has('foo') === false, 'cache has key that has not been set');
    cache.set('foo', 1);
    test.ok(cache.has('foo') === true, 'cache does not have key after being set');

    test.ok(cache.exists('bar') === false, 'cache shows key with no value as existing');
    cache.set('bar', 1);
    test.ok(cache.exists('bar') === true, 'cache shows key with truthy value as not existing');
    cache.set('bar', null);
    test.ok(cache.exists('bar') === false, 'cache shows null value as existing');

    var cache2 = stashe.create();
    test.ok(cache2.size() === 0, 'empty cache has size');
    cache2.set('foo', 1);
    test.ok(cache2.size() === 1, 'cache with data shows incorrect size');
    cache2.remove('foo');
    test.ok(cache2.size() === 0, 'cache with removed key shows incorrect size');

    test.ok(_.isObject(cache2.stats()), 'stats was not returned as an object');

    test.done();
};

exports['count tests'] = function(test) {
    var cache = stashe.create();

    test.ok(cache.stats().keys    === 0, 'cache does not start out with zero-based stats for keys');
    test.ok(cache.stats().flushes === 0, 'cache does not start out with zero-based stats for flushes');
    test.ok(cache.stats().reads   === 0, 'cache does not start out with zero-based stats for reads');
    test.ok(cache.stats().writes  === 0, 'cache does not start out with zero-based stats for writes');
    test.ok(cache.stats().deletes === 0, 'cache does not start out with zero-based stats for deletes');

    cache.set('foo', 1);
    cache.set('bar', 1);
    cache.set('baz', 1);
    test.ok(cache.stats().keys    === 3, 'cache does not store correct value for keys after setting');
    test.ok(cache.stats().flushes === 0, 'cache does not store correct value for flushes after setting');
    test.ok(cache.stats().reads   === 0, 'cache does not store correct value for reads after setting');
    test.ok(cache.stats().writes  === 3, 'cache does not store correct value for writes after setting');
    test.ok(cache.stats().deletes === 0, 'cache does not store correct value for deletes after setting');

    cache.get('foo');
    cache.get('bar');
    cache.get('baz');
    test.ok(cache.stats().keys    === 3, 'cache does not store correct value for keys after getting');
    test.ok(cache.stats().flushes === 0, 'cache does not store correct value for flushes after getting');
    test.ok(cache.stats().reads   === 3, 'cache does not store correct value for reads after getting');
    test.ok(cache.stats().writes  === 3, 'cache does not store correct value for writes after getting');
    test.ok(cache.stats().deletes === 0, 'cache does not store correct value for deletes after getting');

    cache.remove('baz');
    test.ok(cache.stats().keys    === 2, 'cache does not store correct value for keys after removing');
    test.ok(cache.stats().flushes === 0, 'cache does not store correct value for flushes after removing');
    test.ok(cache.stats().reads   === 3, 'cache does not store correct value for reads after removing');
    test.ok(cache.stats().writes  === 3, 'cache does not store correct value for writes after removing');
    test.ok(cache.stats().deletes === 1, 'cache does not store correct value for deletes after removing');

    cache.flush();
    test.ok(cache.stats().keys    === 0, 'cache does not store correct value for keys after flushing');
    test.ok(cache.stats().flushes === 1, 'cache does not store correct value for flushes after flushing');
    test.ok(cache.stats().reads   === 0, 'cache does not store correct value for reads after flushing');
    test.ok(cache.stats().writes  === 0, 'cache does not store correct value for writes after flushing');
    test.ok(cache.stats().deletes === 0, 'cache does not store correct value for deletes after flushing');

    test.done();
};
