
/*!
 * Express - router - Route
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Expose `Route`.
 */

module.exports = Route;

/**
 * Initialize `Route` with the given HTTP `method`, `path`,
 * and an array of `callbacks` and `options`.
 *
 * Options:
 *
 *   - `sensitive`    enable case-sensitive routes
 *   - `strict`       enable strict matching for trailing slashes
 *
 * @param {String} method
 * @param {String} path
 * @param {Object} options.
 * @api private
 */

function Route(method, path, options) {
  options = options || {};
  this.path = path;
  this.method = method;
  this.regexp = utils.pathRegexp(path
    , this.keys = []
    , options.sensitive
    , options.strict);
}

/**
 * Return route middleware with
 * the given callback `fn()`.
 *
 * @param {Function} fn
 * @return {Function}
 * @api public
 */

Route.prototype.middleware = function(fn){
  var self = this;

  if ('ALL' == this.method) {
    return function(req, res, next){
      if (!self.match(req.path)) return next();
      fn(req, res, next);
    }
  }

  if ('GET' == this.method) {
    return function(req, res, next){
      if ('GET' != req.method && 'HEAD' != req.method) return next();
      if (!self.match(req.path)) return next();
      fn(req, res, next);
    }
  }

  return function(req, res, next){
    if (self.method != req.method) return next();
    if (!self.match(req.path)) return next();
    fn(req, res, next);
  }
};

/**
 * Check if this route matches `path`, if so
 * populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */

Route.prototype.match = function(path){
  var keys = this.keys
    , params = this.params = []
    , m = this.regexp.exec(path);

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];

    var val = 'string' == typeof m[i]
      ? decodeURIComponent(m[i])
      : m[i];

    if (key) {
      params[key.name] = val;
    } else {
      params.push(val);
    }
  }

  return true;
};
