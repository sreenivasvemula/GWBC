package gw.transaction

uses com.google.common.base.Predicates
uses com.guidewire.bc.system.dependency.BCDependencies
uses com.guidewire.bc.util.BCIterables
uses gw.lang.reflect.IType

uses java.lang.IllegalArgumentException
uses java.util.Collections
uses java.util.List

@Export
class ChargePatternHelper {

  static function getChargePatterns( ownerType : IType ) : List<ChargePattern> {
    return getChargePatterns( ownerType, UserTransactionType.NONE)
  }

  static function getChargePatterns( ownerType : IType, transactionType : UserTransactionType) : List<ChargePattern> {
    if (!TAccountOwner.Type.isAssignableFrom( ownerType )) {
      throw new IllegalArgumentException( "ownerType must be a subtype of TAccountOwner. Got: " + ownerType )
    }
    var allChargePatterns = BCDependencies.accounting().config().getChargeService().getAllChargePatterns()
    var chargePatterns = allChargePatterns.where(\ chargePattern -> ownerType == chargePattern.getTAccountOwnerType())

    chargePatterns = BCIterables.filterIntoNewList( chargePatterns, ChargePattern.INVOICEFEE_FILTER )
    chargePatterns = BCIterables.filterIntoNewList( chargePatterns, ChargePattern.INSTALLMENTFEE_FILTER )
    if (transactionType == UserTransactionType.FEE_OR_GENERAL) {
      return BCIterables.filterIntoNewList( chargePatterns, Predicates.or(ChargePattern.FEE_FILTER, ChargePattern.EXTERNAL_FILTER))
    } else if (transactionType == UserTransactionType.RECAPTURE) {
      return BCIterables.filterIntoNewList( chargePatterns, ChargePattern.RECAPTURE_FILTER )
    } else if (transactionType == UserTransactionType.NONE) {
      return chargePatterns // return them all unfiltered
    } else {
      throw new IllegalArgumentException(displaykey.Web.ChargePatternHelper.Error.UnsupportedUserTransactionType(transactionType))
    }
  }

  static function getChargePattern( chargePatternName : String ) : ChargePattern {
    return BCDependencies.accounting().config().getChargeService().getChargePattern( chargePatternName )
  }

  static function getChargePatterns( owner : TAccountOwner, transactionType : UserTransactionType ) : List<ChargePattern> {
    return getChargePatterns( typeof owner, transactionType)
  }

  static property get ReversableChargePatterns() : List<ChargePattern> {
      var chargePatterns = BCDependencies.accounting().config().getChargeService().getAllChargePatterns()
      return chargePatterns.where(\ chargePattern -> chargePattern.Reversible)
    }

  static function getAvailableInvoiceTreatments( chargePattern : ChargePattern ) : List<InvoiceTreatment> {
    if (chargePattern.getTAccountOwnerPattern() != null && PolicyPeriod.Type == chargePattern.TAccountOwnerType) {
      return InvoiceTreatment.getTypeKeys(false)
    } else {
      return Collections.singletonList( InvoiceTreatment.TC_ONETIME )
    }
  }
}
