package gw.agencybill

uses com.guidewire.bc.api.web.producer.agencybill.distributionwizard.AgencyCycleDistViewInternal
uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.util.DisplayableException
uses gw.api.web.producer.agencybill.AgencyBillMoneyReceivedSetup
uses gw.api.web.producer.agencybill.AgencyBillMoneySetupFactory
uses gw.api.web.producer.agencybill.AgencyBillPaymentMoneySetup
uses gw.api.web.producer.agencybill.AgencyBillPromisedMoneySetup
uses gw.api.web.producer.agencybill.AgencyBillMoneyReceivedSetup.PolicyFilterOption
uses gw.api.web.producer.agencybill.distributionwizard.AgencyCycleDistView
uses gw.pl.currency.MonetaryAmount
uses pcf.AgencyDistributionWizard_SavePopup
uses pcf.api.Location

uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.lang.StringBuffer
uses java.util.ArrayList
uses java.util.Collections
uses java.util.Comparator
uses java.util.HashMap
uses java.util.Set

@Export
class AgencyDistributionWizardHelper {

  public static enum DistributeToEnum {
    DO_NOT_DISTRIBUTE_NOW(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeTo.DoNotDistributeNow),
    STATEMENTS_AND_POLICIES(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeTo.StatementsAndPolicies),
    PROMISE(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeTo.Promise),
    SAVED(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeTo.Saved),
    MODIFYING(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeTo.Modifying)
    //IMPORT_DATA(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeTo.ImportData) not yet implemented

    private var _displayResolver : block() : String as DisplayResolver
    override function toString() : String {
      return DisplayResolver()
    }

    private construct(resolveDisplayKey() : String) {
      _displayResolver = resolveDisplayKey
    }
  }

  public static enum DistributeAmountsEnum {
    EDIT_DISTRIBUTION(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeAmounts.EditDistribution),
    DISTRIBUTE_NET_OWED_AMOUNTS_AUTOMATICALLY(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeAmounts.DistributeNetOwedAmountsAutomatically)

    private var _displayResolver : block() : String as DisplayResolver
    override function toString() : String {
      return DisplayResolver()
    }

    private construct(resolveDisplayKey() : String) {
      _displayResolver = resolveDisplayKey
    }
  }

  public static enum DistributeByEnum {
    ITEM(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeBy.Item),
    POLICY(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributeBy.Policy)

    private var _displayResolver : block() : String as DisplayResolver
    override function toString() : String {
      return DisplayResolver()
    }

    private construct(resolveDisplayKey() : String) {
      _displayResolver = resolveDisplayKey
    }
  }

  public static enum StatusEnum {
    OPEN(\ -> displaykey.Web.AgencyDistributionWizardHelper.Status.Open),
    PLANNED(\ -> displaykey.Web.AgencyDistributionWizardHelper.Status.Planned),

    private var _displayResolver : block() : String as DisplayResolver
    override function toString() : String {
      return DisplayResolver()
    }

    private construct(resolveDisplayKey() : String) {
      _displayResolver = resolveDisplayKey
    }
  }

  public static enum DistributionDifferenceMethodEnum {
    USE_UNAPPLIED(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributionDifferenceMethod.UseUnapplied),
    WRITE_OFF(\ -> displaykey.Web.AgencyDistributionWizardHelper.DistributionDifferenceMethod.WriteOff),

    private var _displayResolver : block() : String as DisplayResolver
    override function toString() : String {
      return DisplayResolver()
    }

    private construct(resolveDisplayKey() : String) {
      _displayResolver = resolveDisplayKey
    }
  }

  public static enum DistributionTypeEnum {
    PROMISE,
    PAYMENT,
    CREDIT_DISTRIBUTION
  }

