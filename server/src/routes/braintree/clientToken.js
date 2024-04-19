import settings from 'config';
import gateway from '../middleware/paymentGateway';
import logIt from '../middleware/logIt';

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
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logIt(`[${ip}] Generate Client Token`);
    return res.json({
      code: 200,
      clientToken: response.clientToken
    });
  });
};
