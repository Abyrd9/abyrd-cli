#!/usr/bin/env node

const path = require("path");
const fs = require('fs');
const replace = require('replace-in-file');
const program = require('commander');
const prompt = require('prompt');
const { spawn } = require('child_process');

const currentPath = path.resolve(".");
const pathToFile = path.resolve(__dirname + '/template/templatePackage.json');

var schema = {
  properties: {
    'Package Name': {
      pattern: /^[a-zA-Z\-]+$/,
      type: 'string',
      message: 'Name must be only lower case letters, or dashes',
      required: true
    },
    'Package Description': {
      type: 'string',
      required: false,
      default: '',
    },
    'Package Repo': {
      type: 'string',
      required: false,
      default: ''
    },
    'Sass': {
      description: 'Would you like to use Sass/Scss for this project?',
      type: 'boolean',
      message: 'answers includes: "true", "t", "false", "f"',
      required: true,
    },
    'StyledComponents': {
      description: 'Would you like to use Styled Components in this project?',
      type: 'boolean',
      message: 'answers includes: "true", "t", "false", "f"',
      required: true,
    },
    'Firebase': {
      description: 'Would you like to use firebase in this project?',
      type: 'boolean',
      message: 'answers includes: "true", "t", "false", "f"',
      required: true,
    }
  }
};

prompt.start();
prompt.get(schema, (err, res) => {

  let packageJson = {
    "name": res['Package Name'],
    "version": "1.0.0",
    "description": res['Package Description'],
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "repository": {
      "type": "git",
      "url": res['Package Repo'],
    },
    "keywords": [],
    "author": "Andrew Byrd",
    "license": "MIT",
    "devDependencies": {
      "@babel/core": "^7.0.0-beta.46",
      "@babel/preset-env": "^7.0.0-beta.46",
      "@babel/preset-react": "^7.0.0-beta.46",
      "@babel/preset-stage-2": "^7.0.0-beta.46",
      "babel-loader": "^8.0.0-beta.2",
      "uglifyjs-webpack-plugin": "^1.2.5",
      "webpack": "^4.8.1",
      "webpack-cli": "^2.1.3",
      "webpack-dev-server": "^3.1.4",
      "webpack-merge": "^4.1.2",
    },
    "dependencies": {
      "express": "^4.16.3",
      "react": "^16.3.2",
      "react-dom": "^16.3.2"
    }
  }
  console.log(packageJson);
  if (res['Sass']) {
    packageJson = {
      ...packageJson, devDependencies: {
        ...packageJson.devDependencies,
        "css-loader": "^0.28.11",
        "extract-text-webpack-plugin": "^4.0.0-beta.0",
        "node-sass": "^4.9.0",
        "optimize-css-assets-webpack-plugin": "^4.0.1",
        "sass-loader": "^7.0.1",
        "style-loader": "^0.21.0",
      }
    };
  }
  fs.writeFile("./package.json", JSON.stringify(packageJson, null, 2), err => {
    if (err) return console.log(err);
    const child = spawn('yarn');
    child.on('exit', (code, signal) => {
      'child process exited with ' + `code ${code} and signal ${signal}`
    })
  })



})

// const options = {
//   files: pathToFile,
//   from: /package-name/g,
//   to: ''
// }



// console.log("This is Running on the command line!");
// console.log(". = %s", path.resolve("."));
// console.log("__dirname = %s", path.resolve(__dirname));