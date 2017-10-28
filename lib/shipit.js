var path = require('path2/posix');
var _ = require('lodash');
var util = require('util');
var Shipit = module.exports;

/**
 * Compute the current release dir name.
 *
 * @param {object} result
 * @returns {string}
 */

function computeReleases(result) {
  if (!result.stdout) return null;

  // Trim last breakline.
  var dirs = result.stdout.replace(/\n$/, '');

  // Convert releases to an array.
  return dirs.split('\n');
}

/**
 * Test if all values are equal.
 *
 * @param {*[]} values
 * @returns {boolean}
 */

function equalValues(values) {
  return values.every(function (value) {
    return _.isEqual(value, values[0]);
  });
}

/**
 * Compute the current release dir name.
 *
 * @param {object} result
 * @returns {string}
 */

function computeReleaseDirname(result) {
  if (!result.stdout) return null;

  // Trim last breakline.
  var target = result.stdout.replace(/\n$/, '');

  return target.split(path.sep).pop();
}

/**
 * Return the current release dirname.
 */

Shipit.getCurrentReleaseDirname = function() {
  var shipit = this;

  return shipit.remote(util.format('if [ -h %s ]; then readlink %s; fi', shipit.currentPath, shipit.currentPath))
  .then(function(results) {
    results = results || [];
    var releaseDirnames = results.map(computeReleaseDirname);

    if (!equalValues(releaseDirnames)) {
      throw new Error('Remote servers are not synced.');
    }

    if (!releaseDirnames[0]) {
      shipit.log('No current release found.');
      return null;
    }

    return releaseDirnames[0];
  });
};

/**
 * Return all remote releases (newest first)
 */

Shipit.getReleases = function() {
  var shipit = this;

  return shipit.remote('ls -r1 ' + shipit.releasesPath)
  .then(function(results) {
    var releases = results.map(computeReleases);

    if (!equalValues(releases))
      throw new Error('Remote servers are not synced.');

    return releases[0];
  });
};

/**
 * Return the REVISION file content
 *
 * @param {string} releaseDir Directory name of the relesase dir (YYYYMMDDHHmmss).
 */

Shipit.getRevision = function(releaseDir) {
  var shipit = this;
  var file = path.join(shipit.releasesPath, releaseDir, 'REVISION');

  return shipit.remote('if [ -f ' + file + ' ]; then cat ' + file + ' 2>/dev/null; fi;')
  .then(function(response) {
    return response[0].stdout.trim();
  });
};

Shipit.getCurrentRevision = function() {
  var shipit = this;

  return shipit.getCurrentReleaseDirname()
  .then(function(currentReleaseDirname) {
    if (!currentReleaseDirname) {
      return null;
    }
    return shipit.getRevision(currentReleaseDirname)
    .then(function(deployedRevision) {
      return deployedRevision;
    });
  });
};
