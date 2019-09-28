({
	/* 
	 * Get the configuration information from the server
	 * It is stored in CMT corresponding to template Id
	*/
    doInit : function(component, event, helper) {
		//Get server action
		let getApplicationStructure_sa = component.get('c.getApplicationStructure');
        //Set Params - No params required
        getApplicationStructure_sa.setParams({
            templateId: component.get('v.templateId')
        });
        //Set callback
        getApplicationStructure_sa.setCallback(this,function(response){
            let state = response.getState();
            if(state==='SUCCESS'){
                //Result is a sorted list of Map containing Steps as keys and list of section as values
                const resultIs = response.getReturnValue();
                console.log('***resultIs:'+JSON.stringify(resultIs));
                let stepList = Object.keys(resultIs);
                console.log('***stepList:'+JSON.stringify(stepList));
                component.set('v.stepList',stepList);
                //Get first step
                component.set('v.index',0);
                component.set('v.cs',stepList[0]);
                //Get the path type
                component.set('v.pt',resultIs[stepList[0]][0].Application_Wizard__r.Wizard_Type__c);
                //Set result
                component.set('v.result',resultIs);
            }
        });
        //Enqueue Action
        $A.enqueueAction(getApplicationStructure_sa);
	},
    createSections : function(component, event, helper){
        console.log('***Create sections called');
        helper.createSectionsHelper(component, event, helper);
    },
    receiveAppStatus: function(component, event, helper){
        console.log('***receiveAppStatus called');
        if(event.getParam('status')=='NEXT'){
            helper.next(component, event, helper);
        }else if (event.getParam('status')=='PREVIOUS'){
            helper.previous(component, event, helper);
        }
    },
    receiveLoad : function(component, event, helper){
        console.log('**** receive load invoked'+JSON.stringify(event.getParam('payload')));
        const pl = event.getParam('payload');
        const stepListVar = component.get('v.stepList');
        let payloadRecsVar = component.get('v.payloadRecs');
        payloadRecsVar.push(pl);
        if(payloadRecsVar.length==stepListVar.length){
            //Invoke server action for save
            payloadRecsVar = payloadRecsVar.sort(function(a,b){
                return Number(a.saveOrder) - Number(b.saveOrder);
            });
            console.log('***payloads sorted'+JSON.stringify(payloadRecsVar));
            //Get server action
            let savePayload_sa = component.get('c.savePayload');
            //Set Params - No params required
            savePayload_sa.setParams({
                payload : JSON.stringify(payloadRecsVar)
            });
            //Set callback
            savePayload_sa.setCallback(this,function(response){
                let state = response.getState();
                if(state==='SUCCESS'){
                    //set response
                    component.set('v.navigationMap',response.getReturnValue());
                    console.log('**nav map'+JSON.stringify(response.getReturnValue()));
                    /*
                    component.find('notifLib').showToast({
                        title: "Application Submission!",
                        message: "Your application has been submitted successfully.",
                        variant: "success",
                        mode: "dismissable"
                    }); 
                    */
                    //Hide the section
                    let ci = component.get('v.index');
                    let dmVar = component.find('dm')[ci];
                    $A.util.toggleClass(dmVar,'slds-hide');
                    component.set('v.isSubmitSuccessful',true);
                }else{
                    component.find('notifLib').showToast({
                        title: "Application Submission!",
                        message: "Your application submission has failed."+JSON.stringify(response.getError()),
                        variant: "error",
                        mode: "dismissable"
                    });
                }
            });
            //Enqueue Action
            $A.enqueueAction(savePayload_sa);
        }else{
         	//Collect all payloads
            component.set('v.payloadRecs',payloadRecsVar);   
        }
    },
    newApplication: function(component, event, helper){
        $A.get('e.force:refreshView').fire();
    },
    navigateToApplication: function(component, event, helper){
        let resultIs = component.get('v.result');
        let navigateTo;
        for( var rec of Object.values(resultIs)){
            console.log('***jss'+JSON.stringify(rec));
            if(rec[0].Navigate_here__c==true) {
                navigateTo = rec[0].Unique_Id__c;
                break;
            }
        }
        console.log('***navigating to '+navigateTo);
        let navMap = component.get('v.navigationMap');
        console.log('***navMap => '+JSON.stringify(navMap));
        var sObectEvent = $A.get("e.force:navigateToSObject");
        sObectEvent .setParams({
            "recordId": navMap[navigateTo]  ,
            "slideDevName": "detail"
        });
        sObectEvent.fire();
    }
})