  public static function createMoneySetup(producer : Producer, location : Location, distributionType : DistributionTypeEnum, moneyToEdit : BaseMoneyReceived) : AgencyBillMoneyReceivedSetup {
    if (moneyToEdit != null) {
      if (moneyToEdit typeis AgencyBillMoneyRcvd) {
        return AgencyBillMoneySetupFactory.createEditingPaymentMoney(moneyToEdit, location)
      } else if (moneyToEdit typeis PromisedMoney) {
        return AgencyBillMoneySetupFactory.createEditingPromisedMoney(moneyToEdit, location)
      } else {
        throw new IllegalArgumentException(displaykey.Web.AgencyDistributionWizardHelper.Error.InvalidMoneyType(typeof moneyToEdit))
      }
    }

    switch (distributionType) {
      case DistributionTypeEnum.PAYMENT: return AgencyBillMoneySetupFactory.createNewPaymentMoney(producer, location)
      case DistributionTypeEnum.PROMISE : return AgencyBillMoneySetupFactory.createNewPromisedMoney(producer, location)
      case DistributionTypeEnum.CREDIT_DISTRIBUTION : return AgencyBillMoneySetupFactory.createNewZeroDollarMoney(producer, location)
      default: throw new IllegalArgumentException(displaykey.Web.AgencyDistributionWizardHelper.Error.UnknownDistributionType(distributionType))
    }
  }

  private var _moneySetup : AgencyBillMoneyReceivedSetup as MoneySetup
  private var _distributeTo : DistributeToEnum as DistributeTo
  private var _distributeAmounts : DistributeAmountsEnum as DistributeAmounts
  private var _distributeBy : DistributeByEnum as DistributeBy
  private var _agencyCycleDistView : AgencyCycleDistView as AgencyCycleDistView
  private var _distributionDifferenceMethod : DistributionDifferenceMethodEnum as DistributionDifferenceMethod
  private var _isSaving = false
  private var _isNew = true
  private var _warnNoStatementsSelected = true
  private var _wizard : pcf.api.Wizard

  construct(theMoneySetup : AgencyBillMoneyReceivedSetup) {
    _moneySetup = theMoneySetup
    _distributeTo = DistributeToValues.first()
    if (MoneySetup.SavedDistribution != null) {
      // if the money was instantiated with a saved distribution (for instance, we entered the wizard trying to continue with a saved distribution),
      // we need to reflect that on the screen
      _distributeTo = DistributeToEnum.SAVED
      _isNew = false
    }
    if (MoneySetup.EditingExecutedDistribution) {
      _isNew = false
    }
    _distributeAmounts = DistributeAmountsEnum.EDIT_DISTRIBUTION
    _distributeBy = DistributeByEnum.ITEM
    MoneySetup.Prefill = AgencyCycleDistPrefill.TC_UNPAID
    _distributionDifferenceMethod = DistributionDifferenceMethodEnum.USE_UNAPPLIED

    // initialize the distribute to statements to be populated with all open statements on the paying producer
    if (IsPayment) {
      MoneySetup.addDistributeToStatements(MoneySetup.Producer.AgencyBillCycles.map(\ abc -> abc.StatementInvoice).where(\ s -> s.Open))
    }
  }

  property set DistributeTo( value : DistributeToEnum) {
    if (value != DistributeToEnum.PROMISE && MoneySetup typeis AgencyBillPaymentMoneySetup) {
      MoneySetup.AppliedFromPromise = null
    }
    _distributeTo = value
  }

  property get DistributeToValues() : DistributeToEnum[] {
    if (IsContinuingSaved) {
      return {DistributeToEnum.SAVED}
    } else if (MoneySetup.EditingExecutedDistribution) {
      return {DistributeToEnum.MODIFYING}
    } else if (IsPayment) {
        return DistributeToEnum.values().subtract({DistributeToEnum.SAVED, DistributeToEnum.MODIFYING}).toArray(new DistributeToEnum[0])
    } else if (IsPromise || IsCreditDistribution) {
      return DistributeToEnum.values().subtract({DistributeToEnum.DO_NOT_DISTRIBUTE_NOW, DistributeToEnum.PROMISE, DistributeToEnum.SAVED, DistributeToEnum.MODIFYING})
        .toArray(new DistributeToEnum[0])
    } else {
      throw new IllegalStateException(displaykey.Web.AgencyDistributionWizardHelper.Error.UnknownDistributionType(""))
    }
  }

  property get PolicyFilterValues() : PolicyFilterOption[] {
    return PolicyFilterOption.values()
  }

  property set PolicyFilter(option : PolicyFilterOption) {
    MoneySetup.PolicyFilterOption = option
  }

  property get PolicyFilter() : PolicyFilterOption {
    return MoneySetup.PolicyFilterOption
  }

  property get DistributeAmountsValues() : DistributeAmountsEnum[] {
    return DistributeAmountsEnum.values()
  }

  property get DistributeByValues() : DistributeByEnum[] {
    return DistributeByEnum.values()
  }

