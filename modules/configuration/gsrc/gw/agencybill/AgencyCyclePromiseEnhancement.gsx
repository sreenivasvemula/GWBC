package gw.agencybill

@Export
enhancement AgencyCyclePromiseEnhancement : AgencyCyclePromise {

  public property get Status() : String {
    if (this.New) {
      return displaykey.Java.AgencyCycleDist.Status.New
    } else if (this.Reversed) {
      return displaykey.Java.AgencyCycleDist.Status.Reversed
    } else if (!this.Executed) {
      return displaykey.Java.AgencyCycleDist.Status.Draft
    } else if (this.Applied) {
      return displaykey.Java.AgencyCyclePromise.Status.Paid
    } else if (this.Executed) {
      return displaykey.Java.AgencyCyclePromise.Status.Unpaid
    }

    return displaykey.Java.AgencyCyclePromise.Status.NotApplicable
  }

}
