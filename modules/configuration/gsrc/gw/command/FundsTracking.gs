package gw.command

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.webservice.systemTools.SystemToolsImpl
uses gw.api.webservice.systemTools.SystemRunlevel
uses gw.api.domain.fundstracking.FundsTrackingSwitch
uses gw.lang.Export

@Export 
class FundsTracking extends BaseCommand {

  function enable() {
    runAtMaintenanceModeThenReturnToCurrentLevel(\ -> FundsTrackingSwitch.enable())
  }

  function disable() {
    runAtMaintenanceModeThenReturnToCurrentLevel(\ -> FundsTrackingSwitch.disable())
  }
  
  private function runAtMaintenanceModeThenReturnToCurrentLevel(action()) {
    var system = new SystemToolsImpl()
    var currentLevel = system.Runlevel
    if (currentLevel != SystemRunlevel.MAINTENANCE) {
      system.setRunlevel(SystemRunlevel.MAINTENANCE)
    }
    action()
    if (currentLevel != SystemRunlevel.MAINTENANCE) {
      system.setRunlevel(currentLevel)
    }
  }
}
