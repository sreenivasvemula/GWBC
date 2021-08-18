/*
 *   Title: TopicUtils-JavaScript.js
 *   
 *  JavaScript related to the TopicUtils code. This file gets COPIED into the output webworks files to support
 *  the link to this page code.
 */

 
// extracts the src=myfilename from the URL
function Guidewire_ExtractSrcFromURL() {
	var VarDocumentURL = window.WWHFrame.location;
	var TheParametersArray = VarDocumentURL.hash.split("&");
	var thisParam;
	var FMSourceFile = "UNKNOWN_FRAMEMAKER_SOURCE_FILE";

	k = TheParametersArray.length;
	for (i= 0 ; i < k; i++) {
	   thisParam = unescape(TheParametersArray[i]);
	   if (thisParam.search(/^src=/) != -1) {
		  FMSourceFile = thisParam.substring(4); // strip off the "src=" at the beginning
		}
	 }
	return FMSourceFile;
}

// takes a file name of format "myfilename.4.3" and gets the beginning part and returns "myfilename" only
function Guidewire_FMSourceFileExtract(FullFileName)
{
  var VarSplitURL= FullFileName.split(".");
  return VarSplitURL[0];
}

// is the src=myfile arg from the URL (which means it was from myfile.fm) match the desired file
// generally speaking we do not care since we just want it unique per book
// so we just say yes, but we say false if it's a special file that allows duplicates in one book
function Guidewire_FMSourceFileMatch(FROM_URL,LOCAL_FILENAME) {
	var varFileURL = FROM_URL.toLowerCase();
	var varFileActual = LOCAL_FILENAME.toLowerCase();

	// SPECIAL CASE FOR UPGRADE GUIDE PROCEDURES -- BASICALLY 
	if (varFileURL.search(/^procedure-/) != -1) {
	  if  (varFileActual.search(/^procedure-/) != -1)  { 
		  return (varFileURL == Guidewire_FMSourceFileExtract(varFileActual)); 
		} else { 
		 return false; 
	   }
	 }
	else {
	   // basically, the default is to say they match... 
	   // if it's one of these specially-handled files, just let it work  
	   return true; 
	}
}


