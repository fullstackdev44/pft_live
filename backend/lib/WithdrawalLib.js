'use strict';

const CommonLib = require('../component/lib');

const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');

const sgMail = require('@sendgrid/mail');

class WithdrawalLib extends CommonLib{

  constructor(){
    super(Withdrawal);
  }

  getWithdrawalWithSkipOption(skip_option, decoded, callback) {
    Withdrawal.find({user: decoded._id}).sort({ 'created': -1 }).skip(Number(skip_option)).limit(10).exec(callback);
  };

  createWithdrawal = (Withdrawal_data, decoded, callback) => {

    const new_withdrawal = new Withdrawal();

    for (const key in Withdrawal_data) {
      if ({}.hasOwnProperty.call(Withdrawal_data, key)) {
        new_withdrawal[key] = Withdrawal_data[key];
      }
    }

    new_withdrawal.save((error, saved_withdrawal) => {

      if(error){
        return callback(error);
      }

      User.findById(decoded._id, {full_name: true, email :true}).exec((err, user) => {
      	const msg = {
	        to: process.env.PFTV_EMAIL,
	        from: {
	          email: process.env.PFTV_EMAIL,
	          name: 'Project Fitness TV'
	        },
	        dynamic_template_data: {
	          full_name: user.full_name,
	          email: user.email,
	          amount: new_withdrawal.amount
	        },
	        template_id: 'd-a7f4cc1f0f7e4561a5308372937f4f21'
	      };
	      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	      sgMail
	        .send(msg)
	        .then(() => {
	          console.log("verification mail sent to:");
	          console.log(process.env.PFTV_EMAIL);
	        }, error => {
	          console.error(error);
	          if (error.response) {
	            console.error(error.response.body)
	          }
	          callback('email error');
	        });
      });

      callback(null, saved_withdrawal);
    });
  }

}

module.exports = WithdrawalLib;
