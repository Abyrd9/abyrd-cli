#!/usr/bin/env node

const path = require("path");
const fs = require('fs');
const replace = require('replace-in-file');
const prompt = require('prompt');
const { spawn } = require('child_process');
const fse = require('fs-extra');

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
			"start:dev": "webpack-dev-server --mode development --config config/webpack.base.config.js --open --hot --history-api-fallback",
			"prestart:prod": "webpack --mode production --config config/webpack.prod.config.js --env.NODE_ENV=production --progress",
			"start:prod": "node server"
		},
    "repository": {
      "type": "git",
      "url": res['Package Repo'],
    },
    "keywords": [],
    "author": "Andrew Byrd",
    "license": "MIT",
	}

  fs.writeFile("./package.json", JSON.stringify(packageJson, null, 2), err => {
		if (err) return console.log(err);
		const npm = (process.platform === "win32" ? "npm.cmd" : "npm");
		const commandDev = ["install", "--save-dev", "@babel/core", "@babel/preset-env", "@babel/preset-react", "@babel/preset-stage-2", "babel-loader", "uglifyjs-webpack-plugin", "webpack", "webpack-cli", "webpack-dev-server", "webpack-merge"];
		if (res['Sass']) {
			const cssPackages = ["css-loader", "extract-text-webpack-plugin","node-sass", "optimize-css-assets-webpack-plugin", "sass-loader", "style-loader"];
			commandDev.push(...cssPackages);
		}
		const runDevCommand = spawn(npm, commandDev, { stdio: 'inherit' });
		const command = ["install", "--save", "express", "react", "react-dom"];
		if (res['StyledComponents']) {
			command.push('styled-components');
		}
		if (res['Firebase']) {
			command.push('firebase');
		}
		const runCommand = spawn(npm, command, { stdio: 'inherit' });
	})
	
	fse.copy(__dirname + '/templates', './', err => {
		if (err) return console.log(err);

		if (!res['Sass']) {
			fse.remove("./configSass", err => {
				if (err) {
					console.log('failed to delete extra config directory')
				}
			})
			fse.remove("./src/scss", err => {
				if (err) {
					console.log('failed to delete src/scss/')
				}
			})
			fse.remove("./src/style.scss", err => {
				if (err) {
					console.log('failed to delete src/style')
				}
			})
			fse.remove("./dist/style.css", err => {
				if (err) {
					console.log('failed to delete dist/style')
				}
			})
			const removeImport = {
				files: './src/index.js',
				from: "import './styles.scss';",
				to: ''
			}
			const removeLinks = {
				files: ['./dist/index.html', './src/index.html'],
				from: '<link rel="stylesheet" href="style.css" type="text/css">',
				to: ''
			}
			replace(removeImport)
				.catch(err => console.log(err))
			replace(removeLinks)
				.catch(err => console.log(err))
		} else {
			fse.remove("./config", err => {
				if (err) {
					console.log('failed to delete extra config directory')
				} else {
					fse.rename("./configSass", "./config", err => {
						if (err) {
							console.log('Unable to rename folder');
						}
					})
				}
			})
		}

		if (!res['StyledComponents']) {
			fse.remove('./src/js/style', err => {
				if (err) {
					console.log('failed to delete style folder in js');
				}
			})
		}

		console.log('Folder Structure Successfully copied!');
	})


})