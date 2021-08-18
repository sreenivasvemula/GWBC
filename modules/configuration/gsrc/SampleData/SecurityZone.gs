package SampleData

@Export
class SecurityZone {
  
  function getDefaultSecurityZone() : SecurityZone {
    return com.guidewire.pl.system.dependency.PLDependencies.getSecurityZoneFinder().findDefaultSecurityZone()
  }
  
}