  property get DistributionDifferenceMethodValues() : DistributionDifferenceMethodEnum[] {
    return DistributionDifferenceMethodEnum.values()
  }

  property get ShowSpecificPolicies() : boolean {
    return MoneySetup.PolicyFilterOption == PolicyFilterOption.FILTER
  }

  property get DistributeToStatementsAndPolicies() : boolean {
    return DistributeTo == DistributeToEnum.STATEMENTS_AND_POLICIES
  }

  property get DistributeToPromise() : boolean {
    return DistributeTo == DistributeToEnum.PROMISE
  }

  property get DistributeToSaved() : boolean {
    return DistributeTo == DistributeToEnum.SAVED
  }

  property get DoNotDistributeNow() : boolean {
    return DistributeTo == DistributeToEnum.DO_NOT_DISTRIBUTE_NOW
  }

  property get DistributionInfo() : String {
   var info = new StringBuffer()
   info.append(MoneySetup.Producer.DisplayName + ":")

   if (MoneySetup.DistributeToStatements.Count == 0) {
     info.append(displaykey.Web.AgencyDistributionWizardHelper.DistributionInfo.NoStatements)
     return info.toString()
   }

   if (ShowSpecificPolicies) {
     info.append(displaykey.Web.AgencyDistributionWizardHelper.DistributionInfo.SpecificPolicies)
   } else  {
     info.append(displaykey.Web.AgencyDistributionWizardHelper.DistributionInfo.AllPolicies)
   }
   if (MoneySetup.DistributeToStatements.Count == 1) {
     var statement = MoneySetup.DistributeToStatements.first()
     info.append(displaykey.Web.AgencyDistributionWizardHelper.DistributionInfo.OneStatement(
                     statement.InvoiceNumber,
                     statement.EventDate.format("short"),
                     statement.DisplayStatus))
   } else {
     info.append(displaykey.Web.AgencyDistributionWizardHelper.DistributionHelper.MultipleStatements)
   }
   return info.toString()
  }

  property get SelectedEditDistribution() : boolean {
    return DistributeAmounts == DistributeAmountsEnum.EDIT_DISTRIBUTION
  }

  property get SelectedDistributeNetOwedAmountsAutomatically() : boolean {
    return DistributeAmounts == DistributeAmountsEnum.DISTRIBUTE_NET_OWED_AMOUNTS_AUTOMATICALLY
  }

  public property get AdjustProducerUnapplied() : boolean {
    return DistributionDifferenceMethod == DistributionDifferenceMethodEnum.USE_UNAPPLIED
  }

  public property get WriteOffDifference() : boolean {
    return DistributionDifferenceMethod == DistributionDifferenceMethodEnum.WRITE_OFF
  }

  public function validateFinishDistributionStep() {
    if (!_isSaving
        && AgencyCycleDistView.AgencyCycleDist.DistItems.IsEmpty
        && AgencyCycleDistView.AgencyCycleDist.BaseSuspDistItems.IsEmpty) {
      throw new DisplayableException(displaykey.Web.AgencyDistributionWizard.Step.Distribution.Error.NoDistribution)
    }
    for (distItem in AgencyCycleDistView.AgencyCycleDist.DistItems) {
      if (isGrossAmountToApplyInvalid(distItem)) {
        throw new DisplayableException(displaykey.Java.Error.BaseDist.InvalidGrossDistributionAmount)
      }
      if (isCommissionAmountToApplyInvalid(distItem)) {
        throw new DisplayableException(displaykey.Java.Error.BaseDist.InvalidCommissionDistributionAmount)
      }
    }
  }

  public function isGrossAmountToApplyInvalid(agencyDistItem : BaseDistItem) : Boolean {
    return areAmountsMismatched(agencyDistItem.InvoiceItem.Amount, agencyDistItem.GrossAmountToApply)
  }

  public function isCommissionAmountToApplyInvalid(agencyDistItem : BaseDistItem) : Boolean {
    return agencyDistItem.ItemCommissionToTarget.CommissionAmount.IsZero &&  agencyDistItem.CommissionAmountToApply.IsNotZero
  }

  // Following are the validation conditions
  // If amountFromInvoiceItem > 0, then amountToApply must be >= 0
  // If amountFromInvoiceItem < 0, then amountToApply must be <= 0
  // If amountFromInvoiceItem == 0, then amountToApply must be equal to 0
  private function areAmountsMismatched(amountFromInvoiceItem : MonetaryAmount, amountToApply : MonetaryAmount) : Boolean {
    return (amountFromInvoiceItem.IsPositive && amountToApply.IsNegative)
      || (amountFromInvoiceItem.IsNegative && amountToApply.IsPositive)
      || (amountFromInvoiceItem.IsZero && amountToApply.IsNotZero)
  }

