package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand

@Export
class Version extends BaseCommand {
  construct() {
  }

  public static function getCurrent() : String {
    return "99"
  }
  
  public static function useVersioning(): Boolean {
    return true
  }

  private static function prefixVersion(): Boolean {
    return true  // True for Prefix; False for Suffix
  }

  public static function addVersion(name: String, localVersion: String): String {
    var returnValue = name
    if (useVersioning()) {
      if (prefixVersion())
        returnValue = getCurrent() + localVersion + "-" + name
      else
        returnValue = name + "-" + getCurrent() + localVersion
    }
    return returnValue
  }
}