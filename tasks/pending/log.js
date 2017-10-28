var utils = require('shipit-utils');
var init = require('../../lib/init');
var path = require('path');
var _ = require('lodash');
var chalk = require('chalk');

/**
 * Log task.
 */

module.exports = function (gruntOrShipit) {
  utils.registerTask(gruntOrShipit, 'pending:log', task);

  function task() {
    var shipit = init(utils.getShipit(gruntOrShipit));
    return shipit.getCurrentRevision()
    .then(function(rev) {
      var msg = chalk.green('\nNo current revision.');

      if (rev) {
        msg = chalk.yellow(chalk.underline('\nCurrent Revision:\n') + rev);
      }

      shipit.log(msg);
    });
  }
};