  public function beforeCommit() {
    if (_isSaving) {
      // do not execute payments if we have hit the save button
    } else if (DoNotDistributeNow) {
      executeMoneyOnly()
    } else {
      executeDistribution()
    }
  }

  public function onExitMoneyDetailsScreen() {
    if (DoNotDistributeNow || DistributeToPromise) {
        MoneySetup.clearDistributeToStatements()
    }
    if (SelectedDistributeNetOwedAmountsAutomatically) {
      MoneySetup.setPrefill(AgencyCycleDistPrefill.TC_UNPAID)
      if (MoneySetup.DistributeToStatements.IsEmpty && DistributeToStatementsAndPolicies) {
        throw new DisplayableException(displaykey.Web.AgencyDistributionWizard.Step.MoneyDetails.Error.NoStatementsForDistributingAutomatically)
      }
    }
    if (!MoneySetup.HasStartedDistributedStep && !DoNotDistributeNow) {
      if (DistributeToStatementsAndPolicies &&  _warnNoStatementsSelected && MoneySetup.DistributeToStatements.IsEmpty) {
        _warnNoStatementsSelected = false // only warn the user once
        throw new DisplayableException(displaykey.Web.AgencyDistributionWizard.Step.MoneyDetails.Error.NoStatementsSelected)
      }
      AgencyCycleDistView = AgencyCycleDistViewInternal.createView(MoneySetup.prepareDistribution())
    }
  }
  private function executeMoneyOnly() {
    if (AgencyCycleDistView != null) {
      throw new DisplayableException(displaykey.Web.AgencyDistributionWizardHelper.Error.DistributionFoundWhenTryingToExecuteMoneyOnly)
    }
    MoneySetup.Money.execute()
  }

  private function executeDistribution() {
    if (Remaining.IsNotZero && WriteOffDifference && AgencyCycleDistView.AgencyCycleDist typeis AgencyCyclePayment) {
      var writeOffThreshold = MoneySetup.Producer.AgencyBillPlan.ProducerWriteoffThreshold
      if (Remaining.abs() > writeOffThreshold) {
        throw new gw.api.util.DisplayableException(displaykey.Web.AgencyDistributionWizardHelper.Error.OverWriteOffThreshold)
      }
      AgencyCycleDistView.AgencyCycleDist.WriteOffAmount = Remaining.negate()
    }
    AgencyCycleDistView.AgencyCycleDist.execute()
  }

  /**
   * The amount of money we have left to distribute on this payment/credit distribution.
   * Negative if the payment is overdistributed, and positive if it is underdistributed
   */
  property get Remaining() : MonetaryAmount {
    if (IsCreditDistribution) {
      return TotalAmountAvailableForDistribution - DistributedAndSuspense
    } else {
      return AgencyCycleDistView.AgencyCycleDist.Amount - DistributedAndSuspense
    }
  }

  /**
   * The amount of money we have "used up" on this distribution.
   * Total net amount to apply across all the dist items + total net amount to apply across suspense items
   */
  property get DistributedAndSuspense() : MonetaryAmount {
    return AgencyCycleDistView.AgencyCycleDist.DistributedAmountForUnexecutedDist + AgencyCycleDistView.AgencyCycleDist.NetSuspenseAmountForSavedOrExecuted
  }

  enum Disposition {
      Automatic,
      NonAutomtic
  }

  property get ExceptionDistItems() : BaseDistItem[] {
    var plugin = gw.plugin.Plugins.get(gw.plugin.invoice.IInvoiceItem)
    var dividedByDisposition = AgencyCycleDistView.AgencyCycleDist.DistItems
        .partition(\ distItem -> {
          if (distItem.Disposition == DistItemDisposition.TC_AUTOEXCEPTION ) {
            return Disposition.Automatic
          } else {
            return  Disposition.NonAutomtic
          }
        })

    var automaticDispositionItems = dividedByDisposition.get(Disposition.Automatic) == null ?
       new ArrayList<BaseDistItem>() :
       dividedByDisposition.get(Disposition.Automatic)
    var nonAutomaticDispositionItems = dividedByDisposition.get(Disposition.NonAutomtic) == null ?
       new ArrayList<BaseDistItem>() :
       dividedByDisposition.get(Disposition.NonAutomtic)

    var distItemsToReturn = plugin.agencyDistributionItemsAboutToCauseExceptions(automaticDispositionItems)
    distItemsToReturn.addAll(nonAutomaticDispositionItems)

    return sortExceptionDistItems(distItemsToReturn)
  }

