const aws = require('aws-sdk');

exports.handler = (event, context, cb) => {
	let input;
	const res = {};
	try {
		input = JSON.parse(event.body);
		['lb', 'oz', 'in', 'sex', 'c', 'b', 'date', 'name', 'email'].forEach((key) => {
			if (!input.hasOwnProperty(key) || input[key] === null ||
			   input[key] === '') {
				throw new Error(`Missing required value ${key}`);
			}
		});
		const ua = (context && context.identity && context.identity.userAgent) ?
			  context.identity.userAgent : '';
		submitToSDB(input, ua)
			.then(() => {
				res.statusCode = 204;
				res.headers = {
					'Access-Control-Allow-Origin': '*'
				};
				cb(null, res);
			})
			.catch((err) => {
				throw err;
			});
	} catch (err) {
		if (err.name === 'SyntaxError') {
			res.statusCode = 400;
			res.body = {
				error: 'Non-JSON body',
				input: event.body
			};
		} else if (err.name === 'ConditionalCheckFailed') {
			res.statusCode = 400;
			res.body = {
				error: 'Already submitted'
			};
		} else {
			console.log(err);
			res.statusCode = 500;
		}
		if (res.body) {
			res.body = JSON.stringify(res.body);
		}
		res.headers = {
			'Access-Control-Allow-Origin': '*'
		};
		cb(null, res);
	}
};

function submitToSDB(data, userAgent) {
	return new Promise((resolve) => {
		const cred = new aws.Credentials({
			accessKeyId: process.env.KEY_ID,
			secretAccessKey: process.env.SECRET_KEY
		});
		const sdb = new aws.SimpleDB(new aws.Config({
			credentials: cred,
			region: 'us-east-1'
		}));
		const params = {
			DomainName: 'baby-poll',
			ItemName: data.email,
			Expected: {
				Name: 'submittedAt',
				Exists: false
			}
		};
		params.Attributes = Object.keys(data).map((key) => {
			return {
				Name: key,
				Value: data[key].toString()
			};
		});
		params.Attributes.push({
			Name: 'submittedAt',
			Value: new Date().toISOString()
		}, {
			Name: 'userAgent',
			Value: userAgent || ''
		});
		sdb.putAttributes(params, (err, res) => {
			if (err) {
				console.log(err);
				throw err;
			}
			console.log(res);
			resolve();
		});

	});
}
