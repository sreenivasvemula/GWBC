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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire BillingCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-app.html") ) { return "cover-app.html";}
else if (Guidewire_TopicMatch(TOPIC,"About BillingCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction") && Guidewire_FMSourceFileMatch(SRCFILE,"p-intro.html") ) { return "p-intro.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Functionality") && Guidewire_FMSourceFileMatch(SRCFILE,"intro_functionality.04.1.html") ) { return "intro_functionality.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"A Web\u2011Based Billing System") && Guidewire_FMSourceFileMatch(SRCFILE,"intro_functionality.04.2.html") ) { return "intro_functionality.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commissions") && Guidewire_FMSourceFileMatch(SRCFILE,"intro_functionality.04.3.html") ) { return "intro_functionality.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Architecture and the Billing Lifecycle") && Guidewire_FMSourceFileMatch(SRCFILE,"intro_bc_architecture.05.1.html") ) { return "intro_bc_architecture.05.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Architecture Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"intro_bc_architecture.05.2.html") ) { return "intro_bc_architecture.05.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Lifecycle") && Guidewire_FMSourceFileMatch(SRCFILE,"intro_bc_architecture.05.3.html") ) { return "intro_bc_architecture.05.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accounting Structure") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts_trxs.06.1.html") ) { return "accounts_trxs.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Internal Accounting System") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts_trxs.06.2.html") ) { return "accounts_trxs.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with T-accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts_trxs.06.3.html") ) { return "accounts_trxs.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_transactions.07.1.html") ) { return "bc_transactions.07.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Key Transaction Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_transactions.07.2.html") ) { return "bc_transactions.07.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_transactions.07.3.html") ) { return "bc_transactions.07.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Transaction Table") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_transactions.07.4.html") ) { return "bc_transactions.07.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Key BillingCenter Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"terms_and%20_entities.08.1.html") ) { return "terms_and%20_entities.08.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Key Setup Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"terms_and%20_entities.08.2.html") ) { return "terms_and%20_entities.08.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Key Billing Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"terms_and%20_entities.08.3.html") ) { return "terms_and%20_entities.08.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Key Payment Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"terms_and%20_entities.08.4.html") ) { return "terms_and%20_entities.08.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"p-highlevelui.html") ) { return "p-highlevelui.html";}
else if (Guidewire_TopicMatch(TOPIC,"Navigating BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_user_interface.10.1.html") ) { return "bc_user_interface.10.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging in to BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_user_interface.10.2.html") ) { return "bc_user_interface.10.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Preferences") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_user_interface.10.3.html") ) { return "bc_user_interface.10.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Selecting International Settings in BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_user_interface.10.4.html") ) { return "bc_user_interface.10.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Common Areas in the BillingCenter User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_user_interface.10.5.html") ) { return "bc_user_interface.10.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Tabs") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_user_interface.10.6.html") ) { return "bc_user_interface.10.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Auto Complete") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_user_interface.10.7.html") ) { return "bc_user_interface.10.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging out of BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_user_interface.10.8.html") ) { return "bc_user_interface.10.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Screen Layout") && Guidewire_FMSourceFileMatch(SRCFILE,"screenlayout.11.1.html") ) { return "screenlayout.11.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adjusting List Views") && Guidewire_FMSourceFileMatch(SRCFILE,"screenlayout.11.2.html") ) { return "screenlayout.11.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Sidebar Width") && Guidewire_FMSourceFileMatch(SRCFILE,"screenlayout.11.3.html") ) { return "screenlayout.11.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing Layout Preferences") && Guidewire_FMSourceFileMatch(SRCFILE,"screenlayout.11.4.html") ) { return "screenlayout.11.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"QuickJump") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.12.1.html") ) { return "quickjump.12.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"QuickJump Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.12.2.html") ) { return "quickjump.12.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using QuickJump") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.12.3.html") ) { return "quickjump.12.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"QuickJump Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.12.4.html") ) { return "quickjump.12.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"QuickJump Reference") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.12.5.html") ) { return "quickjump.12.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Saving Your Work") && Guidewire_FMSourceFileMatch(SRCFILE,"autosave.html") ) { return "autosave.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accounts, Policies, and Producers") && Guidewire_FMSourceFileMatch(SRCFILE,"p_accts_policies_prods.html") ) { return "p_accts_policies_prods.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts.15.1.html") ) { return "accounts.15.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accounts Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts.15.2.html") ) { return "accounts.15.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a New Account") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts.15.3.html") ) { return "accounts.15.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Summary Information") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts.15.4.html") ) { return "accounts.15.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for an Existing Account") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts.15.5.html") ) { return "accounts.15.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing Existing Account Information") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts.15.6.html") ) { return "accounts.15.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Closing an Account") && Guidewire_FMSourceFileMatch(SRCFILE,"accounts.15.7.html") ) { return "accounts.15.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.1.html") ) { return "policies.16.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policies and Policy Periods") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.2.html") ) { return "policies.16.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"How Policies Are Added to an Account") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.3.html") ) { return "policies.16.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Summary Information") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.4.html") ) { return "policies.16.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for an Existing Policy") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.5.html") ) { return "policies.16.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing Existing Policy Information") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.6.html") ) { return "policies.16.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a Policy Change") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.7.html") ) { return "policies.16.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Transferring a Policy Between Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.8.html") ) { return "policies.16.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Transferring a Policy Between Producers") && Guidewire_FMSourceFileMatch(SRCFILE,"policies.16.9.html") ) { return "policies.16.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producers") && Guidewire_FMSourceFileMatch(SRCFILE,"producer.17.1.html") ) { return "producer.17.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating or Editing a Producer") && Guidewire_FMSourceFileMatch(SRCFILE,"producer.17.2.html") ) { return "producer.17.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Up a Commission Plan") && Guidewire_FMSourceFileMatch(SRCFILE,"producer.17.3.html") ) { return "producer.17.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assigning a Producer to a Security Zone") && Guidewire_FMSourceFileMatch(SRCFILE,"producer.17.4.html") ) { return "producer.17.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Transferring a Policy") && Guidewire_FMSourceFileMatch(SRCFILE,"producer.17.5.html") ) { return "producer.17.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"p-setting_up.html") ) { return "p-setting_up.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Plan Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"plans_overview.19.1.html") ) { return "plans_overview.19.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Plan Types") && Guidewire_FMSourceFileMatch(SRCFILE,"plans_overview.19.2.html") ) { return "plans_overview.19.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"plans_overview.19.3.html") ) { return "plans_overview.19.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_plan.20.1.html") ) { return "billing_plan.20.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Plan Settings") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_plan.20.2.html") ) { return "billing_plan.20.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Billing Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_plan.20.3.html") ) { return "billing_plan.20.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Related Billing Plan Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_plan.20.4.html") ) { return "billing_plan.20.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_plan.21.1.html") ) { return "payment_plan.21.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Plan Contents") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_plan.21.2.html") ) { return "payment_plan.21.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Plans and Charge Invoicing") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_plan.21.3.html") ) { return "payment_plan.21.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Plan Fee Specifications") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_plan.21.4.html") ) { return "payment_plan.21.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Payment Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_plan.21.5.html") ) { return "payment_plan.21.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Plan Modifiers") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_plan.21.6.html") ) { return "payment_plan.21.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Aligning Payment Schedules") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_plan.21.7.html") ) { return "payment_plan.21.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Payment Schedule") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_plan.21.8.html") ) { return "payment_plan.21.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Allocation Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_allocation_plan.22.1.html") ) { return "payment_allocation_plan.22.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Allocation Plan Settings") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_allocation_plan.22.2.html") ) { return "payment_allocation_plan.22.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Maintaining Payment Allocation Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"payment_allocation_plan.22.3.html") ) { return "payment_allocation_plan.22.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Delinquency Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.01.html") ) { return "delinquency_plans.23.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Delinquency Plan Contents") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.02.html") ) { return "delinquency_plans.23.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Delinquency Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.03.html") ) { return "delinquency_plans.23.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assigning Delinquency Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.04.html") ) { return "delinquency_plans.23.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Delinquency Plan General Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.05.html") ) { return "delinquency_plans.23.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Delinquency Plan Workflow Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.06.html") ) { return "delinquency_plans.23.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Associating a Different Delinquency Plan with an Account or Policy") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.07.html") ) { return "delinquency_plans.23.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Initiating Delinquencies from External Systems") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.08.html") ) { return "delinquency_plans.23.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Initiating Delinquencies from the User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.09.html") ) { return "delinquency_plans.23.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"How Delinquencies Affect Account Evaluations") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.10.html") ) { return "delinquency_plans.23.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Related Delinquency Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"delinquency_plans.23.11.html") ) { return "delinquency_plans.23.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"agency_bill_plan.24.1.html") ) { return "agency_bill_plan.24.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Plan Contents") && Guidewire_FMSourceFileMatch(SRCFILE,"agency_bill_plan.24.2.html") ) { return "agency_bill_plan.24.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Agency Bill Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"agency_bill_plan.24.3.html") ) { return "agency_bill_plan.24.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Dunning Notices in the Agency Bill Plan") && Guidewire_FMSourceFileMatch(SRCFILE,"agency_bill_plan.24.4.html") ) { return "agency_bill_plan.24.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Related Agency Bill Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"agency_bill_plan.24.5.html") ) { return "agency_bill_plan.24.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commission Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"commission_plans.25.1.html") ) { return "commission_plans.25.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commission Plan Contents") && Guidewire_FMSourceFileMatch(SRCFILE,"commission_plans.25.2.html") ) { return "commission_plans.25.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Subplan Properties") && Guidewire_FMSourceFileMatch(SRCFILE,"commission_plans.25.3.html") ) { return "commission_plans.25.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating and Editing Commission Subplans") && Guidewire_FMSourceFileMatch(SRCFILE,"commission_plans.25.4.html") ) { return "commission_plans.25.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Commission Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"commission_plans.25.5.html") ) { return "commission_plans.25.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Commission Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"commission_plans.25.6.html") ) { return "commission_plans.25.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Related Commission Plans Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"commission_plans.25.7.html") ) { return "commission_plans.25.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Instructions and Charges") && Guidewire_FMSourceFileMatch(SRCFILE,"p-setting_up_2.html") ) { return "p-setting_up_2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Instructions") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_instruc.27.1.html") ) { return "billing_instruc.27.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Instruction Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_instruc.27.2.html") ) { return "billing_instruc.27.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Interaction with a Policy Administration System") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_instruc.27.3.html") ) { return "billing_instruc.27.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Instruction Subtypes") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_instruc.27.4.html") ) { return "billing_instruc.27.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Related Billing Instruction Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_instruc.27.5.html") ) { return "billing_instruc.27.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charges and Charge Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"charges.28.1.html") ) { return "charges.28.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charges") && Guidewire_FMSourceFileMatch(SRCFILE,"charges.28.2.html") ) { return "charges.28.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"charges.28.3.html") ) { return "charges.28.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Charge Invoicing") && Guidewire_FMSourceFileMatch(SRCFILE,"p-charge_invoicing.html") ) { return "p-charge_invoicing.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Invoicing Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"invoicing_overview.30.1.html") ) { return "invoicing_overview.30.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Invoicing Definition") && Guidewire_FMSourceFileMatch(SRCFILE,"invoicing_overview.30.2.html") ) { return "invoicing_overview.30.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Invoicing Terminology") && Guidewire_FMSourceFileMatch(SRCFILE,"invoicing_overview.30.3.html") ) { return "invoicing_overview.30.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Invoicing Process") && Guidewire_FMSourceFileMatch(SRCFILE,"invoicing.31.1.html") ) { return "invoicing.31.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Invoicing Process Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"invoicing.31.2.html") ) { return "invoicing.31.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Invoicing Input") && Guidewire_FMSourceFileMatch(SRCFILE,"invoicing.31.3.html") ) { return "invoicing.31.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Invoicing Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"invoicing.31.4.html") ) { return "invoicing.31.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Credit Handling") && Guidewire_FMSourceFileMatch(SRCFILE,"credit_handling.32.1.html") ) { return "credit_handling.32.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction to Return Premium Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"credit_handling.32.2.html") ) { return "credit_handling.32.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Steps in the Credit Handling Process") && Guidewire_FMSourceFileMatch(SRCFILE,"credit_handling.32.3.html") ) { return "credit_handling.32.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Credit Allocation Examples") && Guidewire_FMSourceFileMatch(SRCFILE,"credit_handling.32.4.html") ) { return "credit_handling.32.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Return Premium Plan Properties") && Guidewire_FMSourceFileMatch(SRCFILE,"credit_handling.32.5.html") ) { return "credit_handling.32.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Invoice Items") && Guidewire_FMSourceFileMatch(SRCFILE,"p-items.html") ) { return "p-items.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Item Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"item-overview.34.1.html") ) { return "item-overview.34.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Item Owners and Payers") && Guidewire_FMSourceFileMatch(SRCFILE,"item-overview.34.2.html") ) { return "item-overview.34.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assigning a Payer") && Guidewire_FMSourceFileMatch(SRCFILE,"item-overview.34.3.html") ) { return "item-overview.34.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assignment and Reassignment of Charges and Items") && Guidewire_FMSourceFileMatch(SRCFILE,"item-overview.34.4.html") ) { return "item-overview.34.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assigning a Payer for Charges and Items") && Guidewire_FMSourceFileMatch(SRCFILE,"item-assignment.35.1.html") ) { return "item-assignment.35.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge and Item Assignment Use Cases") && Guidewire_FMSourceFileMatch(SRCFILE,"item-assignment.35.2.html") ) { return "item-assignment.35.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Automatically Assigning a Payer") && Guidewire_FMSourceFileMatch(SRCFILE,"item-assignment.35.3.html") ) { return "item-assignment.35.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Manually Assigning a Payer") && Guidewire_FMSourceFileMatch(SRCFILE,"item-assignment.35.4.html") ) { return "item-assignment.35.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Charge and Item Assignments") && Guidewire_FMSourceFileMatch(SRCFILE,"item-assignment.35.5.html") ) { return "item-assignment.35.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reassigning a Payer") && Guidewire_FMSourceFileMatch(SRCFILE,"item-reassignment.36.1.html") ) { return "item-reassignment.36.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Manually Reassigning a Payer") && Guidewire_FMSourceFileMatch(SRCFILE,"item-reassignment.36.2.html") ) { return "item-reassignment.36.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Programmatically Reassigning a Payer Using Domain Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"item-reassignment.36.3.html") ) { return "item-reassignment.36.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"What Happens When You Reassign an Item") && Guidewire_FMSourceFileMatch(SRCFILE,"item-reassignment.36.4.html") ) { return "item-reassignment.36.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Billing Method on a Policy") && Guidewire_FMSourceFileMatch(SRCFILE,"item-reassignment.36.5.html") ) { return "item-reassignment.36.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Plugins for Configuring Billing Method Behavior") && Guidewire_FMSourceFileMatch(SRCFILE,"item-reassignment.36.6.html") ) { return "item-reassignment.36.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Moving an Invoice Item") && Guidewire_FMSourceFileMatch(SRCFILE,"item-moving.37.1.html") ) { return "item-moving.37.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Moving an Item to Another Invoice") && Guidewire_FMSourceFileMatch(SRCFILE,"item-moving.37.2.html") ) { return "item-moving.37.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a New Invoice") && Guidewire_FMSourceFileMatch(SRCFILE,"item-moving.37.3.html") ) { return "item-moving.37.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Tracking Item Details") && Guidewire_FMSourceFileMatch(SRCFILE,"item-tracking.38.1.html") ) { return "item-tracking.38.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Item Detail Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"item-tracking.38.2.html") ) { return "item-tracking.38.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Item Events") && Guidewire_FMSourceFileMatch(SRCFILE,"item-tracking.38.3.html") ) { return "item-tracking.38.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Additional Features of BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"p-more_features.html") ) { return "p-more_features.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Reporting") && Guidewire_FMSourceFileMatch(SRCFILE,"prem_report.40.1.html") ) { return "prem_report.40.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Reporting Lifecycle") && Guidewire_FMSourceFileMatch(SRCFILE,"prem_report.40.2.html") ) { return "prem_report.40.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing Premium Reporting Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"prem_report.40.3.html") ) { return "prem_report.40.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Reporting Auditing") && Guidewire_FMSourceFileMatch(SRCFILE,"prem_report.40.4.html") ) { return "prem_report.40.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Canceling Premium Reporting Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"prem_report.40.5.html") ) { return "prem_report.40.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_billing_trxs.41.1.html") ) { return "bc_billing_trxs.41.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Recapture Charges") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_billing_trxs.41.2.html") ) { return "bc_billing_trxs.41.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Ad Hoc Credits") && Guidewire_FMSourceFileMatch(SRCFILE,"bc_billing_trxs.41.3.html") ) { return "bc_billing_trxs.41.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trouble Tickets and Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"trouble_tix.42.1.html") ) { return "trouble_tix.42.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trouble Ticket Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"trouble_tix.42.2.html") ) { return "trouble_tix.42.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Trouble Tickets") && Guidewire_FMSourceFileMatch(SRCFILE,"trouble_tix.42.3.html") ) { return "trouble_tix.42.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trouble Ticket Escalation") && Guidewire_FMSourceFileMatch(SRCFILE,"trouble_tix.42.4.html") ) { return "trouble_tix.42.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Closing a Trouble Ticket") && Guidewire_FMSourceFileMatch(SRCFILE,"trouble_tix.42.5.html") ) { return "trouble_tix.42.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trouble Ticket Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"trouble_tix.42.6.html") ) { return "trouble_tix.42.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trouble Ticket Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"trouble_tix.42.7.html") ) { return "trouble_tix.42.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producer Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"producer_writeoffs.43.1.html") ) { return "producer_writeoffs.43.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Producer Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"producer_writeoffs.43.2.html") ) { return "producer_writeoffs.43.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reversing Producer Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"producer_writeoffs.43.3.html") ) { return "producer_writeoffs.43.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding the Write-off Amount") && Guidewire_FMSourceFileMatch(SRCFILE,"producer_writeoffs.43.4.html") ) { return "producer_writeoffs.43.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Funds Tracking") && Guidewire_FMSourceFileMatch(SRCFILE,"funds_tracking.44.1.html") ) { return "funds_tracking.44.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Funds Tracking Basics") && Guidewire_FMSourceFileMatch(SRCFILE,"funds_tracking.44.2.html") ) { return "funds_tracking.44.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Item Groups") && Guidewire_FMSourceFileMatch(SRCFILE,"funds_tracking.44.3.html") ) { return "funds_tracking.44.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling or Disabling Funds Tracking") && Guidewire_FMSourceFileMatch(SRCFILE,"funds_tracking.44.4.html") ) { return "funds_tracking.44.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Funds Tracking Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"funds_tracking.44.5.html") ) { return "funds_tracking.44.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_holds.45.1.html") ) { return "charge_holds.45.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Charge Holds Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_holds.45.2.html") ) { return "charge_holds.45.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Charge Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_holds.45.3.html") ) { return "charge_holds.45.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring Charge Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_holds.45.4.html") ) { return "charge_holds.45.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Releasing Charge Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"charge_holds.45.5.html") ) { return "charge_holds.45.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Collateral Handling") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.1.html") ) { return "collateral.46.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Collateral Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.2.html") ) { return "collateral.46.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Collateral Types") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.3.html") ) { return "collateral.46.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Collateral Requirements") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.4.html") ) { return "collateral.46.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a Collateral Requirement") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.5.html") ) { return "collateral.46.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Collateral") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.6.html") ) { return "collateral.46.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Allocating a Payment to a Collateral Requirement") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.7.html") ) { return "collateral.46.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Cancellation with Collateral Deposit") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.8.html") ) { return "collateral.46.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Collateral Related Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"collateral.46.9.html") ) { return "collateral.46.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Evaluation") && Guidewire_FMSourceFileMatch(SRCFILE,"accountevaluation.47.1.html") ) { return "accountevaluation.47.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Evaluation Definition") && Guidewire_FMSourceFileMatch(SRCFILE,"accountevaluation.47.2.html") ) { return "accountevaluation.47.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Evaluation User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"accountevaluation.47.3.html") ) { return "accountevaluation.47.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Evaluation Customization") && Guidewire_FMSourceFileMatch(SRCFILE,"accountevaluation.47.4.html") ) { return "accountevaluation.47.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Features") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency_bc.48.1.html") ) { return "multicurrency_bc.48.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency_bc.48.2.html") ) { return "multicurrency_bc.48.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Currency Separation") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency_bc.48.3.html") ) { return "multicurrency_bc.48.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.49.1.html") ) { return "contacts.49.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a New Contact to an Account") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.49.2.html") ) { return "contacts.49.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding an Existing Contact to an Account") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.49.3.html") ) { return "contacts.49.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Contact Information") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.49.4.html") ) { return "contacts.49.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for Contact Information") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.49.5.html") ) { return "contacts.49.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing Contact Information") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.49.6.html") ) { return "contacts.49.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Removing Contact Information") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.49.7.html") ) { return "contacts.49.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"p_direct_bill.html") ) { return "p_direct_bill.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Processing Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"db_process_overview.html") ) { return "db_process_overview.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Lifecycle") && Guidewire_FMSourceFileMatch(SRCFILE,"invoice_lifecycle.52.1.html") ) { return "invoice_lifecycle.52.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoices and Invoice Items") && Guidewire_FMSourceFileMatch(SRCFILE,"invoice_lifecycle.52.2.html") ) { return "invoice_lifecycle.52.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoice Cycle") && Guidewire_FMSourceFileMatch(SRCFILE,"invoice_lifecycle.52.3.html") ) { return "invoice_lifecycle.52.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying Invoices") && Guidewire_FMSourceFileMatch(SRCFILE,"invoice_lifecycle.52.4.html") ) { return "invoice_lifecycle.52.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying Invoice Items") && Guidewire_FMSourceFileMatch(SRCFILE,"invoice_lifecycle.52.5.html") ) { return "invoice_lifecycle.52.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment and Distribution") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.01.html") ) { return "payments.53.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Direct Bill Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.02.html") ) { return "payments.53.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Posting Direct Bill Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.03.html") ) { return "payments.53.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Suspense Payments and Items") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.04.html") ) { return "payments.53.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.05.html") ) { return "payments.53.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Distributing Direct Bill Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.06.html") ) { return "payments.53.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating and Editing Direct Bill Credit Distributions") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.07.html") ) { return "payments.53.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Moving Direct Bill Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.08.html") ) { return "payments.53.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reversing Direct Bill Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.09.html") ) { return "payments.53.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying Direct Bill Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"payments.53.10.html") ) { return "payments.53.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_levels.54.1.html") ) { return "billing_levels.54.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Types of Billing Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_levels.54.2.html") ) { return "billing_levels.54.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Levels and Unapplied T\u2011Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_levels.54.3.html") ) { return "billing_levels.54.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Billing Level") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_levels.54.4.html") ) { return "billing_levels.54.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Effects of Changing the Billing Level") && Guidewire_FMSourceFileMatch(SRCFILE,"billing_levels.54.5.html") ) { return "billing_levels.54.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commission Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"producer_payments.55.1.html") ) { return "producer_payments.55.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producer Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"producer_payments.55.2.html") ) { return "producer_payments.55.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Moving Commissions from Reserves to Payable") && Guidewire_FMSourceFileMatch(SRCFILE,"producer_payments.55.3.html") ) { return "producer_payments.55.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"db_writeoffs.56.1.html") ) { return "db_writeoffs.56.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Charge Write-offs and Commission Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"db_writeoffs.56.2.html") ) { return "db_writeoffs.56.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Charge Write-off Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"db_writeoffs.56.3.html") ) { return "db_writeoffs.56.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Commission Write-off Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"db_writeoffs.56.4.html") ) { return "db_writeoffs.56.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Direct Bill Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"db_writeoffs.56.5.html") ) { return "db_writeoffs.56.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Write-offs and Delinquencies") && Guidewire_FMSourceFileMatch(SRCFILE,"db_writeoffs.56.6.html") ) { return "db_writeoffs.56.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Write-off Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"db_writeoffs.56.7.html") ) { return "db_writeoffs.56.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Disbursements") && Guidewire_FMSourceFileMatch(SRCFILE,"disbursements.57.1.html") ) { return "disbursements.57.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Manual Disbursements") && Guidewire_FMSourceFileMatch(SRCFILE,"disbursements.57.2.html") ) { return "disbursements.57.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Automatic Disbursements") && Guidewire_FMSourceFileMatch(SRCFILE,"disbursements.57.3.html") ) { return "disbursements.57.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Disbursing Suspense Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"disbursements.57.4.html") ) { return "disbursements.57.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Disbursement Approval or Rejection") && Guidewire_FMSourceFileMatch(SRCFILE,"disbursements.57.5.html") ) { return "disbursements.57.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Delinquency") && Guidewire_FMSourceFileMatch(SRCFILE,"db_del_process.58.1.html") ) { return "db_del_process.58.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Delinquency Process") && Guidewire_FMSourceFileMatch(SRCFILE,"db_del_process.58.2.html") ) { return "db_del_process.58.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Direct Bill Delinquency Workflows") && Guidewire_FMSourceFileMatch(SRCFILE,"db_del_process.58.3.html") ) { return "db_del_process.58.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Equity Dating") && Guidewire_FMSourceFileMatch(SRCFILE,"db_del_process.58.4.html") ) { return "db_del_process.58.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Tracking Delinquencies") && Guidewire_FMSourceFileMatch(SRCFILE,"db_del_process.58.5.html") ) { return "db_del_process.58.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating Delinquency Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"db_del_process.58.6.html") ) { return "db_del_process.58.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"List Bill Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"p-list_bill.html") ) { return "p-list_bill.html";}
else if (Guidewire_TopicMatch(TOPIC,"List Bill Processing Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"list_bill_overview.html") ) { return "list_bill_overview.html";}
else if (Guidewire_TopicMatch(TOPIC,"List Bill Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"list_bill.61.1.html") ) { return "list_bill.61.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing List Bill Accounts and Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"list_bill.61.2.html") ) { return "list_bill.61.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating and Editing List Bill Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"list_bill.61.3.html") ) { return "list_bill.61.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account-level Charges for List Bill Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"list_bill.61.4.html") ) { return "list_bill.61.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"List Bill Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"list_bill.61.5.html") ) { return "list_bill.61.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"p_agency_bill.html") ) { return "p_agency_bill.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Processing Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_process_overview.html") ) { return "ab_process_overview.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Cycles") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_cycles.64.1.html") ) { return "ab_cycles.64.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Statements and Cycles") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_cycles.64.2.html") ) { return "ab_cycles.64.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generating an Agency Bill Cycle") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_cycles.64.3.html") ) { return "ab_cycles.64.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"What Affects Agency Bill Cycles") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_cycles.64.4.html") ) { return "ab_cycles.64.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_receiv_pay.65.1.html") ) { return "ab_receiv_pay.65.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill (Statement) Processing") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_receiv_pay.65.2.html") ) { return "ab_receiv_pay.65.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Making Agency Bill Payment Distributions") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_receiv_pay.65.3.html") ) { return "ab_receiv_pay.65.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Payments Handling") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_receiv_pay.65.4.html") ) { return "ab_receiv_pay.65.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Promise Handling") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_receiv_pay.65.5.html") ) { return "ab_receiv_pay.65.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Credit Distributions Handling") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_receiv_pay.65.6.html") ) { return "ab_receiv_pay.65.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_receiv_pay.65.7.html") ) { return "ab_receiv_pay.65.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Exceptions") && Guidewire_FMSourceFileMatch(SRCFILE,"agenbill_excep_mgt.66.1.html") ) { return "agenbill_excep_mgt.66.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Agency Bill Exceptions") && Guidewire_FMSourceFileMatch(SRCFILE,"agenbill_excep_mgt.66.2.html") ) { return "agenbill_excep_mgt.66.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Common Causes for Exceptions") && Guidewire_FMSourceFileMatch(SRCFILE,"agenbill_excep_mgt.66.3.html") ) { return "agenbill_excep_mgt.66.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Common Exception Resolutions") && Guidewire_FMSourceFileMatch(SRCFILE,"agenbill_excep_mgt.66.4.html") ) { return "agenbill_excep_mgt.66.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Mismatch Exceptions") && Guidewire_FMSourceFileMatch(SRCFILE,"agenbill_excep_mgt.66.5.html") ) { return "agenbill_excep_mgt.66.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Promise Mismatch Exceptions") && Guidewire_FMSourceFileMatch(SRCFILE,"agenbill_excep_mgt.66.6.html") ) { return "agenbill_excep_mgt.66.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Late Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"agenbill_excep_mgt.66.7.html") ) { return "agenbill_excep_mgt.66.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Late Promises") && Guidewire_FMSourceFileMatch(SRCFILE,"agenbill_excep_mgt.66.8.html") ) { return "agenbill_excep_mgt.66.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"My Agency Items") && Guidewire_FMSourceFileMatch(SRCFILE,"my_agency_items.67.1.html") ) { return "my_agency_items.67.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"My Agency Items Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"my_agency_items.67.2.html") ) { return "my_agency_items.67.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing Payment Exceptions") && Guidewire_FMSourceFileMatch(SRCFILE,"my_agency_items.67.3.html") ) { return "my_agency_items.67.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing Promise Exceptions") && Guidewire_FMSourceFileMatch(SRCFILE,"my_agency_items.67.4.html") ) { return "my_agency_items.67.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Unapplied Payments") && Guidewire_FMSourceFileMatch(SRCFILE,"my_agency_items.67.5.html") ) { return "my_agency_items.67.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Late Payments and Promises") && Guidewire_FMSourceFileMatch(SRCFILE,"my_agency_items.67.6.html") ) { return "my_agency_items.67.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Suspense Items") && Guidewire_FMSourceFileMatch(SRCFILE,"my_agency_items.67.7.html") ) { return "my_agency_items.67.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_writeoffs.68.1.html") ) { return "ab_writeoffs.68.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Charge Write-offs and Commission Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_writeoffs.68.2.html") ) { return "ab_writeoffs.68.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Charge Write-off Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_writeoffs.68.3.html") ) { return "ab_writeoffs.68.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Commission Write-off Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_writeoffs.68.4.html") ) { return "ab_writeoffs.68.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Agency Bill Write-offs") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_writeoffs.68.5.html") ) { return "ab_writeoffs.68.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Write-off Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_writeoffs.68.6.html") ) { return "ab_writeoffs.68.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Delinquency") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_delinq_process.69.1.html") ) { return "ab_delinq_process.69.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Delinquency Process") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_delinq_process.69.2.html") ) { return "ab_delinq_process.69.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Agency Bill Workflows") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_delinq_process.69.3.html") ) { return "ab_delinq_process.69.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Agency Bill Workflow") && Guidewire_FMSourceFileMatch(SRCFILE,"ab_delinq_process.69.4.html") ) { return "ab_delinq_process.69.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Administration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-admin.html") ) { return "p-admin.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administrative Tasks") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.71.1.html") ) { return "admin.71.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering Activity Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.71.2.html") ) { return "admin.71.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering BillingCenter Plans") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.71.3.html") ) { return "admin.71.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering Charge Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.71.4.html") ) { return "admin.71.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering Collection Agencies") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.71.5.html") ) { return "admin.71.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering Message Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.71.6.html") ) { return "admin.71.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering Workflows") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.71.7.html") ) { return "admin.71.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security") && Guidewire_FMSourceFileMatch(SRCFILE,"security.72.1.html") ) { return "security.72.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Users, Groups, and Roles") && Guidewire_FMSourceFileMatch(SRCFILE,"security.72.2.html") ) { return "security.72.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"security.72.3.html") ) { return "security.72.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Authority Limits and Authority Limit Profiles") && Guidewire_FMSourceFileMatch(SRCFILE,"security.72.4.html") ) { return "security.72.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security Zones") && Guidewire_FMSourceFileMatch(SRCFILE,"security.72.5.html") ) { return "security.72.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security Dictionary") && Guidewire_FMSourceFileMatch(SRCFILE,"security.72.6.html") ) { return "security.72.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Access Control for Documents and Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"security.72.7.html") ) { return "security.72.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Holidays and Business Weeks") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.73.1.html") ) { return "holidays.73.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying Holiday Dates") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.73.2.html") ) { return "holidays.73.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Holidays, Weekends, and Business Weeks") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.73.3.html") ) { return "holidays.73.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Gosu Methods to Work with Holidays") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.73.4.html") ) { return "holidays.73.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Business Weeks and Business Hours") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.73.5.html") ) { return "holidays.73.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Holiday Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.73.6.html") ) { return "holidays.73.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administration Utilities") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_utilities.74.1.html") ) { return "admin_utilities.74.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Data") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_utilities.74.2.html") ) { return "admin_utilities.74.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering Script Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_utilities.74.3.html") ) { return "admin_utilities.74.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering Data Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_utilities.74.4.html") ) { return "admin_utilities.74.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"External System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-integration.html") ) { return "p-integration.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Administration System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pas_integration_.76.1.html") ) { return "pas_integration_.76.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"System Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"pas_integration_.76.2.html") ) { return "pas_integration_.76.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Components") && Guidewire_FMSourceFileMatch(SRCFILE,"pas_integration_.76.3.html") ) { return "pas_integration_.76.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"pas_integration_.76.4.html") ) { return "pas_integration_.76.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Period Billing Instructions") && Guidewire_FMSourceFileMatch(SRCFILE,"pas_integration_.76.5.html") ) { return "pas_integration_.76.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Integration Between BillingCenter and PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"pas_integration_.76.6.html") ) { return "pas_integration_.76.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"pas_integration_.76.7.html") ) { return "pas_integration_.76.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Related Integration Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"pas_integration_.76.8.html") ) { return "pas_integration_.76.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Management System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-ab-integration.77.1.html") ) { return "bc-ab-integration.77.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for Contacts Within a Contact Management System") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-ab-integration.77.2.html") ) { return "bc-ab-integration.77.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Updated Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-ab-integration.77.3.html") ) { return "bc-ab-integration.77.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Detecting Duplicates in the Contact Management System") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-ab-integration.77.4.html") ) { return "bc-ab-integration.77.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Duplicate Contacts in BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-ab-integration.77.5.html") ) { return "bc-ab-integration.77.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deleting, Removing, and Inactivating a Contact") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-ab-integration.77.6.html") ) { return "bc-ab-integration.77.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Customizing the Contact Management System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"bc-ab-integration.77.7.html") ) { return "bc-ab-integration.77.7.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
