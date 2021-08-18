package gw.account

/**
 * Helper for the disbursement wizards
 */
@Export
class CreateDisbursementWizardHelper {

  var _disbursement : AccountDisbursement

  construct(disbursement : AccountDisbursement) {
    _disbursement = disbursement
  }

  property get TargetUnapplied() : UnappliedFund {
    return _disbursement.UnappliedFund
  }

  property set TargetUnapplied(unapplied : UnappliedFund) {
    if (_disbursement.UnappliedFund != unapplied) {
      _disbursement.setUnappliedFundsAndFields(unapplied)
    }
  }

  static function createDisbursement(account : Account) : AccountDisbursement {
    var disb = new AccountDisbursement(account.Currency)
    disb.setUnappliedFundsAndFields(account.DefaultUnappliedFund)
    return disb
  }
}