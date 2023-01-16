'use strict'

const colorTypesNumber = 34;

const ToolLib = (function(){

	let exports = {};

	exports.generateUniqueId = function(data){

		//return data.replace(/ /g, "_").replace(/?/g, "_").replace(/#/g, "_").replace(/\//g, "_");
		return data.replace(/ /g, "_").replace(/#/g, "_").replace(/\//g, "_");
	}

	exports.generateCard = function(user){
		
	    const name_parts = user.full_name.split(" ");
	    
	    if(name_parts.length == 1){
	      return name_parts[0].substr(0, 2).toUpperCase();
	    }

	    return name_parts.map(current => current.substr(0, 1)).splice(0, 2).join("").toUpperCase();
	  }

	  exports.generateColor = function(){

	    return Math.floor(Math.random() * colorTypesNumber);
	  }

	return exports;

})();

module.exports = ToolLib;
