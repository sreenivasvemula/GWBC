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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-config.html") ) { return "cover-config.html";}
else if (Guidewire_TopicMatch(TOPIC,"About BillingCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Configuration Basics") && Guidewire_FMSourceFileMatch(SRCFILE,"p-basics.html") ) { return "p-basics.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of BillingCenter Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.1.html") ) { return "overview.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"What You Can Configure") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.2.html") ) { return "overview.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"How You Configure BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.3.html") ) { return "overview.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Types of Application Environments") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.4.html") ) { return "overview.04.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deploying Configuration Files") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.5.html") ) { return "overview.04.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Regenerating the Data Dictionary and Security Dictionary") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.6.html") ) { return "overview.04.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing Configuration Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"overview.04.7.html") ) { return "overview.04.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Application Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.01.html") ) { return "params.05.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.02.html") ) { return "params.05.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assignment Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.03.html") ) { return "params.05.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Process Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.04.html") ) { return "params.05.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Business Calendar Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.05.html") ) { return "params.05.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cache Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.06.html") ) { return "params.05.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Clustering Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.07.html") ) { return "params.05.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.08.html") ) { return "params.05.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Creation and Document Management Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.09.html") ) { return "params.05.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Domain Graph Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.10.html") ) { return "params.05.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Environment Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.11.html") ) { return "params.05.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Financial Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.12.html") ) { return "params.05.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Globalization Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.13.html") ) { return "params.05.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.14.html") ) { return "params.05.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.15.html") ) { return "params.05.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Miscellaneous Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.16.html") ) { return "params.05.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"PDF Print Settings Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.17.html") ) { return "params.05.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Scheduler and Workflow Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.18.html") ) { return "params.05.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Search Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.19.html") ) { return "params.05.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.20.html") ) { return "params.05.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"User Interface Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.21.html") ) { return "params.05.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Work Queue Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"params.05.22.html") ) { return "params.05.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Guidewire Development Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"p-datamodel.html") ) { return "p-datamodel.html";}
else if (Guidewire_TopicMatch(TOPIC,"Getting Started") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.01.html") ) { return "studio.07.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"What Is Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.02.html") ) { return "studio.07.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Studio Development Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.03.html") ) { return "studio.07.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the QuickStart Development Server") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.04.html") ) { return "studio.07.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Configuration Files") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.05.html") ) { return "studio.07.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Studio with IntelliJ IDEA Ultimate Edition") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.06.html") ) { return "studio.07.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Studio and the DCE VM") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.07.html") ) { return "studio.07.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Starting Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.08.html") ) { return "studio.07.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Restarting Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.09.html") ) { return "studio.07.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Studio Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"studio.07.10.html") ) { return "studio.07.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working in Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.01.html") ) { return "studio_using.08.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entering Valid Code") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.02.html") ) { return "studio_using.08.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accessing Reference Information") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.03.html") ) { return "studio_using.08.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Studio Keyboard Shortcuts") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.04.html") ) { return "studio_using.08.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Keyboard Shortcuts in BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.05.html") ) { return "studio_using.08.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Text Editing Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.06.html") ) { return "studio_using.08.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Navigating Tables") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.07.html") ) { return "studio_using.08.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Refactoring Gosu Code") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.08.html") ) { return "studio_using.08.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Saving Your Work") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.09.html") ) { return "studio_using.08.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validating Studio Resources") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_using.08.10.html") ) { return "studio_using.08.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_configure.09.1.html") ) { return "studio_configure.09.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Improving Studio Performance") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_configure.09.2.html") ) { return "studio_configure.09.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Font Display Options") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_configure.09.3.html") ) { return "studio_configure.09.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Studio and Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.01.html") ) { return "building_blocks.10.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Building Blocks") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.02.html") ) { return "building_blocks.10.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Case Sensitivity") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.03.html") ) { return "building_blocks.10.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Gosu in BillingCenter Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.04.html") ) { return "building_blocks.10.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Packages") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.05.html") ) { return "building_blocks.10.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Classes") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.06.html") ) { return "building_blocks.10.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Base Configuration Classes") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.07.html") ) { return "building_blocks.10.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Class Visibility in Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.08.html") ) { return "building_blocks.10.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Preloading Gosu Classes") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.09.html") ) { return "building_blocks.10.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Enhancements") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.10.html") ) { return "building_blocks.10.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Guidewire XML Model") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.11.html") ) { return "building_blocks.10.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Script Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.12.html") ) { return "building_blocks.10.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Script Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.13.html") ) { return "building_blocks.10.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Referencing a Script Parameter in Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"building_blocks.10.14.html") ) { return "building_blocks.10.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Studio Editors") && Guidewire_FMSourceFileMatch(SRCFILE,"p-editors.html") ) { return "p-editors.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Studio Editors") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_editors.12.1.html") ) { return "studio_editors.12.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing in Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_editors.12.2.html") ) { return "studio_editors.12.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working in the Gosu Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_editors.12.3.html") ) { return "studio_editors.12.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Plugins Registry Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_plugins.13.1.html") ) { return "studio_plugins.13.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"What Are Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_plugins.13.2.html") ) { return "studio_plugins.13.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_plugins.13.3.html") ) { return "studio_plugins.13.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Customizing Plugin Functionality") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_plugins.13.4.html") ) { return "studio_plugins.13.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Plugin Versions") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_plugins.13.5.html") ) { return "studio_plugins.13.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_web_services.14.1.html") ) { return "studio_web_services.14.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Web Services and Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_web_services.14.2.html") ) { return "studio_web_services.14.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Web Service Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_web_services.14.3.html") ) { return "studio_web_services.14.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining a Web Service Collection") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_web_services.14.4.html") ) { return "studio_web_services.14.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Implementing QuickJump Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_quickjump.15.1.html") ) { return "studio_quickjump.15.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"What Is QuickJump") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_quickjump.15.2.html") ) { return "studio_quickjump.15.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a QuickJump Navigation Command") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_quickjump.15.3.html") ) { return "studio_quickjump.15.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Implementing QuickJumpCommandRef Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_quickjump.15.4.html") ) { return "studio_quickjump.15.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Implementing StaticNavigationCommandRef Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_quickjump.15.5.html") ) { return "studio_quickjump.15.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Implementing ContextualNavigationCommandRef Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_quickjump.15.6.html") ) { return "studio_quickjump.15.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking Permissions on QuickJump Navigation Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_quickjump.15.7.html") ) { return "studio_quickjump.15.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Entity Names Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_entity_names.16.1.html") ) { return "studio_entity_names.16.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entity Names Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_entity_names.16.2.html") ) { return "studio_entity_names.16.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Variable Table") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_entity_names.16.3.html") ) { return "studio_entity_names.16.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Text Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_entity_names.16.4.html") ) { return "studio_entity_names.16.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Including Data from Subentities") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_entity_names.16.5.html") ) { return "studio_entity_names.16.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entity Name Types") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_entity_names.16.6.html") ) { return "studio_entity_names.16.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Messaging Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_messaging.17.1.html") ) { return "studio_messaging.17.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Messaging Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_messaging.17.2.html") ) { return "studio_messaging.17.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Display Keys Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_displaykey_editor.18.1.html") ) { return "studio_displaykey_editor.18.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Display Keys Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_displaykey_editor.18.2.html") ) { return "studio_displaykey_editor.18.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating Display Keys in a Gosu Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_displaykey_editor.18.3.html") ) { return "studio_displaykey_editor.18.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Retrieving the Value of a Display Key") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_displaykey_editor.18.4.html") ) { return "studio_displaykey_editor.18.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Model Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-datamodel_2.html") ) { return "p-datamodel_2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Data Dictionary") && Guidewire_FMSourceFileMatch(SRCFILE,"data_dictionary.20.1.html") ) { return "data_dictionary.20.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"What is the Data Dictionary") && Guidewire_FMSourceFileMatch(SRCFILE,"data_dictionary.20.2.html") ) { return "data_dictionary.20.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"What Can You View in the Data Dictionary") && Guidewire_FMSourceFileMatch(SRCFILE,"data_dictionary.20.3.html") ) { return "data_dictionary.20.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Data Dictionary") && Guidewire_FMSourceFileMatch(SRCFILE,"data_dictionary.20.4.html") ) { return "data_dictionary.20.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"The BillingCenter Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.01.html") ) { return "entities.21.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"What is the Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.02.html") ) { return "entities.21.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Data Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.03.html") ) { return "entities.21.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Base BillingCenter Data Objects") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.04.html") ) { return "entities.21.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Object Subelements") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.05.html") ) { return "entities.21.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"(array)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.06.html") ) { return "entities.21.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"(column)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.07.html") ) { return "entities.21.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"(edgeForeignKey)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.08.html") ) { return "entities.21.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"(events)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.09.html") ) { return "entities.21.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"(foreignkey)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.10.html") ) { return "entities.21.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"(fulldescription)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.11.html") ) { return "entities.21.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"(implementsEntity)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.12.html") ) { return "entities.21.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"(implementsInterface)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.13.html") ) { return "entities.21.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"(index)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.14.html") ) { return "entities.21.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"(onetoone)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.15.html") ) { return "entities.21.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"(remove-index)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.16.html") ) { return "entities.21.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"(tag)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.17.html") ) { return "entities.21.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"(typekey)") && Guidewire_FMSourceFileMatch(SRCFILE,"entities.21.18.html") ) { return "entities.21.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Associative Arrays") && Guidewire_FMSourceFileMatch(SRCFILE,"associative_arrays.22.1.html") ) { return "associative_arrays.22.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Associative Arrays") && Guidewire_FMSourceFileMatch(SRCFILE,"associative_arrays.22.2.html") ) { return "associative_arrays.22.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Subtype Mapping Associative Arrays") && Guidewire_FMSourceFileMatch(SRCFILE,"associative_arrays.22.3.html") ) { return "associative_arrays.22.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typelist Mapping Associative Arrays") && Guidewire_FMSourceFileMatch(SRCFILE,"associative_arrays.22.4.html") ) { return "associative_arrays.22.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying the Base Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.01.html") ) { return "extenddm.23.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Planning Changes to the Base Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.02.html") ) { return "extenddm.23.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining a New Data Entity") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.03.html") ) { return "extenddm.23.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extending a Base Configuration Entity") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.04.html") ) { return "extenddm.23.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Attribute Overrides") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.05.html") ) { return "extenddm.23.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extending the Base Data Model: Examples") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.06.html") ) { return "extenddm.23.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a New Delegate Object") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.07.html") ) { return "extenddm.23.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extending a Delegate Object") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.08.html") ) { return "extenddm.23.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining a Subtype") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.09.html") ) { return "extenddm.23.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining a Reference Entity") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.10.html") ) { return "extenddm.23.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining an Entity Array") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.11.html") ) { return "extenddm.23.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Implementing a Many-to-Many Relationship Between Entity Types") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.12.html") ) { return "extenddm.23.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extending an Existing View Entity") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.13.html") ) { return "extenddm.23.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Removing Objects from the Base Configuration Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.14.html") ) { return "extenddm.23.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deploying Data Model Changes to the Application Server") && Guidewire_FMSourceFileMatch(SRCFILE,"extenddm.23.15.html") ) { return "extenddm.23.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Types") && Guidewire_FMSourceFileMatch(SRCFILE,"datatypes.24.1.html") ) { return "datatypes.24.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Data Types") && Guidewire_FMSourceFileMatch(SRCFILE,"datatypes.24.2.html") ) { return "datatypes.24.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Data Types Configuration File") && Guidewire_FMSourceFileMatch(SRCFILE,"datatypes.24.3.html") ) { return "datatypes.24.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Customizing Base Configuration Data Types") && Guidewire_FMSourceFileMatch(SRCFILE,"datatypes.24.4.html") ) { return "datatypes.24.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Medium Text Data Type (Oracle)") && Guidewire_FMSourceFileMatch(SRCFILE,"datatypes.24.5.html") ) { return "datatypes.24.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Data Type API") && Guidewire_FMSourceFileMatch(SRCFILE,"datatypes.24.6.html") ) { return "datatypes.24.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining a New Data Type: Required Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"datatypes.24.7.html") ) { return "datatypes.24.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining a New Tax Identification Number Data Type") && Guidewire_FMSourceFileMatch(SRCFILE,"datatypes.24.8.html") ) { return "datatypes.24.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Field Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"fieldvalidators.25.1.html") ) { return "fieldvalidators.25.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Field Validators") && Guidewire_FMSourceFileMatch(SRCFILE,"fieldvalidators.25.2.html") ) { return "fieldvalidators.25.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Field Validator Definitions") && Guidewire_FMSourceFileMatch(SRCFILE,"fieldvalidators.25.3.html") ) { return "fieldvalidators.25.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"(FieldValidators)") && Guidewire_FMSourceFileMatch(SRCFILE,"fieldvalidators.25.4.html") ) { return "fieldvalidators.25.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying Field Validators") && Guidewire_FMSourceFileMatch(SRCFILE,"fieldvalidators.25.5.html") ) { return "fieldvalidators.25.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Typelists") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.01.html") ) { return "studio_typelist.26.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"What is a Typelist") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.02.html") ) { return "studio_typelist.26.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Terms Related to Typelists") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.03.html") ) { return "studio_typelist.26.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typelists and Typecodes") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.04.html") ) { return "studio_typelist.26.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typelist Definition Files") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.05.html") ) { return "studio_typelist.26.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Different Kinds of Typelists") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.06.html") ) { return "studio_typelist.26.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Typelists in Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.07.html") ) { return "studio_typelist.26.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typekey Fields") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.08.html") ) { return "studio_typelist.26.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Removing or Retiring a Typekey") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.09.html") ) { return "studio_typelist.26.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typelist Filters") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.10.html") ) { return "studio_typelist.26.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Static Filters") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.11.html") ) { return "studio_typelist.26.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Dynamic Filters") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.12.html") ) { return "studio_typelist.26.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typecode References in Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.13.html") ) { return "studio_typelist.26.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Mapping Typecodes to External System Codes") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_typelist.26.14.html") ) { return "studio_typelist.26.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"User Interface Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-ui.html") ) { return "p-ui.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the PCF Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.01.html") ) { return "studio_pcf.28.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Page Configuration (PCF) Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.02.html") ) { return "studio_pcf.28.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Page Canvas Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.03.html") ) { return "studio_pcf.28.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a New PCF File") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.04.html") ) { return "studio_pcf.28.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Shared or Included Files") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.05.html") ) { return "studio_pcf.28.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Page Config Menu") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.06.html") ) { return "studio_pcf.28.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Toolbox Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.07.html") ) { return "studio_pcf.28.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Structure Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.08.html") ) { return "studio_pcf.28.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Properties Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.09.html") ) { return "studio_pcf.28.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"PCF Elements") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.10.html") ) { return "studio_pcf.28.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Elements") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_pcf.28.11.html") ) { return "studio_pcf.28.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction to Page Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"pageconfig.29.1.html") ) { return "pageconfig.29.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Page Configuration Files") && Guidewire_FMSourceFileMatch(SRCFILE,"pageconfig.29.2.html") ) { return "pageconfig.29.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Page Configuration Elements") && Guidewire_FMSourceFileMatch(SRCFILE,"pageconfig.29.3.html") ) { return "pageconfig.29.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Getting Started Configuring Pages") && Guidewire_FMSourceFileMatch(SRCFILE,"pageconfig.29.4.html") ) { return "pageconfig.29.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying Style and Theme Elements") && Guidewire_FMSourceFileMatch(SRCFILE,"pageconfig.29.5.html") ) { return "pageconfig.29.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Panels") && Guidewire_FMSourceFileMatch(SRCFILE,"panels.30.1.html") ) { return "panels.30.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Panel Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"panels.30.2.html") ) { return "panels.30.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Detail View Panel") && Guidewire_FMSourceFileMatch(SRCFILE,"panels.30.3.html") ) { return "panels.30.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"List View Panel") && Guidewire_FMSourceFileMatch(SRCFILE,"panels.30.4.html") ) { return "panels.30.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Location Groups") && Guidewire_FMSourceFileMatch(SRCFILE,"locationgroups.31.1.html") ) { return "locationgroups.31.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Location Group Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"locationgroups.31.2.html") ) { return "locationgroups.31.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Define a Location Group") && Guidewire_FMSourceFileMatch(SRCFILE,"locationgroups.31.3.html") ) { return "locationgroups.31.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Location Groups as Navigation") && Guidewire_FMSourceFileMatch(SRCFILE,"locationgroups.31.4.html") ) { return "locationgroups.31.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Navigation") && Guidewire_FMSourceFileMatch(SRCFILE,"nav.32.1.html") ) { return "nav.32.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Navigation Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"nav.32.2.html") ) { return "nav.32.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Tab Bars") && Guidewire_FMSourceFileMatch(SRCFILE,"nav.32.3.html") ) { return "nav.32.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Tabs") && Guidewire_FMSourceFileMatch(SRCFILE,"nav.32.4.html") ) { return "nav.32.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Search Functionality") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.1.html") ) { return "search.33.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Search Functionality") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.2.html") ) { return "search.33.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring BillingCenter Search") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.3.html") ) { return "search.33.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Search Criteria in XML") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.4.html") ) { return "search.33.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"The (CriteriaDef) Element") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.5.html") ) { return "search.33.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"The (Criterion) Subelement") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.6.html") ) { return "search.33.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Search Criteria in Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.7.html") ) { return "search.33.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"The SearchMethods Class") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.8.html") ) { return "search.33.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Search Criteria Validation Upon Server Start-up") && Guidewire_FMSourceFileMatch(SRCFILE,"search.33.9.html") ) { return "search.33.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Special Page Functions") && Guidewire_FMSourceFileMatch(SRCFILE,"pagefunc.34.1.html") ) { return "pagefunc.34.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding Print Capabilities") && Guidewire_FMSourceFileMatch(SRCFILE,"pagefunc.34.2.html") ) { return "pagefunc.34.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Linking to a Specific Page: Using an EntryPoint PCF") && Guidewire_FMSourceFileMatch(SRCFILE,"pagefunc.34.3.html") ) { return "pagefunc.34.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Linking to a Specific Page: Using an ExitPoint PCF") && Guidewire_FMSourceFileMatch(SRCFILE,"pagefunc.34.4.html") ) { return "pagefunc.34.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow and Activity Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-workflow.html") ) { return "p-workflow.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Workflow Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_workflow.36.1.html") ) { return "studio_workflow.36.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow in Guidewire BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_workflow.36.2.html") ) { return "studio_workflow.36.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow in Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_workflow.36.3.html") ) { return "studio_workflow.36.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Workflow Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_workflow.36.4.html") ) { return "studio_workflow.36.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Workflow Right-Click Menu") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_workflow.36.5.html") ) { return "studio_workflow.36.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Search with Workflow") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_workflow.36.6.html") ) { return "studio_workflow.36.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Workflow") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.01.html") ) { return "workflow.37.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Workflow") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.02.html") ) { return "workflow.37.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Instances") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.03.html") ) { return "workflow.37.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Work Items") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.04.html") ) { return "workflow.37.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Process Format") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.05.html") ) { return "workflow.37.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.06.html") ) { return "workflow.37.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Versioning") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.07.html") ) { return "workflow.37.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Localization") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.08.html") ) { return "workflow.37.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Structural Elements") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.09.html") ) { return "workflow.37.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"(Context)") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.10.html") ) { return "workflow.37.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"(Start)") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.11.html") ) { return "workflow.37.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"(Finish)") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.12.html") ) { return "workflow.37.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Common Step Elements") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.13.html") ) { return "workflow.37.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enter and Exit Scripts") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.14.html") ) { return "workflow.37.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Asserts") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.15.html") ) { return "workflow.37.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Events") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.16.html") ) { return "workflow.37.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Notifications") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.17.html") ) { return "workflow.37.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Branch IDs") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.18.html") ) { return "workflow.37.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Basic Workflow Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.19.html") ) { return "workflow.37.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"AutoStep") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.20.html") ) { return "workflow.37.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"MessageStep") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.21.html") ) { return "workflow.37.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"ActivityStep") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.22.html") ) { return "workflow.37.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"ManualStep") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.23.html") ) { return "workflow.37.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Outcome") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.24.html") ) { return "workflow.37.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Step Branches") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.25.html") ) { return "workflow.37.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Branch IDs") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.26.html") ) { return "workflow.37.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"GO") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.27.html") ) { return "workflow.37.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"TRIGGER") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.28.html") ) { return "workflow.37.28.html";}
else if (Guidewire_TopicMatch(TOPIC,"TIMEOUT") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.29.html") ) { return "workflow.37.29.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating New Workflows") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.30.html") ) { return "workflow.37.30.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extending a Workflow: A Simple Example") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.31.html") ) { return "workflow.37.31.html";}
else if (Guidewire_TopicMatch(TOPIC,"Instantiating a Workflow") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.32.html") ) { return "workflow.37.32.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Workflow Engine") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.33.html") ) { return "workflow.37.33.html";}
else if (Guidewire_TopicMatch(TOPIC,"Synchronicity, Transactions, and Errors") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.34.html") ) { return "workflow.37.34.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Subflows") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.35.html") ) { return "workflow.37.35.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Administration") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.36.html") ) { return "workflow.37.36.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Debugging, Logging, and Testing") && Guidewire_FMSourceFileMatch(SRCFILE,"workflow.37.37.html") ) { return "workflow.37.37.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining Activity Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"activity-patterns.38.1.html") ) { return "activity-patterns.38.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"What is an Activity Pattern") && Guidewire_FMSourceFileMatch(SRCFILE,"activity-patterns.38.2.html") ) { return "activity-patterns.38.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Pattern Types and Categories") && Guidewire_FMSourceFileMatch(SRCFILE,"activity-patterns.38.3.html") ) { return "activity-patterns.38.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Activity Patterns in Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"activity-patterns.38.4.html") ) { return "activity-patterns.38.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Calculating Activity Due Dates") && Guidewire_FMSourceFileMatch(SRCFILE,"activity-patterns.38.5.html") ) { return "activity-patterns.38.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Activity Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"activity-patterns.38.6.html") ) { return "activity-patterns.38.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Activity Patterns with Documents and Emails") && Guidewire_FMSourceFileMatch(SRCFILE,"activity-patterns.38.7.html") ) { return "activity-patterns.38.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Activity Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"activity-patterns.38.8.html") ) { return "activity-patterns.38.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Testing Gosu Code") && Guidewire_FMSourceFileMatch(SRCFILE,"p-testing.html") ) { return "p-testing.html";}
else if (Guidewire_TopicMatch(TOPIC,"Testing and Debugging Your Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.1.html") ) { return "studio_debugging.40.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Testing BillingCenter With Guidewire Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.2.html") ) { return "studio_debugging.40.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Studio Debugger") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.3.html") ) { return "studio_debugging.40.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Breakpoints") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.4.html") ) { return "studio_debugging.40.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Stepping Through Code") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.5.html") ) { return "studio_debugging.40.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Current Values") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.6.html") ) { return "studio_debugging.40.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Resuming Execution") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.7.html") ) { return "studio_debugging.40.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Gosu Scratchpad") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.8.html") ) { return "studio_debugging.40.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Suggestions for Testing Rules") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_debugging.40.9.html") ) { return "studio_debugging.40.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using GUnit") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.01.html") ) { return "studio_GUnit_tester.41.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"The TestBase Class") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.02.html") ) { return "studio_GUnit_tester.41.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overriding TestBase Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.03.html") ) { return "studio_GUnit_tester.41.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring the Server Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.04.html") ) { return "studio_GUnit_tester.41.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring the Test Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.05.html") ) { return "studio_GUnit_tester.41.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.06.html") ) { return "studio_GUnit_tester.41.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a GUnit Test Class") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.07.html") ) { return "studio_GUnit_tester.41.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Entity Builders to Create Test Data") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.08.html") ) { return "studio_GUnit_tester.41.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating an Entity Builder") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.09.html") ) { return "studio_GUnit_tester.41.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entity Builder Examples") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.10.html") ) { return "studio_GUnit_tester.41.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating New Builders") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_GUnit_tester.41.11.html") ) { return "studio_GUnit_tester.41.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-BillingCenter.html") ) { return "p-BillingCenter.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Workflows and Delinquency Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-workflow.43.1.html") ) { return "bc-workflow.43.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflows in BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-workflow.43.2.html") ) { return "bc-workflow.43.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Workflows and Delinquency Events") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-workflow.43.3.html") ) { return "bc-workflow.43.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a New Delinquency Plan: An Example") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-workflow.43.4.html") ) { return "bc-workflow.43.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring the Charge Invoicing Process") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_invoicing_process.44.1.html") ) { return "charge_invoicing_process.44.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Charge Invoicing Process for New Charges") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_invoicing_process.44.2.html") ) { return "charge_invoicing_process.44.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Expected Results and Plugin Customizations") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_invoicing_process.44.3.html") ) { return "charge_invoicing_process.44.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying an Existing Charge") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_invoicing_process.44.4.html") ) { return "charge_invoicing_process.44.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extension Properties for Charge and InvoiceItem Objects") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_invoicing_process.44.5.html") ) { return "charge_invoicing_process.44.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Invoicing and Payment Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_invoicing_process.44.6.html") ) { return "charge_invoicing_process.44.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Plan Modifiers") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_invoicing_process.44.7.html") ) { return "charge_invoicing_process.44.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"InvoiceStream and DateSequence Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_invoicing_process.44.8.html") ) { return "charge_invoicing_process.44.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Payment Allocation Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"cash-handling-config-bc.45.1.html") ) { return "cash-handling-config-bc.45.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Allocation Plan Configuration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"cash-handling-config-bc.45.2.html") ) { return "cash-handling-config-bc.45.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Writing an Invoice Item Filter") && Guidewire_FMSourceFileMatch(SRCFILE,"cash-handling-config-bc.45.3.html") ) { return "cash-handling-config-bc.45.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Ordering of Invoice Items") && Guidewire_FMSourceFileMatch(SRCFILE,"cash-handling-config-bc.45.4.html") ) { return "cash-handling-config-bc.45.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying the DirectBillPayment Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"cash-handling-config-bc.45.5.html") ) { return "cash-handling-config-bc.45.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Distributions") && Guidewire_FMSourceFileMatch(SRCFILE,"distributions.46.1.html") ) { return "distributions.46.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying Direct Bill Payment and Credit Distributions") && Guidewire_FMSourceFileMatch(SRCFILE,"distributions.46.2.html") ) { return "distributions.46.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying Agency Bill Payment and Credit Distributions") && Guidewire_FMSourceFileMatch(SRCFILE,"distributions.46.3.html") ) { return "distributions.46.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying Agency Bill Promise Distributions") && Guidewire_FMSourceFileMatch(SRCFILE,"distributions.46.4.html") ) { return "distributions.46.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Write-Offs") && Guidewire_FMSourceFileMatch(SRCFILE,"writeoffs.47.1.html") ) { return "writeoffs.47.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commission Write-Offs") && Guidewire_FMSourceFileMatch(SRCFILE,"writeoffs.47.2.html") ) { return "writeoffs.47.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producer Write-Offs") && Guidewire_FMSourceFileMatch(SRCFILE,"writeoffs.47.3.html") ) { return "writeoffs.47.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Credit Handling") && Guidewire_FMSourceFileMatch(SRCFILE,"credit-handling-config_bc.48.1.html") ) { return "credit-handling-config_bc.48.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining New Return Premium Plan Property Settings") && Guidewire_FMSourceFileMatch(SRCFILE,"credit-handling-config_bc.48.2.html") ) { return "credit-handling-config_bc.48.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining New Excess Treatment Settings") && Guidewire_FMSourceFileMatch(SRCFILE,"credit-handling-config_bc.48.3.html") ) { return "credit-handling-config_bc.48.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Identifying Eligible Invoice Items") && Guidewire_FMSourceFileMatch(SRCFILE,"credit-handling-config_bc.48.4.html") ) { return "credit-handling-config_bc.48.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Credit Allocation") && Guidewire_FMSourceFileMatch(SRCFILE,"credit-handling-config_bc.48.5.html") ) { return "credit-handling-config_bc.48.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Multicurrency") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency-config-bc.49.1.html") ) { return "multicurrency-config-bc.49.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring BillingCenter with a Single Currency") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency-config-bc.49.2.html") ) { return "multicurrency-config-bc.49.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring BillingCenter with Multiple Currencies") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency-config-bc.49.3.html") ) { return "multicurrency-config-bc.49.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling Multicurrency Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency-config-bc.49.4.html") ) { return "multicurrency-config-bc.49.4.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if(P=="Field_Validator_Extensions")C="fieldvalidators.25.1.html";
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
