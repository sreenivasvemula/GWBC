package gw.plugin.pas
uses gw.plugin.messaging.MessageRequest
uses gw.api.system.database.SequenceUtil
uses java.util.Date

@Export
class PASMessageRequest implements MessageRequest{

  construct() {  }
  
  /** CC-48690: Generate transaction id and store in the message if this is the first time the 
  * message is sent. Otherwise, just return the string stored in the message. The id should be
  * generated so that it is unique among all the messages and is unique to among all other
  * policy systems that send message to the billing system. Also, the message should be time
  * stamped so that it can remain unique after db drop.
  */
  override function beforeSend(message : Message) : String {
    if(message.RetryCount == 0){
      message.Payload = "BC:" + Date.CurrentDate.Time + "-" 
        + SequenceUtil.next(1, "PC_SOAP_REQUEST")
    }
    return message.Payload
  }

  override function shutdown() { }

  override function resume() { }

  override function suspend() { }

  override function setDestinationID(p0 : int) { }


  override function afterSend(p0 : Message) { }

}
