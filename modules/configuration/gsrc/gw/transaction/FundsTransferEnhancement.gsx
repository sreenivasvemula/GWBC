package gw.transaction

@Export
enhancement FundsTransferEnhancement : entity.FundsTransfer {

  property get TargetAccount() : Account {
    return this.TargetUnapplied.Account
  }

  property set TargetAccount(account : Account) {
    if (account == null) {
      this.TargetUnapplied = null
    } else if (this.TargetUnapplied == null || this.TargetUnapplied.Account != account) {
      this.TargetUnapplied = account.DefaultUnappliedFund
    }
  }

}
