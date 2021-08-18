package gw.webservice.bc.bc700

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.DuplicateKeyException
uses gw.api.webservice.exception.EntityStateException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPServerException
uses java.util.Arrays
uses java.util.ArrayList
uses java.util.HashSet
uses java.util.Date
uses gw.api.domain.accounting.BillingInstructionUtil
uses gw.api.domain.accounting.ChargeUtil
uses gw.api.domain.troubleticket.TroubleTicketUtil

//@RpcWebService
@Export
class IBillingCenterAPI extends APITestBase{
  
  construct() {
  }
  
  /**
   * Add a new Note to an existing TroubleTicket
   *
   * @param note the Note entity to add to an existing trouble ticket
   * @param troubleTicketPublicID string public id of an existing trouble ticket
   * @return newly created Note entity which has been added to the trouble ticket
   */
  @Throws(BadIdentifierException, "trouble ticket id is not valid")
  @Throws(DataConversionException, "if the note or trouble ticket id is null")
  function addNoteToTroubleTicket(note : Note, troubleTicketPublicID : String) : Note {
    require(note, "note")
    require(troubleTicketPublicID, "troubleTicket public ID")
    var troubleTicket = Query.make(TroubleTicket).compare("PublicID", Equals, troubleTicketPublicID).select().getAtMostOneRow()
    if (troubleTicket == null) {
      throw new BadIdentifierException(troubleTicketPublicID)
    }
    note.Bundle.add(troubleTicket)
    troubleTicket.addNote(note)
    note.Bundle.commit()
    
    return note
  }

  /**
   * Add a new Note to an existing Account
   *
   * @param note the Note entity to add to an existing account
   * @param accountPublicID string public id of an existing account
   * @return newly created Note entity which has been added to the account
   */
  @Throws(DataConversionException, "if the note or account id is null")
  function addNoteToAccount(note : Note, accountID : String) : Note {
    require(note, "note")
    var account = loadAccount(accountID)
    note.Bundle.add(account)
    account.addNote(note)
    note.Bundle.commit()
    
    return note
  }
  
  /**
   * Add a new Note to an existing PolicyPeriods
   *
   * @param note                 the Note entity to add to an existing policy period
   * @param policyPeriodPublicID string public id of an existing policy period
   * @return newly created Note entity which has been added to the policy period
   */
  @Throws(DataConversionException, "if the note or policyperiod id is null")
  function addNoteToPolicyPeriod(note : Note, policyPeriodID : String) : Note {
    require(note, "note")
    var policyPeriod = loadPolicyPeriod(policyPeriodID)
    note.Bundle.add(policyPeriod)
    policyPeriod.Policy.addNote(note)
    note.Bundle.commit()
    
    return note
  }
  
  // Add Document

  /**
   * Add a new Document to an existing Account
   *
   * @param document the Document entity to add to an existing account
   * @param accountID string public id of an existing account
   * @return newly created Document entity's public ID
   */
  @Throws(DataConversionException, "if the document or accountID is null")
  function addDocumentToAccount(document : Document, accountID : String) : String {
    require(document, "document")
    var account = loadAccount(accountID)
    document.Bundle.add(account)
    account.addDocument( document )
    document.Bundle.commit()
    return document.PublicID;
  }
  
  
  /**
   * Add a new Document to an existing PolicyPeriod
   *
   * @param document the Document entity to add to an existing policy period
   * @param policyPeriodID string public id of an existing policy period
   * @return newly created Document entity's public ID
   */
  @Throws(DataConversionException, "if the document or policyPeriodID is null")
  function addDocumentToPolicyPeriod(document : Document, policyPeriodID : String) : String {
    require(document, "document")
    var policyPeriod = loadPolicyPeriod(policyPeriodID)
    document.Bundle.add(policyPeriod)
    policyPeriod.Policy.addDocument( document )
    document.Bundle.commit()
    return document.PublicID;
  }
  
