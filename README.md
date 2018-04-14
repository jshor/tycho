<p align="center">
  <a href="https://tycho.io">
    <img src="https://raw.githubusercontent.com/jshor/tycho2/develop/public/static/img/logo-gradient-dark.png" width="450" height="88" />
  </a>
</p>

<br>

<p align="center">
  <a href="https://codecov.io/gh/jshor/tycho">
    <img src="https://img.shields.io/codecov/c/github/jshor/tycho.svg?style=flat-square"
         alt="Code coverage">
  </a>

  <a href="hhttps://travis-ci.org/jshor/tycho">
    <img src="https://img.shields.io/travis/jshor/tycho.svg?style=flat-square"
         alt="Build status">
  </a>

  <a href="https://david-dm.org/jshor/tycho#info=devDependencies">
    <img src="https://img.shields.io/david/jshor/tycho.svg?style=flat-square"
         alt="devDependencies Status">
  </a>

  <a href="https://david-dm.org/jshor/tycho#info=dependencies">
    <img src="https://img.shields.io/david/jshor/tycho.svg?style=flat-square"
         alt="Dependency Status">
  </a>

  <a href="LICENSE.md">
    <img src="http://img.shields.io/:license-MIT-blue.svg?style=flat-square"
         alt="License | MIT">
  </a>

  <a href="https://github.com/jshor/tycho/releases/tag/v1.0.1">
    <img src="http://img.shields.io/:version-1.0.1-orange.svg?style=flat-square"
        alt="Version 1.0.1">
  </a>
</p>

## Table of Contents

