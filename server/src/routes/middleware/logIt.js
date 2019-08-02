import fs from 'fs';
import settings from 'config';

const checkForFile = (fileName, callback) => {
	fs.exists(fileName, (exists) => {
		if (exists) {
			callback();
		} else {
			fs.writeFile(fileName, '', { flag: 'wx' }, () => { 
				callback();
			});
		}
	});
};


const logIt = function logIt(message) {
	const access = `${settings.rootPath}/access.log`;
	checkForFile(access, () => {
		const fileStream = fs.createWriteStream(access, { flags: 'a' });
		var d = new Date();

		fileStream.write(`[${d.toLocaleString()}] ${message}\n`, () => {
			fileStream.end();
		});
	});
};

module.exports = logIt;