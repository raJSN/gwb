({
    next : function(component, event, helper){
        console.log('**next is invoked');
        //Hide current div & show next one 
        let ci = component.get('v.index');
        //Get correct div from index 
        let dmVar = component.find('dm')[ci];//ci represent current div index
        $A.util.toggleClass(dmVar,'slds-hide');
        
        let ni = ++ci;
        component.set('v.index',ni);
        //Get correct div from index 
        dmVar = component.find('dm')[ni];//ni represent next div index
        //Check div has body or not
        if(dmVar.get('v.body').length!=0){
            console.log('***body is already present.'+JSON.stringify(dmVar.get('v.body')));
         	$A.util.toggleClass(dmVar,'slds-hide');   
            //Update progress indicator
            let stepList = component.get('v.stepList');
            component.set('v.cs',stepList[ni]);
        }else{
         	helper.createSectionsHelper(component, event, helper);   
        }
    },
    previous : function(component, event, helper){
        console.log('**previous is invoked');
        //Hide current div & show next one 
        let ci = component.get('v.index');
        //Get correct div from index 
        let dmVar = component.find('dm')[ci];//ci represent current div index
        $A.util.toggleClass(dmVar,'slds-hide');
        
        //Sections will already be there, we just need to show hide sections
        let pi = --ci;
        component.set('v.index',pi);
        //Get correct div from index 
        dmVar = component.find('dm')[pi];//ci represent previous div index
        $A.util.toggleClass(dmVar,'slds-hide');
        //Update progress indicator
        let stepList = component.get('v.stepList');
		component.set('v.cs',stepList[pi]);
    },
    createSectionsHelper : function(component, event, helper){
        /*
        * We will be getting all fieldsets corresponding to the step in map format from apex
        * Generating application sections as per the step
        */
        //Get all field section for firstStep
        const index = component.get('v.index');
        const stepList = component.get('v.stepList');
        //Get all fieldsets informations
        const resultVar = component.get('v.result');
        if(resultVar && stepList[index]){
            const fieldsetsVar = component.get('v.result')[stepList[index]];
            //Get field set information from server
            let getFieldWrapper_sa = component.get('c.getFieldWrapper');
            //Set param
            let objects = [];
            let fieldsets = [];
            fieldsetsVar.forEach(function(rec){
                objects.push(rec.Object_Name__r.QualifiedApiName);
                fieldsets.push(rec.Fieldset__c);
            });
            getFieldWrapper_sa.setParams({
                'objects' : objects,
                'fieldsets' : fieldsets,
            });
            //Set callback
            getFieldWrapper_sa.setCallback(this, function(response){
                let state = response.getState();
                if(state==='SUCCESS'){
                    //Result will be a map, with ObjectName as Key and list of fieldNames as values
                    let result = response.getReturnValue();
                    console.log('***result:'+JSON.stringify(result));
                    //helper.createComps(component, result, helper, 0, firstStepVar);
                    helper.createSection(component, result, helper, 0, fieldsetsVar, false);
                }else{
                    console.log('***response:error'+JSON.stringify(response.getError()));
                }
            });
            //Set enqueue action
            $A.enqueueAction(getFieldWrapper_sa);
        }
    },
    createSection: function(component, result, helper,i, fieldsetsVar, isCollapsed ,bodyListAre){
        console.log('***create section');
        console.log('***create section:result'+JSON.stringify(result));
        const ci = component.get('v.index');
        let stepList = component.get('v.stepList');
        let oKeys = Object.keys(result);
        let object = oKeys[i];
        console.log('***create section'+JSON.stringify(object));
        let bodyList=[];//Holds components body
        if(bodyListAre && bodyListAre.length>0){
            bodyList=bodyListAre;
        }
        if(result[object]){
            let isLast = false;
            //Check the size list & show submit button
            if(ci==stepList.length-1){
                isLast = true;
            }
            $A.createComponent
            ('c:LTX_ApplicationFormSection',
             {
                 object:object,
                 fields:result[object],
                 settingsRec: fieldsetsVar[i],
                 isCollapsed: isCollapsed,
                 isLast:isLast
             }
             ,
             function(newComponent, status, errors){
                 console.log('***fie'+JSON.stringify(fieldsetsVar));
                 bodyList.push(newComponent);
                 //Get correct div from index 
                 let dmVar = component.find('dm')[ci];//ci represent current div index
                 dmVar.set('v.body',bodyList);
                 //Update progress indicator
                 component.set('v.cs',stepList[ci]);
                 //Hide Section
                 //component.set('v.buttonHidden',false);
                 $A.util.toggleClass(dmVar,'slds-hide');
                 //Invoke another creation if required
                 console.log('***comp created:'+bodyList);
                 helper.createSection(component, result, helper, ++i,fieldsetsVar, bodyList);
             }
            );     
        }
    },
    /*
    createComps : function(component, result, helper, i, firstStepVar,isCollapsed, bodyListAre) {
        console.log('***createComps');
        let bodyList=[];//Holds components body
        if(bodyListAre && bodyListAre.length>0){
            bodyList=bodyListAre;
        }
        //Iterate over the fieldsets to create body
        let objectName = Object.keys(result);
        console.log('***obj name'+objectName);
        //Create components
        let fieldListMdt = result[objectName[i]];
        if(fieldListMdt){
            //Get fields information
            let fieldList = [];
            let componentIs;
            let paramObj;
            fieldListMdt.forEach(function(rec){
                //Initialize object & list 
                componentIs = [];
                paramObj=new Object();
                //Push element
                componentIs.push('lightning:inputField');
                paramObj.fieldName=rec;
                componentIs.push(paramObj);
                fieldList.push(componentIs);
            });
            
            $A.createComponents(
                fieldList, // Fields first
                function(newComponents, status, error){
                    //Creating record form 
                    $A.createComponent(
                        'lightning:recordEditForm',
                        {
                            objectApiName : objectName[i],
                            body: newComponents
                        },function(recordForm, status, errors){
                            bodyList.push(recordForm);
                            //Get correct div from index 
                            let divs = component.get('v.stepList');
                            let divIndex = divs.indexOf(firstStepVar);
                            let dmVar = component.find('dm')[divIndex];
                            dmVar.set('v.body',bodyList);
                            //Invoke another method
                            helper.createComps(component, result, helper, ++i, firstStepVar, bodyList);
                        }
                    );
                }
            );
        }
    }
    */
})