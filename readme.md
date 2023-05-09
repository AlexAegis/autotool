# [autotool workspace](https://github.com/AlexAegis/autotool)

[![npm](https://img.shields.io/npm/v/@alexaegis/autotool/latest)](https://www.npmjs.com/package/@alexaegis/autotool)
[![ci](https://github.com/AlexAegis/autotool/actions/workflows/cicd.yml/badge.svg)](https://github.com/AlexAegis/autotool/actions/workflows/cicd.yml)
[![codacy](https://app.codacy.com/project/badge/Grade/a040168fa1e244debb0d1bbafcace38f)](https://app.codacy.com/gh/AlexAegis/autotool/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![codecov](https://codecov.io/gh/AlexAegis/autotool/branch/master/graph/badge.svg?token=kw8ZeoPbUh)](https://codecov.io/gh/AlexAegis/autotool)

A code migration tool mainly for distributing tooling configurations in packages
within a monorepo.

It's a very generic tool that will apply file operations on your workspace but
it's intended usecase is setting up tooling configurations within your
repository. You are still heavily encouraged to first create your own
plugins/configuration packages for the individual packages (Like an
`eslint-plugin` or a `prettier-plugin`) but the files that tell the tool still
need to be defined. This is where `autotool` comes in and forces your repository
to look the way you want it.

Another usecase is to add and format your `package.json` file. For example, a
plugin can set up your `prettier` configuration, but not just that, it will also
add related scripts to your `package.json` file.

Check out what the individial `ElementExecutor`s do as `autotool` on itself is
just an orchestrator of plugins. It collects their elements, executors and
validators, checks what packages and files they are targeting based on their
filters, then applies them.

## How to use

Install `autotool` as a `devDependency`

```sh
pnpm i -D autotool
```

Install some plugins that you want `autotool` to apply when you run it.

```sh
pnpm i -D @alexaegis/autotool-plugin-ts # automatic ts setup
```

Run `autotool`

```sh
npx autotool
```

It will detect all installed plugins in your workspace and apply them.

## How to write a plugin?

Create a new npm package and export an `AutotoolPlugin` object/function as your
default export. The type definitions are available in the
[`autotool-plugin`](https://github.com/AlexAegis/autotool/tree/master/packages/autotool-plugin)
package on which your plugin should depend on.

> You can put `autotool-plugin` among your keywords array too in the
> package.json if you want people to find it!

### Elements

Elements describe what and how to apply to your workspace. They can be applied
to your entire workspace or just specific packages, you can even write filters
based on the packageJson of each package.

For example you can have an element that creates a `.prettierignore` file in all
your

You can use some basic element types that are defined in the
[default plugin](https://github.com/AlexAegis/autotool/tree/master/packages/autotool-plugin-default)

### Executors

Executors describe how to apply an element, they contain the actual logic.

#### Consolidation

An executor can have a consolidate function that combines multiple elements on
the same target file and combine them into another set of elements. (Usually
just one but I kept the option to consolidate into more than one element)

For example you can have multiple elements adding properties into your
packageJson file. At execution all these elements will get consolidated into
one, and written to disk only **once**!

### Validators

Some additional safety checks can be performed before trying to apply a set of
plugins to your workspace. For example not letting multiple elements copy to or
delete the same file. (A `consolidate` step can help you here if you do want to
execute multiple elements of the same kind, for example the `packageJson`
element does that)

## Packages

### [autotool](https://github.com/AlexAegis/autotool/tree/master/packages/autotool)

The main CLI tool

### [autotool-plugin](https://github.com/AlexAegis/autotool/tree/master/packages/autotool-plugin)

Type definitions and helper functions for plugin development

### [autotool-plugin-default](https://github.com/AlexAegis/autotool/tree/master/packages/autotool-plugin-default)

The default (always on) plugin containing the main element types and validators.
