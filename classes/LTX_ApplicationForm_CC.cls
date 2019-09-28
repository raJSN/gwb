public class LTX_ApplicationForm_CC {
    /* 
     * Method to fetch Wizard structure settings as per the template id passed
     * It doesn't support multiple section per wizard page
     */
    @AuraEnabled (cacheable=true)
    public static map<String, list<Application_Wizard_Section__mdt>> getApplicationStructure(String templateId){
        System.debug('**temlate'+templateId);
        //We can use order by on relationship fields, So we have to this using maps -- Below code does that
        map<Decimal, list<Application_Wizard_Section__mdt>> stepOrderMap = new map<Decimal,list<Application_Wizard_Section__mdt>>();
        map<Decimal, String> stepLabelMap = new map<Decimal, String>();
        map<String, list<Application_Wizard_Section__mdt>> stepMap = new map<String,list<Application_Wizard_Section__mdt>>();       
        for(Application_Wizard_Section__mdt rec: [SELECT Id, MasterLabel, Label, Section_Title__c, Object_Name__r.QualifiedApiName, 
                                                  Fieldset__c, Icon_Name__c, Section_Order__c,RelatedId__c,
                                                  Unique_Id__c, Related_Unique_Id__c, Save_Order__c,Navigate_here__c,
                                                  Application_Wizard__r.Icon_Name__c,Application_Wizard__r.Help__c,
                                                  Application_Wizard__r.Wizard_Type__c
                                                  FROM Application_Wizard_Section__mdt 
                                                  where Is_Active__c=true and Application_Wizard__r.DeveloperName=:templateId])
        {
            //There could be only one step per step order for wizard section 
            stepOrderMap.put(rec.Section_Order__c,new list<Application_Wizard_Section__mdt>{rec});
            //Label map for remapping of labels as per order
            stepLabelMap.put(rec.Section_Order__c, rec.MasterLabel);
        }
        //Sorting the keys using list as we can't sort set
        list<Decimal> deciList = new list<Decimal>();
        deciList.addAll(stepOrderMap.keySet());
        deciList.sort();
        for(Decimal rec : deciList){
            stepMap.put(stepLabelMap.get(rec),stepOrderMap.get(rec));
        }
        System.debug('****'+stepMap);
        return stepMap;
    }
    
    @AuraEnabled
    public static map<String,list<String>> getFieldWrapper(list<String> objects, list<String> fieldsets){
        map<String,list<String>> fieldWrapper = new map<String,list<String>>();
        for(Integer i=0;i<objects.size();i++){
            fieldWrapper.put(objects[i],
                             getFieldsFromFieldSet(objects[i], fieldsets[i]));
        }
        return fieldWrapper;
    }
    private static list<String> getFieldsFromFieldSet(String objectNameIs, String fieldSetName){
        System.debug('***getFieldsFromFieldSet_sa called:'+fieldSetName+' : '+objectNameIs);
        list<String> fieldList = new list<String>();
        DescribeSObjectResult[] describes = Schema.describeSObjects(new String[] {objectNameIs});
        // There should only be the one match for the one object type name
        for(Schema.FieldSetMember fs : describes[0].fieldSets.getMap().get(fieldSetName).getFields()){
            fieldList.add(fs.getFieldPath());
        }
        return fieldList;
    }
    
    @AuraEnabled
    public static map<String,String> savePayload(String payload){
        System.debug('***payload'+payload);
        //Create list of payload wrapper
        list<PayloadWrapper> plw = (list<PayloadWrapper>) JSON.deserialize(payload, list<PayloadWrapper>.CLASS);
        System.debug('***plw'+plw);
        //Iterate over the plw to save the records - Save order will be coming from JS 
        map<String,String> uniqueIdMap = new map<String,String>();
        for(PayloadWrapper rec: plw){
            Schema.DescribeSObjectResult dr = Schema.describeSObjects(new list<String>{rec.objectIs})[0];
            SObject record = dr.getSObjectType().newSObject();
            /* 
             * 1st save will be root
            */
            for(FieldWrapper reci: rec.fieldWrapper){
                if(dr.fields.getMap().get(reci.fieldApi).getDescribe().getType()==Schema.DisplayType.Boolean){
                   if(reci.fieldValue<>null)
                       	record.put(reci.fieldApi,Boolean.valueOf(reci.fieldValue)); 
                }else if(dr.fields.getMap().get(reci.fieldApi).getDescribe().getType()==Schema.DisplayType.DATE){
                   if(reci.fieldValue<>null)
                       	record.put(reci.fieldApi,Date.valueOf(reci.fieldValue)); 
                }else if(dr.fields.getMap().get(reci.fieldApi).getDescribe().getType()==Schema.DisplayType.DOUBLE ||
                        dr.fields.getMap().get(reci.fieldApi).getDescribe().getType()==Schema.DisplayType.CURRENCY ||
                        dr.fields.getMap().get(reci.fieldApi).getDescribe().getType()==Schema.DisplayType.PERCENT){
                   if(reci.fieldValue<>null)
                    	record.put(reci.fieldApi,DOUBLE.valueOf(reci.fieldValue)); 
                }else{
                    System.debug('***a'+dr.fields.getMap().get(reci.fieldApi).getDescribe().getType());
                    record.put(reci.fieldApi,reci.fieldValue);
                }
                
            }
            if(uniqueIdMap.get(rec.relatedUniqueId)!=null){
                //This means it is not root & is related object. Update realted id field here
                record.put(rec.relatedId,uniqueIdMap.get(rec.relatedUniqueId));// It could be like contact__c -> 0031U00000A4sbi
            }
            //Check if the object record is already created or not
            if(uniqueIdMap.containsKey(rec.uniqueId)){
                record.put('Id',uniqueIdMap.get(rec.uniqueId));
            }
            //Insert the record
            upsert record;
            uniqueIdMap.put(rec.uniqueId, String.valueOf(record.get('Id')));
        }
        return uniqueIdMap;
    }
    
    public Class PayloadWrapper{
        private String objectIs;
        private Integer saveOrder;
        private list<FieldWrapper> fieldWrapper;
        private String relatedId;
        private String uniqueId;
        private String relatedUniqueId;
    }
    public Class FieldWrapper{
        private String fieldApi;
        private String fieldValue;
    }
}