  /**
   * Add a new Document to an existing Producer
   *
   * @param document the Document entity to add to an existing producer
   * @param producerID string public id of an existing producer
   * @return newly created Document entity's public ID
   */
  @Throws(DataConversionException, "if the document or producerID id is null")
  function addDocumentToProducer(document : Document, producerID : String) : String {
    require(document, "document")
    var producer = loadProducer(producerID)
    document.Bundle.add(producer)
    producer.addDocument( document )
    document.Bundle.commit()
    return document.PublicID;
  }
  
  /**
   * Creates an account in BillingCenter.
   *
   * @param account the Account entity to create.  Must include all non-nullable fields (please refer to data
   *                dictionary for the current set of required fields for Account), except DefaultPaymentInstrument.  
   *               If DefaultPaymentInstrument is null, the account's Responsive PaymentInstrument will be chosen.  If
   *               a Responsive PaymentInstrument does not exist, one will be created.
   * @return the newly created account entity
   * @throws DataConversionException if account is null
   */
  @Throws(DataConversionException, "if account is null")
  function createAccount(account : Account) : Account {
    require(account, "account")

    account.Bundle.commit()
    return account;
  }
  
  /**
   * Creates a producer in BillingCenter.
   *
   * @param producer the producer to create.  Must include all non-nullable fields (please refer to data dictionary for
   *                 the current set of required fields for Producer)
   * @return the newly created producer entity
   * @throws DataConversionException if producer, producerPaymentPeriodicity, or nextPaymentDate is null
   */
  @Throws(DataConversionException, "if producer, producerPaymentFrequency, producerPaymentBasis, or nextPaymentDate is null")
  function createProducer(producer : Producer,
                          producerPaymentPeriodicity : Periodicity, 
                          nextPaymentDate : DateTime) : Producer {
    require(producer, "producer")
    require(producerPaymentPeriodicity, "producerPaymentPeriodicity")
    require(nextPaymentDate, "nextPaymentDate")

    var ppr = producer.getProducerPaymentRecurrable()
    ppr.InitialDate = nextPaymentDate
    ppr.DayOfMonth = nextPaymentDate.DayOfMonth
    ppr.Periodicity = producerPaymentPeriodicity
    ppr.Producer = producer
    producer.Bundle.commit()
    return producer;
  }
  
