---
title: VS Code, npm run-scripts, and mocha
author: jeff
date: 2016-08-11 17:08
template: article.jade
---

vscode touts itself as being easy to use for out-of-the-box Node.js debugging -
which is true for single scripts - but debugging node-based executables
(npm, npm scripts, mocha) takes additional setup based on your environment.

## atom to vscode: faster with integrated debugger

Recently I switched from [atom](https://atom.io) [vscode](http://vscode.io), after being
impressed by a talk at npm conf. I only had two complaints with atom that started to
weigh on me - the often sluggish performance, and the lack of solid debugging for Node.js.
(There are some 3rd party packages that try, but it is not core to the editor and
often breaks).

vscode is like greased lightening. It's everyting I missed from SublimeText 2, plus
solid debugging and javascript support.


Setting up vscode for debugging basic node scripts is supported out of the box. The editor
even generates working debug defaults at `.vscode/launch.json`. But if you want to debug
npm scripts or other node-based executables, it is not straight forward at first. Turns out
it's pretty easy though.


I exclude `.vscode/` in `.gitignore` because it ends up having settings specific to my
environment and workflow.


The trick to running npm scripts or node executables is to use a hardcoded path to npm
to launch the things. So for example, in `package.json`:

```json
{
    "scripts": {
        "mocha": "mocha"
    }
}
```

and in `.vscode/launch.json`:

###### `npm run mocha`: use a hardcoded path to your npm exe. You can obtain it from the terminal with `which npm`.

```json
{
    "name": "mocha",
    "type": "node",
    "request": "launch",
    "program": "/Users/jeffparrish/.nvm/versions/node/v6.3.1/bin/npm",
    "stopOnEntry": false,
    "args": ["run", "mocha"],
    "cwd": "${workspaceRoot}",
    "env": {
        "NODE_ENV": "test"
    }
}
```

At first it seemed like it would be possible to do something like:

###### DOES NOT WORK
```json
{
    "program": "/usr/bin/env npm",
    "args": ["run", "mocha"]
}
```

or:

###### DOES NOT WORK
```json
{
    "program": "${workspaceRoot}/node_modules/.bin/mocha",
}
```

but both failed.