  private function sortExceptionDistItems(baseDistItems : Set<BaseDistItem>) : BaseDistItem[] {
    var sortedBaseDistItems = new ArrayList<BaseDistItem>(baseDistItems)

    var partitionByPolicyPeriod = sortedBaseDistItems.partition(\ distItem -> distItem.PolicyPeriod )
    var totalDifferenceForPolicyPeriod = new HashMap<PolicyPeriod, MonetaryAmount>()
    partitionByPolicyPeriod.eachKeyAndValue(\ key, value ->
      totalDifferenceForPolicyPeriod.put(key, value.sum(MoneySetup.Currency, \ distItem -> distItem.NetDifferenceAmount))
    )

    var distItemComparator = new Comparator<? extends BaseDistItem>() {
      override function compare(d1 : BaseDistItem, d2 : BaseDistItem) : int {
        var policyTotalDifferenceOrder = totalDifferenceForPolicyPeriod.get(d1.PolicyPeriod).compareTo(totalDifferenceForPolicyPeriod.get(d2.PolicyPeriod))
        if(policyTotalDifferenceOrder != 0) {
          return -1 * policyTotalDifferenceOrder; //display items grouped by policies with highest total differences first (descending sort)
        } else {
          var statementDateOrder = d1.InvoiceItem.Invoice.EventDate.compareTo(d2.InvoiceItem.Invoice.EventDate)
          if (statementDateOrder != 0) {
            return statementDateOrder;
          } else {
            var netDifferenceAmountOrder = d1.NetDifferenceAmount.compareTo(d2.NetDifferenceAmount)
            if (netDifferenceAmountOrder != 0) {
              return -1 * netDifferenceAmountOrder //display items with highest NetDifferenceAmount first (descending sort)
            } else {
              return d1.InvoiceItem.DisplayNameAsItemType.compareTo(d2.InvoiceItem.DisplayNameAsItemType)
            }
          }
        }
      }
    }
    Collections.sort(sortedBaseDistItems, distItemComparator)
    return sortedBaseDistItems.toArray(new BaseDistItem[0])
  }

  function getExceptionsDescription( exceptions : BaseDistItem[] ) : String {
    var numAuto = NumberOfAutomaticExceptions(exceptions)
    var moneyAuto = MoneyInAutomaticExceptions(exceptions)
    var numWriteOff = NumberOfWriteOffExceptions(exceptions)
    var moneyWriteOff = MoneyInWriteOffExceptions(exceptions)
    var numCarried = NumberOfCarriedForwardExceptions(exceptions)
    var numForced = NumberOfForcedExceptions(exceptions)
    if (numAuto > 0 && numWriteOff > 0) {
      return displaykey.Web.AgencyDistributionWizardHelper.ExceptionsDescription.AutoAndWriteOffs(numAuto, moneyAuto, numWriteOff, moneyWriteOff, numCarried, numForced)
    } else if (numAuto > 0) {
      return displaykey.Web.AgencyDistributionWizardHelper.ExceptionsDescription.AutoOnly(numAuto, moneyAuto, numWriteOff, numCarried, numForced)
    } else if (numWriteOff > 0) {
      return displaykey.Web.AgencyDistributionWizardHelper.ExceptionsDescription.WriteOffOnly(numAuto, numWriteOff, moneyWriteOff, numCarried, numForced)
    } else {
      return displaykey.Web.AgencyDistributionWizardHelper.ExceptionsDescription.NoAutoAndNoWriteOffs(numAuto, numWriteOff, numCarried, numForced)
    }
  }

  function save(wizard : pcf.api.Wizard) {
    _isSaving = true
    _wizard = wizard
    AgencyDistributionWizard_SavePopup.push(this)
  }

  function finishSave(popup : Location) {
    popup.commit()
    _wizard.finish()
  }

  function cancelSave(popup : Location) {
    popup.cancel()
    _isSaving = false
    _wizard = null
  }

