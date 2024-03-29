#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const replace = require('replace-in-file');
const prompt = require('prompt');
const { spawn } = require('child_process');
const fse = require('fs-extra');

const currentPath = path.resolve('.');
const pathToFile = path.resolve(__dirname + '/template/templatePackage.json');

var schema = {
	properties: {
		'Package Name': {
			pattern: /^[a-zA-Z\-]+$/,
			type: 'string',
			message: 'Name must be only lower case letters, or dashes',
			required: true,
		},
		'Package Description': {
			type: 'string',
			required: false,
			default: '',
		},
		'Package Repo': {
			type: 'string',
			required: false,
			default: '',
		},
		Styles: {
			description: 'Would you like to use Sass/Scss, StyledComponents, or start clean for this project?',
			pattern: /^((\bsass\b)|(\bstyled\b))|(\bnone\b)+$/,
			type: 'string',
			message: 'answer should be either "sass", "styled", or "none',
			required: true,
		},
		'State Management': {
			description: 'Would you like to start this project with Redux, Context, or None?',
			pattern: /^((\bredux\b)|(\bcontext\b)|(\bnone\b))+$/,
			type: 'string',
			message: 'answer should be "redux", "context", or "none"',
			required: true,
		},
		Firebase: {
			description: 'Would you like to use firebase in this project?',
			pattern: /^(^y(es)?$)|(^n(o)?$)/,
			type: 'string',
			message: 'answer should be "y" or "yes" or "n" or "no"',
			required: true,
		},
	},
};

prompt.start();
prompt.get(schema, (err, res) => {
	let packageJson = {
		name: res['Package Name'],
		version: '1.0.0',
		description: res['Package Description'],
		main: 'index.js',
		scripts: {
			'dev':
				'webpack-dev-server --mode development --config config/webpack.base.config.js --open --hot --history-api-fallback',
			'build':
				'webpack --mode production --config config/webpack.prod.config.js --env.NODE_ENV=production --progress',
			'prod': 'node server',
		},
		repository: {
			type: 'git',
			url: res['Package Repo'],
		},
		keywords: [],
		author: 'Andrew Byrd',
		license: 'MIT',
	};

	fs.writeFile('./package.json', JSON.stringify(packageJson, null, 2), err => {
		if (err) return console.log(err);
		const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
		const commandDev = [
			'install',
			'--save-dev',
			'@babel/core',
			'@babel/preset-env',
			'@babel/preset-react',
			'@babel/preset-stage-2',
			'babel-loader@^8.0.0-beta.4',
			'uglifyjs-webpack-plugin',
			'html-webpack-plugin',
			'webpack',
			'webpack-cli',
			'webpack-dev-server',
			'webpack-merge',
			'webpack-manifest-plugin',
			'sw-precache-webpack-plugin',
			'file-loader',
		];
		// Booleans from Prompts
		const useSass = res['Styles'] === 'sass';
		const useStyled = res['Styles'] === 'styled';
		const useNoStylePackage = res['Styles'] === 'none';
		const useRedux = res['State Management'] === 'redux';
		const useContext = res['State Management'] === 'context';
		const useNoStateManagement = res['State Management'] === 'none';
		const useFirebase = res['Firebase'] === 'y' || res['Firebase'] === 'yes';

		if (useSass) {
			const cssPackages = [
				'css-loader',
				'extract-text-webpack-plugin',
				'node-sass',
				'optimize-css-assets-webpack-plugin',
				'sass-loader',
				'style-loader',
			];
			commandDev.push(...cssPackages);
		}
		const runDevCommand = spawn(npm, commandDev, { stdio: 'inherit' });

		const command = ['install', '--save', 'express', 'react', 'react-dom', 'immer'];
		if (useStyled) {
			command.push('styled-components');
		}
		if (useRedux) {
			const reduxDependencies = [
				'react-redux',
				'redux',
				'redux-logger',
				'redux-promise-middleware',
				'redux-thunk',
			];
			command.push(...reduxDependencies);
		}
		if (useFirebase) {
			command.push('firebase');
		}
		const runCommand = spawn(npm, command, { stdio: 'inherit' });

		// Folder Structure Changes;
		fse.copy(__dirname + '/template', './', err => {
			if (err) return console.log(err);

			const removeSass = (passFunction) => {
				// Remove File Line
				const removeImport = {
					files: './src/index.js',
					from: "import './styles.scss';",
					to: '',
				};
				const removeLinks = {
					files: ['./dist/index.html', './src/index.html'],
					from: '<link rel="stylesheet" href="style.css" type="text/css">',
					to: '',
				};
				replace(removeImport)
					.then(() => {if (!useRedux) {passFunction()}})
					.catch(err => console.log(err));
				replace(removeLinks)
					.catch(err => console.log(err));

				// Change Folder Structure
				fse.remove('./configSass', err => {
					if (err) {
						console.log('failed to delete extra config directory');
					}
				});
				fse.remove('./src/scss', err => {
					if (err) {
						console.log('failed to delete src/scss/');
					}
				});
				fse.remove('./src/style.scss', err => {
					if (err) {
						console.log('failed to delete src/style');
					}
				});
				fse.remove('./dist/style.css', err => {
					if (err) {
						console.log('failed to delete dist/style');
					}
				});
			}

			const removeStyled = () => {
				fse.remove('./config', err => {
					if (err) {
						console.log('failed to delete extra config directory');
					} else {
						fse.rename('./configSass', './config', err => {
							if (err) {
								console.log('Unable to rename folder');
							}
						});
					}
				});
				fse.remove('./src/js/style', err => {
					if (err) {
						console.log('failed to delete style folder in js');
					}
				});
			}

			const removeReduxLine = () => {
				// Remove File Line
				const removeProvider = {
					files: './src/index.js',
					from: [
						"import {Provider} from 'react-redux';",
						"import store from './js/store';",
						"<Provider store={store}>",
						"</Provider>"
					],
					to: ['', '', '', ''],
				};
				replace(removeProvider)
					.catch(err => console.log(err));
			}

			const removeRedux = () => {
				// Remove File Line
				const removeProvider = {
					files: './src/index.js',
					from: [
						"import {Provider} from 'react-redux';",
						"import store from './js/store';",
						"<Provider store={store}>",
						"</Provider>"
					],
					to: ['', '', '', ''],
				};
				replace(removeProvider)
					.catch(err => console.log(err));
				// Change Folder Structure
				fse.remove('./src/js/actions', err => {
					if (err) {
						console.log('unable to delete the actions folder');
					}
				});
				fse.remove('./src/js/reducers', err => {
					if (err) {
						console.log('unable to delete the reducers folder');
					}
				});
				fse.remove('./src/js/store.js', err => {
					if (err) {
						console.log('unable to delete the store.js file');
					}
				});
			}

			const removeContext = () => {
				fse.remove('./src/js/components/ContextTheme.js', err => {
					if (err) {
						console.log('unable to delete the ContextTheme file');
					}
				});
			}

			const removeFirebase = () => {
				fse.remove('./src/js/utils/Firebase.js', err => {
					if (err) {
						console.log('Failed to delete Firebase.js file');
					}
				});
			}

			// Replace
			if (useStyled) {
				removeSass(removeReduxLine)
			} else if (useSass) {
				removeStyled()
			} else {
				removeSass(removeReduxLine);
				removeStyled()
			}


			if (useRedux || useNoStateManagement) {
				removeContext();
			}

			if (useContext || useNoStateManagement) {
				removeRedux();
			}

			if (!useFirebase) {
				removeFirebase();
			}

			console.log('Folder Structure Successfully copied!');
		});
	});
});
