define(['core/model'], function(Model){

    var Phone = Model.extend({

        callMe : function(params) {
        	
            var url = this.getProperty('baseUrl') + '/call';

			var inputXML = '<clickToCall xmlns="http://bindings.egain.com/clickToCall">';
		
			inputXML += '<visitorId>1</visitorId>'
					 + '<phoneNumber>' + params.dialNum + '</phoneNumber>'
					 + '<delayTimeInSec>' + params.time + '</delayTimeInSec>'
					 + '<countryCode>' + params.countryCode + '</countryCode>'
					 + '<entrypointId>' + params.entryPointId + '</entrypointId>';
					 
			
			inputXML += this.addVisitorHistoryTrackingData(inputXML, params.visitorHistoryIds);
			inputXML += '</clickToCall>';
		
			return $.ajax( {
				url : url,
				type : 'POST',
				contentType : 'text/XML',
				data : inputXML,
				dataType : 'xml',
				success_codes : [200],
				error_codes : [404, 405],
				success : function(xml) {
		
					var callStatusText = $(xml).find('clickToCall').attr('status');
					var callStatus = callStatusText.toLowerCase() == 'true';
					
					params.success.call(params.context, callStatus, params.time);
				},
				error : function(){

                    if(!params.error)
                        return;

                    params.error.call(params.context);
                }
			});
        },
        
        /** Adds visitor history tracking data (if present) to the request xml */
        addVisitorHistoryTrackingData : function(inputXML, visitoHistoryData) {
        	var visitorHistoryXML = "";
			
			if(typeof visitoHistoryData != "undefined" && visitoHistoryData)
			{
				visitorHistoryXML += '<visitorIdentifier>';
				visitorHistoryXML += '<userId>' + visitoHistoryData.uId + '</userId>';
				visitorHistoryXML += '<accountId>' + visitoHistoryData.aId + '</accountId>';
				visitorHistoryXML += '<sessionId>' + visitoHistoryData.sId + '</sessionId>';
				visitorHistoryXML += '</visitorIdentifier>';
			}
			return visitorHistoryXML;
        }
    });

    return Phone;
});