- [About This Project](#about-this-project)
- [Running the app](#running-the-app)
- [Development](#development)
  - [Package Management](#package-management)
  - [Framework + Libraries](#framework--libraries)
  - [Styling](#styling)
  - [Testing](#testing)
    - [Testing Guidelines](#testing-guidelines)
- [Application Architecture](#application-architecture)
  - [State management](#state-management)
- [Static Data](#static-data)
- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
  - [yarn start](#yarn-start)
  - [yarn test](#yarn-test)
  - [yarn test:coverage](#yarn-testcoverage)
  - [yarn lint](#yarn-lint)
  - [yarn lint:fix](#yarn-lintfix)
  - [yarn build](#yarn-build)
  - [yarn deploy](#yarn-deploy)
    - [yarn deploy:upload](#yarn-deployupload)
    - [yarn deploy:invalidate](#yarn-deployinvalidate)
  - [yarn orbitals](#yarn-orbitals)
  - [yarn ephemeris](#yarn-ephemeris)
- [Supported Language Features and Polyfills](#supported-language-features-and-polyfills)
- [Credits](#credits)

## About This Project

This is a real-time, WebGL-based, 3D visualization of our Solar System. It's a complete re-write of the [original Tycho.io](https://github.com/jshor/tycho.io) project. Check out the full experience at [tycho.io](https://tycho.io)!

## Running the app

1. Clone this repo.

```sh
git clone https://github.com/jshor/tycho2.git
```

2. Use the right node version.

```sh
nvm use
```

3. Install dependencies (via yarn).

```sh
yarn install
```

4. Start

```sh
yarn start
```

## Development

### Package Management

Using [Yarn](https://yarnpkg.com/en/).

### Framework + Libraries

This app is built using [React.js](https://facebook.github.io/react/)/[Redux](http://redux.js.org/), [THREE.js](https://threejs.org), and uses [react-three-renderer](https://github.com/toxicFork/react-three-renderer) for THREE-based React components. It's bootstrapped using [Create React App](https://github.com/facebookincubator/create-react-app).

### Styling

Each DOM component contains a corresponding [Sass](http://sass-lang.com/) stylesheet and employs the [BEM](http://getbem.com/) CSS design pattern. This app uses [node-sass-chokidar](https://www.npmjs.com/package/node-sass-chokidar) for Sass compilation.

### Testing

Tests use [Jest](https://facebook.github.io/jest/), [enzyme](https://github.com/airbnb/enzyme), and [snapshot testing](https://facebook.github.io/jest/docs/en/snapshot-testing.html#content) for components.

#### Testing Guidelines

* The importance of code coverage should not supercede the importance of writing good quality tests. 
* Methods for containers should contain a corresponding unit test, and is ideally written as a pure function.
* For exceptions, such as when a local state is updated, there should be a corresponding integration test.
* Components should be [snapshot tested](https://facebook.github.io/jest/docs/en/snapshot-testing.html#content).
* [TDD](https://en.wikipedia.org/wiki/Test-driven_development) and [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development).

## Application Architecture

The overall architecture uses the [React/Redux container pattern](http://www.thegreatcodeadventure.com/the-react-plus-redux-container-pattern/). In a nutshell, containers in this app leverage tasks such as handling state and minor front-end logic, while components simply handle the presentation. Physics calculations and business logic is delegated to services, and some critical components, such as the Camera, have dedicated services.

### State management

All shared-state data is stored in the Redux store. This includes the 2D and 3D positions of objects and the current time. This enables unidirectional data flow (see [advantages of Redux](https://www.reddit.com/r/javascript/comments/3w8uey/what_are_the_real_benefits_of_using_fluxredux/)). In rare cases, some components will use the local state for things internal to that component, when appropriate.

## Static Data

The JSON data for `orbitals.json` is generated by the [yarn orbitals](#yarn-orbitals) script. It will look for all of the JSON files in the `public/static/data/orbitals` directory. For information on the file structure for these JSON files, please see the [Wiki](https://github.com/jshor/tycho2/wiki/Orbital-JSONs).

## Folder Structure

This project utilizes a typical React app flat directory structure. Tests for each item typically live in `__tests__`. Components have corresponding tests and Sass in the same directory. `__tests__` folders may contain `__snapshots__` and `__fixtures__`.

Note that 3D React components and DOMElement ones coexist in the same general paths.

Static assets, such as textures, media, and data are stored in the `public` folder. The `img`, `js`, `css` and some JSON file contents are generated by build scripts.

## Available Scripts

In the project directory, you can run the following commands:

### `yarn start`

Runs the app in the development mode.<br>
It will also build the CSS using `build-css`.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>

### `yarn test:coverage`

Runs all tests and prints out code covfefe.<br>

### `yarn lint`

Runs the linter using [ESLint](https://eslint.org/).<br>

### `yarn lint:fix`

Fixes any linting errors discovered by the linter and reports any issues that could not be addressed automatically.<br>

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.<br>
It also runs the compilation script for the orbital data json.<br>
The build is minified and the filenames include the hashes.<br>

### `yarn deploy`

Performs a full deploy.<br>
Requires credentials defined at `~/.aws/credentials`. [More info](https://docs.aws.amazon.com/cli/latest/topic/config-vars.html).

#### `yarn deploy:upload`

Uploads the `build/` contents to the designated production AWS S3 bucket.<br>

#### `yarn deploy:invalidate`

[Invalidates](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html) the designated AWS CloudFront instance.<br>

### `yarn orbitals`

Runs the compilation script for the orbital data json.

### `yarn ephemeris`

Takes all orbital JSONs, probes the [NASA/JPL HORIZONS database]() for ephemeris data, and updates each JSON accordingly. For more information on this script, and on the prerequisite data format, please see [this wiki page](https://github.com/jshor/tycho2/wiki/Orbital-JSONs#nasa-jpl-horizons).

## Supported Language Features and Polyfills

This project supports a superset of the latest JavaScript standard.<br>
In addition to [ES6](https://github.com/lukehoban/es6features) syntax features, it also supports:

* [Exponentiation Operator](https://github.com/rwaldron/exponentiation-operator) (ES2016).
* [Async/await](https://github.com/tc39/ecmascript-asyncawait) (ES2017).
* [Object Rest/Spread Properties](https://github.com/sebmarkbage/ecmascript-rest-spread) (stage 3 proposal).
* [Dynamic import()](https://github.com/tc39/proposal-dynamic-import) (stage 3 proposal).
* [Class Fields and Static Properties](https://github.com/tc39/proposal-class-public-fields) (stage 2 proposal).
* [JSX](https://facebook.github.io/react/docs/introducing-jsx.html).

Learn more about [different proposal stages](https://babeljs.io/docs/plugins/#presets-stage-x-experimental-presets-).

The following ES6 **[polyfills](https://en.wikipedia.org/wiki/Polyfill)** are available:

* [`Object.assign()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) via [`object-assign`](https://github.com/sindresorhus/object-assign).
* [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) via [`promise`](https://github.com/then/promise).
* [`fetch()`](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) via [`whatwg-fetch`](https://github.com/github/fetch).

## Credits

* Project developed by [Josh Shor](http://josh.so)
* Planetary ephemerides courtesy of [NASA](https://jpl.nasa.gov/) and the [Jet Propulsion Laboratory](https://www.nasa.gov/).
* Orbital textures by [James Hastings-Trew](http://planetpixelemporium.com/).
* Ambient music: [*Ultra Deep Field*](https://soundcloud.com/stellardrone/stellardrone-ultra-deep-field) by [Stellardrone](https://soundcloud.com/stellardrone).
* Special thanks to the open source community for [React.js](https://facebook.github.io/react/)/[Redux](http://redux.js.org/), [THREE.js](https://threejs.org), and [react-three-renderer](https://github.com/toxicFork/react-three-renderer). 
