package gw.agencybill

@Export
class DistributionWizardUtil {
  static function onInformationStepFirstEnter(
          releaseSuspenseItemLegacysOnEntry : boolean, agencyCycleDist : AgencyCycleDist) {
    // If releaseSuspenseItemLegacysOnEntry is true, then the 1st time the user comes to
    // Enter Information step send them to View Suspense Items Popup
    if (releaseSuspenseItemLegacysOnEntry) {
      pcf.AgencySuspenseItemsPopup.push( agencyCycleDist, true );
    }
  }
}
