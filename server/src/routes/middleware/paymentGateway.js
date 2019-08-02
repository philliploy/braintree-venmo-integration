import settings from 'config';
import braintree from 'braintree';

const environment = settings.braintree.environment.charAt(0).toUpperCase() + settings.braintree.environment.slice(1);
const gateway = braintree.connect({
	environment: braintree.Environment[environment],
	merchantId: settings.braintree.merchantId,
	publicKey: settings.braintree.publicKey,
	privateKey: settings.braintree.privateKey
});

module.exports = gateway;