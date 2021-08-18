package gw.plugin.pas

uses gw.api.util.Logger
uses gw.plugin.Plugins
uses gw.plugin.messaging.MessageTransport

uses java.lang.Exception
uses java.lang.IllegalStateException

/**
 * PASMessageTransport receives policy administration system related messages and notifies the
 * policy administration system by using the IPolicySystemPlugin.
 */
@Export
class PASMessageTransport implements MessageTransport{
  public static final var DEST_ID : int = 100
  
  public static final var EVENT_CANCEL_NOW : String = "PAS_CancelNow"
  public static final var EVENT_RESCIND_CANCELLATION : String = "PAS_Rescind"
  public static final var EVENT_OFFER_PAID : String = "PAS_OfferPaid"
  public static final var EVENT_POLICY_PERIOD_CONFIRMED: String = "PAS_PolicyPeriodConfirmed"
  
  private var logger = Logger.forCategory("PAS")
  
  construct() {  }
  
  override function send( message: Message, payload: String ) : void {
    
    var eventName = message.EventName
    logger.info("PAS integration event: ${message.MessageRoot} - ${eventName}")
    var pasPlugin = Plugins.get(IPolicySystemPlugin)
    try{
      switch(eventName){
        case EVENT_POLICY_PERIOD_CONFIRMED:
          var policyPeriod = message.MessageRoot as PolicyPeriod
          pasPlugin.confirmPolicyPeriod(policyPeriod, getTransactionId(message))
          break
        case EVENT_CANCEL_NOW:
          var policyPeriod = message.MessageRoot as PolicyPeriod
          var delinquencyReason = policyPeriod.CancellationProcessEvent.DelinquencyProcess.Reason
          pasPlugin.requestCancellation(policyPeriod, delinquencyReason, getTransactionId(message))
          break
        case EVENT_OFFER_PAID:
          var payment = message.MessageRoot as SuspensePayment
          pasPlugin.notifyPaymentReceivedForRenewalOffer(payment, getTransactionId(message))
          break
        case EVENT_RESCIND_CANCELLATION:
          var policyPeriod = message.MessageRoot as PolicyPeriod
          var delinquencyReason = policyPeriod.CancellationProcessEvent.DelinquencyProcess.Reason
          pasPlugin.rescindCancellation(policyPeriod, delinquencyReason, getTransactionId(message))
          break
        default:
          throw new IllegalStateException("Unexpected event sent to PAS: ${eventName}")
      }
      message.reportAck()
    } catch(e : Exception){ 
      logger.error("PAS Integration Error", e)
      message.ErrorDescription = e.Message
      message.reportError()
    }
  }
  
  private function getTransactionId(message : Message) : String {
    return message.Payload
  }
  
  override function resume() : void { }

  override function setDestinationID( id: int ) : void { }

  override function shutdown() : void { }

  override function suspend() : void { }

}
