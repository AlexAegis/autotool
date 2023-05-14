# [autotool-plugin-default](https://github.com/AlexAegis/autotool/tree/master/packages/autotool-plugin-default)

[![npm](https://img.shields.io/npm/v/autotool-plugin-default/latest)](https://www.npmjs.com/package/@alexaegis/autotool-plugin-default)
[![ci](https://github.com/AlexAegis/autotool/actions/workflows/cicd.yml/badge.svg)](https://github.com/AlexAegis/autotool/actions/workflows/cicd.yml)
[![codacy](https://app.codacy.com/project/badge/Grade/a040168fa1e244debb0d1bbafcace38f)](https://app.codacy.com/gh/AlexAegis/autotool/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![codecov](https://codecov.io/gh/AlexAegis/autotool/branch/master/graph/badge.svg?token=kw8ZeoPbUh)](https://codecov.io/gh/AlexAegis/autotool)

This plugin provides the default element executors and some validators. It is
always included you don't need to install it separately.

## Provided Element Executors

### PackageJsonElement

Allows you to add and remove elements from a packageJson file. Will also sort it
for you based on a preference. To delete an element, set it to `undefined`.

Example:

```ts
// Add a build script to the package json, and remove another if exists
{
  type: 'packageJson',
  data: {
    scripts: {
      build: 'vite',
      'build-but-legacy': undefined
    }
  }
}
```

> It will also apply `prettier` formatting with your config on the package json.
> Which means if you don't have prettier your file will come out using using a
> simple 2 space formatting straight out of `JSON.stringify`.

### FileCopyElement

Copies a file that has been shipped with your plugin to the target location.
It's important that the file that you are copying will be copied from the
`node_modules` folder when it is executed at the user.

> If you can't ship the files you need to create, you can use a custom element
> and create it manually.

Example:

```ts
{
  executor: 'fileCopy',
  description: 'Create root prettierrc',
  targetFile: '.prettierrc.cjs',
  packageKind: 'root',
  sourcePluginPackageName: packageJson.name, // import packageJson from '../package.json';
  sourceFile: join('static', 'prettierrc.cjs'), // import { join } from 'node:path';
},
```

This element will create a `.prettierrc.cjs` file at your workspace root.

You need to define a `sourceFile`, that's a relative path from your plugin
package and `sourcePluginPackageName` which has to be your package's name. These
two are needed to know where the file will end up at the consumers
`node_modules` folder.

### CustomElement

This is the simplest element. You define a function and are given the context
all other elements have. The element it's applying (always itself), the target
and the options containing data like if it's a `dryish` run, and the logger.

```ts
{
  executor: 'custom',
  description: 'say hello to all public packages!',
  packageJsonFilter: {
    private: false,
  },
  apply: (_e, target, options) =>
    options.logger.info('Hello', target.targetPackage.packageJson.name),
},
```

## Provided Validators

### Elements for root should not target inside packages

Use elements that are executing right at that package
