package gw.command

uses com.guidewire.pl.quickjump.Argument
uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.databuilder.UniqueKeyGenerator
uses gw.entity.ITypeList
uses gw.lang.reflect.IMethodInfo
uses gw.testharness.Disabled
uses gw.testharness.TestBase

uses java.lang.Double
uses java.lang.Exception
uses java.util.ArrayList
uses java.util.Date
uses java.util.HashMap
uses java.util.List
uses java.util.Map

/**
 * Test base class for tests which exercise RunCommand classes.
 * These tests are provided for a minimal "smoke" or "VerifyAllResources"
 * type of test.  For complete coverage, specific tests on each
 * RunCommand method must be created.
 */
@Export
class RunCommandTestBase extends TestBase {
  private var _cmdClass : Type as CommandUnderTest
  private var _custParameters : Map<String, List> as CustomParameters
  private var _cmd : Object

  construct(testName : String) {
    super(testName)
  }

  override function beforeMethod() {
    if (_custParameters == null) {
      _custParameters = new HashMap<String, List>()
    }
  }

  /**
   * Test all commands on the provided RunCommand class.
   * Output is similar to the following:
   * <code>
   * INFO RunCommand action successful: PMDemo createPolicy05 parameters: [] (Policy POL-0005 created on Account 04 Wolf AV Rental and producer 04 Cost-U-Nothing Insurance)
   * INFO RunCommand action successful: PMDemo createPolicy06 parameters: [] (Policy POL-0006 created on Account 05 Pure Water and producer 05 Sunset Insurance)
   * INFO RunCommand action successful: PMDemo createPolicy07to14 parameters: [] (Policy POL-0007 created on Account 05 Pure Water and producer 06 ABC InsurancePolicy POL-0008 created on Account 05 Pure Water and producer 06 ABC InsurancePolicy POL-0009 created on Account 05 Pure Water and producer 07 DEF InsurancePolicy POL-0010 created on Account 05 Pure Water and producer 07 DEF InsurancePolicy POL-0011 created on Account 05 Pure Water and producer 08 GHI InsurancePolicy POL-0012 created on Account 05 Pure Water and producer 09 JKL InsurancePolicy POL-0013 created on Account 05 Pure Water and producer 10 MNO InsurancePolicy POL-0014 created on Account 05 Pure Water and producer 10 MNO Insurance)
   * WARN RunCommand action disabled: PMDemo endorsePolicy01
   * INFO RunCommand action successful: PMDemo createPremiumReportPolicy01 parameters: [] (Premium Reporting Policy PRPOL-0001created on Account 7200131769 and producer 02 Rainbow Insurance)
   * INFO RunCommand action successful: PMDemo createPremiumReportPolicy02 parameters: [] (Premium Reporting Policy PRPOL-0002created on Account 9153099533 and producer 02 Rainbow Insurance)
   * ERROR RunCommand action failed: PMDemo createPremiumReportDueDate01 parameters: []
   * java.lang.AssertionError: [Cannot create a PremiumReportDueDate without a PolicyPeriod (cannot find policyNumber PRPOL-0001)] expecting a non-null object, but it was null
   * ...
   *
   * Gosu Stack Trace:
   * ~~~~~~~~~~~~~~~~~~~~
   * at gw.command.RunCommandTestBase.testAllCommands(RunCommandTestBase.gs:98)
   * ~~~~~~~~~~~~~~~~~~~~
   *
   * java.lang.AssertionError: [One or more commands on gw.command.PMDemo.PMDemo failed.
   * Please inspect the logs for specific failures.
   * Failed commands:
   * 	PMDemo createPremiumReportDueDate01 parameters: []
   * 	PMDemo createPremiumReportingCharge01 parameters: []
   * 	PMDemo createPremiumReportingCharge02 parameters: []
   * 	PMDemo createPremiumReportingCharge03 parameters: []
   * 	PMDemo createPremiumReportingCharge04 parameters: []
   * 	PMDemo createPremiumReportingFinalAudit01 parameters: []
   * 	PMDemo agencyBillDemoStep01 parameters: []] expected:<0> but was:<7>
   * </code>
   */
  function testAllCommands() {
    var failedCommands = new ArrayList<String>()
    _cmd = _cmdClass.TypeInfo.Constructors[0].Constructor.newInstance( null )
    if ( BaseCommand.Type.isAssignableFrom( _cmdClass ) ) {
      (_cmd as BaseCommand).Arguments.add(new Argument("name", "1" ))
    }
    for ( method in _cmdClass.TypeInfo.getMethods() ) {
      if ( ( ! method.Public ) || method.Deprecated || method.Abstract || ( method.Container != _cmdClass.TypeInfo ) ) {
        continue
      }
      var description = _cmdClass.RelativeName + " " + method.DisplayName
      if ( method.hasAnnotation( Disabled ) ) {
        Logger.warn( "RunCommand action disabled: " + description )
        continue
      }
      var parameterValues = genParametersFor( method )
      description = description + " parameters: " + parameterValues
      var returnValue : Object
      try {
        if ( method.Static ) {
          if ( method.ReturnType != null ) {
            returnValue = method.CallHandler.handleCall( null, parameterValues.toArray() )
          } else {
            method.CallHandler.handleCall( null, parameterValues.toArray() )
          }
        } else {
          if ( method.ReturnType != null ) {
            returnValue = method.CallHandler.handleCall( _cmd, parameterValues.toArray() )
          } else {
            method.CallHandler.handleCall( _cmd, parameterValues.toArray() )
          }
        }
        Logger.info( "RunCommand action successful: " + description +
            ( returnValue != null ? " (" + returnValue + ")" : "" ) )
      } catch ( de : gw.api.util.DisplayableException ) {
        Logger.info( "RunCommand action successful: " + description + " (" + de + ")" )
      } catch ( e : Exception) {
        Logger.error( "RunCommand action failed: " + description, e )
        failedCommands.add( description )
      }
    }
    var nl = java.lang.System.getProperty( "line.separator" )
    assertThat( failedCommands.size() )
        .as( failedCommands.reduce(
            ( "One or more commands on " + _cmdClass.Name + " failed." + nl +
            "Please inspect the logs for specific failures." + nl +
            "Failed commands:" ), \ q, s -> q + nl + "\t" + s ) )
        .isEqualTo( 0 )
  }

  private function genParametersFor( method : IMethodInfo ) : List<Object> {
    var parameterValues = new ArrayList<Object>()
    if ( _custParameters.containsKey( method.DisplayName ) ) {
      return _custParameters.get( method.DisplayName )
    }
    for ( type in method.Parameters ) {
      if ( type.FeatureType.isAssignableFrom( String ) ) {
        parameterValues.add( UniqueKeyGenerator.get().nextID() )
      } else if ( type.FeatureType.isAssignableFrom( Date ) ) {
        parameterValues.add( Date.CurrentDate.addDays( 1 ) )
      } else if ( type.FeatureType.isAssignableFrom( Number ) ) {
        parameterValues.add( 1 as Number )
      } else if ( ITypeList.Type.isAssignableFrom( type.FeatureType ) ) {
        for ( prop in type.FeatureType.TypeInfo.Properties ) {
          if ( prop.Static ) {
            parameterValues.add( prop.Accessor.getValue( null ) )
            break
          }
        }
      } else {
        parameterValues.add( null )
      }
    }
    return parameterValues
  }
}
