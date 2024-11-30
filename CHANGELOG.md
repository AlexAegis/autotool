# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.7.0](https://github.com/AlexAegis/autotool/compare/v0.6.2...v0.7.0) (2024-11-30)

## [0.6.2](https://github.com/AlexAegis/autotool/compare/v0.6.1...v0.6.2) (2024-10-25)

## [0.6.1](https://github.com/AlexAegis/autotool/compare/v0.6.0...v0.6.1) (2024-05-19)


### Features

* forward package manager and all discovered packages to plugins too ([b6b7932](https://github.com/AlexAegis/autotool/commit/b6b7932949d39f6a20faa1075c63070a2af14827))

## [0.6.0](https://github.com/AlexAegis/autotool/compare/v0.5.0...v0.6.0) (2024-05-19)


### Features

* only add the workspace version specifier if the target version matches the local version ([c4bf8ea](https://github.com/AlexAegis/autotool/commit/c4bf8eac66a16b2300767fa68e7484b330cc1e5d))
* workspace version specifier now will be added in pnpm and yarn workspaces for local packages ([90612e6](https://github.com/AlexAegis/autotool/commit/90612e6d7d8e5c737d35a6c4f2f47cc839ad8374))

## [0.5.0](https://github.com/AlexAegis/autotool/compare/v0.4.1...v0.5.0) (2024-03-23)

## [0.4.1](https://github.com/AlexAegis/autotool/compare/v0.4.0...v0.4.1) (2023-12-14)

## [0.4.0](https://github.com/AlexAegis/autotool/compare/v0.3.0...v0.4.0) (2023-12-01)


### Bug Fixes

* missing turbo cache location specifier on the postinstall script ([bf1a7a2](https://github.com/AlexAegis/autotool/commit/bf1a7a2a978773935011a317640dfead892a8be8))

## [0.3.0](https://github.com/AlexAegis/autotool/compare/v0.2.3...v0.3.0) (2023-09-01)

## [0.2.3](https://github.com/AlexAegis/autotool/compare/v0.2.2...v0.2.3) (2023-07-18)

## [0.2.2](https://github.com/AlexAegis/autotool/compare/v0.2.1...v0.2.2) (2023-07-08)


### Features

* use sort files ([202f547](https://github.com/AlexAegis/autotool/commit/202f547c054febd974dc88ad9f57e3bb3bfdd038))

## [0.2.1](https://github.com/AlexAegis/autotool/compare/v0.2.0...v0.2.1) (2023-07-07)

## [0.2.0](https://github.com/AlexAegis/js/compare/v0.1.1...v0.2.0) (2023-07-06)


### Features

* prettier v3 ([d20200b](https://github.com/AlexAegis/js/commit/d20200bb939da4c0d3c22485dc00767ce5306423))

## [0.1.1](https://github.com/AlexAegis/js/compare/v0.1.0...v0.1.1) (2023-07-02)


### Features

* **autotool:** implement plugin filtering ([5e759e3](https://github.com/AlexAegis/js/commit/5e759e38c131f4eb412553c26cbe04fdaeb9d4da))
* **autotool:** moved dependency merging functions here ([fb9a82b](https://github.com/AlexAegis/js/commit/fb9a82b646e80b1d0df1f25193e9790c9a30d470))

## [0.1.0](https://github.com/AlexAegis/js/compare/v0.0.5...v0.1.0) (2023-06-28)


### Features

* do not execute anything for non-managed packages ([030c72d](https://github.com/AlexAegis/js/commit/030c72d1f30bd51647a77d62f40f54897adb9855))


### Bug Fixes

* **autotool:** drop off fields that are no longer used after this step ([5206ce2](https://github.com/AlexAegis/js/commit/5206ce21f6e70465a119aea9e95d571edc1d111d))
* list loaded plugins after filtering ([5391831](https://github.com/AlexAegis/js/commit/5391831941223cce2741aefd4887fb294b72a8ac))

## [0.0.5](https://github.com/AlexAegis/js/compare/v0.0.4...v0.0.5) (2023-05-29)


### Features

* **autotool:** added simple --filterPlugins option and autoformat on copy ([99cb1bd](https://github.com/AlexAegis/js/commit/99cb1bdecc367df51b57a9faedd50eacd25dfda7))
* **autotool:** run install if dependencies have changed ([b607582](https://github.com/AlexAegis/js/commit/b60758211c6a7ba36ce660aa1cfd04056288cdc9))

## [0.0.4](https://github.com/AlexAegis/js/compare/v0.0.3...v0.0.4) (2023-05-17)


### Bug Fixes

* **autotool:** add default plugin before freeze ([9618268](https://github.com/AlexAegis/js/commit/96182681d400dabd4b84a489dbd9a5b609574109))

## [0.0.3](https://github.com/AlexAegis/js/compare/v0.0.2...v0.0.3) (2023-05-16)


### Features

* **autotool:** automatically consolidate descriptions too ([7f8674b](https://github.com/AlexAegis/js/commit/7f8674b971af4c365a079e07f8c06c983b4d72d4))
* **autotool:** deep freezing plugin config once loaded, fixed packageJson consolidation mutation ([8a9ccba](https://github.com/AlexAegis/js/commit/8a9ccbaa1db8e98861520d6d99414e00eb378551))

## [0.0.2](https://github.com/AlexAegis/js/compare/v0.0.1...v0.0.2) (2023-05-15)


### Features

* disable plugins from archetype ([f701517](https://github.com/AlexAegis/js/commit/f701517eb8686947ab53f6b92adadd2d0f0fca96))

## 0.0.1 (2023-05-14)


### Features

* **autotool-plugin-default:** added custom element ([8ef5176](https://github.com/AlexAegis/js/commit/8ef517643730fb98429831193b6635bb410e562a))
* **autotool-plugin-default:** implement packageJson updater ([c47e864](https://github.com/AlexAegis/js/commit/c47e864f6624e07002d4a89b5da3d910e15a738d))
* **autotool-plugin-default:** no multiple element copies or overwrites the same file ([9ca59d6](https://github.com/AlexAegis/js/commit/9ca59d66e97dbf85a46a3f6e41c9b703941d5525))
* **autotool:** add listPlugins mode ([a6ab358](https://github.com/AlexAegis/js/commit/a6ab3585b0dfd32de18795bae3d1b04fb339c5e7))
* **autotool:** added --force, validators are now async, and marks are now checked for target files ([9591983](https://github.com/AlexAegis/js/commit/9591983456f58e2279f8a136fceaca294c812af3))
* **autotool:** copy element implemented ([2d1d219](https://github.com/AlexAegis/js/commit/2d1d21992bdde7cea0ffd5c1542f223d7a750346))
* **autotool:** fill sourcePlugin info from consolidating plugin ([20d29bf](https://github.com/AlexAegis/js/commit/20d29bfa06bf2faedec3e34e1383cadd1c4c3393))
* **autotool:** improved logging ([3ab1d95](https://github.com/AlexAegis/js/commit/3ab1d9598662e3c76d7df7f6cab57ead25b00865))
* **autotool:** plugin loading ([b642856](https://github.com/AlexAegis/js/commit/b6428561d6a88a321dfa31da8252e4eca49681a6))
* create folders before copy and symlink ([37c64b5](https://github.com/AlexAegis/js/commit/37c64b51def3f05f626fb13cf9d5d0824b85f4d4))
* everyElementShouldHaveAnExecutor validator ([5bb1553](https://github.com/AlexAegis/js/commit/5bb1553e665be46c144a9b828aeed087ce7748df))
* execute untargeted elements too ([07522f8](https://github.com/AlexAegis/js/commit/07522f81caee295d44feac0c79ba9ee9552cc7fa))
* plugin factories ([6693e04](https://github.com/AlexAegis/js/commit/6693e04084efbb235b4749308f33bcba74b5bf9e))
* separated targeted and untargeted types ([3ee407b](https://github.com/AlexAegis/js/commit/3ee407b894277398dcb4bfab46f570adf097ecb2))
* setup base repo ([50429c4](https://github.com/AlexAegis/js/commit/50429c4a9e1a895aabe3d87133a2d117763f9108))
* validate if every element has a validator ([0758313](https://github.com/AlexAegis/js/commit/0758313b198cd9ed9658298f5ef738841dfd71bb))
