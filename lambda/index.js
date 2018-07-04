const aws = require('aws-sdk');

exports.handler = (event, context, cb) => {
	let input;
	const res = {};
	try {
		input = JSON.parse(event.body);
		['lb', 'oz', 'in', 'sex', 'c', 'b', 'date'].forEach((key) => {
			if (!input.hasOwnProperty(key)) {
				throw new Error(`Missing required value ${key}`);
			}
		});
		submitToSDB(input)
			.then(() => {
				res.statusCode = 204;
				cb(null, res);
			});
	} catch (err) {
		if (err.name === 'SyntaxError') {
			res.statusCode = 400;
			res.body = {
				error: 'Non-JSON body',
				input: event.body
			};
		} else {
			console.log(err);
			res.statusCode = 500;
		}
		if (res.body) {
			res.body = JSON.stringify(res.body);
		}
		cb(null, res);
	}
};

function submitToSDB(data) {
	return new Promise((resolve) => {
		const cred = new aws.Credentials({
			accessKeyId: process.env.KEY_ID,
			secretAccessKey: process.env.SECRET_KEY
		});
		const sdb = new aws.SimpleDB(new aws.Config({
			credentials: cred,
			region: 'us-east-1'
		}));
		resolve();
	});
}
