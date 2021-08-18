 package gw.webservice.bc.bc801

uses gw.api.webservice.exception.SOAPException;
uses gw.api.tools.ProcessID;
uses gw.api.webservice.tableImport.StagingTableEncryptionImpl;


/**
 * This interface provides methods for encrypting data in the  staging tables.
 * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI instead.
 */
 @RpcWebService
 @Export
@java.lang.Deprecated
class IStagingTableEncryptionAPI
{
  /**
   * Instructs the  server to encrypt data on the staging tables.
   *  @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#encryptDataOnStagingTables instead.
   */
  @Throws(SOAPException, "")
  @java.lang.Deprecated
  public function encryptDataOnStagingTables(){
     new StagingTableEncryptionImpl().encryptDataOnStagingTables()
  }

  /**
   * Instructs the  server to encrypt data on the staging tables.  The same as encryptDataOnStagingTables
   * except that the process will be performed asynchronously in a batch process.  After completion,
   * the process status will contain the number of tables that were updated in the opsCompleted field.  
   * Note that this batch process can't be terminated.
   *
   * @deprecated (Since 8.0.1) Use gw.webservice.bc.bc801.BCAPI#encryptDataOnStagingTablesAsBatchProcess instead.
   */
  @Throws(SOAPException, "")
  @java.lang.Deprecated
  public function encryptDataOnStagingTablesAsBatchProcess() : ProcessID {
    return new StagingTableEncryptionImpl().encryptDataOnStagingTablesAsBatchProcess()
  }
}