  public property get PaymentMoneySetup() : AgencyBillPaymentMoneySetup {
    if (IsPayment || IsCreditDistribution) {
      return MoneySetup as AgencyBillPaymentMoneySetup
    } else {
      return null
    }
  }

  public property get PromiseMoneySetup() : AgencyBillPromisedMoneySetup {
    if (IsPromise) {
      return MoneySetup as AgencyBillPromisedMoneySetup
    } else {
      return null
    }
  }

  public property get IsPayment() : boolean {
    return MoneySetup typeis gw.api.web.producer.agencybill.AgencyBillPaymentMoneySetup && !MoneySetup.CreditDistribution
  }

  public property get IsPromise() : boolean {
    return MoneySetup typeis gw.api.web.producer.agencybill.AgencyBillPromisedMoneySetup
  }

  public property get IsCreditDistribution() : boolean {
    return MoneySetup typeis gw.api.web.producer.agencybill.AgencyBillPaymentMoneySetup && MoneySetup.CreditDistribution
  }

  public property get IsNewDistAndNotFromPromise() : boolean {
    if (MoneySetup typeis gw.api.web.producer.agencybill.AgencyBillPaymentMoneySetup) {
      return _isNew && MoneySetup.AppliedFromPromise == null
    } else {
      return _isNew
    }
  }

  /**
   * Returns true if there exists a saved distribution of the same type as this helper's AgencyCycleDist that
   * has the same producer and amount (for promises) and payment instrument (for payments)
   */
  property get SimilarSavedDistributionExists() : boolean {
    var similarSavedDistributionsQuery: Query<AgencyCycleDist>
    if (IsPayment || IsCreditDistribution) {
      similarSavedDistributionsQuery = new Query<AgencyCyclePayment>(AgencyCyclePayment.Type)
      similarSavedDistributionsQuery.cast(AgencyCyclePayment.Type)
    } else if (IsPromise) {
      similarSavedDistributionsQuery = new Query<AgencyCyclePromise>(AgencyCyclePromise.Type)
      similarSavedDistributionsQuery.cast(AgencyCyclePromise.Type)
    } else {
      throw new IllegalStateException(displaykey.Web.AgencyDistributionWizardHelper.Error.UnknownDistributionType(""))
    }

    similarSavedDistributionsQuery
      .compare("DistributedDate", Equals, null) // saved
      .compare("ID", NotEquals, AgencyCycleDistView.AgencyCycleDist.ID)  // don't include the one we are currently working on
    var moneyReceivedTable = similarSavedDistributionsQuery.join("BaseMoneyReceived")

    if (IsPayment) {
      moneyReceivedTable
        .cast(AgencyBillMoneyRcvd.Type)
        .compare("Producer", Equals, MoneySetup.Producer) // same producer
        .compare("PaymentInstrument", Equals, PaymentMoneySetup.Money.PaymentInstrument) // same payment instrument
    } else if (IsCreditDistribution) {
      moneyReceivedTable
        .cast(ZeroDollarAMR.Type)
        .compare("Producer", Equals, MoneySetup.Producer) // same producer
    } else {
      moneyReceivedTable
        .cast(PromisedMoney.Type)
        .compare("PromisingProducer", Equals, MoneySetup.Producer) // same producer
   }
    moneyReceivedTable.compare("Amount", Equals, MoneySetup.Money.Amount) // same amount

    return !similarSavedDistributionsQuery.select().Empty
  }

  private function NumberOfAutomaticExceptions( exceptions : BaseDistItem[] ) : int {
    return exceptions.countWhere(\ e -> e.Disposition == DistItemDisposition.TC_AUTOEXCEPTION)
  }

  private function MoneyInAutomaticExceptions( exceptions : BaseDistItem[] ) : String {
    return render(exceptions.sum(
      MoneySetup.Currency,
      \ e -> e.Disposition == DistItemDisposition.TC_AUTOEXCEPTION ? e.NetDifferenceAmount : 0bd.ofCurrency(MoneySetup.Currency)))
  }

  private function NumberOfWriteOffExceptions( exceptions : BaseDistItem[] ) : int {
    return exceptions.countWhere(\ e -> e.Disposition == DistItemDisposition.TC_WRITEOFF)
  }

  private function MoneyInWriteOffExceptions( exceptions : BaseDistItem[] ) : String {
    return render(exceptions.sum(
      MoneySetup.Currency,
      \ e -> e.Disposition == DistItemDisposition.TC_WRITEOFF ? e.NetDifferenceAmount :  0bd.ofCurrency(MoneySetup.Currency)))
  }

