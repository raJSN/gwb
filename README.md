This is an Aura based Component to generate Forms declaratively using Custom metadata types. Go ahead and install the package in your org to play with it.

# ED Diagram

## Object Schema:

* Objects are not concrete & are abstract. We can use any object  & fieldsets to display information in tabs . 

## Configuration Schema:

1. Below is the configuration schema that is used to generate the form sections dynamically. In Aura Components, Sections are generated dynamically. However, in LWC sections needs to be generated on load itself.

![image](https://user-images.githubusercontent.com/3901703/81555664-96147a00-93a6-11ea-8f35-f3afc751c876.png)
Custom Metadata Types:

Create below custom metadata types to display Form wizard:

1. '*Application Wizard*' -> Use this component as the Wizard Container . It identify Wizard characteristics like 'Path type', 'Success Image', 'Tab Order' and 'Tab Panel Template Identifier'.
2. '*Application Wizard Section*' -> Use this component to configure parameters that will be displayed in wizard sections and control it save order.

## Features:

1. Create Wizard & Wizard Form sections declaratively.
2. Configure the  Object & fields that will be displayed in form sections using fieldsets. 
3. Configure the save order. It is important as the save order identify that records are created in correct order.
4. Configure other parameters like “is collapsed", "section order" etc.

## Installation Link: 

https://login.salesforce.com/packaging/installPackage.apexp?p0=04t0o000002uMQYAA2

## Setup (Example):

1. Use the installation link provided to install the package. 
2. Assign user ‘Generic Tabset’ permission set.
3. Example of custom metadata type used for the demo:
    1. ![image](https://user-images.githubusercontent.com/3901703/81555705-a62c5980-93a6-11ea-8751-462f0cc204fc.png)
4. Sample Schema used for the demo:
    1. ![image](https://user-images.githubusercontent.com/3901703/81555729-b2b0b200-93a6-11ea-8cb4-df7f4456a6a0.png)
5. After installation, go to “Generic Form Wizard” tab to open the component. It will open up a form like this.
    1. ![image](https://user-images.githubusercontent.com/3901703/81555776-c78d4580-93a6-11ea-98c0-4694da0524d0.png)
    2. ![image](https://user-images.githubusercontent.com/3901703/81555815-dbd14280-93a6-11ea-96c0-fa08ce8adbdb.png)

Cheers,
Rajendra Singh Nagar
