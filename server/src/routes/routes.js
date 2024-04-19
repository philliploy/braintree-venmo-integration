import app from '../express';
import braintreeRoutes from './braintree';

export default () => {
	const apiVersion = '/api/v1/';
	app.use(apiVersion+'braintree', braintreeRoutes());
};
