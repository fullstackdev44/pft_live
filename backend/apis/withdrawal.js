'use strict';

const CommonApi = require('../component/api');

const WithdrawalLib = require('../lib/WithdrawalLib');
const Withdrawal = require('../models/Withdrawal');

class WithdrawalApi extends CommonApi{

  constructor(){
    super('withdrawal', Withdrawal, WithdrawalLib, ["create"]);

    this.router.route('/').post(this.create);

    this.router.route('/withdrawalWithSkipOption/:skip_option').get((request, response, next) => {
      this.wrap(this.modelLib.getWithdrawalWithSkipOption, request.params.skip_option, request.decoded, request, next);
    })

  }

  create = (request, response, next) => {
    this.wrap(this.modelLib.createWithdrawal, request.body, request.decoded, request, next);
  }

}

module.exports = WithdrawalApi;