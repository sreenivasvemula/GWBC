package libraries

/**
 * Encapsulates the {@link entity.Account} properties used to identify it when
 *    displayed through a {@link ProducerStatement}.
 *
 * (This is local to the {@link ProducerStatement} enhancement).
 *
 * @author jwong
 */
@Export
internal class AccountNames {
  /**
   * The identifier key for the entity that references the {@link Account}.
   */
  var _id : Key as readonly ContainerID
  /**
   * The localized version of the name of the {@link Account}.
   */
  var _localizedName : String as readonly AccountNameLocalized
  /**
   * The numeric string associated with the {@link Account}.
   */
  var _number : String as readonly AccountNumber

  construct(id : Key, localizedName : String, number : String) {
    _id = id
    _localizedName = localizedName
    _number = number
  }

  /**
   * The display name for the {@link Account} from its {@link
   *    #AccountNameLocalized} and {@link #AccountNumber}.
   */
  final property get AccountDisplayName() : String {
    if (AccountNameLocalized == null)  {
      return AccountNumber
    } else {
      if (AccountNumber == null) {
        return AccountNameLocalized
      } else {
        return AccountNameLocalized + " (" + AccountNumber + ")"
      }
    }
  }
}