  private function NumberOfCarriedForwardExceptions( exceptions : BaseDistItem[] ) : int {
    return exceptions.countWhere(\ e -> e.Disposition == DistItemDisposition.TC_CARRYFORWARD)
  }

  private function NumberOfForcedExceptions( exceptions : BaseDistItem[] ) : int {
    return exceptions.countWhere(\ e -> e.Disposition == DistItemDisposition.TC_EXCEPTION)
  }

  private function render( amount : MonetaryAmount ) : String {
    return amount.render()
  }

  property get IsNewCreditDistribution() : boolean {
    return (IsCreditDistribution && !MoneySetup.EditingExecutedDistribution)
  }

  property get CreditAvailableForDistribution() : MonetaryAmount {
    if (IsCreditDistribution) {
      if (MoneySetup.EditingExecutedDistribution) {
        return ModifiedDistributedOrInSuspenseAmount
      } else {
        return MoneySetup.Producer.UnappliedAmount
      }
    } else {
      return 0bd.ofCurrency(MoneySetup.Currency)
    }
  }

  property get OtherUnappliedAvailableForDistribution() : MonetaryAmount {
    if (IsCreditDistribution) {
      if (MoneySetup.EditingExecutedDistribution) {
        return MoneySetup.Producer.UnappliedAmount
      } else {
        return 0bd.ofCurrency(MoneySetup.Currency)
      }
    } else {
      return MoneySetup.Producer.UnappliedAmount - ModifiedUnappliedAmount
    }
  }

  property get TotalAmountAvailableForDistribution() : MonetaryAmount {
    if (IsCreditDistribution) {
      return CreditAvailableForDistribution + OtherUnappliedAvailableForDistribution
    } else {
      return MoneySetup.Money.Amount + OtherUnappliedAvailableForDistribution
    }
  }

  property get ModifiedDistributedOrInSuspenseAmount() : MonetaryAmount {
      if (MoneySetup.EditingExecutedDistribution) {
        return MoneySetup.PreviouslyExecutedDistribution.NetDistributedToInvoiceItems
            .add(MoneySetup.PreviouslyExecutedDistribution.NetInSuspense)
      } else {
        return 0bd.ofCurrency(MoneySetup.Currency)
      }
  }

  property get ModifiedUnappliedAmount() : MonetaryAmount {
    if (AgencyCycleDistView.AgencyCycleDist.BaseMoneyReceived.Modifying && (IsPayment || IsCreditDistribution)) {
      if (MoneySetup.EditingExecutedDistribution) {
        return MoneySetup.PreviouslyExecutedDistribution.NetDistributedToInvoiceItems
          .add(MoneySetup.PreviouslyExecutedDistribution.NetInSuspense)
          .subtract((MoneySetup.PreviouslyExecutedDistribution.Amount)
          .add(ProducerAmountWrittenOff)).negate()
      }
      else {
        return AgencyCycleDistView.AgencyCycleDist.BaseMoneyReceived.MoneyBeingModified.Amount
      }
    }
    else return 0bd.ofCurrency(MoneySetup.Currency)
  }

  property get ProducerAmountWrittenOff() : MonetaryAmount {
    var query = gw.api.database.Query.make(ProducerWriteoff)

    var contextTable = query.subselect("ID", CompareIn, entity.ProducerContext, "Transaction")

    var prodWriteoffContext = contextTable.cast(ProdWriteoffContext)
    prodWriteoffContext.compare("AgencyCyclePayment", Relop.Equals, MoneySetup.PreviouslyExecutedDistribution)

    var writeoffs = query.select()

    if (writeoffs.Count == 1) {
      return writeoffs.single().Amount
    }

    return 0bd.ofCurrency(MoneySetup.Currency)
  }

  property get IsContinuingSaved() : boolean {
    return MoneySetup.SavedDistribution != null
  }

  property get AllowChangeOfDistribution() : boolean {
    return !IsContinuingSaved && !MoneySetup.EditingExecutedDistribution && !MoneySetup.HasStartedDistributedStep
  }

  public function isNetAmountToApplyInvalid(agencyDistItem : BaseDistItem) : Boolean {
    return isGrossAmountToApplyInvalid(agencyDistItem) || isCommissionAmountToApplyInvalid(agencyDistItem)
  }
}
