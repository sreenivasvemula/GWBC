package gw.webservice.bc.bc801

uses com.guidewire.pl.system.dependency.PLDependencies
uses gw.api.domain.troubleticket.TroubleTicketUtil
uses gw.api.util.Logger
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.SOAPServerException
uses gw.pl.persistence.core.Bundle
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.bc.bc801.util.WebservicePreconditions
uses gw.xml.ws.annotation.WsiWebService

uses java.lang.Exception
uses java.util.Date
uses java.util.List

@WsiWebService("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/TroubleTicketAPI")
@Export
class TroubleTicketAPI {

  private static final var SHOULD_IGNORE_CASE = true
  
  construct() {
  }

  public function createDisasterTroubleTicketsOnAccountsAndPoliciesWithPostalCodes(postalCodes : List<String>) {
    var exceptionWasThrown = false
    try {
      createTroubleTicketsOnAccountsAndPolicyPeriodsWithPostalCodes(postalCodes)
    } catch (ex : Exception) {
      exceptionWasThrown = true
      Logger.logError("An exception occurred while creating disaster trouble tickets", ex)
    }

    if (exceptionWasThrown) {
      createActivityWhenExceptionOccurs(postalCodes)
    }
  }

  public function createDisasterTroubleTicketsOnPoliciesWithPostalCodes(postalCodes : List<String>) {
    var exceptionWasThrown = false
    try {
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> { 
        createTroubleTicketsOnPolicyPeriodsWithPostalCodes(postalCodes)
      })
    } catch (ex : Exception) {
      exceptionWasThrown = true
      Logger.logError("An exception occurred while creating disaster trouble tickets", ex)
    }

