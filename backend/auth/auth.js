// local JWT strategy
const fs = require('fs');
const path = require('path');
const jsonwt = require('jsonwebtoken');
const jwt_config = require('./config/jwt');

module.exports = function(req, res, next) {

  // reading private and public keys
  const file_name = path.join(__dirname, './config') + '/public.key';
  const publicKey = fs.readFileSync(file_name, 'utf8');

  const verify_options = {
    expiresIn: jwt_config.TOKEN_LIFETIME,
    algorithm: ['RS256']
  };

  const public_routes = jwt_config.NOT_CHECKED_PATHS.map(current => current.route);
  let request_index = null;
  let found = false;

  found = public_routes.some((currentRoute, index) => {
    if(jwt_config.NOT_CHECKED_PATHS[index].generic){

      const startWithRegex = new RegExp("^" + currentRoute, "i")
      if(startWithRegex.test(req.path)){
        request_index = index;
        return true;
      }
    }
    else{
      if(currentRoute === req.path){
        request_index = index;
        return true;
      }
    }
  })

  jsonwt.verify(req.token, publicKey, verify_options, function(err, decoded) {

    if (err && !(found && req.method === jwt_config.NOT_CHECKED_PATHS[request_index].method)) {
      return res.status(401).json({error: err});
    }

    req.decoded = decoded;
    return next();
  })
};
