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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-integration.html") ) { return "cover-integration.html";}
else if (Guidewire_TopicMatch(TOPIC,"About BillingCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Planning Integration Projects") && Guidewire_FMSourceFileMatch(SRCFILE,"p-overview.html") ) { return "p-overview.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.1.html") ) { return "overview.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Integration Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.2.html") ) { return "overview.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Important Information about BillingCenter Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.3.html") ) { return "overview.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Integration With Policy Administration Systems") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.4.html") ) { return "overview.04.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Preparing for Integration Development") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.5.html") ) { return "overview.04.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integration Documentation Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.6.html") ) { return "overview.04.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Regenerating Integration Libraries and WSDL") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.7.html") ) { return "overview.04.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"What are Required Files for Integration Programmers") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.8.html") ) { return "overview.04.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Public IDs and Integration Code") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.9.html") ) { return "overview.04.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"p-webservices.html") ) { return "p-webservices.html";}
else if (Guidewire_TopicMatch(TOPIC,"Web Services Introduction") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices.06.1.html") ) { return "webservices.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"What are Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices.06.2.html") ) { return "webservices.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"What Happens During a Web Service Call") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices.06.3.html") ) { return "webservices.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reference of All Built-in Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices.06.4.html") ) { return "webservices.06.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Publishing Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.01.html") ) { return "webservices-wsi-publish.07.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Web Service Publishing Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.02.html") ) { return "webservices-wsi-publish.07.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Web Service Publishing Quick Reference") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.03.html") ) { return "webservices-wsi-publish.07.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Publishing and Configuring a Web Service") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.04.html") ) { return "webservices-wsi-publish.07.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Testing Web Services with Local WSDL") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.05.html") ) { return "webservices-wsi-publish.07.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generating WSDL") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.06.html") ) { return "webservices-wsi-publish.07.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding Advanced Security Layers to a Web Service") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.07.html") ) { return "webservices-wsi-publish.07.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Web Services Authentication Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.08.html") ) { return "webservices-wsi-publish.07.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking for Duplicate External Transaction IDs") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.09.html") ) { return "webservices-wsi-publish.07.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Request or Response XML Structural Transformations") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.10.html") ) { return "webservices-wsi-publish.07.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reference Additional Schemas in Your Published WSDL") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.11.html") ) { return "webservices-wsi-publish.07.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validate Requests Using Additional Schemas as Parse Options") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.12.html") ) { return "webservices-wsi-publish.07.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invocation Handlers for Implementing Preexisting WSDL") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.13.html") ) { return "webservices-wsi-publish.07.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Locale Support") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.14.html") ) { return "webservices-wsi-publish.07.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Response Serialization Options, Including Encodings") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.15.html") ) { return "webservices-wsi-publish.07.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Exposing Typelists and Enumerations as String Values") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.16.html") ) { return "webservices-wsi-publish.07.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Transforming a Generated Schema") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.17.html") ) { return "webservices-wsi-publish.07.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Login Authentication Confirmation") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.18.html") ) { return "webservices-wsi-publish.07.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Stateful Session Affinity Using Cookies") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.19.html") ) { return "webservices-wsi-publish.07.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Calling a BillingCenter Web Service from Java") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.20.html") ) { return "webservices-wsi-publish.07.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding HTTP Basic Authentication in Java") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.21.html") ) { return "webservices-wsi-publish.07.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding SOAP Header Authentication in Java") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-wsi-publish.07.22.html") ) { return "webservices-wsi-publish.07.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Calling Web Services from Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"webservice-wsi-consuming.08.1.html") ) { return "webservice-wsi-consuming.08.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding Configuration Options") && Guidewire_FMSourceFileMatch(SRCFILE,"webservice-wsi-consuming.08.2.html") ) { return "webservice-wsi-consuming.08.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"One-Way Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"webservice-wsi-consuming.08.3.html") ) { return "webservice-wsi-consuming.08.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Asynchronous Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"webservice-wsi-consuming.08.4.html") ) { return "webservice-wsi-consuming.08.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"MTOM Attachments with Gosu as Web Service Client") && Guidewire_FMSourceFileMatch(SRCFILE,"webservice-wsi-consuming.08.5.html") ) { return "webservice-wsi-consuming.08.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.01.html") ) { return "bc-webservices.09.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Web Services Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.02.html") ) { return "bc-webservices.09.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Administration System Core Web Service APIs (BillingAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.03.html") ) { return "bc-webservices.09.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of the BillingAPI Web Service") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.04.html") ) { return "bc-webservices.09.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account APIs in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.05.html") ) { return "bc-webservices.09.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Period APIs in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.06.html") ) { return "bc-webservices.09.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producer APIs in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.07.html") ) { return "bc-webservices.09.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Plan APIs in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.08.html") ) { return "bc-webservices.09.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Allocation Plans API in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.09.html") ) { return "bc-webservices.09.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Bill and Commission Plan APIs in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.10.html") ) { return "bc-webservices.09.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Final Audit APIs in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.11.html") ) { return "bc-webservices.09.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Update the Written Date on a Charge in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.12.html") ) { return "bc-webservices.09.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Get Account Unapplied Funds Methods in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.13.html") ) { return "bc-webservices.09.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact API in BillingAPI") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.14.html") ) { return "bc-webservices.09.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Details Web Service APIs (InvoiceDetailsAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.15.html") ) { return "bc-webservices.09.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payments Web Service APIs (PaymentAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.16.html") ) { return "bc-webservices.09.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Make a Direct Bill Payment") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.17.html") ) { return "bc-webservices.09.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Make a Suspense Payment") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.18.html") ) { return "bc-webservices.09.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reverse a Payment") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.19.html") ) { return "bc-webservices.09.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Make an Account Balance Adjustment") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.20.html") ) { return "bc-webservices.09.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producer Unapplied Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.21.html") ) { return "bc-webservices.09.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Make an Agency Payment") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.22.html") ) { return "bc-webservices.09.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Instrument Web Service APIs (PaymentInstrumentAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.23.html") ) { return "bc-webservices.09.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Summary Web Service APIs (BillingSummaryAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.24.html") ) { return "bc-webservices.09.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trouble Ticket Web Service APIs (TroubleTicketAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.25.html") ) { return "bc-webservices.09.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Other Billing Web Service APIs (BCAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.26.html") ) { return "bc-webservices.09.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"Create a Collateral Requirement") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.27.html") ) { return "bc-webservices.09.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"Add a Note") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.28.html") ) { return "bc-webservices.09.28.html";}
else if (Guidewire_TopicMatch(TOPIC,"Add a Document") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.29.html") ) { return "bc-webservices.09.29.html";}
else if (Guidewire_TopicMatch(TOPIC,"Create an Activity") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.30.html") ) { return "bc-webservices.09.30.html";}
else if (Guidewire_TopicMatch(TOPIC,"Start a Delinquency") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.31.html") ) { return "bc-webservices.09.31.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trigger a Delinquency") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.32.html") ) { return "bc-webservices.09.32.html";}
else if (Guidewire_TopicMatch(TOPIC,"Change Billing Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.33.html") ) { return "bc-webservices.09.33.html";}
else if (Guidewire_TopicMatch(TOPIC,"Create or Cancel a Premium Report Due Date") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.34.html") ) { return "bc-webservices.09.34.html";}
else if (Guidewire_TopicMatch(TOPIC,"Encrypt Data in Staging Tables") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-webservices.09.35.html") ) { return "bc-webservices.09.35.html";}
else if (Guidewire_TopicMatch(TOPIC,"General Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-general.10.1.html") ) { return "webservices-general.10.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Mapping Typecodes to External System Codes") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-general.10.2.html") ) { return "webservices-general.10.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing Administrative Data") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-general.10.3.html") ) { return "webservices-general.10.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Maintenance Tools Web Service") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-general.10.4.html") ) { return "webservices-general.10.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"System Tools Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-general.10.5.html") ) { return "webservices-general.10.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-general.10.6.html") ) { return "webservices-general.10.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Profiling Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"webservices-general.10.7.html") ) { return "webservices-general.10.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"p-plugins.html") ) { return "p-plugins.html";}
else if (Guidewire_TopicMatch(TOPIC,"Plugin Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.01.html") ) { return "plugins.12.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of BillingCenter Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.02.html") ) { return "plugins.12.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Error Handling in Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.03.html") ) { return "plugins.12.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Temporarily Disabling a Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.04.html") ) { return "plugins.12.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Example Gosu Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.05.html") ) { return "plugins.12.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Special Notes For Java Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.06.html") ) { return "plugins.12.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Getting Plugin Parameters from the Plugins Registry Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.07.html") ) { return "plugins.12.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Writing Plugin Templates For Plugins That Take Template Data") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.08.html") ) { return "plugins.12.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Plugin Registry APIs") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.09.html") ) { return "plugins.12.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Plugin Thread Safety") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.10.html") ) { return "plugins.12.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reading System Properties in Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.11.html") ) { return "plugins.12.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Do Not Call Local Web Services From Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.12.html") ) { return "plugins.12.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating Unique Numbers in a Sequence") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.13.html") ) { return "plugins.12.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Restarting and Testing Tips for Plugin Developers") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.14.html") ) { return "plugins.12.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Summary of All BillingCenter Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins.12.15.html") ) { return "plugins.12.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.01.html") ) { return "bc-plugins.13.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Evaluation Calculation Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.02.html") ) { return "bc-plugins.13.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Incentive Calculation Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.03.html") ) { return "bc-plugins.13.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commission Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.04.html") ) { return "bc-plugins.13.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Delinquency Processing Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.05.html") ) { return "bc-plugins.13.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Numbers and Sequences Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.06.html") ) { return "bc-plugins.13.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Parameter Calculation Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.07.html") ) { return "bc-plugins.13.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Instruction Execution Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.08.html") ) { return "bc-plugins.13.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Period Information Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.09.html") ) { return "bc-plugins.13.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Application Event Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.10.html") ) { return "bc-plugins.13.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"ChargeInitializer Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.11.html") ) { return "bc-plugins.13.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Plan Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.12.html") ) { return "bc-plugins.13.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.13.html") ) { return "bc-plugins.13.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Assembler Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.14.html") ) { return "bc-plugins.13.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Stream Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.15.html") ) { return "bc-plugins.13.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Get Invoice Stream Periodicity For an Invoice Stream") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.16.html") ) { return "bc-plugins.13.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Get Existing Matching Invoice Stream") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.17.html") ) { return "bc-plugins.13.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Customize New Invoice Stream") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.18.html") ) { return "bc-plugins.13.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Get Anchor Dates for Custom Periodicities") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.19.html") ) { return "bc-plugins.13.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Item Exception Information Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.20.html") ) { return "bc-plugins.13.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Date Sequence Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.21.html") ) { return "bc-plugins.13.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Cycle Distribution Pre-fill Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.22.html") ) { return "bc-plugins.13.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Report Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.23.html") ) { return "bc-plugins.13.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Information Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.24.html") ) { return "bc-plugins.13.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producer Information Customization Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.25.html") ) { return "bc-plugins.13.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Distribution Limit Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.26.html") ) { return "bc-plugins.13.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"Collateral Cash Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.27.html") ) { return "bc-plugins.13.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Distribution Disposition Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.28.html") ) { return "bc-plugins.13.28.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy System Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.29.html") ) { return "bc-plugins.13.29.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Payment Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.30.html") ) { return "bc-plugins.13.30.html";}
else if (Guidewire_TopicMatch(TOPIC,"Suspense Payment Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.31.html") ) { return "bc-plugins.13.31.html";}
else if (Guidewire_TopicMatch(TOPIC,"Funds Tracking Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.32.html") ) { return "bc-plugins.13.32.html";}
else if (Guidewire_TopicMatch(TOPIC,"How BillingCenter Uses the Funds Tracking Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.33.html") ) { return "bc-plugins.13.33.html";}
else if (Guidewire_TopicMatch(TOPIC,"Writing a Funds Tracking Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.34.html") ) { return "bc-plugins.13.34.html";}
else if (Guidewire_TopicMatch(TOPIC,"How the Funds Tracking Plugin Creates Payment Item Groups") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.35.html") ) { return "bc-plugins.13.35.html";}
else if (Guidewire_TopicMatch(TOPIC,"How the Funds Tracking Plugin Allots Funds") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-plugins.13.36.html") ) { return "bc-plugins.13.36.html";}
else if (Guidewire_TopicMatch(TOPIC,"Authentication Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"authentication.14.1.html") ) { return "authentication.14.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of User Authentication Interfaces") && Guidewire_FMSourceFileMatch(SRCFILE,"authentication.14.2.html") ) { return "authentication.14.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"User Authentication Source Creator Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"authentication.14.3.html") ) { return "authentication.14.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"User Authentication Service Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"authentication.14.4.html") ) { return "authentication.14.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deploying User Authentication Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"authentication.14.5.html") ) { return "authentication.14.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Authentication Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"authentication.14.6.html") ) { return "authentication.14.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Authentication") && Guidewire_FMSourceFileMatch(SRCFILE,"authentication.14.7.html") ) { return "authentication.14.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Management") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.01.html") ) { return "documentsforms.15.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Management Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.02.html") ) { return "documentsforms.15.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Choices for Storing Document Content and Metadata") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.03.html") ) { return "documentsforms.15.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Storage Plugin Architecture") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.04.html") ) { return "documentsforms.15.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Implementing a Document Content Source for External DMS") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.05.html") ) { return "documentsforms.15.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Storing Document Metadata In an External DMS") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.06.html") ) { return "documentsforms.15.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Built-in Document Storage Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.07.html") ) { return "documentsforms.15.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Asynchronous Document Storage") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.08.html") ) { return "documentsforms.15.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"APIs to Attach Documents to Business Objects") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.09.html") ) { return "documentsforms.15.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Retrieval and Rendering of PDF or Other Input Stream Data") && Guidewire_FMSourceFileMatch(SRCFILE,"documentsforms.15.10.html") ) { return "documentsforms.15.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Production") && Guidewire_FMSourceFileMatch(SRCFILE,"documentproduction.16.1.html") ) { return "documentproduction.16.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Production Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"documentproduction.16.2.html") ) { return "documentproduction.16.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Template Descriptors") && Guidewire_FMSourceFileMatch(SRCFILE,"documentproduction.16.3.html") ) { return "documentproduction.16.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generating Documents from Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"documentproduction.16.4.html") ) { return "documentproduction.16.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Encryption Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"encryption.17.1.html") ) { return "encryption.17.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Encryption Integration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"encryption.17.2.html") ) { return "encryption.17.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing Your Encryption Algorithm Later") && Guidewire_FMSourceFileMatch(SRCFILE,"encryption.17.3.html") ) { return "encryption.17.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Encryption Features for Staging Tables") && Guidewire_FMSourceFileMatch(SRCFILE,"encryption.17.4.html") ) { return "encryption.17.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Management Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"management.18.1.html") ) { return "management.18.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Management Integration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"management.18.2.html") ) { return "management.18.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Abstract Management Plugin Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"management.18.3.html") ) { return "management.18.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integrating With the Included JMX Management Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"management.18.4.html") ) { return "management.18.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Other Plugin Interfaces") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.1.html") ) { return "plugins-other.19.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Automatic Address Completion and Fill-in Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.2.html") ) { return "plugins-other.19.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Phone Number Normalizer Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.3.html") ) { return "plugins-other.19.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Testing Clock Plugin (Only For Non-Production Servers)") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.4.html") ) { return "plugins-other.19.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Work Item Priority Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.5.html") ) { return "plugins-other.19.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Official IDs Mapped to Tax IDs Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.6.html") ) { return "plugins-other.19.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Preupdate Handler Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.7.html") ) { return "plugins-other.19.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining Base URLs for Fully-Qualified Domain Names") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.8.html") ) { return "plugins-other.19.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Exception and Escalation Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-other.19.9.html") ) { return "plugins-other.19.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Startable Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-startable.20.1.html") ) { return "plugins-startable.20.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Startable Plugins Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-startable.20.2.html") ) { return "plugins-startable.20.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Writing a Startable Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-startable.20.3.html") ) { return "plugins-startable.20.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Startable Plugins and Run Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-startable.20.4.html") ) { return "plugins-startable.20.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Startable Plugins to Run on All Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-startable.20.5.html") ) { return "plugins-startable.20.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Java and Startable Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-startable.20.6.html") ) { return "plugins-startable.20.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Persistence and Startable Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"plugins-startable.20.7.html") ) { return "plugins-startable.20.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multi-threaded Inbound Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"inbound-integration.21.1.html") ) { return "inbound-integration.21.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multi-threaded Inbound Integration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"inbound-integration.21.2.html") ) { return "inbound-integration.21.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inbound Integration Configuration XML File") && Guidewire_FMSourceFileMatch(SRCFILE,"inbound-integration.21.3.html") ) { return "inbound-integration.21.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inbound File Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"inbound-integration.21.4.html") ) { return "inbound-integration.21.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inbound JMS Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"inbound-integration.21.5.html") ) { return "inbound-integration.21.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Custom Inbound Integrations") && Guidewire_FMSourceFileMatch(SRCFILE,"inbound-integration.21.6.html") ) { return "inbound-integration.21.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding the Polling Interval and Throttle Interval") && Guidewire_FMSourceFileMatch(SRCFILE,"inbound-integration.21.7.html") ) { return "inbound-integration.21.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Messaging") && Guidewire_FMSourceFileMatch(SRCFILE,"p-messaging.html") ) { return "p-messaging.html";}
else if (Guidewire_TopicMatch(TOPIC,"Messaging and Events") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.01.html") ) { return "eventsmessaging.23.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Messaging Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.02.html") ) { return "eventsmessaging.23.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Message Destination Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.03.html") ) { return "eventsmessaging.23.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"List of Messaging Events in BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.04.html") ) { return "eventsmessaging.23.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generating New Messages in Event Fired Rules") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.05.html") ) { return "eventsmessaging.23.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Message Ordering and Multi-Threaded Sending") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.06.html") ) { return "eventsmessaging.23.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Late Binding Data in Your Payload") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.07.html") ) { return "eventsmessaging.23.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reporting Acknowledgements and Errors") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.08.html") ) { return "eventsmessaging.23.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Tracking a Specific Entity With a Message") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.09.html") ) { return "eventsmessaging.23.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Implementing Messaging Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.10.html") ) { return "eventsmessaging.23.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Resynchronizing Messages for a Primary Object") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.11.html") ) { return "eventsmessaging.23.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Message Payload Mapping Utility for Java Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.12.html") ) { return "eventsmessaging.23.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Message Status Code Reference") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.13.html") ) { return "eventsmessaging.23.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring Messages and Handling Errors") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.14.html") ) { return "eventsmessaging.23.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Messaging Tools Web Service") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.15.html") ) { return "eventsmessaging.23.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Mode Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.16.html") ) { return "eventsmessaging.23.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Included Messaging Transports") && Guidewire_FMSourceFileMatch(SRCFILE,"eventsmessaging.23.17.html") ) { return "eventsmessaging.23.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing Billing and Account Data") && Guidewire_FMSourceFileMatch(SRCFILE,"p-importingbillingandaccounts.fm.html") ) { return "p-importingbillingandaccounts.fm.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing from Database Staging Tables") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.01.html") ) { return "databaseimport.25.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction to Database Staging Table Import") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.02.html") ) { return "databaseimport.25.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of a Typical Database Staging Table Import") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.03.html") ) { return "databaseimport.25.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"High-Level Steps in a Typical Database Staging Table Import") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.04.html") ) { return "databaseimport.25.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Detailed Steps in a Typical Database Staging Table Import") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.05.html") ) { return "databaseimport.25.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Import Performance and Statistics") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.06.html") ) { return "databaseimport.25.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Table Import Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.07.html") ) { return "databaseimport.25.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Populating the Staging Tables") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.08.html") ) { return "databaseimport.25.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loading BillingCenter-specific Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.09.html") ) { return "databaseimport.25.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Loadable Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.10.html") ) { return "databaseimport.25.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Derived Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.11.html") ) { return "databaseimport.25.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Non-Loadable Administrative Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.12.html") ) { return "databaseimport.25.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Data Loading Requirements") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.13.html") ) { return "databaseimport.25.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loading Commissions") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.14.html") ) { return "databaseimport.25.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loading Past (Closed) Delinquencies") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.15.html") ) { return "databaseimport.25.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loading Active (Open) Delinquencies") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.16.html") ) { return "databaseimport.25.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loading Agency Bill Data") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.17.html") ) { return "databaseimport.25.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loading Reversals") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.18.html") ) { return "databaseimport.25.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loading Disbursements") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.19.html") ) { return "databaseimport.25.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loading Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.20.html") ) { return "databaseimport.25.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Processing Requirements") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.21.html") ) { return "databaseimport.25.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Integrity Checks") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.22.html") ) { return "databaseimport.25.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Table Import Tips and Troubleshooting") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.23.html") ) { return "databaseimport.25.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Staging Table Import of Encrypted Properties") && Guidewire_FMSourceFileMatch(SRCFILE,"databaseimport.25.24.html") ) { return "databaseimport.25.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Other Integration Topics") && Guidewire_FMSourceFileMatch(SRCFILE,"p-claims.html") ) { return "p-claims.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"contact-integration.27.1.html") ) { return "contact-integration.27.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integrating with a Contact Management System") && Guidewire_FMSourceFileMatch(SRCFILE,"contact-integration.27.2.html") ) { return "contact-integration.27.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Web Service APIs") && Guidewire_FMSourceFileMatch(SRCFILE,"contact-integration.27.3.html") ) { return "contact-integration.27.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Integration between BillingCenter and PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency-bc-pc.28.1.html") ) { return "multicurrency-bc-pc.28.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Set up Currencies for Multicurrency Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency-bc-pc.28.2.html") ) { return "multicurrency-bc-pc.28.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configure Account Numbers for Multicurrency Accounts in BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency-bc-pc.28.3.html") ) { return "multicurrency-bc-pc.28.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Custom Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.01.html") ) { return "batchprocess.29.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Custom Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.02.html") ) { return "batchprocess.29.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Styles of Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.03.html") ) { return "batchprocess.29.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Choosing a Style for Custom Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.04.html") ) { return "batchprocess.29.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Nightly and Daytime Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.05.html") ) { return "batchprocess.29.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Processing Typecodes") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.06.html") ) { return "batchprocess.29.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Developing Custom Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.07.html") ) { return "batchprocess.29.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Custom Work Queue Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.08.html") ) { return "batchprocess.29.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining the Typecode for Your Custom Work Queue") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.09.html") ) { return "batchprocess.29.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining the Work Item Type for Your Custom Work Queue") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.10.html") ) { return "batchprocess.29.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating Your Custom Work Queue Class") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.11.html") ) { return "batchprocess.29.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Developing the Writer for Your Custom Work Queue") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.12.html") ) { return "batchprocess.29.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Developing the Workers for Your Custom Work Queue") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.13.html") ) { return "batchprocess.29.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Example Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.14.html") ) { return "batchprocess.29.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Simple Example of a Work Queue") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.15.html") ) { return "batchprocess.29.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Example Work Queue for Updating Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.16.html") ) { return "batchprocess.29.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Example Work Queue with a Custom Work Item Type") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.17.html") ) { return "batchprocess.29.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Developing Custom Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.18.html") ) { return "batchprocess.29.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Custom Batch Process Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.19.html") ) { return "batchprocess.29.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a Custom Batch Process") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.20.html") ) { return "batchprocess.29.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Process Implementation Using the Batch Process Base Class") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.21.html") ) { return "batchprocess.29.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Example Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.22.html") ) { return "batchprocess.29.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Example Batch Process for a Background Task") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.23.html") ) { return "batchprocess.29.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Example Batch Process for Unit of Work Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.24.html") ) { return "batchprocess.29.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling Custom Batch Processing to Run") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.25.html") ) { return "batchprocess.29.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Categorizing Your Batch Processing Typecode") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.26.html") ) { return "batchprocess.29.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"Updating the Work Queue Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.27.html") ) { return "batchprocess.29.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"Implementing the Processes Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.28.html") ) { return "batchprocess.29.28.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring Batch Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.29.html") ) { return "batchprocess.29.29.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Work Queue Info Page") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.30.html") ) { return "batchprocess.29.30.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Batch Process Info Page") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.31.html") ) { return "batchprocess.29.31.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring for Batch Processing Completion") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.32.html") ) { return "batchprocess.29.32.html";}
else if (Guidewire_TopicMatch(TOPIC,"Maintenance Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.33.html") ) { return "batchprocess.29.33.html";}
else if (Guidewire_TopicMatch(TOPIC,"Process History") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.34.html") ) { return "batchprocess.29.34.html";}
else if (Guidewire_TopicMatch(TOPIC,"Periodic Purging of Batch Processing Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"batchprocess.29.35.html") ) { return "batchprocess.29.35.html";}
else if (Guidewire_TopicMatch(TOPIC,"Servlets") && Guidewire_FMSourceFileMatch(SRCFILE,"servlets.html") ) { return "servlets.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Extraction Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"dataextraction.31.1.html") ) { return "dataextraction.31.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Why Gosu Templates are Useful for Data Extraction") && Guidewire_FMSourceFileMatch(SRCFILE,"dataextraction.31.2.html") ) { return "dataextraction.31.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Extraction Using Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"dataextraction.31.3.html") ) { return "dataextraction.31.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.32.1.html") ) { return "logging.32.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging Overview For Integration Developers") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.32.2.html") ) { return "logging.32.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging Properties File") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.32.3.html") ) { return "logging.32.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging APIs for Java Integration Developers") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.32.4.html") ) { return "logging.32.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Java and OSGi Support") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.01.html") ) { return "java-api.33.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Java and OSGi Support") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.02.html") ) { return "java-api.33.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accessing Entity and Typecode Data in Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.03.html") ) { return "java-api.33.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Regenerating Java API Libraries") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.04.html") ) { return "java-api.33.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entity Packages and Customer Extensions from Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.05.html") ) { return "java-api.33.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typecode Classes from Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.06.html") ) { return "java-api.33.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Comparing Entity Instances and Typecodes") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.07.html") ) { return "java-api.33.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entity Bundles and Transactions from Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.08.html") ) { return "java-api.33.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating New Entity Instances from Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.09.html") ) { return "java-api.33.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Getting and Setting Entity Properties from Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.10.html") ) { return "java-api.33.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Calling Entity Object Methods from Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.11.html") ) { return "java-api.33.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Querying for Entity Data in Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.12.html") ) { return "java-api.33.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accessing Gosu Classes from Java Using Reflection") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.13.html") ) { return "java-api.33.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Enhancement Properties and Methods in Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.14.html") ) { return "java-api.33.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Class Loading and Delegation for non-OSGi Java") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.15.html") ) { return "java-api.33.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deploying Non-OSGi Java Classes and JARs") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.16.html") ) { return "java-api.33.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"OSGi Plugin Deployment with IntelliJ IDEA with OSGi Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.17.html") ) { return "java-api.33.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Advanced OSGi Dependency and Settings Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.18.html") ) { return "java-api.33.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Updating Your OSGi Plugin Project After Product Location Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"java-api.33.19.html") ) { return "java-api.33.19.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if(P=="Built-in_Web_Services")C="webservices.06.4.html";
if(P=="Web_Service_and_SOAP_Entity_Overview")C="webservices-wsi-publish.07.02.html";
if(P=="MTOM_Attachments")C="webservice-wsi-consuming.08.5.html";
if(P=="Implementing_Java_Plugins")C="plugins.12.06.html";
if(P=="The_Plugin_Registry")C="plugins.12.09.html";
if(P=="Plugin_Thread_Safety_and_Static_Variables")C="plugins.12.10.html";
if(P=="Plugin_Thread_Safety")C="plugins.12.10.html";
if(P=="Do_Not_Call_Local_SOAP_APIs_From_Plugins")C="plugins.12.12.html";
if(P=="The_Behavior_of_Built-in_Document_Storage_Plugins")C="documentsforms.15.07.html";
if(P=="GScript-Initiated_Automatic_Document_Generation")C="documentproduction.16.4.html";
if(P=="Property_Encryption_Integration")C="encryption.17.2.html";
if(P=="Property_Level_Encryption_Integration")C="encryption.17.2.html";
if(P=="Custom_Inbound_Integration_with_InboundIntegrationPlugin")C="inbound-integration.21.6.html";
if(P=="What_Events_Might_Be_Generated")C="eventsmessaging.23.04.html";
if(P=="Generating_Your_Message_Payload")C="eventsmessaging.23.05.html";
if(P=="Using_Rules_to_Generating_Messages")C="eventsmessaging.23.05.html";
if(P=="Message_Ordering")C="eventsmessaging.23.06.html";
if(P=="Overview_of_Messages")C="eventsmessaging.23.06.html";
if(P=="Late_Binding_Fields")C="eventsmessaging.23.07.html";
if(P=="Early_Binding_and_Late_Binding")C="eventsmessaging.23.07.html";
if(P=="Resyncing_Messages")C="eventsmessaging.23.11.html";
if(P=="Address_Book_Integration")C="contact-integration.27.1.html";
if(P=="Web_Service_API_Data_Extraction")C="dataextraction.31.3.html";
if(P=="Deploying_Java_Code_in_BillingCenter")C="java-api.33.01.html";
if(P=="Deploying_Java_Code_in_PolicyCenter")C="java-api.33.01.html";
if(P=="Deploying_Java_Code_in_ClaimCenter")C="java-api.33.01.html";
if(P=="Accessing_Gosu_Classes_from_Java_Using_Reflection")C="java-api.33.13.html";
if(P=="Gosu_Enhancements_in_the_Entity_Libraries")C="java-api.33.14.html";
if(P=="Gosu-to-Java_Class_Deployment")C="java-api.33.16.html";
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
