import { Router } from 'express';

import {
  clientToken,
  checkout
} from './braintree/_methods';


export default () => {
	const routes = Router();

	routes
		.post('/clientToken', clientToken)
		.post('/checkout', checkout)
		
	return routes;
};

