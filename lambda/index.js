exports.handler = (event, context, cb) => {
	let input;
	const res = {};
	try {
		input = JSON.parse(event.body);
		res.statusCode = 200;
		res.body = { result: 'OK' };
		console.log(input);
	} catch (err) {
		if (err.name === 'SyntaxError') {
			res.statusCode = 400;
			res.body = { error: 'Non-JSON body' };
		} else {
			console.log(err);
			res.statusCode = 500;
		}
	}
	if (res.body) {
		res.body = JSON.stringify(res.body);
	}
	cb(null, res);
};
