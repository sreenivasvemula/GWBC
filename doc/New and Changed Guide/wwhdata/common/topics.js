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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-whatsnew.html") ) { return "cover-whatsnew.html";}
else if (Guidewire_TopicMatch(TOPIC,"About BillingCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"What\u2019s New and Changed in 8.0 Maintenance Releases") && Guidewire_FMSourceFileMatch(SRCFILE,"p-emerald-maint.html") ) { return "p-emerald-maint.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in BillingCenter 8.0.4") && Guidewire_FMSourceFileMatch(SRCFILE,"804.04.1.html") ) { return "804.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in BillingCenter 8.0.4") && Guidewire_FMSourceFileMatch(SRCFILE,"804.04.2.html") ) { return "804.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Support for Extension Properties of Type Array") && Guidewire_FMSourceFileMatch(SRCFILE,"804.04.3.html") ) { return "804.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in BillingCenter 8.0.4") && Guidewire_FMSourceFileMatch(SRCFILE,"804.04.4.html") ) { return "804.04.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Assembler Plugin Is Called During Charge Invoicing Process") && Guidewire_FMSourceFileMatch(SRCFILE,"804.04.5.html") ) { return "804.04.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the BillingCenter API") && Guidewire_FMSourceFileMatch(SRCFILE,"804.04.6.html") ) { return "804.04.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in BillingCenter 8.0.3") && Guidewire_FMSourceFileMatch(SRCFILE,"803.05.1.html") ) { return "803.05.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in BillingCenter 8.0.3") && Guidewire_FMSourceFileMatch(SRCFILE,"803.05.2.html") ) { return "803.05.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"New config.xml Parameter AllocateInvoiceNumberOnInit") && Guidewire_FMSourceFileMatch(SRCFILE,"803.05.3.html") ) { return "803.05.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trouble Ticket Holds Placed on a Policy") && Guidewire_FMSourceFileMatch(SRCFILE,"803.05.4.html") ) { return "803.05.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in BillingCenter 8.0.3") && Guidewire_FMSourceFileMatch(SRCFILE,"803.05.5.html") ) { return "803.05.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Support for Oracle Partitioned Indexes") && Guidewire_FMSourceFileMatch(SRCFILE,"803.05.6.html") ) { return "803.05.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in BillingCenter 8.0.2") && Guidewire_FMSourceFileMatch(SRCFILE,"802.06.1.html") ) { return "802.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in BillingCenter 8.0.2") && Guidewire_FMSourceFileMatch(SRCFILE,"802.06.2.html") ) { return "802.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Integration between BillingCenter and PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"802.06.3.html") ) { return "802.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Plugin Interface InboundIntegrationMessageReply") && Guidewire_FMSourceFileMatch(SRCFILE,"802.06.4.html") ) { return "802.06.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"New BillingAPI Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"802.06.5.html") ) { return "802.06.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in BillingCenter 8.0.2") && Guidewire_FMSourceFileMatch(SRCFILE,"802.06.6.html") ) { return "802.06.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Removed Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"802.06.7.html") ) { return "802.06.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integration Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"802.06.8.html") ) { return "802.06.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in BillingCenter 8.0.1") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.01.html") ) { return "801.07.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in BillingCenter 8.0.1") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.02.html") ) { return "801.07.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Allocation Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.03.html") ) { return "801.07.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Support for OSGi Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.04.html") ) { return "801.07.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Using Clause Now Supports Finally Clause") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.05.html") ) { return "801.07.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in BillingCenter 8.0.1") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.06.html") ) { return "801.07.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Payment Schedule Modification") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.07.html") ) { return "801.07.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Account Billing Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.08.html") ) { return "801.07.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Return Premium Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.09.html") ) { return "801.07.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Premium Report Billing Instruction") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.10.html") ) { return "801.07.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Premium Report Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.11.html") ) { return "801.07.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Conversion of Web Services from RPCE to WS-I") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.12.html") ) { return "801.07.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Removal of Agency Money Receipts from the Search Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.13.html") ) { return "801.07.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Web Service Transaction IDs") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.14.html") ) { return "801.07.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Change to Inbound Integration Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.15.html") ) { return "801.07.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Suppress Warnings Annotation") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.16.html") ) { return "801.07.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Compound Assignment Operators for Logical AND and Logical OR") && Guidewire_FMSourceFileMatch(SRCFILE,"801.07.17.html") ) { return "801.07.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"What\u2019s New and Changed in 8.0.0") && Guidewire_FMSourceFileMatch(SRCFILE,"p-emerald.html") ) { return "p-emerald.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.01.html") ) { return "e-app.09.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.02.html") ) { return "e-app.09.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.03.html") ) { return "e-app.09.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change Menu Link") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.04.html") ) { return "e-app.09.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Screen Layout") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.05.html") ) { return "e-app.09.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.06.html") ) { return "e-app.09.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Direct Billing") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.07.html") ) { return "e-app.09.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Agency Billing") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.08.html") ) { return "e-app.09.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cash and Return Premium Handling") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.09.html") ) { return "e-app.09.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy-Level Billing with Cash Management") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.10.html") ) { return "e-app.09.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Context Field for Reversed Charges") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.11.html") ) { return "e-app.09.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Suspense Items for Payments that Do Not Match the Expected Amount") && Guidewire_FMSourceFileMatch(SRCFILE,"e-app.09.12.html") ) { return "e-app.09.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in Configuration in 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.01.html") ) { return "e-configuration.10.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Important Changes to the Configuration Module") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.02.html") ) { return "e-configuration.10.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.03.html") ) { return "e-configuration.10.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Generate Dictionary Command") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.04.html") ) { return "e-configuration.10.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.05.html") ) { return "e-configuration.10.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.06.html") ) { return "e-configuration.10.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.07.html") ) { return "e-configuration.10.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes Related to PCF Files") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.08.html") ) { return "e-configuration.10.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes Related to Configuring BillingCenter Charges") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.09.html") ) { return "e-configuration.10.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes Related to Integrating with ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.10.html") ) { return "e-configuration.10.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Removal of Preload.txt Lines that Include Run Level") && Guidewire_FMSourceFileMatch(SRCFILE,"e-configuration.10.11.html") ) { return "e-configuration.10.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in Gosu in 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.01.html") ) { return "e-gosu.11.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in Gosu in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.02.html") ) { return "e-gosu.11.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Assert Statement") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.03.html") ) { return "e-gosu.11.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"In For Loop Declarations, Local Variable is Now Optional") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.04.html") ) { return "e-gosu.11.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Final Variable Initialization Separate from Declaration") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.05.html") ) { return "e-gosu.11.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"The new Operator Now Is Optionally a Statement") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.06.html") ) { return "e-gosu.11.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Support Annotations on Function Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.07.html") ) { return "e-gosu.11.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Named Arguments in Annotations") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.08.html") ) { return "e-gosu.11.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Support for Code Coverage Tools for Gosu Code") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.09.html") ) { return "e-gosu.11.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Entity Touch API is Changed and No Longer Deprecated") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.10.html") ) { return "e-gosu.11.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in Gosu in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.11.html") ) { return "e-gosu.11.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu is Now Case Sensitive In Most Cases") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.12.html") ) { return "e-gosu.11.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Bundle Changes from Gosu and Java") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.13.html") ) { return "e-gosu.11.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Map Enhancement Method Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.14.html") ) { return "e-gosu.11.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entity Literal Syntax is Deprecated") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.15.html") ) { return "e-gosu.11.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entity Methods loadByKey, loadByPublicID, and remove Deprecated") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.16.html") ) { return "e-gosu.11.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Packages Changed to Reflect Public and Internal Status") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.17.html") ) { return "e-gosu.11.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Concurrency API Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.18.html") ) { return "e-gosu.11.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"The () Inequality Operator Is Now Invalid") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.19.html") ) { return "e-gosu.11.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Gosu Command Line Tool Built-in Editor Removed") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.20.html") ) { return "e-gosu.11.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Change in Gosu Named Parameters Usage") && Guidewire_FMSourceFileMatch(SRCFILE,"e-gosu.11.21.html") ) { return "e-gosu.11.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in Integration in 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.01.html") ) { return "e-integration.12.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in Integration in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.02.html") ) { return "e-integration.12.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Phone Number Normalizer Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.03.html") ) { return "e-integration.12.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"New MTOM Support for Results of Published WS-I Web Service") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.04.html") ) { return "e-integration.12.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multi-threaded Inbound Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.05.html") ) { return "e-integration.12.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Messaging Destination Option for Messages Without Primary Object") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.06.html") ) { return "e-integration.12.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Regenerating WSDL and XSD in Web Service Collections (regen-from-wsc)") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.07.html") ) { return "e-integration.12.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Charge Initializer Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.08.html") ) { return "e-integration.12.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in Integration in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.09.html") ) { return "e-integration.12.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"RPCE Web Services Deprecated in 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.10.html") ) { return "e-integration.12.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Existing Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.11.html") ) { return "e-integration.12.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Important Changes for Java Code") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.12.html") ) { return "e-integration.12.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Plugin Registry Changes in Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.13.html") ) { return "e-integration.12.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Document Management Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.14.html") ) { return "e-integration.12.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Messaging Flow Changed") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.15.html") ) { return "e-integration.12.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"New PCPolicyPublicID Property in Web Services Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.16.html") ) { return "e-integration.12.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the BillingCenter Charge Invoicing Process") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.17.html") ) { return "e-integration.12.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Commission Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.18.html") ) { return "e-integration.12.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Payment Plan Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"e-integration.12.19.html") ) { return "e-integration.12.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in System Administration in 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-administration.13.1.html") ) { return "e-administration.13.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in System Administration in 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-administration.13.2.html") ) { return "e-administration.13.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Phone Number Normalizer Work Queue") && Guidewire_FMSourceFileMatch(SRCFILE,"e-administration.13.3.html") ) { return "e-administration.13.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in System Administration in 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-administration.13.4.html") ) { return "e-administration.13.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Database Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"e-administration.13.5.html") ) { return "e-administration.13.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Work Queue Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"e-administration.13.6.html") ) { return "e-administration.13.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Scheduled Purge Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"e-administration.13.7.html") ) { return "e-administration.13.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Database Statistics Updating") && Guidewire_FMSourceFileMatch(SRCFILE,"e-administration.13.8.html") ) { return "e-administration.13.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in Globalization in\u00a08.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.01.html") ) { return "e-globalization.14.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"New to Globalization in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.02.html") ) { return "e-globalization.14.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Separation of Language and Regional Format") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.03.html") ) { return "e-globalization.14.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Base Configuration Language Support") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.04.html") ) { return "e-globalization.14.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Base Configuration Region Support") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.05.html") ) { return "e-globalization.14.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Base Configuration Currency Support") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.06.html") ) { return "e-globalization.14.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Base Configuration Geographical Support") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.07.html") ) { return "e-globalization.14.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Phone Number Data and Phone Validator Gosu Class") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.08.html") ) { return "e-globalization.14.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Automatic Address Completion and Fill-in Plugin Functionality") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.09.html") ) { return "e-globalization.14.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Ability to Provide a Sort Order for the Typecodes in a Typelist") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.10.html") ) { return "e-globalization.14.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Ability to Localize Script Parameter Descriptions") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.11.html") ) { return "e-globalization.14.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Language Module Installation Utility") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.12.html") ) { return "e-globalization.14.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Globalization-related Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.13.html") ) { return "e-globalization.14.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Globalization-related Typelists") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.14.html") ) { return "e-globalization.14.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Ability to Set First Day of Week by Region") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.15.html") ) { return "e-globalization.14.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in the BillingCenter 8.0 Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.16.html") ) { return "e-globalization.14.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Globalization in BillingCenter 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.17.html") ) { return "e-globalization.14.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Address Configuration 8.0") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.18.html") ) { return "e-globalization.14.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Admin Data Localization") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.19.html") ) { return "e-globalization.14.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to 8.0 Typelists") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.20.html") ) { return "e-globalization.14.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Files Used with Globalization") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.21.html") ) { return "e-globalization.14.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"List Sort Methods Support Optional Locale Sensitive Sorting") && Guidewire_FMSourceFileMatch(SRCFILE,"e-globalization.14.22.html") ) { return "e-globalization.14.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"What\u2019s New and Changed in 7.0.0") && Guidewire_FMSourceFileMatch(SRCFILE,"part-b.html") ) { return "part-b.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in BillingCenter 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.01.html") ) { return "d-app.16.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Funds Tracking") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.02.html") ) { return "d-app.16.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy-level Billing") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.03.html") ) { return "d-app.16.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"List Bill Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.04.html") ) { return "d-app.16.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Instruments") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.05.html") ) { return "d-app.16.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Producer Write-Offs Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.06.html") ) { return "d-app.16.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Suspense Items Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.07.html") ) { return "d-app.16.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Exception Persistence") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.08.html") ) { return "d-app.16.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Support for Enhanced Integration with PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.09.html") ) { return "d-app.16.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Support for Integration with ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"d-app.16.10.html") ) { return "d-app.16.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in Configuration in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-configuration.17.1.html") ) { return "d-configuration.17.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"d-configuration.17.2.html") ) { return "d-configuration.17.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"d-configuration.17.3.html") ) { return "d-configuration.17.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"d-configuration.17.4.html") ) { return "d-configuration.17.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"d-configuration.17.5.html") ) { return "d-configuration.17.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes Related to PCF Files") && Guidewire_FMSourceFileMatch(SRCFILE,"d-configuration.17.6.html") ) { return "d-configuration.17.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Improvements in Localization") && Guidewire_FMSourceFileMatch(SRCFILE,"d-configuration.17.7.html") ) { return "d-configuration.17.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in Gosu in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.01.html") ) { return "d-gosu.18.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in Gosu in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.02.html") ) { return "d-gosu.18.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Support for Intervals") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.03.html") ) { return "d-gosu.18.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Support for Numeric Literals") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.04.html") ) { return "d-gosu.18.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Null-safe Operators") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.05.html") ) { return "d-gosu.18.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"New Named Function Arguments and Argument Defaults") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.06.html") ) { return "d-gosu.18.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in Gosu in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.07.html") ) { return "d-gosu.18.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Compiles to Java Virtual Machine Bytecode") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.08.html") ) { return "d-gosu.18.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Syntax Changes (Compile Time Issues)") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.09.html") ) { return "d-gosu.18.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Behavior Changes (Run Time Issues)") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.10.html") ) { return "d-gosu.18.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"New XML APIs and Improved XSD Support Using \u2018XmlElement\u2019") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.11.html") ) { return "d-gosu.18.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire XML Modeler (GX Modeler) Upgraded to Use New XML API") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.12.html") ) { return "d-gosu.18.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Interceptors Removed") && Guidewire_FMSourceFileMatch(SRCFILE,"d-gosu.18.13.html") ) { return "d-gosu.18.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in Integration in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.01.html") ) { return "d-integration.19.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in Integration in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.02.html") ) { return "d-integration.19.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes in Integration in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.03.html") ) { return "d-integration.19.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"WS-I Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.04.html") ) { return "d-integration.19.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Locale in WS-I Requests for Guidewire Servers Only") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.05.html") ) { return "d-integration.19.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Locally-Accessed RPCE Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.06.html") ) { return "d-integration.19.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire InsuranceSuite Plugin Implementations are Versioned") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.07.html") ) { return "d-integration.19.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"SOAP Implementation Classes and WSDL Packages Include Version") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.08.html") ) { return "d-integration.19.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Escalation and Exception Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.09.html") ) { return "d-integration.19.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Messaging System Safe Ordering") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.10.html") ) { return "d-integration.19.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Messaging System Resync") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.11.html") ) { return "d-integration.19.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Management in BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.12.html") ) { return "d-integration.19.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Delinquency Processing Customization") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.13.html") ) { return "d-integration.19.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Billing Instruction Customization") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.14.html") ) { return "d-integration.19.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Billing Summaries") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.15.html") ) { return "d-integration.19.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to Making Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.16.html") ) { return "d-integration.19.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Invoice Assembler Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.17.html") ) { return "d-integration.19.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Invoice and Related Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.18.html") ) { return "d-integration.19.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes to the Policy Period and Policy System Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"d-integration.19.19.html") ) { return "d-integration.19.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in System Administration in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-administration.20.1.html") ) { return "d-administration.20.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"New in System Administration in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-administration.20.2.html") ) { return "d-administration.20.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"DCE VM Strongly Recommended for Development Environments") && Guidewire_FMSourceFileMatch(SRCFILE,"d-administration.20.3.html") ) { return "d-administration.20.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changed in System Administration in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-administration.20.4.html") ) { return "d-administration.20.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Updated System Requirements") && Guidewire_FMSourceFileMatch(SRCFILE,"d-administration.20.5.html") ) { return "d-administration.20.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Configuration Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"d-administration.20.6.html") ) { return "d-administration.20.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed in Rules in 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-rules.21.1.html") ) { return "d-rules.21.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes in Rules in BillingCenter 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"d-rules.21.2.html") ) { return "d-rules.21.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Release Notes Archive") && Guidewire_FMSourceFileMatch(SRCFILE,"part-relnotes.html") ) { return "part-relnotes.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 8.0.3 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC803.html") ) { return "ReleaseNotes-BC803.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 8.0.2 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC802.html") ) { return "ReleaseNotes-BC802.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 8.0.1 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC801.html") ) { return "ReleaseNotes-BC801.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 8.0.0 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC800.html") ) { return "ReleaseNotes-BC800.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 7.0.7 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC707.html") ) { return "ReleaseNotes-BC707.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 7.0.6 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC706.html") ) { return "ReleaseNotes-BC706.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 7.0.5 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC705.html") ) { return "ReleaseNotes-BC705.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 7.0.4 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC704.html") ) { return "ReleaseNotes-BC704.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 7.0.3 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC703.html") ) { return "ReleaseNotes-BC703.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 7.0.2 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes-BC702.html") ) { return "ReleaseNotes-BC702.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 7.0.1 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-701.html") ) { return "ReleaseNotes_BC-701.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 7.0.0 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-700.34.1.html") ) { return "ReleaseNotes_BC-700.34.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing This Release") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-700.34.2.html") ) { return "ReleaseNotes_BC-700.34.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changes in this Release") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-700.34.3.html") ) { return "ReleaseNotes_BC-700.34.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Known Issues and Limitations") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-700.34.4.html") ) { return "ReleaseNotes_BC-700.34.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 3.0.7 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-307.html") ) { return "ReleaseNotes_BC-307.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 3.0.6 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-306.html") ) { return "ReleaseNotes_BC-306.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 3.0.5 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-305.html") ) { return "ReleaseNotes_BC-305.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 3.0.4 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"ReleaseNotes_BC-304.html") ) { return "ReleaseNotes_BC-304.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 3.0.3 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"relnotes-bc303.html") ) { return "relnotes-bc303.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 3.0.2 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"relnotes-bc302.html") ) { return "relnotes-bc302.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 3.0.1 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"relnotes-bc301.html") ) { return "relnotes-bc301.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter 3.0.0 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"relnotes-bc300.html") ) { return "relnotes-bc300.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
