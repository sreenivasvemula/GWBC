package gw.accounting

uses com.google.common.base.Preconditions
uses gw.api.domain.charge.ChargeInitializer
uses gw.transaction.ChargePatternHelper
uses gw.transaction.UserTransactionType

uses java.lang.RuntimeException
uses java.util.Date

/**
 * Defines a utility class to help the navigation of wizards that create a
 * single new {@link Charge charge} with either a {@link PolicyPeriod policy
 * period} or an {@link Account} {@link TAccountOwner t-account owner} and a
 * general {@link BillingInstruction billing instruction}.
 *
 * Used by {@link NewTransactionWizard}, {@link NewFeeWizard},
 * {@link AccountNewTransactionWizard}, {@link AccountNewFeeWizard}
 */
@Export
class NewGeneralSingleChargeHelper {
  private var _tAccountOwner : TAccountOwner
  private var _billingInstruction : BillingInstruction as readonly BillingInstruction
  private var _chargePatternHelper : ChargePatternHelper
  private var _transactionType : UserTransactionType

  construct(account : Account, transactionType : UserTransactionType) {
    _tAccountOwner = account
    _chargePatternHelper = new ChargePatternHelper()
    _transactionType = transactionType
    updateBecauseOfNewTAccountOwner()
  }

  construct(transactionType : UserTransactionType) {
    _transactionType = transactionType
  }

  property set TAccountOwner(newTAccountOwner : TAccountOwner) {
    Preconditions.checkNotNull(newTAccountOwner)
    if (_tAccountOwner != null && _tAccountOwner == newTAccountOwner) {
      return
    }
    _tAccountOwner = newTAccountOwner
    updateBecauseOfNewTAccountOwner()
  }

  property get TAccountOwner() : TAccountOwner {
    return _tAccountOwner
  }

  property get ChargeInitializer() : ChargeInitializer {
    return _billingInstruction.ChargeInitializers.single()
  }

  property get ChargePatternValues() : List<ChargePattern> {
    return _chargePatternHelper.getChargePatterns(_tAccountOwner, _transactionType)
  }

  private function updateBecauseOfNewTAccountOwner() {
    var chargePattern = ChargePatternValues.first()
    if (chargePattern == null) {
      throw new RuntimeException(
          displaykey.Web.NewGeneralSingleChargeHelper.Error.NoChargePatternsFound(_tAccountOwner, _transactionType))
    }
    if (_billingInstruction != null) {
      _billingInstruction.remove()
    }
    if (_tAccountOwner typeis PolicyPeriod) {
      var bi = new General(_tAccountOwner.Currency)
      bi.ModificationDate = Date.Now
      bi.AssociatedPolicyPeriod = _tAccountOwner
      _billingInstruction = bi
    } else if (_tAccountOwner typeis Account) {
      var bi = new AccountGeneral(_tAccountOwner.Currency)
      bi.BillingInstructionDate = Date.Now
      bi.Account = _tAccountOwner
      _billingInstruction = bi
    } else {
      throw new RuntimeException(
          displaykey.Web.NewGeneralSingleChargeHelper.Error.BadTAccountOwner(_tAccountOwner))
    }
    // because this method is only called when
    _billingInstruction.buildCharge(0bd.ofCurrency(_tAccountOwner.Currency), chargePattern)
  }

  function getDisplayName() : String{
    return _tAccountOwner != null
    ? displaykey.Java.TAccountOwner.TAccountOwnerTypeAndDisplayName( _tAccountOwner.getIntrinsicType().getDisplayName(),  _tAccountOwner.getDisplayName())
    : null;
  }

}