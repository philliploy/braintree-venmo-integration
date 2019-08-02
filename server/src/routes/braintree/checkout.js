import settings from 'config';
import gateway from '../middleware/paymentGateway';
import braintree from 'braintree';

var TRANSACTION_SUCCESS_STATUSES = [
  braintree.Transaction.Status.Authorizing,
  braintree.Transaction.Status.Authorized,
  braintree.Transaction.Status.Settled,
  braintree.Transaction.Status.Settling,
  braintree.Transaction.Status.SettlementConfirmed,
  braintree.Transaction.Status.SettlementPending,
  braintree.Transaction.Status.SubmittedForSettlement
];

function formatErrors(errors) {
  var formattedErrors = '';

  for (var i in errors) { // eslint-disable-line no-inner-declarations, vars-on-top
    if (errors.hasOwnProperty(i)) {
      formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
    }
  }
  return formattedErrors;
}

function createResultObject(transaction) {
  var result;
  var status = transaction.status;

  if (TRANSACTION_SUCCESS_STATUSES.indexOf(status) !== -1) {
    result = 'Your test transaction has been successfully processed.';
  } else {
    result = 'Your test transaction has a status of ' + status + '. See the Braintree API response and try again.';
  }

  return result;
}

export default (req, res) => {
  var transactionErrors;

  const {
    payment_method_nonce,
    orderId,
    device_data
  } = req.body;
  
  gateway.transaction.sale({
    amount: 1,
    paymentMethodNonce: payment_method_nonce,
    orderId: orderId,
    deviceData: device_data,
    options: {
      submitForSettlement: true
    }
  }, function (err, result) {
    if (result.success) {
      return res.json({
        code: 200,
        result: result,
        message: createResultObject(result.transaction)
      });
    } else {
      transactionErrors = result.errors.deepErrors();
      return res.json({
        code: 400,
        result: result,
        message: formatErrors(transactionErrors)
      });
    }
  })
  
};
