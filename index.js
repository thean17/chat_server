if (process.env.PRODUCTION) {
	require('./bin/www');
} else {
	require('@babel/register')();
  require("@babel/polyfill");
  
	require('./bin/www');
}
