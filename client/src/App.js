import React from 'react';
import './App.scss';
import VenmoIcon from './components/images/venmo_pay.svg';
import fetchJSON from './services/utils/fetchJSON';

// let paypalInstanceObject = {};
// let applePayInstanceObject = {};
let venmoInstanceObject = {};
//let hostedFieldsInstanceObject = {};

class App extends React.Component {
  state = {
    venmoReady: false,
    methodLabel: 'venmo',
    clientToken: '',
    deviceData: '',
    paymentApi: '/api/v1/braintree/checkout',
    failMessage: '',
    successMessage: '',
    orderId: ''
  }
  componentDidMount = () => {
    const generate = require('nanoid/generate');
    const orderId = generate('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);
    this.setState({
      orderId
    }, this.initBraintree);
  }
  initBraintree() {
    const { methodLabel } = this.state;
    if (!document.getElementById('braintreeScript')) {
      this.addScriptHead('braintreeScript', 'client.min.js', 'braintree', this.setupBraintree);
      this.addScriptHead('braintreeDataCollector', 'data-collector.min.js');
      switch (methodLabel) {
        case 'venmo':
          this.addScriptHead('braintreeVenmo', 'venmo.min.js', 'braintree');
          break;
        
        // case 'card': 
        //   this.addScriptHead('braintreeCard', 'hosted-fields.min.js', 'braintree');
        //   break;
        // case 'paypal': 
        //   this.addScriptHead('braintreePaypal', 'paypal-checkout.min.js', 'braintree', this.initPaypalScripts);
        //   break;
        // case 'applePay': 
        //   this.addScriptHead('braintreeApplePay', 'apple-pay.min.js', 'braintree');
        //   break;
        default:
      }
    }
  }
  addScriptHead = (name, url, base = 'braintree', onload = {}) => {
    const braintreeScript = document.createElement('script');
    braintreeScript.setAttribute('id', name);
    let source = '';
    if (base === 'braintree') {
      source = 'https://js.braintreegateway.com/web/3.42.0/js/';
    }
    braintreeScript.onload = onload;
    braintreeScript.setAttribute('src', `${source}${url}`);
    document.head.appendChild(braintreeScript);
  }
  setupBraintree = () => {
    fetchJSON('/api/v1/braintree/clientToken', {
      method: 'post'
    }).then(data => {
      //console.log('data', data);
      if (data.code === 200) {
        this.setState({
          clientToken: data.clientToken
        }, this.initPayments)
      }
     }).catch(error => {
        this.changeFailMessage(error);
        console.log(error);
     });
  }
  initPayments = () => {
    braintree.client.create({ // eslint-disable-line
      authorization: this.state.clientToken
    }, (clientErr, clientInstance) => {
      if (clientErr) {
        console.log('Error creating client:', clientErr);
        this.changeFailMessage(clientErr.message);
        return;
      }
      const { methodLabel } = this.state;
      this.getDeviceDataAndStart(clientInstance, methodLabel);      
    });
  }
  getDeviceDataAndStart = (clientInstance, methodLabel) => {
    console.log('getDeviceDataAndStart');
    braintree.dataCollector.create({ // eslint-disable-line
      client: clientInstance,
      paypal: true
    }, (err, dataCollectorInstance) => {
      if (err) {
        console.log('err', err);
        // Handle error
        return;
      }
      const myDeviceData = dataCollectorInstance.deviceData;

      this.setState({
        deviceData: myDeviceData
      });

      switch (methodLabel) {
        // case 'card':
        //   this.initializeCard(clientInstance);
        //   break;
        // case 'paypal': 
        //   this.initializePayPal(clientInstance);
        //   break;
        case 'venmo': 
          this.initializeVenmo(clientInstance);
          break;
        // case 'applePay': 
        //   this.initializeApplePay(clientInstance);
        //   break;
        default:
      }

    });
  }
  initializeVenmo = (clientInstance) => {
    console.log('initializeVenmo', clientInstance);
    braintree.venmo.create({ // eslint-disable-line
      client: clientInstance,
      // Add allowNewBrowserTab: false if your checkout page does not support
      // relaunching in a new tab when returning from the Venmo app. This can
      // be omitted otherwise.
      allowNewBrowserTab: false
    }, (venmoErr, venmoInstance) => {
      if (venmoErr) {
        console.log('Error creating Venmo:', venmoErr);
        this.changeFailMessage('Venmo is fail, try again later');
        this.closeFail(Object.assign({'failReason':'Venmo error'}, venmoErr), 'Venmo-venmoErr');
        return;
      }
      // Verify browser support before proceeding.
      if (!venmoInstance.isBrowserSupported()) {
        this.changeFailMessage('Venmo is not support');
        this.closeFail('Venmo is not support', 'Venmo-isBrowserSupported');
        return;
      }
      venmoInstanceObject = venmoInstance;
      this.setState({
        venmoReady: true,
        paymentLoading: false
      });
      //console.log('venmoInstance', venmoInstance.hasTokenizationResult() )
      if (venmoInstance.hasTokenizationResult()) {
        venmoInstance.tokenize((tokenizeErr, payload) => {
          this.startPayVenmo(tokenizeErr, payload);
        });
        return;
      }
    })
  }
  closeFail = (failStatus, failMethod) => {
    console.log('closeFail', failStatus, failMethod);
  }
  changeFailMessage = (message) => {
    this.setState({
      failMessage: message
    });
  }
  payWithVenmo = () => {
    console.log('payWithVenmo NOW');
    this.setState({
      failMessage: ''
    });
    venmoInstanceObject.tokenize((tokenizeErr, payload) => {
      this.startPayVenmo(tokenizeErr, payload);
    });
  }
  startPayVenmo = (tokenizeErr, payload) => {
    if (tokenizeErr) {
      if (tokenizeErr.code === 'VENMO_CANCELED') {
        this.changeFailMessage('User canceled Venmo, or Venmo app is not available.');
        console.log('App is not available or user aborted payment flow');
      } else if (tokenizeErr.code === 'VENMO_APP_CANCELED') {
        this.changeFailMessage('User canceled Venmo flow.');
        console.log('User canceled payment flow');
      } else {
        this.changeFailMessage('Failed in the process of payment Venmo');
        console.error('An error occurred:', tokenizeErr.message);
      }
      this.closeFail(tokenizeErr, 'Venmo-Fail');
    } else {
      console.log('handleVenmoSuccess', payload)
      this.handlePaymentMethod(payload);
    }
  }
  handlePaymentMethod = (payload = false) => {
    const { deviceData } = this.state;
    const { orderId, methodLabel } = this.state;
    let body = {
      source: methodLabel,
      orderId: orderId
    };
    if (deviceData) {
      body.device_data = deviceData;
    };
    
    body.payment_method_nonce = payload.nonce;

    fetchJSON(this.state.paymentApi, {
      method: 'post',
      body
    }).then(data => {
      console.log(data);
      if (data.code === 200) {
        this.successPayment(data.message);
      } else {
        this.changeFailMessage(data.message);
        this.serverFail(data.message, 'serverSide');
      }
    }).catch(error => {
      console.log(error);
      this.serverFail('Server error catch', 'serverSide');
    });
  }
  successPayment = (message) => {
    console.log('successPayment!', message);
    this.setState({
      successMessage: message,
      failMessage: ''
    })
  }
  serverFail = (failServer) => {
    console.log('serverFail!')
    this.changeFailMessage('Server fail');
  }
  render() {
    const {
      venmoReady,
      failMessage,
      successMessage
    } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1>Pay with Venmo</h1>
          <p>Venmo status: {venmoReady ? 'is ready' : 'is not ready' }</p>
          {failMessage ? 
            <p style={{'color': 'red'}}>FAIL: {failMessage}</p>
          : null }

          {successMessage ? 
            <p style={{'color': 'green'}}>SUCCESS: {successMessage}</p>
          : null }
          <br/>
          <br/>
          {!successMessage ? <button type="button" disabled={!venmoReady} onClick={this.payWithVenmo} className="App__pay venmo">
            <img className="App__brand" src={VenmoIcon} alt="" />
          </button> : null }
        </header>
      </div>
    );
  }
}

export default App;