// this function takes a topic Name and converts it to a simpler string, such as underscores instead of space chars
// This is also important because FrameMaker + ePubs's  native handling of topic alias names mirror this behavior
//
// IMPORTANT: IF YOU CHANGE THIS CODE IN CONTROLS.JS (IN TEMPLATE OVERRIDES), ALSO CHANGE THE MIRROR FUNCTION IN TOPICUTILS-JAVASCRIPT.JS
// IMPORTANT: IF YOU CHANGE THIS CODE IN TOPICUTILS.FSL, ALSO CHANGE THE MIRROR FUNCTION IN CONTROLS.JS (IN TEMPLATE OVERRIDES)
// THE CONTROLS.JS FUNCTION ENCODES THE URL, AND THIS FUNCTION ENCODES it and compares against the input string with the full name for each topic (potentially with funny characters)
function Guidewire_SafeTopicName(theTitle) {
theTitle = theTitle.replace(/ /g, "_");  // converts space char
theTitle = theTitle.replace(/\u00a0/g, "_");  // converts nbsp char
// censor (remove) characters that mess up epublisher in URLs: forward slash, backslash, question mark, &amp;
theTitle= theTitle.replace(/[\\\/\?]/g, "");
theTitle = theTitle.replace(/&/g, "");
theTitle = theTitle.replace(/\u201c/g, ""); // double quote smart L
theTitle = theTitle.replace(/\u201d/g, "");// double quote smart R
theTitle = theTitle.replace(/\u2018/g, "");// single quote smart L
theTitle = theTitle.replace(/\u2019/g, "");// single quote smart R
theTitle = theTitle.replace(/\u2022/g, "");// trademark
theTitle = theTitle.replace(/'/g, "");// apparently a dumb single quote gets stripped by webworks
theTitle = theTitle.replace(/"/g, "");// to be safe let us strip double quotes too
theTitle = theTitle.replace(/\</g, "(");  // open bracket
theTitle = theTitle.replace(/\>/g, ")");   // close bracket
theTitle = theTitle.replace(/:/g, "_");    // colon
theTitle = theTitle.replace(/&/g, "");
return (theTitle);  }




function Guidewire_TopicMatch(FROMEPUB,WHATTOMATCH) {
var varLower1 = FROMEPUB.toLowerCase();
var varLower2 = WHATTOMATCH.toLowerCase();
var varLower2Safe = Guidewire_SafeTopicName(varLower2)

// match positively if they naturally match, or they match the safe version (convert spaces to underscores...)
var varMatches = (varLower1 == varLower2 || varLower1 == Guidewire_SafeTopicName(varLower2))

// console.log(Guidewire_TopicMatch, varLower1, varLower2, varLower2Safe, varMatches)
return varMatches
}
function GUIDEWIRE_TOPIC_TO_FILE(TOPIC, SRCFILE) { 
if (Guidewire_TopicMatch(TOPIC,"cover")) return "index.html"

else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-admin.html") ) { return "cover-admin.html";}
else if (Guidewire_TopicMatch(TOPIC,"About BillingCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Basic Configuration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.1.html") ) { return "configndeploy.03.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"The config.xml File") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.2.html") ) { return "configndeploy.03.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"The database-config.xml File") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.3.html") ) { return "configndeploy.03.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining the Application Server Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.4.html") ) { return "configndeploy.03.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring an Email Server for Notifications") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.5.html") ) { return "configndeploy.03.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Unrestricted User") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.6.html") ) { return "configndeploy.03.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Logging") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.1.html") ) { return "logging.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of BillingCenter Logging") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.2.html") ) { return "logging.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Logging Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.3.html") ) { return "logging.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Logging Categories") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.4.html") ) { return "logging.04.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Logging Levels by Category") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.5.html") ) { return "logging.04.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Information in Log Messages") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.6.html") ) { return "logging.04.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Logging in a Multiple Instance Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.7.html") ) { return "logging.04.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Making Dynamic Logging Changes without Redeploying") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.8.html") ) { return "logging.04.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring and Maintaining the BillingCenter Database") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.01.html") ) { return "database.05.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.02.html") ) { return "database.05.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Database Direct Update Policy") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.03.html") ) { return "database.05.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Connection Pool Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.04.html") ) { return "database.05.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Backing up the BillingCenter Database") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.05.html") ) { return "database.05.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding and Authorizing Data Model Updates") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.06.html") ) { return "database.05.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking Database Consistency") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.07.html") ) { return "database.05.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Database Statistics") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.08.html") ) { return "database.05.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commands for Updating Database Statistics") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.09.html") ) { return "database.05.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Database Statistics Generation") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.10.html") ) { return "database.05.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Number of Threads for Statistics Generation") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.11.html") ) { return "database.05.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking the Database Statistics Updating Process") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.12.html") ) { return "database.05.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Canceling the Database Statistics Updating Process") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.13.html") ) { return "database.05.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Purging Old Workflows and Workflow Logs") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.14.html") ) { return "database.05.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Resizing Columns") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.15.html") ) { return "database.05.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change API") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.1.html") ) { return "datachange.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change API Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.2.html") ) { return "datachange.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typical Use of the Data Change API") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.3.html") ) { return "datachange.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change Command Prompt Reference(data_change.bat)") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.4.html") ) { return "datachange.06.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change Web Service Reference (DataChangeAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.5.html") ) { return "datachange.06.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing BillingCenter Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.01.html") ) { return "mngservers.07.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Stopping the BillingCenter Application") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.02.html") ) { return "mngservers.07.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Server Modes and Run Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.03.html") ) { return "mngservers.07.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring the Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.04.html") ) { return "mngservers.07.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring and Managing Event Messages") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.05.html") ) { return "mngservers.07.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"System Users") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.06.html") ) { return "mngservers.07.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Minimum and Maximum Password Length") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.07.html") ) { return "mngservers.07.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Client Session Timeout") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.08.html") ) { return "mngservers.07.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Avoiding Session Replication") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.09.html") ) { return "mngservers.07.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Application Server Caching") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.10.html") ) { return "mngservers.07.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Analyzing Server Memory Management") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.11.html") ) { return "mngservers.07.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Clustering Application Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.01.html") ) { return "clustering.08.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Clustering") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.02.html") ) { return "clustering.08.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Planning a BillingCenter Cluster") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.03.html") ) { return "clustering.08.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"JGroups Clustering") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.04.html") ) { return "clustering.08.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cluster Communication") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.05.html") ) { return "clustering.08.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cache Usage in Guidewire Clusters") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.06.html") ) { return "clustering.08.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring a Cluster") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.07.html") ) { return "clustering.08.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"List of Cluster Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.08.html") ) { return "clustering.08.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Individual Cluster Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.09.html") ) { return "clustering.08.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling and Disabling Clustering") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.10.html") ) { return "clustering.08.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring the Registry Element for Clustering") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.11.html") ) { return "clustering.08.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Multicast Address") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.12.html") ) { return "clustering.08.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying the Key Range") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.13.html") ) { return "clustering.08.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Separate Logging Environments") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.14.html") ) { return "clustering.08.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing a Cluster") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.15.html") ) { return "clustering.08.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Starting Clustered Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.16.html") ) { return "clustering.08.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a Server to a Cluster") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.17.html") ) { return "clustering.08.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Removing a Server from a Cluster") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.18.html") ) { return "clustering.08.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Running Administrative Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.19.html") ) { return "clustering.08.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Updating Clustered Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.20.html") ) { return "clustering.08.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring Cluster Health") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.21.html") ) { return "clustering.08.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Cluster Info Page") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.22.html") ) { return "clustering.08.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking Node Health") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.23.html") ) { return "clustering.08.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Securing BillingCenter Communications") && Guidewire_FMSourceFileMatch(SRCFILE,"serversecurity.09.1.html") ) { return "serversecurity.09.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using SSL with BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"serversecurity.09.2.html") ) { return "serversecurity.09.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accessing a BillingCenter Server Through SSL") && Guidewire_FMSourceFileMatch(SRCFILE,"serversecurity.09.3.html") ) { return "serversecurity.09.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Administrative Data") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.01.html") ) { return "importdata.10.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Ways to Import Administrative Data") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.02.html") ) { return "importdata.10.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding the import Directory") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.03.html") ) { return "importdata.10.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Character Set Encoding for File Import") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.04.html") ) { return "importdata.10.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Maintaining Data Integrity During Administrative Data Import") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.05.html") ) { return "importdata.10.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administrative Data and the BillingCenter Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.06.html") ) { return "importdata.10.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Constructing a CSV File for Import") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.07.html") ) { return "importdata.10.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Constructing an XML File for Import") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.08.html") ) { return "importdata.10.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing Administrative Data Using the import_tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.09.html") ) { return "importdata.10.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Administrative Data from BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.10.html") ) { return "importdata.10.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing Roles and Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.11.html") ) { return "importdata.10.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing Authority Limits and Authority Limit Profiles") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.12.html") ) { return "importdata.10.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing Security Zones") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.13.html") ) { return "importdata.10.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing Zone Data") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.14.html") ) { return "importdata.10.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.01.html") ) { return "batch.11.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.02.html") ) { return "batch.11.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.03.html") ) { return "batch.11.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.04.html") ) { return "batch.11.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Running Work Queue Writers and Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.05.html") ) { return "batch.11.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Scheduling Work Queue Writers and Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.06.html") ) { return "batch.11.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.07.html") ) { return "batch.11.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Performing Custom Actions After Batch Processing Completion") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.08.html") ) { return "batch.11.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Troubleshooting Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.09.html") ) { return "batch.11.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"List of Work Queues and Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.10.html") ) { return "batch.11.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Inactivity Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.11.html") ) { return "batch.11.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Activity Escalation Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.12.html") ) { return "batch.11.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Advance Expiration Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.13.html") ) { return "batch.11.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Suspense Payment Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.14.html") ) { return "batch.11.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Allot Funds for Funds Tracking Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.15.html") ) { return "batch.11.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Automatic Disbursement Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.16.html") ) { return "batch.11.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge ProRata Transaction Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.17.html") ) { return "batch.11.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Collateral Requirement Effective Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.18.html") ) { return "batch.11.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Collateral Requirement Expiration Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.19.html") ) { return "batch.11.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commission Payable Calculations Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.20.html") ) { return "batch.11.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commission Payment Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.21.html") ) { return "batch.11.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Consistency Check Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.22.html") ) { return "batch.11.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Statistics Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.23.html") ) { return "batch.11.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deferred Upgrade Tasks Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.24.html") ) { return "batch.11.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Disbursement Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.25.html") ) { return "batch.11.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Full Pay Discount Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.26.html") ) { return "batch.11.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.27.html") ) { return "batch.11.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Due Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.28.html") ) { return "batch.11.28.html";}
else if (Guidewire_TopicMatch(TOPIC,"Legacy Agency Bill Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.29.html") ) { return "batch.11.29.html";}
else if (Guidewire_TopicMatch(TOPIC,"Legacy Collateral Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.30.html") ) { return "batch.11.30.html";}
else if (Guidewire_TopicMatch(TOPIC,"Legacy Delinquency Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.31.html") ) { return "batch.11.31.html";}
else if (Guidewire_TopicMatch(TOPIC,"Legacy Letter of Credit Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.32.html") ) { return "batch.11.32.html";}
else if (Guidewire_TopicMatch(TOPIC,"Letter Of Credit Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.33.html") ) { return "batch.11.33.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Payment Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.34.html") ) { return "batch.11.34.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Request Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.35.html") ) { return "batch.11.35.html";}
else if (Guidewire_TopicMatch(TOPIC,"Phone Number Normalizer Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.36.html") ) { return "batch.11.36.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Closure Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.37.html") ) { return "batch.11.37.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Reporting Report Due Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.38.html") ) { return "batch.11.38.html";}
else if (Guidewire_TopicMatch(TOPIC,"Process Completion Monitor Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.39.html") ) { return "batch.11.39.html";}
else if (Guidewire_TopicMatch(TOPIC,"Process History Purge Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.40.html") ) { return "batch.11.40.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producer Payment Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.41.html") ) { return "batch.11.41.html";}
else if (Guidewire_TopicMatch(TOPIC,"Purge Cluster Members Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.42.html") ) { return "batch.11.42.html";}
else if (Guidewire_TopicMatch(TOPIC,"Purge Failed Work Items Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.43.html") ) { return "batch.11.43.html";}
else if (Guidewire_TopicMatch(TOPIC,"Purge Old Transaction IDs Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.44.html") ) { return "batch.11.44.html";}
else if (Guidewire_TopicMatch(TOPIC,"Purge Profiler Data Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.45.html") ) { return "batch.11.45.html";}
else if (Guidewire_TopicMatch(TOPIC,"Purge Workflow Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.46.html") ) { return "batch.11.46.html";}
else if (Guidewire_TopicMatch(TOPIC,"Purge Workflow Logs Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.47.html") ) { return "batch.11.47.html";}
else if (Guidewire_TopicMatch(TOPIC,"Release Charge Holds Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.48.html") ) { return "batch.11.48.html";}
else if (Guidewire_TopicMatch(TOPIC,"Release Trouble Ticket Hold Types Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.49.html") ) { return "batch.11.49.html";}
else if (Guidewire_TopicMatch(TOPIC,"Statement Billed Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.50.html") ) { return "batch.11.50.html";}
else if (Guidewire_TopicMatch(TOPIC,"Statement Due Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.51.html") ) { return "batch.11.51.html";}
else if (Guidewire_TopicMatch(TOPIC,"Suspense Payment Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.52.html") ) { return "batch.11.52.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trouble Ticket Escalation Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.53.html") ) { return "batch.11.53.html";}
else if (Guidewire_TopicMatch(TOPIC,"Upgrade Billing Instruction Payment Plan Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.54.html") ) { return "batch.11.54.html";}
else if (Guidewire_TopicMatch(TOPIC,"User Exception Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.55.html") ) { return "batch.11.55.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Writer Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.56.html") ) { return "batch.11.56.html";}
else if (Guidewire_TopicMatch(TOPIC,"Work Item Set Purge Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.57.html") ) { return "batch.11.57.html";}
else if (Guidewire_TopicMatch(TOPIC,"Work Queue Instrumentation Purge Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.58.html") ) { return "batch.11.58.html";}
else if (Guidewire_TopicMatch(TOPIC,"Write-off Staging Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.59.html") ) { return "batch.11.59.html";}
else if (Guidewire_TopicMatch(TOPIC,"List of Unused and Internal Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.60.html") ) { return "batch.11.60.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Guidewire Document Assistant") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.1.html") ) { return "gwdocassist.12.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling Guidewire Document Assistant") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.2.html") ) { return "gwdocassist.12.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Support for Document Management Systems") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.3.html") ) { return "gwdocassist.12.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Client Configuration Requirements") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.4.html") ) { return "gwdocassist.12.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Document Assistant Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.5.html") ) { return "gwdocassist.12.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Assistant Supported File Types") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.6.html") ) { return "gwdocassist.12.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Customizing Document Assistant") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.7.html") ) { return "gwdocassist.12.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Disabling Guidewire Document Assistant") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.8.html") ) { return "gwdocassist.12.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using BillingCenter Server Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.01.html") ) { return "tools-server.13.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Process Info") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.02.html") ) { return "tools-server.13.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Work Queue Info") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.03.html") ) { return "tools-server.13.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Item Statistics") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.04.html") ) { return "tools-server.13.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Set Log Level") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.05.html") ) { return "tools-server.13.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"View Logs") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.06.html") ) { return "tools-server.13.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Info Pages") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.07.html") ) { return "tools-server.13.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.08.html") ) { return "tools-server.13.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Consistency Checks") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.09.html") ) { return "tools-server.13.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Table Info") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.10.html") ) { return "tools-server.13.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.11.html") ) { return "tools-server.13.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Storage") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.12.html") ) { return "tools-server.13.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Distribution") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.13.html") ) { return "tools-server.13.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Statistics") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.14.html") ) { return "tools-server.13.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Oracle Statspack") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.15.html") ) { return "tools-server.13.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Oracle AWR") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.16.html") ) { return "tools-server.13.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Oracle AWR Unused Indexes Information") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.17.html") ) { return "tools-server.13.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"SQL Server DMV Snapshot") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.18.html") ) { return "tools-server.13.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Microsoft JDBC Driver Logging") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.19.html") ) { return "tools-server.13.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Load History") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.20.html") ) { return "tools-server.13.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Load Integrity Checks") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.21.html") ) { return "tools-server.13.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Load Errors") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.22.html") ) { return "tools-server.13.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Upgrade Info") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.23.html") ) { return "tools-server.13.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Runtime Environment Info") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.24.html") ) { return "tools-server.13.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Safe Persisting Order") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.25.html") ) { return "tools-server.13.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loaded Gosu Classes") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.26.html") ) { return "tools-server.13.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"Management Beans") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.27.html") ) { return "tools-server.13.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing and Changing Caching Configuration Values") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.28.html") ) { return "tools-server.13.28.html";}
else if (Guidewire_TopicMatch(TOPIC,"Startable Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.29.html") ) { return "tools-server.13.29.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cluster Info") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.30.html") ) { return "tools-server.13.30.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cache Info") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.31.html") ) { return "tools-server.13.31.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Profiler") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.32.html") ) { return "tools-server.13.32.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Profiler: Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.33.html") ) { return "tools-server.13.33.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Profiler: Profiler Analysis") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.34.html") ) { return "tools-server.13.34.html";}
else if (Guidewire_TopicMatch(TOPIC,"Downloading and Viewing Profiler Data") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.35.html") ) { return "tools-server.13.35.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Profiler: Tags, Frames, and Stacks") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.36.html") ) { return "tools-server.13.36.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Guidewire Profiler with Custom Code") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.37.html") ) { return "tools-server.13.37.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Guidewire Profiler API") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.38.html") ) { return "tools-server.13.38.html";}
else if (Guidewire_TopicMatch(TOPIC,"Funds Tracking") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-server.13.39.html") ) { return "tools-server.13.39.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using BillingCenter Internal Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-internal.14.1.html") ) { return "tools-internal.14.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reload") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-internal.14.2.html") ) { return "tools-internal.14.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"System Clock") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-internal.14.3.html") ) { return "tools-internal.14.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"BC Sample Data") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-internal.14.4.html") ) { return "tools-internal.14.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accounting Config") && Guidewire_FMSourceFileMatch(SRCFILE,"tools-internal.14.5.html") ) { return "tools-internal.14.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using BillingCenter Command Prompt Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.01.html") ) { return "commandsref.15.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administration Tools Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.02.html") ) { return "commandsref.15.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administrative Tool Command Syntax") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.03.html") ) { return "commandsref.15.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.04.html") ) { return "commandsref.15.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Import Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.05.html") ) { return "commandsref.15.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Maintenance Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.06.html") ) { return "commandsref.15.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Messaging Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.07.html") ) { return "commandsref.15.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"System Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.08.html") ) { return "commandsref.15.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Table Import Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.09.html") ) { return "commandsref.15.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.10.html") ) { return "commandsref.15.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Zone Import Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.15.11.html") ) { return "commandsref.15.11.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
