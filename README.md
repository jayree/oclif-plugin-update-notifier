# oclif-plugin-update-notifier
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-plugin-update-notifier.svg)](https://npmjs.org/package/oclif-plugin-update-notifier)
[![CircleCI](https://circleci.com/gh/jayree/oclif-plugin-update-notifier/tree/main.svg?style=shield)](https://circleci.com/gh/jayree/oclif-plugin-update-notifier/tree/main)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/jayree/oclif-plugin-update-notifier?branch=main&svg=true)](https://ci.appveyor.com/project/jayree/oclif-plugin-update-notifier/branch/main)
[![Codecov](https://codecov.io/gh/jayree/oclif-plugin-update-notifier/branch/main/graph/badge.svg)](https://codecov.io/gh/jayree/oclif-plugin-update-notifier)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-plugin-update-notifier.svg)](https://npmjs.org/package/oclif-plugin-update-notifier)
[![License](https://img.shields.io/npm/l/oclif-plugin-update-notifier.svg)](https://github.com/jayree/oclif-plugin-update-notifier/blob/main/package.json)

Update notifications for oclif plugins based on [yeoman/update-notifier](https://github.com/yeoman/update-notifier)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

## Usage

<!-- usage -->
```sh-session
$ oclif-example plugins:install oclif-plugin-update-notifier
$ oclif-example plugins:[COMMAND]
running command...
$ oclif-example plugins
oclif-plugin-update-notifier 1.5.2
$ oclif-example help plugins:[COMMAND]
USAGE
  $ oclif-example plugins:COMMAND
...
```
<!-- usagestop -->

```sh-session
$ oclif-example plugins
@oclif/plugin-help 5.1.11

   ╭────────────────────────────────────────────────────────────────────────────────────────────╮
   │                                                                                            │
   │                             oclif-example-plugin update available!                             │
   │                                                                                            │
   │                             @oclif/plugin-help 5.1.11 → 5.1.12                             │
   │          Changelog: https://github.com/oclif/plugin-help/blob/main/CHANGELOG.md            │
   │                                                                                            │
   ╰────────────────────────────────────────────────────────────────────────────────────────────╯
```
## Commands

<!-- commands -->
* [`oclif-example plugins:update:check`](#oclif-example-pluginsupdatecheck)

### `oclif-example plugins:update:check`

check installed plugins for updates

```
USAGE
  $ oclif-example plugins:update:check

DESCRIPTION
  check installed plugins for updates
```

_See code: [src/commands/plugins/update/check.ts](https://github.com/jayree/oclif-plugin-update-notifier/blob/v1.5.2/src/commands/plugins/update/check.ts)_
<!-- commandsstop -->
