exports.DATABASE_URL = process.env.DATABASE_URL || '';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://firstUser:password123@ds139946.mlab.com:39946/ironyard-test-db';
exports.LOCAL_TEST_DATABASE_URL = 'mongodb://localhost:27017/react-capstone-server';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = 'IronCladSecret';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';