    if (exceptionWasThrown) {
      createActivityWhenExceptionOccurs(postalCodes)
    }
  }

  /**
   * Creates a trouble ticket in BillingCenter.
   *
   * @param troubleTicketDTO contains the properties of the TroubleTicket to create
   * @return the PublicID of the newly created trouble ticket entity
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If troubleTicketDTO is null.")
  @Throws(RequiredFieldException, "If the 'Title' field troubleTicketDTO is missing.")
  @Throws(RequiredFieldException, "If the 'DetailedDescription' field troubleTicketDTO is missing.")
  function createTroubleTicket(troubleTicketDTO : TroubleTicketDTO) : String {
    WebservicePreconditions.notNull(troubleTicketDTO, "troubleTicketDTO")
    WebservicePreconditions.notNull(troubleTicketDTO.Title, "troubleTicketDTO#Title")
    WebservicePreconditions.notNull(troubleTicketDTO.DetailedDescription, "troubleTicketDTO#DetailedDescription")

    var ticket : TroubleTicket
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      ticket = troubleTicketDTO.writeToNewIn(bundle)
    })
    return ticket.PublicID
  }

  /**
   * Puts a hold on the given Account, effective immediately.
   * Creates a TroubleTicket on the given Account based upon the given TroubleTicketDTO and uses that to apply the HoldTypes.
   *
   * @param accountPublicID The PublicID of the Account
   * @param holdTypes The holds on the Account
   * @param troubleTicketDTO contains the properties of the TroubleTicket to be used in applying the hold types to the Account.
   *                         TroubleTicket.Title and TroubleTicket.DetailedDescription are required fields.
   * @return the PublicID of the new TroubleTicket
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If accountPublicID is null.")
  @Throws(RequiredFieldException, "If holdTypes is null.")
  @Throws(SOAPException, "If holdTypes is an empty array.")
  @Throws(RequiredFieldException, "If troubleTicketDTO is null.")
  @Throws(RequiredFieldException, "If the 'Title' field troubleTicketDTO is missing.")
  @Throws(RequiredFieldException, "If the 'DetailedDescription' field troubleTicketDTO is missing.")
  @Throws(BadIdentifierException, "If there is no Account with PublicID matching accountID.")
  function putHoldOnAccount(accountPublicID: String, holdTypes: HoldType[], troubleTicketDTO : TroubleTicketDTO) : String {
    WebservicePreconditions.notNull(accountPublicID, "accountPublicID")
    WebservicePreconditions.notNull(holdTypes, "holdTypes")
    WebservicePreconditions.checkArgument(not holdTypes.IsEmpty, "holdTypes can not be an empty array")
    WebservicePreconditions.notNull(troubleTicketDTO, "troubleTicketDTO")
    WebservicePreconditions.notNull(troubleTicketDTO.Title, "troubleTicketDTO#Title")
    WebservicePreconditions.notNull(troubleTicketDTO.DetailedDescription, "troubleTicketDTO#DetailedDescription")
    return createHoldOnAccount(accountPublicID, holdTypes, troubleTicketDTO)
  }

  /**
   * Puts a hold on the given PolicyPeriod, effective immediately.
   * Creates a TroubleTicket on the given PolicyPeriod based upon the given TroubleTicketDTO and uses that to apply the HoldTypes.
   *
   * @param policyPeriodPublicID The PublicID of the PolicyPeriod
   * @param holdTypes The holds on the PolicyPeriod
   * @param troubleTicketDTO contains the properties of the TroubleTicket to be used in applying the hold types to the Policy Period.
   *                         TroubleTicket.Title and TroubleTicket.DetailedDescription are required fields.
   * @return the publicID of the new TroubleTicket
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPeriodPublicID is null.")
  @Throws(RequiredFieldException, "If holdTypes is null.")
  @Throws(SOAPException, "If holdTypes is an empty array.")
  @Throws(RequiredFieldException, "If troubleTicketDTO is null.")
  @Throws(RequiredFieldException, "If the 'Title' field troubleTicketDTO is missing.")
  @Throws(RequiredFieldException, "If the 'DetailedDescription' field troubleTicketDTO is missing.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with PublicID matching policyPeriodID.")
  function putHoldOnPolicyPeriod(policyPeriodPublicID: String, holdTypes: HoldType[], troubleTicketDTO : TroubleTicketDTO): String {
    WebservicePreconditions.notNull(policyPeriodPublicID, "policyPeriodPublicID")
    WebservicePreconditions.notNull(holdTypes, "holdTypes")
    WebservicePreconditions.checkArgument(not holdTypes.IsEmpty, "holdTypes can not be an empty array")
    WebservicePreconditions.notNull(troubleTicketDTO, "troubleTicketDTO")
    WebservicePreconditions.notNull(troubleTicketDTO.Title, "troubleTicketDTO#Title")
    WebservicePreconditions.notNull(troubleTicketDTO.DetailedDescription, "troubleTicketDTO#DetailedDescription")
    return createHoldOnPolicyPeriod(policyPeriodPublicID, holdTypes, troubleTicketDTO)
  }

  /**
   * Puts a hold on the given Policy, effective immediately.
   * Creates a TroubleTicket on the given Policy based upon the given TroubleTicketDTO and uses that to apply the HoldTypes.
   * Use this method if you really want to put a hold on the Policy. Otherwise use
   * {@link #putHoldOnPolicyPeriod(java.lang.String, typekey.HoldType[], gw.webservice.bc.bc801.TroubleTicketDTO) instead
   *
   * @param policyPublicID The PublicID of the Policy
   * @param holdTypes The holds on the Policy
   * @param troubleTicketDTO contains the properties of the TroubleTicket to be used in applying the hold types to the Policy Period.
   *                         TroubleTicket.Title and TroubleTicket.DetailedDescription are required fields.
   * @return the publicID of the new TroubleTicket
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPublicID is null.")
  @Throws(RequiredFieldException, "If holdTypes is null.")
  @Throws(SOAPException, "If holdTypes is an empty array.")
  @Throws(RequiredFieldException, "If troubleTicketDTO is null.")
  @Throws(RequiredFieldException, "If the 'Title' field troubleTicketDTO is missing.")
  @Throws(RequiredFieldException, "If the 'DetailedDescription' field troubleTicketDTO is missing.")
  @Throws(BadIdentifierException, "If there is no Policy with PublicID matching policyPublicID.")
  function putHoldOnPolicy(policyPublicID: String, holdTypes: HoldType[], troubleTicketDTO : TroubleTicketDTO): String {
    WebservicePreconditions.notNull(policyPublicID, "policyPublicID")
    WebservicePreconditions.notNull(holdTypes, "holdTypes")
    WebservicePreconditions.checkArgument(not holdTypes.IsEmpty, "holdTypes can not be an empty array")
    WebservicePreconditions.notNull(troubleTicketDTO, "troubleTicketDTO")
    WebservicePreconditions.notNull(troubleTicketDTO.Title, "troubleTicketDTO#Title")
    WebservicePreconditions.notNull(troubleTicketDTO.DetailedDescription, "troubleTicketDTO#DetailedDescription")
    return createHoldOnPolicy(policyPublicID, holdTypes, troubleTicketDTO)
  }

  /**
   * Puts a hold on the given Producer, effective immediately.
   * Creates a TroubleTicket on the given Producer based upon the given TroubleTicketDTO and uses that to apply the HoldTypes.
   *
   * @param producerPublicID The PublicID of the Producer
   * @param holdTypes The holds on the Producer
   * @param troubleTicketDTO contains the properties of the TroubleTicket to be used in applying the hold types to the Producer
   *                         TroubleTicket.Title and TroubleTicket.DetailedDescription are required fields.
   * @return the PublicID of the new TroubleTicket
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If producerPublicID is null.")
  @Throws(RequiredFieldException, "If holdTypes is null.")
  @Throws(SOAPException, "If holdTypes is an empty array.")
  @Throws(RequiredFieldException, "If troubleTicketDTO is null.")
  @Throws(RequiredFieldException, "If the 'Title' field troubleTicketDTO is missing.")
  @Throws(RequiredFieldException, "If the 'DetailedDescription' field troubleTicketDTO is missing.")
  @Throws(BadIdentifierException, "If there is no Producer with PublicID matching producerID.")
  function putHoldOnProducer(producerPublicID: String, holdTypes: HoldType[], troubleTicketDTO : TroubleTicketDTO): String {
    WebservicePreconditions.notNull(producerPublicID, "producerPublicID")
    WebservicePreconditions.notNull(holdTypes, "holdTypes")
    WebservicePreconditions.checkArgument(not holdTypes.IsEmpty, "holdTypes can not be an empty array")
    WebservicePreconditions.notNull(troubleTicketDTO, "troubleTicketDTO")
    WebservicePreconditions.notNull(troubleTicketDTO.Title, "troubleTicketDTO#Title")
    WebservicePreconditions.notNull(troubleTicketDTO.DetailedDescription, "troubleTicketDTO#DetailedDescription")
    return createHoldOnProducer(producerPublicID, holdTypes, troubleTicketDTO)
  }

  /**
   * Releases the given HoldTypes on the given account.  If an account has multiple holds on it, then releases the given
   * HoldTypes on all the holds on the account.  If after releasing the given HoldTypes, there are no active HoldTypes
   * on the hold, releases the hold itself by closing the associated trouble ticket.
   * <p/>
   * NOTE: in BillingCenter, holds are always associated with trouble tickets
   *
   * @param accountPublicID The PublicID of the Account
   * @param holdTypes The holds on the Account to release
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If accountPublicID is null.")
  @Throws(RequiredFieldException, "If holdTypes is null.")
  @Throws(BadIdentifierException, "If there is no Account with PublicID matching accountID.")
  function releaseHoldOnAccount(accountPublicID : String, holdTypes : HoldType[]) {
    WebservicePreconditions.notNull(accountPublicID, "accountPublicID")
    var account = WebserviceEntityLoader.loadByPublicID<Account>(accountPublicID)
    releaseHolds(account.TroubleTickets, holdTypes)
  }

  /**
   * Releases the given HoldTypes on the given policy.  If a policy has multiple holds on it, then releases the given
   * HoldTypes on all the holds on the policy.  If after releasing the given HoldTypes, there are no active HoldTypes
   * on the hold, releases the hold itself by closing the associated trouble ticket.
   * <p/>
   * NOTE: in BillingCenter, holds are always associated with trouble tickets
   *
   * @param policyPeriodPublicID The PublicID of the Policy Period
   * @param holdTypes The holds on the Policy Period to release
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPeriodPublicID is null.")
  @Throws(RequiredFieldException, "If holdTypes is null.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with PublicID matching policyPeriodID.")
  function releaseHoldOnPolicyPeriod(policyPeriodPublicID : String, holdTypes : HoldType[]) {
    WebservicePreconditions.notNull(policyPeriodPublicID, "policyPeriodPublicID")
    var policyPeriod = WebserviceEntityLoader.loadByPublicID<PolicyPeriod>(policyPeriodPublicID)
    releaseHolds(policyPeriod.TroubleTickets, holdTypes)
  }

  /**
   * Releases the given HoldTypes on the given producer.  If a producer has multiple holds on it, then releases the given
   * HoldTypes on all the holds on the producer.  If after releasing the given HoldTypes, there are no active HoldTypes
   * on the hold, releases the hold itself by closing the associated trouble ticket.
   * <p/>
   * NOTE: in BillingCenter, holds are always associated with trouble tickets
   *
   * @param producerPublicID The PublicID of the Producer
   * @param holdTypes The holds on the Producer to release
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If producerPublicID is null.")
  @Throws(RequiredFieldException, "If holdTypes is null.")
  @Throws(BadIdentifierException, "If there is no Producer with PublicID matching producerID.")
  function releaseHoldOnProducer(producerPublicID : String, holdTypes : HoldType[]) {
    WebservicePreconditions.notNull(producerPublicID, "producerPublicID")
    var producer = WebserviceEntityLoader.loadByPublicID<Producer>(producerPublicID)
    releaseHolds(producer.TroubleTickets, holdTypes)
  }

  //--------------------------------------------------------------------------------------

  // private methods

  /**
   * @param accountPublicID PublicID of an Account
   * @param holdTypes array of HoldType instances corresponding to types of holds to apply to the Account
   * @param troubleTicket a trouble ticket object to use to apply the holds, or null if we should create a new generic ticket
   * @return the PublicID of the new TroubleTicket
   */
  private function createHoldOnAccount(accountPublicID: String,
                                       holdTypes: HoldType[],
                                       troubleTicketDTO: TroubleTicketDTO): String {
    var account = WebserviceEntityLoader.loadAccount(accountPublicID)
    var troubleTicket : TroubleTicket
    if (troubleTicketDTO != null) {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        troubleTicket = troubleTicketDTO.writeToNewIn(bundle)
        account = bundle.add(account)
        TroubleTicketUtil.putHoldOnAccount(account, holdTypes, troubleTicket)
      })
    } else {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        account = bundle.add(account)
        troubleTicket = TroubleTicketUtil.putHoldOnAccount(account, holdTypes)
      })
    }
    return troubleTicket.PublicID
  }

  /**
   * @param policyPeriodPublicID PublicID of a PolicyPeriod
   * @param holdTypes array of HoldType instances corresponding to types of holds to apply to the PolicyPeriod
   * @param troubleTicket a trouble ticket object to use to apply the holds, or null if we should create a generic trouble ticket
   * @return the PublicID of the new TroubleTicket
   */
  private function createHoldOnPolicyPeriod(policyPeriodPublicID: String,
                                            holdTypes: HoldType[],
                                            troubleTicketDTO: TroubleTicketDTO): String {
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    var troubleTicket : TroubleTicket
    if (troubleTicketDTO != null) {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        troubleTicket = troubleTicketDTO.writeToNewIn(bundle)
        policyPeriod = bundle.add(policyPeriod)
        TroubleTicketUtil.putHoldOnPolicyPeriod(policyPeriod, holdTypes, troubleTicket)
      })
    } else {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        policyPeriod = bundle.add(policyPeriod)
        troubleTicket = TroubleTicketUtil.putHoldOnPolicyPeriod(policyPeriod, holdTypes)
      })
    }
    return troubleTicket.PublicID
  }

  /**
   * @param policyPublicID PublicID of a Policy
   * @param holdTypes array of HoldType instances corresponding to types of holds to apply to the Policy
   * @param troubleTicket a trouble ticket object to use to apply the holds, or null if we should create a generic trouble ticket
   * @return the PublicID of the new TroubleTicket
   */
  private function createHoldOnPolicy(policyPublicID: String,
                                      holdTypes: HoldType[],
                                      troubleTicketDTO: TroubleTicketDTO): String {
    var policy = WebserviceEntityLoader.loadByPublicID<Policy>(policyPublicID)
    var troubleTicket : TroubleTicket
    if (troubleTicketDTO != null) {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        troubleTicket = troubleTicketDTO.writeToNewIn(bundle)
        policy = bundle.add(policy)
        TroubleTicketUtil.putHoldOnPolicy(policy, holdTypes, troubleTicket)
      })
    } else {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        policy = bundle.add(policy)
        troubleTicket = TroubleTicketUtil.putHoldOnPolicy(policy, holdTypes)
      })
    }
    return troubleTicket.PublicID
  }

  /**
   * @param producerPublicID PublicID of a Producer
   * @param holdTypes array of HoldType instances corresponding to types of holds to apply to the Producer
   * @param troubleTicket a trouble ticket object to use to apply the holds, or null if we should create a generic trouble ticket
   * @return the PublicID of the new TroubleTicket
   */
  private function createHoldOnProducer(producerPublicID: String,
                                        holdTypes: HoldType[],
                                        troubleTicketDTO: TroubleTicketDTO): String {
    var producer = WebserviceEntityLoader.loadProducer(producerPublicID)
    var troubleTicket : TroubleTicket
    if (troubleTicketDTO != null) {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        troubleTicket = troubleTicketDTO.writeToNewIn(bundle)
        producer = bundle.add(producer)
        TroubleTicketUtil.putHoldOnProducer(producer, holdTypes, troubleTicket)
      })
    } else {
      gw.transaction.Transaction.runWithNewBundle(\bundle -> {
        producer = bundle.add(producer)
        troubleTicket = TroubleTicketUtil.putHoldOnProducer(producer, holdTypes)
      })
    }
    return troubleTicket.PublicID
  }

  private function releaseHolds(troubleTickets: TroubleTicket[], holdTypes: HoldType[]) {
    WebservicePreconditions.notNull(holdTypes, "holdTypes")
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      var holdTypeSet = holdTypes.toSet()
      for (troubleTicket in troubleTickets) {
        troubleTicket = bundle.add(troubleTicket)
        var hold = bundle.add(troubleTicket.Hold)
        hold.HoldTypes.where( \ holdType -> holdTypeSet.contains(holdType.getHoldType()))
            .each( \ holdType -> hold.removeFromHoldTypes(holdType))
        hold.checkForHoldReleases()
        if (hold.HoldTypes.length == 0) {
          troubleTicket.close()
        }
      }
    })
  }

  private function createTroubleTicketsOnAccountsAndPolicyPeriodsWithPostalCodes(postalCodes : List<String>) {
      for (postalCode in postalCodes) {
        var accounts = findAccountsInPostalCode(postalCode)
        for (account in accounts) {
        gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          account = bundle.add(account)
          createTroubleTicketOnOneAccountAndItsPolicies(account)
        })
        }
      }
  }

  private function createTroubleTicketsOnPolicyPeriodsWithPostalCodes(postalCodes : List<String>) {
      for (postalCode in postalCodes) {
        var policyPeriods = findPolicyPeriodsInPostalCode(postalCode)
        for (policyPeriod in policyPeriods) {
        gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
          policyPeriod = bundle.add(policyPeriod)
          createTroubleTicketOnPolicyPeriod(policyPeriod)
        })
        }
      }
  }
  
  protected function createTroubleTicketOnOneAccountAndItsPolicies(account : Account) : TroubleTicket {
    var troubleTicket = createBaseTroubleTicket(account.Bundle)
    var troubleTicketHelper = new CreateTroubleTicketHelper(account.Bundle)
    troubleTicketHelper.linkTroubleTicketWithAccount(troubleTicket, account)
    var policyPeriods = account.OpenPolicyPeriods
    if (policyPeriods.HasElements) {
      troubleTicketHelper.linkTroubleTicketWithPolicyPeriods(troubleTicket, policyPeriods)
    }
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_DELINQUENCY, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_INVOICESENDING, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_PAYMENTDISTRIBUTION, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_DISBURSEMENTS, true)
    troubleTicket.Hold.checkForHoldAdditions()
    return troubleTicket
  }

  protected function createTroubleTicketOnPolicyPeriod(policyPeriod : PolicyPeriod) : TroubleTicket {
    var troubleTicket = createBaseTroubleTicket(policyPeriod.Bundle)
    var troubleTicketHelper = new CreateTroubleTicketHelper(policyPeriod.Bundle)
    troubleTicketHelper.linkTroubleTicketWithPolicyPeriods(troubleTicket, {policyPeriod})
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_DELINQUENCY, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_INVOICESENDING, true)
    troubleTicket.Hold.setAppliedToHoldType(HoldType.TC_COMMISSIONPOLICYEARN, true)
    troubleTicket.Hold.checkForHoldAdditions()
    return troubleTicket
  }
  
  private function createBaseTroubleTicket(bundle : Bundle) : TroubleTicket {
    var troubleTicket = new TroubleTicket(bundle)
    troubleTicket.Priority = Priority.TC_HIGH
    troubleTicket.TicketType = TroubleTicketType.TC_DISASTERHOLD    
    troubleTicket.Title = displaykey.TroubleTicketAPI.DisasterTroubleTicket.Title
    troubleTicket.DetailedDescription = displaykey.TroubleTicketAPI.DisasterTroubleTicket.Description
    return troubleTicket
  }
  
  private function findAccountsInPostalCode(postalCode : String) : gw.api.database.IQueryBeanResult<Account> {
    var accountQuery = gw.api.database.Query.make(Account)
    return accountQuery.subselect("ID", CompareIn, AccountContact, "Account")
                .join("Contact")
                .join("PrimaryAddress")
                .startsWith("PostalCode", postalCode, SHOULD_IGNORE_CASE)
                .select()
  }

  private function findPolicyPeriodsInPostalCode(postalCode : String) : gw.api.database.IQueryBeanResult<PolicyPeriod> {
    var policyPeriodQuery = gw.api.database.Query.make(PolicyPeriod)
    return policyPeriodQuery.subselect("ID", CompareIn, PolicyPeriodContact, "PolicyPeriod")
                .join("Contact")
                .join("PrimaryAddress")
                .startsWith("PostalCode", postalCode, SHOULD_IGNORE_CASE)
                .select()
  }
  
  private function createActivityWhenExceptionOccurs(postalCodes : List<String>) {
    gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
      var activity = new Activity(bundle)
      activity.Priority = Priority.TC_NORMAL
      activity.Subject = displaykey.TroubleTicketAPI.DisasterTroubleTicket.Error.Activity.Subject
      activity.Description = displaykey.TroubleTicketAPI.DisasterTroubleTicket.Error.Activity.Description(postalCodes.toString(), Date.CurrentDate)
      var userToWhomActivityWillBeAssigned = PLDependencies.getUserFinder().findByCredentialName("admin")
      activity.assign( userToWhomActivityWillBeAssigned.RootGroup, userToWhomActivityWillBeAssigned )
    })
  }
}
