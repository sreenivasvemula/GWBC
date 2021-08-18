package libraries

uses gw.api.domain.delinquency.DelinquencyTarget
uses gw.api.web.payment.DirectBillPaymentFactory
uses gw.pl.currency.MonetaryAmount

uses java.util.ArrayList
uses java.util.Collection
uses java.util.List

@Export
enhancement AccountExt : Account {

  property get OpenDelinquencyTargets() :  DelinquencyTarget[] {
    var all = new ArrayList<DelinquencyTarget>()
    all.add( this as DelinquencyTarget )
    all.addAll( this.OpenPolicyPeriods as Collection<DelinquencyTarget>)
    return all.toTypedArray()
  }

  function discoverDelinquencies() : List<DelinquencyProcess> {
    var newDelinquencyProcesses = new ArrayList<DelinquencyProcess>()

    // start policyDlnqProcesses on not taken or past due policies
    for (policyPeriod in this.OpenPolicyPeriods) {
      var isPendingCancellation = policyPeriod.CancelStatus == PolicyCancelStatus.TC_PENDINGCANCELLATION
      if(policyPeriod.EligibleToStartDelinquency
              and not policyPeriod.isTargetOfHoldType(HoldType.TC_DELINQUENCY)
              and not policyPeriod.isImpliedTargetOfHoldType(HoldType.TC_DELINQUENCY)
              and not isPendingCancellation){
        var process : DelinquencyProcess
        var hasNotTakenReason = policyPeriod.DelinquencyPlan.DelinquencyPlanReasons
          .hasMatch(\ d -> d.DelinquencyReason == DelinquencyReason.TC_NOTTAKEN)
        if( hasNotTakenReason
            and  policyPeriod.getActiveDelinquencyProcesses(DelinquencyReason.TC_NOTTAKEN).Empty
              and policyPeriod.PaidAmount.IsZero){
          process = policyPeriod.startDelinquency(DelinquencyReason.TC_NOTTAKEN);
          newDelinquencyProcesses.add(process)
        } else if ( policyPeriod.getActiveDelinquencyProcesses( DelinquencyReason.TC_PASTDUE ).Empty){
          process = policyPeriod.startDelinquency(DelinquencyReason.TC_PASTDUE);
          newDelinquencyProcesses.add(process)
        }
      }
    }

    // start DelinquencyProcesses on past due account level charges
    if ( ( this.getActiveAccountLevelDelinquencyProcess( DelinquencyReason.TC_PASTDUE ) == null )
            and this.EligibleToStartDelinquency) {
      var process = this.startDelinquency(DelinquencyReason.TC_PASTDUE);
      newDelinquencyProcesses.add(process);
    }

    if (this.Collateral.DelinquentAmount.compareTo(this.DelinquencyPlan.getPolEnterDelinquencyThreshold()) == 1) {
      // var process = start a delinquency process for past due collateral charges
      // newDelinquencyProcesses.add(process)

      // NOTE: Collateral Delinquency Processes do not exist, so if you choose to instead start a Policy or
      // Account level delinquency process, this should be carefully marked, so that is recognizable
      // as a Collateral Delinquency Process in the future.  See DelinquencyProcessExt.onChargesPaid()
    }
    return newDelinquencyProcesses;
  }
  
  function getDelinquencyReasons() : String {
    var reasons = new ArrayList<String>();
    for( p in this.ActiveDelinquencyProcesses) {
      var reason = p.Reason.DisplayName;
      if(not reasons.contains( reason )) {
          reasons.add( reason );
      }
    }
    var result : String;
    for( s in reasons index i) {
      if(i == 0) {
        result = s;
      }
      else {
        result = result + ", " + s
      }
    }
    return result;
  }

  // methods used for Account-level delinquency processes (via workflow) ==========================================

  function sendDunningLetterInternal() {
    this.addHistoryFromGosu(gw.api.util.DateUtil.currentDate(),
              HistoryEventType.TC_DUNNINGLETTERSENT,
              displaykey.Java.AccountHistory.DunningLetterSent, null, null, false)
  }

  // methods used by new transaction wizards ======================================================================

  function makeSingleCashPaymentUsingNewBundle( amount : MonetaryAmount ) {
    gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
      var account = bundle.add(gw.api.database.Query.make(Account).compare("ID", Equals, this.ID).select().AtMostOneRow)
      DirectBillPaymentFactory.pay(account, amount)
    })
  }

  function makeSingleCashDirectBillMoneyReceivedUsingNewBundle( amount : MonetaryAmount ) {
    gw.transaction.Transaction.runWithNewBundle( \ bundle -> {
      var account = bundle.add(gw.api.database.Query.make(Account).compare("ID", Equals, this.ID).select().AtMostOneRow)
      var cashInstrument = new PaymentInstrument()
      cashInstrument.PaymentMethod = PaymentMethod.TC_CASH
      var moneyReceived = DirectBillPaymentFactory.createDirectBillMoneyRcvd(account, cashInstrument, amount)
      moneyReceived.execute()
    })
  }
}
