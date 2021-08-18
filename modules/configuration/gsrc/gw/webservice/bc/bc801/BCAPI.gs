package gw.webservice.bc.bc801

uses gw.api.domain.invoice.ReversePaymentsWhenMovingInvoiceItem
uses gw.api.tools.ProcessID
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.SOAPServerException
uses gw.api.webservice.tableImport.StagingTableEncryptionImpl
uses gw.pl.persistence.core.Bundle
uses gw.transaction.Transaction
uses gw.webservice.bc.bc801.util.WebserviceEntityLoader
uses gw.webservice.bc.bc801.util.WebservicePreconditions
uses gw.xml.ws.annotation.WsiWebService

uses java.util.Date
uses com.guidewire.pl.system.util.DateTimeUtil
uses gw.api.database.Query
uses gw.api.util.DateUtil
uses gw.i18n.DateTimeFormat

@WsiWebService("http://guidewire.com/bc/ws/gw/webservice/bc/bc801/BCAPI")
@Export
class BCAPI {
  /**
   * Add a new Note to an existing Account
   *
   * @param noteDTO Info. about the Note to add to an existing Account
   * @param accountPublicID PublicID of an existing Account
   * @return PublicID of the newly created Note entity which has been added to the Account
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If accountPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Account with PublicID matching accountPublicID.")
  function addNoteToAccount(noteDTO: NoteDTO, accountPublicID: String): String {
    var note: Note
    Transaction.runWithNewBundle(\bundle -> {
      var account = WebserviceEntityLoader.loadAccount(accountPublicID)
      note = buildNote(noteDTO, bundle)
      account.addNote(note)
    })
    return note.PublicID
  }

  /**
   * Add a new Note to an existing PolicyPeriod
   *
   * @param noteDTO Info. about the Note to add to an existing PolicyPeriod
   * @param policyPeriodPublicID PublicID of an existing PolicyPeriod
   * @return PublicID of the newly created Note entity which has been added to the PolicyPeriod
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPeriodPublicID is null.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with PublicID matching policyPeriodPublicID.")
  function addNoteToPolicyPeriod(noteDTO: NoteDTO, policyPeriodPublicID: String): String {
    var note: Note
    Transaction.runWithNewBundle(\bundle -> {
      var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
      note = buildNote(noteDTO, bundle)
      policyPeriod.Policy.addNote(note)
    })
    return note.PublicID
  }

  /**
   * Add a new Note to an existing Producer
   *
   * @param noteDTO Info. about the Note to add to an existing Producer
   * @param producerPublicID PublicID of an existing Producer
   * @return PublicID of the newly created Note entity which has been added to the Producer
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If producerPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Producer with PublicID matching producerPublicID.")
  function addNoteToProducer(noteDTO: NoteDTO, producerPublicID: String): String {
    var note: Note
    Transaction.runWithNewBundle(\bundle -> {
      var producer = WebserviceEntityLoader.loadProducer(producerPublicID)
      note = buildNote(noteDTO, bundle)
      producer.addNote(note)
    })
    return note.PublicID
  }

  /**
   * Add a new Note to an existing TroubleTicket
   *
   * @param noteDTO Info. about the Note to add to an existing TroubleTicket
   * @param troubleTicketPublicID PublicID of an existing TroubleTicket
   * @return PublicID of the newly created Note entity which has been added to the trouble ticket
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If troubleTicketPublicID is null.")
  @Throws(BadIdentifierException, "If there is no TroubleTicket with PublicID matching troubleTicketPublicID.")
  function addNoteToTroubleTicket(noteDTO: NoteDTO, troubleTicketPublicID: String): String {
    var note: Note
    Transaction.runWithNewBundle(\bundle -> {
      var troubleTicket = WebserviceEntityLoader.loadTroubleTicket(troubleTicketPublicID)
      note = buildNote(noteDTO, bundle)
      troubleTicket.addNote(note)
    })
    return note.PublicID
  }

  /**
   * Changes the Billing Method from Direct Bill or List Bill to Agency Bill.
   * <p/>
   * It will try to make it appear as if the original policy period was Agency Bill to begin with and deal with
   * reallocating commissions, moving invoice items, etc.
   *
   * @param policyPeriodPublicID the PublicID of the policyperiod whose billing method needs to be changed to AgencyBill
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(BadIdentifierException, "Policy period public id is not valid")
  @Throws(RequiredFieldException, "Policy period public id cannot be null")
  function changeBillingMethodToAgencyBill(policyPeriodPublicID: String) {
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriod.changeBillingMethodToAgencyBill(ReversePaymentsWhenMovingInvoiceItem.No)
    })
  }

  /**
   * Changes the Billing Method from Agency Bill or List Bill to Direct Bill.
   * <p/>
   * It will try to make it appear as if the original policy period was Direct Bill to begin with and deal with
   * reallocating commissions, moving invoice items, etc.
   * @param policyPeriodPublicID the PublicID of the policyperiod whose billing method needs to be changed to DirectBill
   * @param createInvoiceForToday whether to create a catchup invoice for today for past items
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(BadIdentifierException, "Policy period public id is not valid")
  @Throws(RequiredFieldException, "Policy period public id cannot be null")
  function changeBillingMethodToDirectBill(createInvoiceForToday: boolean, policyPeriodPublicID: String) {
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriod.changeBillingMethodToDirectBill(createInvoiceForToday, ReversePaymentsWhenMovingInvoiceItem.OnlyForNonPlanned)
    })
  }

  /**
   * Changes the Billing Method from Agency Bill or Direct Bill to List Bill.
   * <p/>
   * @param policyPeriodPublicID Required. The PublicID of a PolicyPeriod which will change its BillingMethod to List Bill.
   * @param listBillAccountPublicID Required. The PublicID of a ListBill Account which will be the payer
   * @param paymentPlanPublicID Required. The PublicID of a PaymentPlan to be used
   * @param invoiceStreamPublicID Required. The PublicID of an InvoiceStream to be used
   * @param movePlannedInvoicesOnly Optional. If true, move only the planned invoices to the new payer. Otherwise, move all the invoices to the new payer.
   *                                If null is passed in, the value will default to false.
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPeriodPublicID is null.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with the given policyPeriodPublicID.")
  @Throws(RequiredFieldException, "If listBillAccountPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Account with the given listBillAccountPublicID.")
  @Throws(RequiredFieldException, "If paymentPlanPublicID is null.")
  @Throws(BadIdentifierException, "If there is no PaymentPlan with the given paymentPlanPublicID.")
  @Throws(RequiredFieldException, "If invoiceStreamPublicID is null.")
  @Throws(BadIdentifierException, "If there is no InvoiceStream with the given invoiceStreamPublicID.")
  @Throws(BadIdentifierException, "If the ListBillAccount is not List Bill.")
  function changeBillingMethodToListBill(policyPeriodPublicID: String,
                                         listBillAccountPublicID: String,
                                         paymentPlanPublicID: String,
                                         invoiceStreamPublicID: String,
                                         movePlannedInvoicesOnly: Boolean) {
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    var listBillAccount = WebserviceEntityLoader.loadAccount(listBillAccountPublicID)
    if (not listBillAccount.ListBill) {
      throw new BadIdentifierException(displaykey.BCAPI.Error.NonListBillAccount(listBillAccount))
    }
    var paymentPlan = WebserviceEntityLoader.loadByPublicID<PaymentPlan>(paymentPlanPublicID)
    var invoiceStream = WebserviceEntityLoader.loadByPublicID<InvoiceStream>(invoiceStreamPublicID)
    movePlannedInvoicesOnly = movePlannedInvoicesOnly ?: false
    /**
     * reversePayments
     * Indicates when to reverse a payment if the invoice item it pays is moved.
     * Possible value are "Yes", "No" and "OnlyForNonPlanned".
     * The default is "No".
     */
    var reversePayments = ReversePaymentsWhenMovingInvoiceItem.No
    /**
     * redistributePayments
     * If true, redistribute and reverse affected payment items. Otherwise, reverse affected payment items but do not redistribute them.
     * The default is false.
     */
    var redistributePayments = false
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      policyPeriod.changeBillingMethodToListBill(listBillAccount, paymentPlan, invoiceStream, movePlannedInvoicesOnly, reversePayments, redistributePayments)
    })
  }

  /**
   * Adds a new Document to an existing Account
   * <p/>
   * @param documentDTO contains the properties of the Document to be added
   * @param accountPublicID   the PublicID of an existing Account
   * @return the PublicID of the newly created document
   */
  @Throws(SOAPServerException, "If a communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If documentDTO is null")
  @Throws(RequiredFieldException, "If accountPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Account with the given accountPublicID.")
  function addDocumentToAccount(documentDTO: DocumentDTO, accountPublicID: String): String {
    WebservicePreconditions.notNull(documentDTO, "documentDTO")
    var document: Document
    Transaction.runWithNewBundle(\bundle -> {
      var account = WebserviceEntityLoader.loadAccount(accountPublicID)
      document = account.addDocument(documentDTO.writeToNewEntityIn(bundle))
    })
    return document.PublicID
  }

  /**
   * Add a new Document to an existing PolicyPeriod
   * <p/>
   *
   * @param documentDTO contains the properties of the Document to be added
   * @param policyPeriodPublicID  the PublicID of an existing PolicyPeriod
   * @return the PublicID of the newly created document
   */
  @Throws(SOAPServerException, "If a communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If documentDTO is null")
  @Throws(RequiredFieldException, "If policyPeriodID is null.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with the given policyPeriodPublicID.")
  function addDocumentToPolicyPeriod(documentDTO: DocumentDTO, policyPeriodPublicID: String): String {
    WebservicePreconditions.notNull(documentDTO, "documentDTO")
    var document: Document
    Transaction.runWithNewBundle(\bundle -> {
      var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
      document = policyPeriod.Policy.addDocument(documentDTO.writeToNewEntityIn(bundle))
    })
    return document.PublicID
  }

  /**
   * Add a new Document to an existing Producer
   * <p/>
   * @param documentDTO contains the properties of the Document to be added
   * @param producerPublicID the PublicID of an existing Producer
   * @return the PublicID of the newly created document
   */
  @Throws(SOAPServerException, "If a communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If documentDTO is null")
  @Throws(RequiredFieldException, "If producerPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Producer with the given producerPublicID.")
  function addDocumentToProducer(documentDTO: DocumentDTO, producerPublicID: String): String {
    WebservicePreconditions.notNull(documentDTO, "documentDTO")
    var document: Document
    Transaction.runWithNewBundle(\bundle -> {
      var producer = WebserviceEntityLoader.loadProducer(producerPublicID)
      document = producer.addDocument(documentDTO.writeToNewEntityIn(bundle))
    })
    return document.PublicID
  }

  /**
   * Creates a shared activity within BillingCenter
   *
   * @param activityPatternPublicID the public ID of the activity pattern
   * @param subject           optional subject, which overrides the subject generated from the activity pattern
   * @param description       optional description, which overrides the description generated from the activity pattern
   * @param priority          optional priority, which overrides the priority generated from the activity pattern
   * @param targetDate        optional target date, which overrides the target date of the activity pattern
   * @param escalationDate    optional escalation date, which overrides the target date of the activity pattern
   * @param mandatory         optional If true, the activity must be completed and cannot be skipped. Overrides the mandatory flag of the activity pattern
   * @param troubleTicketDTO  optional TroubleTicket, contains the properties of the TroubleTicket to be associated with the activity.
   * @return                  the publicID of the created SharedActivity
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If activityPatternPublicID is null.")
  @Throws(BadIdentifierException, "If activityPatternPublicID does not correspond to an existing activity pattern")
  function createSharedActivity(activityPatternPublicID: String,
                                subject: String,
                                description: String,
                                priority: Priority,
                                targetDate: Date,
                                escalationDate: Date,
                                mandatory: Boolean,
                                troubleTicketDTO: TroubleTicketDTO): String {
    var isShared = true
    var sharedActivity = createNewActivity(activityPatternPublicID, subject, description, priority, targetDate, escalationDate, mandatory, troubleTicketDTO, isShared)
    return sharedActivity.PublicID
  }

  /**
   * Creates an Activity within BillingCenter and calls autoAssign.
   *
   * @param activityPatternPublicID the public ID of the activity pattern
   * @param subject           optional subject, which overrides the subject generated from the activity pattern
   * @param description       optional description, which overrides the description generated from the activity pattern
   * @param priority          optional priority, which overrides the priority generated from the activity pattern
   * @param targetDate        optional target date, which overrides the target date of the activity pattern
   * @param escalationDate    optional escalation date, which overrides the target date of the activity pattern
   * @param mandatory         optional If true, the activity must be completed and cannot be skipped. Overrides the mandatory flag of the activity pattern
   * @param troubleTicketDTO  optional TroubleTicket, contains the properties of the TroubleTicket to be associated with the activity.
   * @return                  the publicID of the created Activity
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If activityPatternPublicID is null.")
  @Throws(BadIdentifierException, "If activityPatternPublicID does not correspond to an existing activity pattern")
  function createActivity(activityPatternPublicID: String,
                          subject: String,
                          description: String,
                          priority: Priority,
                          targetDate: Date,
                          escalationDate: Date,
                          mandatory: Boolean,
                          troubleTicketDTO: TroubleTicketDTO): String {
    var activity = createNewActivity(activityPatternPublicID, subject, description, priority, targetDate, escalationDate, mandatory, troubleTicketDTO)
    activity.autoAssign()
    activity.Bundle.commit()
    return activity.PublicID
  }

  /**
   * Creates an Activity within BillingCenter and assign it to a User
   *
   * @param activityPatternPublicID the public ID of the activity pattern
   * @param subject           optional subject, which overrides the subject generated from the activity pattern
   * @param description       optional description, which overrides the description generated from the activity pattern
   * @param priority          optional priority, which overrides the priority generated from the activity pattern
   * @param targetDate        optional target date, which overrides the target date of the activity pattern
   * @param escalationDate    optional escalation date, which overrides the target date of the activity pattern
   * @param mandatory         optional If true, the activity must be completed and cannot be skipped. Overrides the mandatory flag of the activity pattern
   * @param troubleTicketDTO  optional TroubleTicket, contains the properties of the TroubleTicket to be associated with the activity.
   * @param userPublicID      the publicID of the User to which the Activity will be assigned.
   * @param groupPublicID     the publicID of the Group to which the Activity will be assigned. The User must belong to the Group.
   * @return                  the publicID of the created Activity
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If activityPatternPublicID is null.")
  @Throws(BadIdentifierException, "If activityPatternPublicID does not correspond to an existing activity pattern")
  @Throws(RequiredFieldException, "If userPublicID is null.")
  @Throws(BadIdentifierException, "If userPublicID does not correspond to an existing User")
  @Throws(BadIdentifierException, "If the User lacks permission to own an Activity.")
  @Throws(RequiredFieldException, "If groupPublicID is null.")
  @Throws(BadIdentifierException, "If groupPublicID does not correspond to an existing Group")
  function createActivityAssignedToUser(activityPatternPublicID: String,
                                        subject: String,
                                        description: String,
                                        priority: Priority,
                                        targetDate: Date,
                                        escalationDate: Date,
                                        mandatory: Boolean,
                                        troubleTicketDTO: TroubleTicketDTO,
                                        userPublicID: String,
                                        groupPublicID: String): String {
    var user = WebserviceEntityLoader.loadByPublicID<User>(userPublicID, "userPublicID")
    if (not userCanBeAssignedToActivity(user)) {
      throw new BadIdentifierException(displaykey.Java.Error.Permission.OtherUserOwnActivity(user))
    }
    var group = WebserviceEntityLoader.loadByPublicID<Group>(groupPublicID, "groupPublicID")
    if (not group.containsUser(user)) {
      throw new BadIdentifierException("user must be in the group")
    }
    var activity = createNewActivity(activityPatternPublicID, subject, description, priority, targetDate, escalationDate, mandatory, troubleTicketDTO)
    activity.assign(group, user)
    activity.Bundle.commit()
    return activity.PublicID
  }

  private function userCanBeAssignedToActivity(user: User): boolean {
    return user.Roles*.Role*.Privileges*.Permission.contains(SystemPermissionType.TC_ACTOWN)
  }

  /**
   * Returns the Data Transfer Object ("DTO") which represents a summary of data from the given account.
   * Note that this information is temporal, and should only be used as a snapshot. See the description of the fields on AccountInfoDTO
   * to get more details about what information is included in this call.
   *
   * @param accountPublicID the PublicID of the account
   * @return a new AccountInfoDTO that represents a summary of data from an {@link entity.Account}.
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If accountPublicID is null.")
  @Throws(BadIdentifierException, "If accountPublicID does not correspond to an existing Account")
  function getAccountInfo(accountPublicID: String): AccountInfoDTO {
    var account = WebserviceEntityLoader.loadAccount(accountPublicID)
    var accountInfoDTO = AccountInfoDTO.valueOf(account)
    return accountInfoDTO
  }

  /**
   * Returns information about the given Producer, represented by the ProducerInfoDTO object. This info
   * is a snapshot of information and should only be used as such. See the fields on ProducerInfoDTO for more on what
   * this call provides.
   *
   * @param producerPublicID PublicID of the Producer
   * @return a ProducerInfoDTO object that represents a summary of data from a {@link entity.Producer}
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If producerPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Producer with PublicID matching producerPublicID.")

  function getProducerInfo(producerPublicID: String): ProducerInfoDTO {
    WebservicePreconditions.notNull(producerPublicID, "producerPublicID")
    var producer = WebserviceEntityLoader.loadProducer(producerPublicID)
    var producerInfoDTO = ProducerInfoDTO.valueOf(producer)
    return producerInfoDTO
  }

  /**
   * Returns information about the given PolicyPeriod, represented by the PolicyPeriodInfoDTO object. This info
   * is a snapshot of information and should only be used as such. See the fields on PolicyPeriodInfoDTO for more on what
   * this call provides.
   *
   * @param policyPeriodPublicID PublicID of the PolicyPeriod
   * @return a policyPeriodInfoDTO object that represents a summary of data from a {@link entity.PolicyPeriod}
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPeriodPublicID is null.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with PublicID matching policyPeriodPublicID.")

  function getPolicyPeriodInfo(policyPeriodPublicID: String): PolicyPeriodInfoDTO {
    WebservicePreconditions.notNull(policyPeriodPublicID, "policyPeriodPublicID")
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    var policyPeriodInfoDTO = PolicyPeriodInfoDTO.valueOf(policyPeriod)
    return policyPeriodInfoDTO
  }

  private function xor(condition1: Boolean, condition2: Boolean): boolean {
    return (condition1 && !condition2 ) || (!condition1 && condition2 )
  }

  /**
   * Creates a CollateralRequirement
   * <p/>
   * @param collateralRequirementDTO contains the properties of the CollateralRequirement to be added
   * @return the PublicID of the newly created CollateralRequirement
   */
  @Throws(SOAPServerException, "If a communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If collateralRequirementDTO is null")
  @Throws(RequiredFieldException, "If collateralRequirementDTO.CollateralPublicID is null.")
  @Throws(RequiredFieldException, "If collateralRequirementDTO.EffectiveDate is null.")
  @Throws(SOAPException, "If collateralRequirementDTO.EffectiveDate occurrs in the past.")
  @Throws(SOAPException, "If collateralRequirementDTO.ExpirationDate occurrs in the past.")
  @Throws(RequiredFieldException, "If collateralRequirementDTO.RequirementName is null.")
  @Throws(RequiredFieldException, "If collateralRequirementDTO.RequirementType is null.")
  @Throws(BadIdentifierException, "If there is no Collateral with the given collateralRequirementDTO.CollateralPublicID.")
  @Throws(BadIdentifierException, "If there is no Policy with the given collateralRequirementDTO.PolicyPublicID.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with the given collateralRequirementDTO.PolicyPeriodPublicID.")
  @Throws(SOAPException, "If collateralRequirementDTO.Required is null or zero.")
  @Throws(SOAPException, "If collateralRequirementDTO.EffectiveDate occurs after collateralRequirementDTO.ExpirationDate.")
  @Throws(SOAPException, "If collateralRequirementDTO.CollateralRequirementType is not Cash but collateralRequirementDTO.Segregated has been set.")
  @Throws(SOAPException, "If both collateralRequirementDTO.PolicyPublicID and collateralRequirementDTO.PolicyPeriodPublicID are non-null.")
  @Throws(SOAPException, "If Policy with PolicyPublicID does not belong to Account that has Collateral with PublicID = collateralRequirementDTO.CollateralPublicID.")
  @Throws(SOAPException, "If PolicyPeriod with PolicyPeriodPublicID does not belong to Account that has Collateral with PublicID = collateralRequirementDTO.CollateralPublicID.")
  function createCollateralRequirement(collateralRequirementDTO: CollateralRequirementDTO): String {
    WebservicePreconditions.notNull(collateralRequirementDTO, "collateralRequirementDTO")
    WebservicePreconditions.notNull(collateralRequirementDTO.CollateralPublicID, "collateralRequirementDTO.CollateralPublicID")
    WebservicePreconditions.notNull(collateralRequirementDTO.EffectiveDate, "collateralRequirementDTO.EffectiveDate")
    WebservicePreconditions.checkArgument(!(collateralRequirementDTO.Required == null || collateralRequirementDTO.Required.IsZero), displaykey.BCAPI.Error.CollateralRequirement.Required)
    WebservicePreconditions.notNull(collateralRequirementDTO.RequirementName, "collateralRequirementDTO.RequirementName")
    WebservicePreconditions.notNull(collateralRequirementDTO.RequirementType, "collateralRequirementDTO.RequirementType")
    WebservicePreconditions.checkArgument(DateUtil.verifyDateOnOrAfterToday(collateralRequirementDTO.EffectiveDate), displaykey.BCAPI.Error.CollateralRequirement.DateInPast("collateralRequirementDTO.EffectiveDate", DateUtil.currentDate().formatDate(DateTimeFormat.SHORT), collateralRequirementDTO.EffectiveDate.formatDate(DateTimeFormat.SHORT)))
    if (collateralRequirementDTO.ExpirationDate != null) {
      WebservicePreconditions.checkArgument(DateUtil.verifyDateOnOrAfterToday(collateralRequirementDTO.ExpirationDate), displaykey.BCAPI.Error.CollateralRequirement.DateInPast("collateralRequirementDTO.ExpirationDate", DateUtil.currentDate().formatDate(DateTimeFormat.SHORT), collateralRequirementDTO.ExpirationDate.formatDate(DateTimeFormat.SHORT)))
      WebservicePreconditions.checkArgument(
          DateTimeUtil.getEarlierOfTwoDates(
              collateralRequirementDTO.EffectiveDate,
                  collateralRequirementDTO.ExpirationDate)
              .equals(collateralRequirementDTO.EffectiveDate),
              displaykey.BCAPI.Error.CollateralRequirement.DateConstraint(collateralRequirementDTO.EffectiveDate, collateralRequirementDTO.ExpirationDate)
      )
    }
    if (!collateralRequirementDTO.RequirementType.equals(CollateralRequirementType.TC_CASH)) {
      WebservicePreconditions.checkArgument(
          collateralRequirementDTO.Segregated == null,
              displaykey.BCAPI.Error.CollateralRequirement.SegregatedConstraint
      )
    }
    WebservicePreconditions.checkArgument(
        xor(collateralRequirementDTO.PolicyPeriodPublicID != null, collateralRequirementDTO.PolicyPublicID != null) ||
            (collateralRequirementDTO.PolicyPeriodPublicID == null && collateralRequirementDTO.PolicyPublicID == null),
            displaykey.Java.Error.CollateralRequirement.MultipleTargets
    )
    var collateralRequirement: CollateralRequirement
    Transaction.runWithNewBundle(\bundle -> {
      collateralRequirement = collateralRequirementDTO.writeToNewEntityIn(bundle)
    })
    return collateralRequirement.PublicID
  }

  /**
   * Starts delinquency processing on the given account.  It does not do any checking such as whether this Account
   * already has an active delinquency process. The caller is responsible for making the necessary checks.
   *
   * @param accountPublicID the PublicID of the Account
   * @param reason          the reason the delinquency is being started
   * @return the DelinquencyProcessDTO that was created
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If accountPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Account with PublicID matching accountPublicID.")
  @Throws(RequiredFieldException, "If reason is null.")
  function startDelinquencyOnAccount(accountPublicID: String, reason: typekey.DelinquencyReason): DelinquencyProcessDTO {
    WebservicePreconditions.notNull(reason, "reason")
    var account = WebserviceEntityLoader.loadAccount(accountPublicID)
    var delinquencyProcess: DelinquencyProcess
    Transaction.runWithNewBundle(\bundle -> {
      account = bundle.add(account)
      delinquencyProcess = account.startDelinquency(reason)
    })
    var delinquencyProcessDTO = DelinquencyProcessDTO.valueOf(delinquencyProcess)
    return delinquencyProcessDTO
  }

  /**
   * Starts delinquency processing on the given policy.  It does not do any checking such as whether this PolicyPeriod
   * already has an active delinquency process. The caller is responsible for making the necessary checks.
   *
   * @param policyPeriodPublicID the PublicID of the policyPeriod
   * @param reason               the reason the delinquency is being started
   * @return the DelinquencyProcessDTO that was created
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPeriodPublicID is null.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with PublicID matching policyPeriodPublicID.")
  @Throws(RequiredFieldException, "If reason is null.")
  function startDelinquencyOnPolicyPeriod(policyPeriodPublicID: String, reason: typekey.DelinquencyReason): DelinquencyProcessDTO {
    WebservicePreconditions.notNull(reason, "reason")
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    var delinquencyProcess: DelinquencyProcess
    Transaction.runWithNewBundle(\bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      delinquencyProcess = policyPeriod.startDelinquency(reason)
    })
    var delinquencyProcessDTO = DelinquencyProcessDTO.valueOf(delinquencyProcess)
    return delinquencyProcessDTO
  }

  /**
   * Invoke the trigger in the workflow (if available) for the active delinquency processes associated with
   * the Account including the delinquency processes of the PolicyPeriods of the Account. Returns true if all of the
   * workflow triggers were available and invoked; false if there was one workflow trigger that was not available.
   *
   * @param accountPublicID  the public id of the Account
   * @param workflowTrigger the trigger to be invoked
   * @return true if all of the workflow triggers were available and invoked; otherwise false.
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If accountPublicID is null.")
  @Throws(BadIdentifierException, "If there is no Account with PublicID matching accountPublicID.")
  @Throws(RequiredFieldException, "If workflowTrigger is null.")
  function triggerDelinquencyWorkflowOnAccount(accountPublicID: String, workflowTrigger: WorkflowTriggerKey): Boolean {
    WebservicePreconditions.notNull(workflowTrigger, "workflowTrigger")
    var account = WebserviceEntityLoader.loadAccount(accountPublicID)
    var result = true
    Transaction.runWithNewBundle(\bundle -> {
      account = bundle.add(account)
      var processes = account.ActiveDelinquencyProcesses
      if (processes.isEmpty()) {
        result = false
      }
      for (delinquencyProcess in processes) {
        delinquencyProcess = bundle.add(delinquencyProcess)
        result = delinquencyProcess.invokeTrigger(workflowTrigger) and result
      }
    })
    return result
  }

  /**
   * If the trigger is available in the workflow for the single active delinquency process associated with
   * the policyPeriod, the workflow will be triggered.
   *
   * @param policyPeriodPublicID  the public id of the policy period
   * @param workflowTrigger the trigger to be invoked
   * @return true if the trigger was invoked; false if the trigger was not available in the workflow
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPeriodPublicID is null.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with PublicID matching policyPeriodPublicID.")
  @Throws(RequiredFieldException, "If workflowTrigger is null.")
  function triggerDelinquencyWorkflowOnPolicyPeriod(policyPeriodPublicID: String, workflowTrigger: WorkflowTriggerKey): Boolean {
    WebservicePreconditions.notNull(workflowTrigger, "workflowTrigger")
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    var result = true
    Transaction.runWithNewBundle(\bundle -> {
      policyPeriod = bundle.add(policyPeriod)
      var processes = policyPeriod.ActiveDelinquencyProcesses
      if (processes.isEmpty()) {
        result = false
      }
      for (delinquencyProcess in processes) {
        delinquencyProcess = bundle.add(delinquencyProcess)
        result = delinquencyProcess.invokeTrigger(workflowTrigger) and result
      }
    })
    return result
  }

  /**
   * Instructs the  server to encrypt data on the staging tables.
   */
  @Throws(SOAPException, "")
  public function encryptDataOnStagingTables(){
    new StagingTableEncryptionImpl().encryptDataOnStagingTables()
  }

  /**
   * Instructs the  server to encrypt data on the staging tables.  The same as encryptDataOnStagingTables
   * except that the process will be performed asynchronously in a batch process.  After completion,
   * the process status will contain the number of tables that were updated in the opsCompleted field.
   * Note that this batch process can't be terminated.
   *
   */
  @Throws(SOAPException, "")
  public function encryptDataOnStagingTablesAsBatchProcess() : ProcessID {
    return new StagingTableEncryptionImpl().encryptDataOnStagingTablesAsBatchProcess()
  }

  /**
   * Creates a premium report due date billing instruction.
   *
   * @param premiumReportDueDateDTO contains the properties of the PremiumReportDueDate to create
   * @return the PublicID of the PremiumReportDueDate that was created.
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If premiumReportDueDateDTO is null.")
  @Throws(RequiredFieldException, "If the DueDate field of premiumReportDueDateDTO is null.")
  @Throws(RequiredFieldException, "If the PeriodStartDate field of premiumReportDueDateDTO is null.")
  @Throws(RequiredFieldException, "If the PremiumReportDDPolicyPeriodPublicID field of premiumReportDueDateDTO is null.")
  function createPremiumReportDueDate(premiumReportDueDateDTO : PremiumReportDueDateDTO) : String {
    WebservicePreconditions.notNull(premiumReportDueDateDTO, "premiumReportDueDateDTO")
    WebservicePreconditions.notNull(premiumReportDueDateDTO.DueDate, "premiumReportDueDateDTO.DueDate")
    WebservicePreconditions.notNull(premiumReportDueDateDTO.PeriodStartDate, "premiumReportDueDateDTO.PeriodStartDate")
    WebservicePreconditions.notNull(premiumReportDueDateDTO.PremiumReportDDPolicyPeriodPublicID, "premiumReportDueDateDTO.PremiumReportDDPolicyPeriodPublicID")
    var premiumReportDueDate : PremiumReportDueDate
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      premiumReportDueDate = premiumReportDueDateDTO.writeToNewIn(bundle)
      premiumReportDueDate.execute()
    })
    return premiumReportDueDate.PublicID
  }

  /**
   * Cancels a premium report due date billing instruction.
   *
   * @param policyPeriodPublicID the ID of the PremiumReportDDPolicyPeriod of the PremiumReportDueDate
   * @param startDate the Start Date of the target billing period
   * @param endDate the End Date of the target billing period - null ok
   * @return true if the PremiumReportDueDate was found and successfully canceled. Otherwise return false.
   */
  @Throws(SOAPServerException, "If communication error or any other SOAP problem occurs.")
  @Throws(RequiredFieldException, "If policyPeriodPublicID is null.")
  @Throws(BadIdentifierException, "If there is no PolicyPeriod with PublicID matching policyPeriodPublicID.")
  @Throws(RequiredFieldException, "If startDate is null.")
  @Throws(BadIdentifierException, "If there is no PremiumReportDueDate found with the given policyPeriodPublicID, startDate and endDate.")
  function cancelPremiumReportDueDate(policyPeriodPublicID : String, startDate : Date, endDate : Date) : Boolean {
    WebservicePreconditions.notNull(policyPeriodPublicID, "policyPeriodPublicID")
    WebservicePreconditions.notNull(startDate, "startDate")
    var policyPeriod = WebserviceEntityLoader.loadPolicyPeriod(policyPeriodPublicID)
    var dueDateQuery = Query.make(PremiumReportDueDate)
    dueDateQuery.compare("PremiumReportDDPolicyPeriod", Equals, policyPeriod)
    dueDateQuery.compare("PeriodStartDate", Equals, startDate)
    dueDateQuery.compare("PeriodEndDate", Equals, endDate)
    var premiumReportDueDate = dueDateQuery.select().AtMostOneRow
    if (premiumReportDueDate == null) {
      throw new BadIdentifierException(displaykey.BCAPI.Error.PremiumReportDueDateNotFound(policyPeriodPublicID, startDate, endDate))
    }
    var premiumReportDueDatePublicID = premiumReportDueDate.PublicID
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      premiumReportDueDate = bundle.add(premiumReportDueDate)
      premiumReportDueDate.remove()
    })
    // verify that it was removed
    var removedPremiumReportDueDate = Query.make(PremiumReportDueDate).compare("PublicID", Equals, premiumReportDueDatePublicID).select().AtMostOneRow
    return removedPremiumReportDueDate == null
  }

  //--------------------------------------------------------------------------------------

  // private methods

  private function createNewActivity(activityPatternPublicID: String,
                                     subject: String,
                                     description: String,
                                     priority: Priority,
                                     targetDate: Date,
                                     escalationDate: Date,
                                     mandatory: Boolean,
                                     troubleTicketDTO: TroubleTicketDTO,
                                     isShared: boolean = false): Activity {
    WebservicePreconditions.notNull(activityPatternPublicID, "activityPatternPublicID")
    var activity: Activity
    gw.transaction.Transaction.runWithNewBundle(\bundle -> {
      var activityPattern = WebserviceEntityLoader.loadByPublicID<ActivityPattern>(activityPatternPublicID)
      var troubleTicket: TroubleTicket
      if (troubleTicketDTO != null) {
        troubleTicket = troubleTicketDTO.writeToNewIn(bundle)
      }
      if (isShared) {
        if (troubleTicket == null) {
          activity = new SharedActivity(bundle)
        } else {
          activity = troubleTicket.createSharedActivity()
        }
      } else {
        if (troubleTicket == null) {
          activity = new Activity(bundle)
        } else {
          activity = troubleTicket.createActivity()
        }
      }
      activity.initialize(activityPattern, targetDate, escalationDate)
      activity = applyActivityOverrides(activity, subject, description, priority, targetDate, escalationDate, mandatory)
    })
    return activity
  }

  private function applyActivityOverrides(activity: Activity,
                                          subject: String,
                                          description: String,
                                          priority: Priority,
                                          targetDate: Date,
                                          escalationDate: Date,
                                          mandatory: Boolean): Activity {
    if (description != null) activity.Description = description
    if (escalationDate != null) activity.EscalationDate = escalationDate
    if (mandatory != null) activity.Mandatory = mandatory
    activity.Mandatory = activity.Mandatory ?: false
    if (priority != null) activity.Priority = priority
    activity.Priority = activity.Priority ?: TC_NORMAL
    if (subject != null) activity.Subject = subject
    if (targetDate != null) activity.TargetDate = targetDate
    return activity
  }

  private function buildNote(noteDTO: NoteDTO, bundle: Bundle): Note {
    WebservicePreconditions.notNull(noteDTO, "noteDTO")
    var note = noteDTO.writeToNewEntityIn(bundle)
    return note
  }
}
