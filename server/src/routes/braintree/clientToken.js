import settings from 'config';
import gateway from '../middleware/paymentGateway';

export default (req, res) => {

  const param = {};
  gateway.clientToken.generate(param, (err, response) => {
    if (err) {
      console.log('clientToken', err);
      return res.status(400).send({
        code: 400,
        client_token: false
      })
    }
    return res.json({
      code: 200,
      clientToken: response.clientToken
    });
  });
};
