package gw.contactmapper.ab800

uses gw.api.system.BCLoggerCategory

/**
 * Returns the ContactIntegrationMapper to be used by BillingCenter
 * for integration.  It's @Export so customers can make the get() method return
 * a different ContactIntegrationMapper.
 */
@Export
class ContactIntegrationMapperFactory {
  private static var _logger = BCLoggerCategory.CONTACT_MANAGER_INTEGRATION

  public static function get() : ContactIntegrationMapper {

    var mapper = new ContactMapper()
    _logger.trace("ContactIntegrationMapperFactory.get() returned a " + mapper.IntrinsicType.Name)

    return mapper
  }
}
