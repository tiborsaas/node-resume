/**
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <tibor@szasz.hu> wrote this file.  As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return.
 * Tibor Szász
 * ----------------------------------------------------------------------------
 */

var template = 'basic';
var devMode = false;

// No need to edit below this line
const Q = require('q');
const fs = require('fs');
const os = require('os');
const pdf = require('html-pdf');
const twig = require('twig');
const chalk = require('chalk');
const minimist = require('minimist')(process.argv.slice(2));
const cvData = require('./data/cv.json');
const PDFoptions = require('./pdf-options.json')
const express = require('express'), app = express();

/**
 * Some helper stuff for user friendly command line juggling
 * npm start dev > this launches a web server to help debug CSS
 * npm start dev [templatename] > same as above, but with the desired template
 * npm start [templatename] > this renders the template
 */
if (minimist._.length > 0) {
	if (minimist._[0] == 'dev') {
		devMode = true;

		if (typeof minimist._[1] !== 'undefined') {
			template = minimist._[1];
			if( !checkTemplateFolder( template ) ) {
				return;
			}
		}
	} else {
		template = minimist._[0];
		if( !checkTemplateFolder( template ) ) {
			return;
		}
	}
}

app.set("twig options", {
    strict_variables: false,
    cache: false,
    auto_reload: true
});

/**
 * Helper stuff for template
 */
const meta = {
	template: template,
	devMode: devMode,
	root: getRoot()
}
cvData.meta = meta;


/**
 * Tell "html-pdf" which template to look assets for
 */
PDFoptions.base += template;


/**
 * Start a server to display the template to debug or modify
 */
if (devMode) {
	const port = 9999;
	app.use(express.static('views'));

	app.get('/', function (req, res) {
		res.render(template + '/cv.twig', cvData);
	});

	app.listen(port, function () {
		console.log(chalk.green('Dev server running on http://localhost:' + port));
	});
	return; // don't render anything from now on
}


/**
 * Render template and generate PDF
 */
var createTemplate = Q.denodeify(twig.renderFile);
var renderedTemplate = createTemplate('views/' + template + '/cv.twig', cvData);

renderedTemplate.then(function (html) {
	console.log(chalk.green('Looks good, just a second...'));

	var deferred = Q.defer()

	pdf.create(html, PDFoptions).toFile('./cv.pdf', (err, res) => {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(res);
		}
	});
	return deferred.promise;

}).then(() => {
	console.log(chalk.cyan('SUCCESS: Your CV is baked as ordered!'));
}, (err) => {
	console.log(chalk.red('ERROR: ' + err));
});


/**
 * PhantomJS prefers paths starting with file:///...
 */
function getFileProtocolPath() {
	if( os.platform() === 'win32' ) {
		var path = __dirname.split('\\');
	} else {
		var path = __dirname.split('/');
	}
	path[0] = 'file://';
	return path.join('/');
}

function getRoot() {
	var root = getFileProtocolPath();

	if( devMode ) {
		return template;
	} else {
		return root + '/views/' + template;
	}
}

function checkTemplateFolder( templateId ) {
	try {
		fs.accessSync('views/' + templateId, fs.F_OK);
		console.log( chalk.green('Rendering template: ' + template) );
		return true;
	} catch (e) {
		console.log( chalk.red('Can\'t find template: ' + template) );
		return false;
	}
}
