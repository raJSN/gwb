({
    opencontent : function(component, event) {
        console.log('***opencontent called');
        let targetVar = event.currentTarget.id;
        if(targetVar=='contentbodySec1_arrowup'){
            component.set('v.isCollapsed',false);
        }else if(targetVar=='contentbodySec1_arrowdown'){
            component.set('v.isCollapsed',true);
        }
    },
    handleLoad : function(component, event){
        component.set('v.showSpinner',false);
    },
    saveIt : function(component, event){
        console.log('***saveit called'+event.getParam('status'));
        if(event.getParam('status')=='SAVEALL'){
            console.log('***saveit called');
            document.getElementById('submit').click();   
        }
    },
    handleSubmit : function(component, event, helper ){
        console.log('***handleSubmit called'+JSON.stringify(event.getSource().getLocalId()));
        console.log('***obj'+component.get('v.object'));
        let cs = component.get('v.ns');
        
        //Set fields values
        console.log('***obj fields:'+JSON.stringify(event.getParam('fields')));
        component.set('v.fieldValues',event.getParam('fields'));
        
        if(cs=='next'){
            helper.handleNext(component, event, helper);
        }else if(cs=='previous'){
            helper.handlePrevious(component, event, helper);
        }else if(cs=='sa'){
            helper.handleSubmitAll(component, event, helper);
        }
        event.preventDefault(); // stop form submission
    },
    handleSuccess : function(component, event){
        console.log('***handleSuccess called');
    },
    getError: function(component, event, helper) {
        console.log('***getError called');
        var error = event.getParam("error");
        console.log('***err msg'+JSON.stringify(error)); // main error message
    },
    next : function(component, event, helper){
        //Publish Event
        component.set('v.ns','next');
    },
    previous : function(component, event, helper){
        //Publish Event
        component.set('v.ns','previous');
    },
    submitAll : function(component, event, helper){
        //Save all records - Actual submission is done via handleSubmit handler only, 
        //This is done to use OOB client side validation
        component.set('v.ns','sa');//submit all
    },
    receiveAppStatus : function(component, event, helper){
        //Once saveall event is invoked, all section components will send thier payloads
        if(event.getParam('status')=='SAVEALL'){
            console.log('save all invoked'+JSON.stringify(component.get('v.settingsRec')));
            //Create form payload
            const payload = new Object();
            payload.objectIs = component.get('v.object');
            payload.saveOrder = component.get('v.settingsRec').Save_Order__c;
            //Constuct field Wrapper from field values
            let fieldValues = component.get('v.fieldValues');
            let fieldWrapper = [];
            for(var key in fieldValues){
                if(fieldValues.hasOwnProperty(key)){
                    console.log('***js:typeof'+typeof fieldValues[key]);
                    console.log('***js:value'+JSON.stringify(fieldValues[key]));
                    if(typeof fieldValues[key]!='object' || fieldValues[key]==null){
                        fieldWrapper.push({
                            'fieldApi': key,
                            'fieldValue': fieldValues[key]
                        });
                    }
                }
            }
            payload.fieldWrapper = fieldWrapper;
            let relId = component.get('v.settingsRec').RelatedId__c;
            //This will point to reference field to be populated
            if(typeof relId == 'undefined'){
               payload.relatedId = 'none';//This refers to the root or top of the hierarchy
            }else{
                payload.relatedId = relId;
            }
            let uId = component.get('v.settingsRec').Unique_Id__c;
            //This is used to identify section Id
            if(typeof uId == 'undefined'){
               payload.uniqueId = 'none';
            }else{
                payload.uniqueId = uId;
            }
            let ruId = component.get('v.settingsRec').Related_Unique_Id__c;
            //This will refer to the field value with which related id has to be populated
            if(typeof ruId == 'undefined'){
               payload.relatedUniqueId = 'none';
            }else{
                payload.relatedUniqueId = ruId;
            }
            //After constructing the payload, send it to container for saving
            console.log('***obj fields:'+JSON.stringify(payload));
            component.getEvent('appLoad').setParams({'payload':payload}).fire();
        }
    }
})