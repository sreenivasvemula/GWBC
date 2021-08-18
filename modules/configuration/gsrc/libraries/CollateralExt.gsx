package libraries

@Export
enhancement CollateralExt : Collateral
{
  /**
   * Called whenever a previously non compliant collateral goes compliant.
   * Allows exiting of collateral delinquency processes for this reason.
   */
  function onCompliance() {
    // var processToExit = find delinquency process (if it exists) that should exit now that this collateral is compliant.
    // processToExit.exitDelinquency()
  }
  
  /**
   * Called whenever a compliant collateral goes non compliant
   * allows starting of delinquency processes for this reason
   */
  function onNonCompliance() : DelinquencyProcess {
    // start and return a collateral delinquency if desired
    // NOTE: Collateral Delinquency Processes do not exist, so if you choose to instead start a Policy or
    // Account level delinquency process, this should be carefully marked, (e.g. with collateral specific
    // delinquency reason) so that is recognizable as a Collateral Delinquency Process in the future.
    return null;
  }
}
