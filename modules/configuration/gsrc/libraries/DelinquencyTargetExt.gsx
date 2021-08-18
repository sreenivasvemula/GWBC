package libraries

uses gw.api.domain.delinquency.DelinquencyTarget
uses java.util.Date

@Export
enhancement DelinquencyTargetExt : DelinquencyTarget
{
  final function hasActiveDelinquenciesOutOfGracePeriod() : boolean {
    if ( this.hasActiveDelinquencyProcess() ) {
      var delinquencyProcesses = this.ActiveDelinquencyProcesses
      return delinquencyProcesses.hasMatch( \ dp -> dp.InceptionDate != null )
    }
    return false
  }

  function sendDunningLetter() {
    if ( this typeis Account ) {
      this.sendDunningLetterInternal()
    } else if ( this typeis PolicyPeriod ) {
      this.sendDunningLetterInternal();
    } else {
      throw displaykey.Java.DelinquencyTarget.CannotAccess.SendDunningLetter( typeof this )
    }
  }

  function cancel(process : DelinquencyProcess) {
    if ( this typeis Account ) {
      // TODO mpc "Cancellation" on account means?
    } else if ( this typeis PolicyPeriod ) {
      this.cancelByDelinquencyProcess(process)
    } else {
      throw displaykey.Java.DelinquencyTarget.CannotAccess.Cancel( typeof this )
    }
  }

  function rescindOrReinstate() {
    if ( this typeis Account ) {
      // TODO mpc "Rescind or Reinstate" on account means?
    } else if ( this typeis PolicyPeriod ) {
      this.rescindOrReinstateInternal()
    } else {
      throw displaykey.Java.DelinquencyTarget.CannotAccess.RescindOrReinstate( typeof this )
    }
  }

  function writeoff() {
    if ( this typeis Account ) {
      this.doWriteoff( this.RemainingBalance, typekey.WriteoffReason.TC_UNCOLLECTABLE )
    } else if ( this typeis PolicyPeriod ) {
      this.doWriteoff( this.RemainingBalance, typekey.WriteoffReason.TC_UNCOLLECTABLE )
    } else {
      throw displaykey.Java.DelinquencyTarget.CannotAccess.DoWriteoff( typeof this )
    }
  }

  function addHistoryEvent( eventDate : Date, type : typekey.HistoryEventType, reference : Object ) {
    ( this as HistoryEventContainer)
        .addHistoryFromGosu( eventDate, type, reference as String, null, null, false )
  }
}
