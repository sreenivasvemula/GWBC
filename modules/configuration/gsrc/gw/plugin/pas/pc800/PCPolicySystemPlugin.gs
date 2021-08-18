package gw.plugin.pas.pc800

uses gw.api.assignment.AutoAssignAssignee
uses gw.api.system.BCConfigParameters
uses gw.api.util.Logger
uses gw.plugin.pas.IPolicySystemPlugin
uses gw.xml.ws.WsdlConfig
uses wsi.remote.gw.webservice.pc.pc800.cancellationapi.CancellationAPI
uses wsi.remote.gw.webservice.pc.pc800.cancellationapi.enums.CancellationSource
uses wsi.remote.gw.webservice.pc.pc800.cancellationapi.enums.ReasonCode
uses wsi.remote.gw.webservice.pc.pc800.policyrenewalapi.PolicyRenewalAPI

uses java.lang.IllegalStateException
uses java.util.Date

/**
 * This implementation is used for integrating with Guidewire Policy Center 8.0.
 */
@Export
class PCPolicySystemPlugin implements IPolicySystemPlugin{

  private var logger = Logger.forCategory("PAS")
  
  construct() {  }

  override function confirmPolicyPeriod(policyPeriod : PolicyPeriod, transactionId : String) {
    logger.info("PCPolicySystemPlugin, policy period confirmed: ${policyPeriod.PolicyNumber} - Term: ${policyPeriod.TermNumber}")

    callPCRenewalAPI(\ api -> {
      api.confirmTerm(policyPeriod.PolicyNumber, policyPeriod.TermNumber, transactionId)
    })
  }
  
  override function notifyPaymentReceivedForRenewalOffer( payment : SuspensePayment, 
                                                          transactionId : String){
    logger.info("PCPolicySystemPlugin, renewal offer payment: ${payment.OfferNumber}")
    try{
      callPCRenewalAPI(\ api -> {
        api.notifyPaymentReceivedForRenewalOffer(payment.OfferNumber, payment.OfferOption, 
          payment.Amount, transactionId)
      })
    }catch(e : wsi.remote.gw.webservice.pc.pc800.policyrenewalapi.faults.BadIdentifierException){
      var activity = new SharedActivity(payment.Bundle)
      activity.ActivityPattern = ActivityPattern.Notification
      activity.Subject = displaykey.Integration.Error.UnknowOfferNumber(payment.OfferNumber)
      activity.Description = displaykey.Integration.Error.UnknowOfferNumberDesc
    }
  }
  
  static private final var CancellationSourceMap = {
    DelinquencyReason.TC_NOTTAKEN -> CancellationSource.Insured,
    DelinquencyReason.TC_PASTDUE -> CancellationSource.Carrier}
    
  static private final var ReasonCodeMap = {
    DelinquencyReason.TC_NOTTAKEN -> ReasonCode.Nottaken,
    DelinquencyReason.TC_PASTDUE -> ReasonCode.Nonpayment}
  
  override function rescindCancellation(policyPeriod : PolicyPeriod, 
                                          reason : DelinquencyReason, transactionId : String){
    logger.info("PCPolicySystemPlugin, rescindCancellation: ${policyPeriod.PolicyNumberLong}, ${reason}")
    rescindPCCancellation(policyPeriod.PolicyNumber, CancellationSourceMap.get(reason), 
        ReasonCodeMap.get(reason), transactionId)  
  }
   
  override function requestCancellation( policyPeriod : PolicyPeriod, 
                                          reason : DelinquencyReason, transactionId : String ) {
    logger.info("PCPolicySystemPlugin, requestCancellation: ${policyPeriod.PolicyNumberLong}, ${reason}")
    var pcReasonCode : ReasonCode
    var source : CancellationSource
    var cancellationDate : Date
    
    var effectiveTime = BCConfigParameters.PASEffectiveTime.Value as Date
    var effectiveTimeMidnight = effectiveTime.trimToMidnight()
    var timeAfterMidnight = effectiveTime.Time - effectiveTimeMidnight.Time
    pcReasonCode = ReasonCodeMap.get(reason)
    source = CancellationSourceMap.get(reason)
    switch(reason){
      case DelinquencyReason.TC_NOTTAKEN:
        cancellationDate = new Date(policyPeriod.PolicyPerEffDate.Time + timeAfterMidnight)    
        break
      case DelinquencyReason.TC_PASTDUE:
        cancellationDate = new Date(Date.Today.Time + timeAfterMidnight)
        break
      default:
        throw new IllegalStateException("Not supported delinquency reason ${reason}")
    }
    if(cancellationDate.after(policyPeriod.ExpirationDate)){
      var activity = policyPeriod.createActivity(ActivityPattern.Notification, 
        displaykey.Integration.Error.TooLateToCancelSubj(policyPeriod), 
        displaykey.Integration.Error.TooLateToCancelDesc(policyPeriod, cancellationDate), 
        null, null, true)
      AutoAssignAssignee.INSTANCE.assignToThis(activity)
    }else{
      try{
        beginPCCancellation(policyPeriod.PolicyNumber, cancellationDate, 
            pcReasonCode, source, transactionId)
      }catch(e : wsi.remote.gw.webservice.pc.pc800.cancellationapi.faults.EntityStateException){
        var activity = policyPeriod.createActivity(ActivityPattern.Notification, 
          displaykey.Integration.Error.CancelFailSubj(policyPeriod), 
          displaykey.Integration.Error.CancelFailDesc(e.LocalizedMessage), 
          null, null, true)
        AutoAssignAssignee.INSTANCE.assignToThis(activity)
        e.printStackTrace()
      }
    }
  }
  
  protected function rescindPCCancellation(policyNumber : String, 
      source : CancellationSource, reasonCode : ReasonCode, transactionId : String){
    callPCCancellationAPI(\ api -> {
      api.rescindCancellation(policyNumber, 
        null, 
        source, 
        reasonCode, 
        transactionId)  
    })
  }
  
  protected function beginPCCancellation(policyNumber : String, cancellationDate : Date, 
      reasonCode : ReasonCode, source : CancellationSource, transactionId : String){
    callPCCancellationAPI(\ api -> {
      api.beginCancellation(policyNumber, cancellationDate, 
        true, // let PC recalculate the earliest date to cancel from source and reason code
        source, reasonCode, 
        null, "", transactionId)
    })
  }
  
  protected function callPCCancellationAPI(call : block(p : CancellationAPI)){
    var config = createWsiConfig()
    var api = new CancellationAPI(config)
    try{
      call(api)
    } catch(e : wsi.remote.gw.webservice.pc.pc800.cancellationapi.faults.AlreadyExecutedException){
      // ignore this duplicated call
    }
  }
  
  protected function callPCRenewalAPI(call : block(p : PolicyRenewalAPI)){
    var config = createWsiConfig()
    var api = new PolicyRenewalAPI(config)
    try{
      call(api)
    } catch(e : wsi.remote.gw.webservice.pc.pc800.policyrenewalapi.faults.AlreadyExecutedException){
      // ignore this duplicated call
    }
  } 
  
  private function createWsiConfig() : WsdlConfig{
    // TODO mvu: platform will add more support to wsi webservice in studio so that we don't need
    // to hard code the password like this. Instead, we probably will enter the password in
    // some config file in studio
    var config = new gw.xml.ws.WsdlConfig()
    config.Guidewire.Locale = User.util.CurrentLocale.Code
    config.Guidewire.Authentication.Username = "su"
    config.Guidewire.Authentication.Password = "gw"
    return config
  }

}
