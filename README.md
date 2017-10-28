# shipit-deploy

Set of deployment tasks for [Shipit](https://github.com/shipitjs/shipit) based on rsync.

**Features:**

- Deploy folder to a remote
- Add additional behaviour using hooks
- Build your project locally or remotely
- Easy rollback

## Install

TODO

```
npm install shipit-deploy
```

If you are deploying from Windows, you may want to have a look at the [wiki page about usage in Windows](https://github.com/shipitjs/shipit-deploy/wiki/Deploying-from-Windows).

## Usage

### Example `shipitfile.js`

```js
module.exports = function (shipit) {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: '/tmp/deploy_to',
      keepReleases: 2,
      deleteOnRollback: false,
      shallowClone: true,
      revision: '2.0'
    },
    staging: {
      servers: 'user@myserver.com'
    }
  });
};
```

To deploy on staging, you must use the following command :

```
shipit staging deploy
```

You can rollback to the previous releases with the command :

```
shipit staging rollback
```

## Options

### workspace

Type: `String`

Define a path to an empty directory where Shipit builds it's syncing source. **Beware to not set this path to the root of your repository as shipit-deploy cleans the directory at the given path as a first step.**

### revision

Type: `String`

Revision number that will be written to a REVISION file in each release.

### dirToCopy

Type: `String`
Default: same as workspace

Define directory within the workspace which should be deployed.

### deployTo

Type: `String`

Define the remote path where the project will be deployed. A directory `releases` is automatically created. A symlink `current` is linked to the current release.

### deleteOnRollback

Type: `Boolean`

Whether or not to delete the old release when rolling back to a previous release.

### keepReleases

Type: `Number`

Number of releases to keep on the remote server.

### shallowClone

Type: `Boolean`

Perform a shallow clone. Default: `false`.

### rsyncFrom

Type: `String` *Optional*

When deploying from Windows, prepend the workspace path with the drive letter. For example `/d/tmp/workspace` if your workspace is located in `d:\tmp\workspace`.
By default, it will run rsync from the workspace folder.

### copy

Type: `String`

Parameter to pass to `cp` to copy the previous release. Non NTFS filesystems support `-r`. Default: `-a`

## Variables

Several variables are attached during the deploy and the rollback process:

### shipit.config.*

All options described in the config sections are available in the `shipit.config` object.

### shipit.releaseDirname

Attached during `deploy:update` and `rollback:init` task.

The current release dirname of the project, the format used is "YYYYMMDDHHmmss" (moment format).

### shipit.releasesPath

Attached during `deploy:init`, `rollback:init`, and `pending:log` tasks.

The remote releases path.

### shipit.releasePath

Attached during `deploy:update` and `rollback:init` task.

The complete release path : `path.join(shipit.releasesPath, shipit.releaseDirname)`.

### shipit.currentPath

Attached during `deploy:init`, `rollback:init`, and `pending:log` tasks.

The current symlink path : `path.join(shipit.config.deployTo, 'current')`.

## Workflow tasks

- deploy
  - deploy:init
    - Emit event "deploy".
  - deploy:update
    - Create and define release path.
    - Remote copy project.
    - Emit event "updated".
  - deploy:publish
    - Update symlink.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
  - deploy:finish
    - Emit event "deployed".
- rollback
  - rollback:init
    - Define release path.
    - Emit event "rollback".
  - deploy:publish
    - Update symlink.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
  - rollback:finish
    - Emit event "rollbacked".
- pending
  - pending:log
    - Log current revision to console

## Dependencies

### Local

- rsync 3+
- OpenSSH 5+

### Remote

- GNU coreutils 5+

## License

MIT
