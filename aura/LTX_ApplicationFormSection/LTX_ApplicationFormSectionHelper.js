({
    handleNext : function(component, event, helper){
        //Publish Event
        $A.get('e.c:LTX_ApplicationStatus').setParams({"status" : "NEXT"}).fire();
    },
    handlePrevious : function(component, event, helper){
        //Publish Event
        $A.get('e.c:LTX_ApplicationStatus').setParams({"status" : "PREVIOUS"}).fire();
    },
    handleSubmitAll : function(component, event, helper){
        //Publish Event
        console.log('***handle submit all called');
        $A.get('e.c:LTX_ApplicationStatus').setParams({'status':'SAVEALL'}).fire();
    }
})