  /**
   * Creates a shared activity within BillingCenter
   *
   * @param activityPatternID the public ID of the activity pattern
   * @param subject           optional subject, which overrides the subject generated from the activity pattern
   * @param description       optional description, which overrides the description generated from the activity pattern
   * @param targetDate        optional target date
   * @param escalationDate    optional escalation date
   * @param mandatory         sets the activity <code>mandatory<code> flag, which is true if the activity must be completed and
   *                          cannot be skipped.
   */
  @Throws(DataConversionException, "if activityPatternID does not correspond to an existing activity pattern")
  function createSharedActivity(activityPatternID : String,
                                subject : String,
                                description : String,
                                targetDate : DateTime,
                                escalationDate : DateTime,
                                mandatory : Boolean) : SharedActivity {
    var sharedActivity : SharedActivity
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var activityPattern : ActivityPattern
      if (activityPatternID != null) {
        activityPattern = Query.make(entity.ActivityPattern).compare("PublicID", Equals, activityPatternID).select().getAtMostOneRow()
        if (activityPattern == null) {
          throw new DataConversionException(activityPatternID + " not a valid activity pattern public ID")
        }
      }
      sharedActivity = new SharedActivity(bundle)
      sharedActivity.initialize(activityPattern, targetDate, escalationDate)
      if (subject != null) {
        sharedActivity.Subject = subject
      }
      if (description != null) {
        sharedActivity.Description = description  
      }
      sharedActivity.Mandatory = mandatory
      sharedActivity.Priority = (activityPattern != null ? activityPattern.Priority : "normal")    
    })
    
    return sharedActivity        
  }
  
  /**
   * Creates a trouble ticket in BillingCenter.
   *
   * @param troubleTicket the trouble ticket to create.  Must include all non-nullable fields (please refer to data dictionary for
   *                      the current set of required fields for TroubleTicket)
   * @return the newly created trouble ticket entity
   */
  @Throws(DataConversionException, "if trouble ticket is null")
  function createTroubleTicket(troubleTicket : TroubleTicket) : TroubleTicket {
    require(troubleTicket, "troubleTicket")
    troubleTicket.Bundle.commit();
    return troubleTicket
  }

  /**
   * Returns the status of the given account, represented by an AccountInfo non-persistent entity.  Note that this
   * information is temporal, and should only be used as a snapshot.  See the description of the fields on AccountInfo
   * to get more details about what information is included in this call.
   *
   * @param accountID the public ID of the account
   * @return a snapshot of the given account
   */
  @Throws(DataConversionException, "if no account exists with given public ID")
  function getAccountInfo(accountID : String) : AccountInfo {
    var account = loadAccount(accountID)
    var accountInfo : AccountInfo
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      account = bundle.add(account)
      accountInfo = account.getAccountInfo()
    })
    
    return accountInfo
  }

  /**
   * Returns information about the given Producer, represented by the non-persistent entity ProducerInfo. This info
   * is a snapshot of information and should only be used as such. See the fields on ProducerInfo for more on what
   * this call provides.
   *
   * @param producerID public ID of the Producer
   * @return snapshot of the given Producer
   */
  @Throws(DataConversionException, "if no producer exists with given public ID")
  function getProducerInfo(producerID : String) : ProducerInfo {
    var producer = Query.make(Producer).compare("PublicID", Equals, producerID).select().getAtMostOneRow()
    if (producer == null) {
      throw new DataConversionException(producerID + " not a valid producer public ID")  
    }
    var producerInfo : ProducerInfo
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      producer = bundle.add(producer)
      producerInfo = producer.getProducerInfo()
    })
    
    return producerInfo
  }

  /**
   * Returns a snapshot of information about the active Policy Period at the time this method was invoked.
   *
   * @param policyPeriodID the public ID of the Policy Period
   * @return a snapshot of the currently active Policy Period for the given Policy
   */
  @Throws(DataConversionException, "if no policyperiod exists with given public ID")
  function getPolicyPeriodInfo(policyPeriodID : String) : PolicyPeriodInfo {
    var policyPeriod = loadPolicyPeriod(policyPeriodID)
    var policyPeriodInfo : PolicyPeriodInfo
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriodInfo = policyPeriod.getPolicyPeriodInfo()
    })

    return policyPeriodInfo;
  }

  /**
   * Gets all of the available billing plans in the system.  Only plans which are effective (ie effectiveDate &lt=
   * current date &lt= expiration date) are returned.
   *
   * @return the available billing plans
   */
  function getAllCurrentBillingPlans() : BillingPlan[] {
    var results = Query.make(BillingPlan).select().iterator()
    var resultsList = new ArrayList()
    for (var billingPlan in results) {
      resultsList.add(billingPlan)
    }
    
    return resultsList.toArray(new BillingPlan[0])
  }

  /**
   * Gets all of the available delinquency plans in the system.  Only plans which are effective (ie effectiveDate &lt=
   * current date &lt= expiration date) are returned.
   *
   * @return the available delinquency plans
   */
  function getAllCurrentDelinquencyPlans() : DelinquencyPlan[] {
    var results = Query.make(DelinquencyPlan).select().iterator()
    var resultsList = new ArrayList()
    for (var delinquencyPlan in results) {
      resultsList.add(delinquencyPlan)
    }
    
    return resultsList.toArray(new DelinquencyPlan[0])
  }

  /**
   * Gets all of the available payment plans in the system.  Only plans which are effective (ie effectiveDate &lt=
   * current date &lt= expiration date) are returned.
   *
   * @return the available payment plans
   */
  function getAllCurrentPaymentPlans() : PaymentPlan[] {
    var results = Query.make(PaymentPlan).compare("UserVisible", Equals, true).select()
    var resultsList = new ArrayList()
    for (var paymentPlan in results) {
      resultsList.add(paymentPlan)
    }
    
    return resultsList.toArray(new PaymentPlan[0])
  }

  /**
   * Gets all of the activity patterns in the system.
   *
   * @return all of the activity patterns in the system.
   */
  function getAllActivityPatterns() : ActivityPattern[] {
    var results = Query.make(ActivityPattern).select().iterator()
    var resultsList = new ArrayList()
    for (var activityPattern in results) {
      resultsList.add(activityPattern)
    }
    
    return resultsList.toArray(new ActivityPattern[0])
  }

  /**
   * Returns the charge pattern with the matching code (case-sensitive).  Returns null if no charge pattern found
   *
   * @param name which must correspond to the ChargeCode field on a charge pattern
   * @return the matching ChargePattern instance, or null if no match found
   */
  function getChargePatternByCode(name : String) : ChargePattern {
    return ChargeUtil.getChargePatternByCode(name);
  }

  /**
   * Returns all invoice items related to this policy period, sorted from oldest to newest
   *
   * @return invoice items sorted from oldest to newest
   */
  @Throws(DataConversionException, "if accountID is null or does not match an existing account")
  function getInvoicesSortedByDate(accountID : String) : Invoice[] {
    require(accountID, "accountID")
    var account = Query.make(Account).compare("PublicID", Equals, accountID).select().getAtMostOneRow()
    if (account == null) {
      throw new DataConversionException(accountID + " not a valid account public ID")
    }
    
    return account.getInvoicesSortedByDate();
  }

  /**
   * Returns all invoice items related to this policy period, sorted from oldest to newest
   *
   * @return invoice items sorted from oldest to newest
   */
  @Throws(DataConversionException, "if policyPeriodID is null or does not match an existing policyPeriodID")
  function getInvoiceItemsSortedByDate(policyPeriodID : String) : InvoiceItem[] {
    require(policyPeriodID, "policyPeriodID")
    var policyPeriod = Query.make(PolicyPeriod).compare("PublicID", Equals, policyPeriodID).select().getAtMostOneRow()
    if (policyPeriod == null) {
      throw new DataConversionException(policyPeriodID + " not a valid policyperiod public ID")  
    }
    
    return policyPeriod.getInvoiceItemsSortedByEventDate()
  }

  /**
   * Returns all invoice items on an invoice
   *
   * @return invoice items on the invoice
   */
  @Throws(DataConversionException, "if policyPeriodID is null or does not match an existing policyPeriodID")
  function getInvoiceItemsOnInvoice(invoiceID : String) : InvoiceItem[] {
    require(invoiceID, "invoiceID")
    var found = Query.make(Invoice).compare("PublicID", Equals, invoiceID).select().getAtMostOneRow()
    if (found == null) {
      throw new DataConversionException(invoiceID + " not a valid invoice public ID")  
    }
    
    return found.InvoiceItems
  }

  /**
   * Puts a hold on the given account, effective immediately.  Applies the given HoldTypes to the hold.
   * Creates a trouble ticket and a hold that is linked to the trouble ticket.
   * <p/>
   * NOTE: in BillingCenter 1.0, holds are always associated with trouble tickets
   *
   * @param accountID The id of the Account
   * @param holdTypes The holds on the Account
   */
  @Throws(DataConversionException, "if holdTypes is null")
  function putHoldOnAccount(accountID : String, holdTypes : HoldType[]) : TroubleTicket {
    require(holdTypes, "holdTypes")
    return createHoldOnAccount(accountID, holdTypes, null)
  }

  /**
   * Puts a hold on the given policy, effective immediately.  Applies the given HoldTypes to the hold.
   * Creates a trouble ticket and a hold that is linked to the trouble ticket.
   * <p/>
   * NOTE: holds are always associated with trouble tickets
   *
   * @param policyPeriodID The id of the Policy Period
   * @param holdTypes      The holds on the Policy Period
   */
  @Throws(DataConversionException, "if holdTypes is null")
  function putHoldOnPolicyPeriod(policyPeriodID : String, holdTypes : HoldType[]) : TroubleTicket {
    require(holdTypes, "holdTypes")
    return createHoldOnPolicyPeriod(policyPeriodID, holdTypes, null)
  }

  /**
   * Provides same functionality as putHoldOnPolicyPeriod(String policyPeriodID,HoldType[] holdTypes, TroubleTicket troubleTicket)
   * with one difference.  This version of the method takes in a TroubleTicket and uses that to apply the HoldTypes.
   * Use this version of the method if is desired to customize the title, description etc of the TroubleTicket
   * associated with the hold.
   *
   * @param accountID     The id of the Account
   * @param holdTypes     The holds on the Account
   * @param troubleTicket TroubleTicket to be used in applying the hold types to the Account
   */
  @Throws(DataConversionException, "if holdTypes is null")
  function putHoldOnAccount(accountID : String, holdTypes : HoldType[], troubleTicket : TroubleTicket) : TroubleTicket {
    require(holdTypes, "holdTypes")
    require(troubleTicket, "troubleTicket")
    return createHoldOnAccount(accountID, holdTypes, troubleTicket)
  }

  /**
   * Provides same functionality as
   * {@link IBillingCenterAPI#putHoldOnPolicyPeriod(String,HoldType[])}
   * with one difference.  This version of the method takes in a TroubleTicket and uses that to apply the HoldTypes.
   * Use this version of the method if is desired to customize the title, description etc of the TroubleTicket
   * associated with the hold.
   *
   * @param policyPeriodID The id of the Policy Period
   * @param holdTypes      The holds on the Policy Period
   * @param troubleTicket  TroubleTicket to be used in applying the hold types to the PolicyPeriod
   * @throws DataConversionException if holdTypes is null
   */
  @Throws(DataConversionException, "if holdTypes or troubleTicket is null")
  function putHoldOnPolicyPeriod(policyPeriodID : String, holdTypes : HoldType[], troubleTicket : TroubleTicket) : TroubleTicket {
    require(holdTypes, "holdTypes");
    require(troubleTicket, "troubleTicket");
    return createHoldOnPolicyPeriod(policyPeriodID, holdTypes, troubleTicket)
  }

  /**
   * Releases the given HoldTypes on the given account.  If an account has multiple holds on it, then releases the given
   * HoldTypes on all the holds on the account.  If after releasing the given HoldTypes, there are no active HoldTypes
   * on the hold, releases the hold itself by closing the associated trouble ticket.
   * <p/>
   * NOTE: in BillingCenter, holds are always associated with trouble tickets
   *
   * @param accountID The id of the Account
   * @param holdTypes The holds on the Account to release
   */
  @Throws(DataConversionException, "if holdTypes is null")
  function releaseHoldOnAccount(accountID : String, holdTypes : HoldType[]) {
    var account = loadAccount(accountID)
    releaseHoldsOnAccountOrPolicyPeriod(account.TroubleTickets, holdTypes)
  }

  /**
   * Releases the given HoldTypes on the given policy.  If a policy has multiple holds on it, then releases the given
   * HoldTypes on all the holds on the policy.  If after releasing the given HoldTypes, there are no active HoldTypes
   * on the hold, releases the hold itself by closing the associated trouble ticket.
   * <p/>
   * NOTE: in BillingCenter, holds are always associated with trouble tickets
   *
   * @param policyPeriodID The id of the Policy Period
   * @param holdTypes      The holds on the Policy Period to release
   */
  @Throws(DataConversionException, "if holdTypes is null")
  function releaseHoldOnPolicyPeriod(policyPeriodID : String, holdTypes : HoldType[]) {
    var policyPeriod = loadPolicyPeriod(policyPeriodID)
    releaseHoldsOnAccountOrPolicyPeriod(policyPeriod.Policy.TroubleTickets, holdTypes);
  }

  /**
   * Generic Billing Instruction
   *
   * @param billingInstruction an instance of one of the available concrete PlcyBillingInstruction subtypes
   * @return array of invoice items
   * @throws DataConversionException if chargeEffectiveDate, context, or charges is null
   * @throws SOAPServerException     if billing instruction cannot be committed because of concurrent data change exceptions
   */
  @Throws(DataConversionException, "if holdTypes is null")
  @Throws(DuplicateKeyException, "if policy already exists, and billing instruction attempts to create a duplicate")
  @Throws(RequiredFieldException, "if required data in BillingInstruction missing")
  @Throws(SOAPServerException, "if too many concurrent data change exceptions are thrown and billing instruction can't be committed")
  function sendBillingInstruction(billingInstruction : BillingInstruction) : BillingInstruction {
    require(billingInstruction, "billingInstruction")
    return BillingInstructionUtil.executeAndCommit(billingInstruction)
  }

  /**
   * Generic Billing Instruction with payment plan modifiers
   *
   * @param billingInstruction an instance of one of the available concrete PlcyBillingInstruction subtypes
   * @return array of invoice items
   * @throws DataConversionException if chargeEffectiveDate, context, or charges is null
   * @throws SOAPServerException     if billing instruction cannot be committed because of concurrent data change exceptions
   */
  @Throws(DataConversionException, "if holdTypes is null")
  @Throws(DuplicateKeyException, "if policy already exists, and billing instruction attempts to create a duplicate")
  @Throws(RequiredFieldException, "if required data in BillingInstruction missing")
  @Throws(SOAPServerException, "if too many concurrent data change exceptions are thrown and billing instruction can't be committed")
  function sendBillingInstruction(billingInstruction : PlcyBillingInstruction,
                                  paymentPlanModifiers : PaymentPlanModifier[]) : PlcyBillingInstruction {
    require(billingInstruction, "billingInstruction")
    return BillingInstructionUtil.executeAndCommit(billingInstruction, paymentPlanModifiers)
  }

  /**
   * Cancels a premium report due date billing instruction.
   *
   * @param policyPeriodID the ID of the policyPeriod
   * @param startDate the Start Date of the target billing period
   * @param endDate the End Date of the target billing period - null ok
   */
  function cancelPremiumReportDueDate(policyPeriodID : String, startDate: Date, endDate: Date) {
    var policyPeriod = loadPolicyPeriod(policyPeriodID)
    var dueDateQuery = Query.make(PremiumReportDueDate)
    dueDateQuery.compare("PremiumReportDDPolicyPeriod", Equals, policyPeriod)
    dueDateQuery.compare("PeriodStartDate", Equals, startDate)
    dueDateQuery.compare("PeriodEndDate", Equals, endDate)
    var premiumReportDueDate = dueDateQuery.select().AtMostOneRow
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      premiumReportDueDate = bundle.add(premiumReportDueDate)
      premiumReportDueDate.remove()
    })                 
  }

  /**
   * Starts delinquency processing on the given policy.  It does not do any checking such as whether this PolicyPeriod
   * already has an active delinquency process. The caller is responsible for making the necessary checks.
   *
   * @param policyPeriodID the ID of the policyPeriod
   * @param reason         the reason the delinquency is being started
   * @return the delinquency process that was created
   */
  function startDelinquency(policyPeriodID : String, reason : DelinquencyReason) : DelinquencyProcess {
    var policyPeriod = loadPolicyPeriod(policyPeriodID)
    var delinquencyProcess : DelinquencyProcess
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      delinquencyProcess = policyPeriod.startDelinquency(reason)
    })
    return delinquencyProcess;
  }

  /**
   * If the trigger is available in the workflow for the single active delinquency process associated with
   * the policyPeriod, the workflow will be triggered.
   *
   * @param policyPeriodID  the public id of the policy period
   * @param workflowTrigger the trigger to be invoked
   * @return true if the trigger was invoked; false if the trigger was not available in the workflow
   */
  @Throws(EntityStateException, "if entities are in a illegal state")
  @Throws(DataConversionException, "if workflowTrigger is null")
  function triggerDelinquencyWorkflow(policyPeriodID : String, workflowTrigger : WorkflowTriggerKey) : Boolean {
    require(workflowTrigger, "workflowTrigger")
    var policyPeriod = loadPolicyPeriod(policyPeriodID)
    var result = true
    // Now, load the delinquency process into bundle and invoke the trigger.
    // Do all of the bundling here, and then delegate to more testable method.
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      var processes = policyPeriod.ActiveDelinquencyProcesses
      if (processes.isEmpty()) {
        noDelinquencyProcessFor(policyPeriod)
      }
      for (var value in processes) {
        var delinquencyProcess = bundle.add(value)
        result = triggerDelinquencyWorkflow(delinquencyProcess, policyPeriod, workflowTrigger) && result
      }
    })
    
    return result;
  }

  /**
   * Returns the CommissionSubPlan that is the best match for the given (new) policy period using the given producer
   * code.  Does not persist anything - this method should be used to preview what the eventual commission a producer
   * could expect to get.
   *
   * @param policyPeriod   a new policy period.  If the policy period already exists, then a DataConversionException is
   *                       thrown.
   * @param producerCodeID the public ID of a producer code
   * @return CommissionSubPlan that is the best match
   */
  @Throws(DataConversionException, "if the policy period already exists, or if the producerCodeID doesn't correspond to an existing producer code")
  function getApplicableCommissionSubPlan(policyPeriod : PolicyPeriod, producerCodeID : String) : CommissionSubPlan {
    require(policyPeriod, "policyPeriod")
    var producerCode = Query.make(ProducerCode).compare("PublicID", Equals, producerCodeID).select().getAtMostOneRow()
    if (producerCode == null) {
      throw new DataConversionException(producerCodeID + " does not correspond to a valid producer code")
    }
    return producerCode.CommissionPlan.getApplicableSubPlan(policyPeriod);
  }

  /**
   * Populates the CommissionRateOverrides array on each Charge in the array of Charges based on the given commission subplan 
   * and the given policy role.  This method, combined with {@link #getApplicableCommissionSubPlan(PolicyPeriod,String)} can
   * be used to preview the expected commission rates that a new policy will generate.
   *
   * @param policyPeriod        The policy period that is going to be submitted.  The ICommission.getCommissionRate() plugin
   *                            method can use the data on the policy period to determine a rate, if necessary.  The internal method only uses
   *                            the policyRole field combined with the commission subplan to determine a rate.
   * @param policyRole          The policy role that is going to be used
   * @param commissionSubPlanID The commission subplan
   * @param charges             The charges, on which will be added the updated commission rate.
   */
  @Throws(DataConversionException, "if the policy period, policyRole, or charges variables are null")
  function populateCommissionRateOverrides(policyPeriod : PolicyPeriod,
                                           policyRole : PolicyRole,
                                           commissionSubPlanID : String,
                                           charges : Charge[]) : Charge[] {
    require(policyPeriod, "policyPeriod");
    require(policyRole, "policyRole");
    require(charges, "charges");
    require(commissionSubPlanID, "commissionSubPlanID")
    var commissionSubPlan = Query.make(CommissionSubPlan).compare("PublicID", Equals, commissionSubPlanID).select().getAtMostOneRow()
    if (commissionSubPlan == null) {
      throw new DataConversionException(commissionSubPlan + " does not correspond to a valid commission subplan")
    }
    for (var charge in charges) {
      if (commissionSubPlan.isCommissionable(charge.ChargePattern, policyRole)) {
        var rate = commissionSubPlan.getBaseRate(charge.ChargePattern, policyRole)
        charge.overrideCommissionRate( policyRole, rate )
      }
    }
    return charges;
  }

  // private methods ===================================================================================================
  
  
    
  private function triggerDelinquencyWorkflow(delinquencyProcess : DelinquencyProcess,
                                              policyPeriod : PolicyPeriod,
                                              workflowTrigger : WorkflowTriggerKey) : Boolean {
    if (delinquencyProcess == null) {
      noDelinquencyProcessFor(policyPeriod);
    }
    return delinquencyProcess.invokeTrigger(workflowTrigger)
  }

  private function noDelinquencyProcessFor(policyPeriod : PolicyPeriod) {
    throw new EntityStateException("PolicyPeriod [" + policyPeriod + "] does not have any active delinquency processes");
  }

  /**
   * @param accountID     public ID of an Account
   * @param holdTypes     array of HoldType instances corresponding to types of holds to apply to the Account
   * @param troubleTicket an existing trouble ticket to use to apply the holds, or null if we should create a new trouble ticket
   * @return TroubleTicket corresponding to the hold that was applied to the Account in this method
   */
  private function createHoldOnAccount(accountID : String,
                                       holdTypes : HoldType[],
                                       troubleTicket : TroubleTicket) : TroubleTicket {
    var account = loadAccount(accountID)
    if (troubleTicket != null) {
      // Use passed-in trouble ticket to apply the hold types to the policy period
      account = troubleTicket.Bundle.add(account)
      TroubleTicketUtil.putHoldOnAccount(account, holdTypes, troubleTicket)
      troubleTicket.Bundle.commit()
    } else {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        account = bundle.add(account)
        troubleTicket = TroubleTicketUtil.putHoldOnAccount(account, holdTypes)
      })
    }

    return troubleTicket;
  }

  /**
   * @param policyPeriodID public ID of a PolicyPeriod
   * @param holdTypes      array of HoldType instances corresponding to types of holds to apply to the PolicyPeriod
   * @param troubleTicket  an existing trouble ticket to use to apply the holds, or null if we should create a new trouble ticket
   * @return TroubleTicket corresponding to the hold that was applied to the PolicyPeriod in this method
   */
  private function createHoldOnPolicyPeriod(policyPeriodID : String,
                                            holdTypes : HoldType[],
                                            troubleTicket : TroubleTicket) : TroubleTicket {
    var policyPeriod = loadPolicyPeriod(policyPeriodID)
    if (troubleTicket != null) {
      // Use passed-in trouble ticket to apply the hold types to the policy period
      policyPeriod = troubleTicket.getBundle().add(policyPeriod);
      TroubleTicketUtil.putHoldOnPolicyPeriod(policyPeriod, holdTypes, troubleTicket);
      troubleTicket.Bundle.commit()
    } else {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        policyPeriod = bundle.add(policyPeriod)
        troubleTicket = TroubleTicketUtil.putHoldOnPolicyPeriod(policyPeriod, holdTypes)
      })
    }
    return troubleTicket;
  }

  private function releaseHoldsOnAccountOrPolicyPeriod(troubleTickets : TroubleTicket[], holdTypes : HoldType[]) {
    require(holdTypes, "holdTypes");
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var holdTypeSet = new HashSet<HoldType>(Arrays.asList(holdTypes))
      for (var troubleTicket in troubleTickets) {
        troubleTicket = bundle.add(troubleTicket)
        var hold = bundle.add(troubleTicket.Hold)
        for (var holdTypeEntry in hold.HoldTypes) {
          if (holdTypeSet.contains(holdTypeEntry.getHoldType())) {
            hold.removeFromHoldTypes(holdTypeEntry)
          }
        }
        troubleTicket.Hold.checkForHoldReleases()
        if (hold.HoldTypes.length == 0) {
          troubleTicket.close()
        }
      }
    })
  }
}
