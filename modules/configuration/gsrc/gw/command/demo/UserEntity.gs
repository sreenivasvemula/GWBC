package gw.command.demo

uses com.guidewire.pl.quickjump.BaseCommand
uses gw.api.database.Query
uses gw.api.databuilder.AddressBuilder
uses gw.api.databuilder.CredentialBuilder
uses gw.api.databuilder.GroupBuilder
uses gw.api.databuilder.GroupUserBuilder
uses gw.api.databuilder.UserBuilder
uses gw.api.databuilder.UserContactBuilder
uses gw.command.BCBaseCommand
uses gw.transaction.Transaction

@Export
class UserEntity extends BaseCommand {
  //  If we end up needing versioning for users, uncomment the next line and comment the line after it.
  //  private static var version = Version.useVersioning()? Version.getCurrent() + "b" : ""
  private static var version = ""

  construct() {
  }

  /**
  * <p>Returns user Supervisor (svisor/ gw)
  **/
  private static function getUserSupervisor() : User {

    var userName = "svisor" + version
    var firstName = "Super"
    var lastName = "Visor" + version
    var roleName = "Superuser"
    var authorityLimitPublicId = getAuthorityLimitProfilePublicId01()
    var publicID = userName

    var user = BCBaseCommand.findUser(userName)

    if (user == null) {
      var contact = getUserContact01(firstName, lastName)
      var credential = getCredentialWithUserName(userName)
      var role = GeneralUtil.findRoleByPublicName( roleName)  // TODO: Make it null proof
      var authority = GeneralUtil.findAuthorityLimitProfileByPublicId(authorityLimitPublicId)   // TODO: Make it null proof

      // create user
      Transaction.runWithNewBundle( \ bundle -> 
        { 
          user = new UserBuilder()
          .withRole(role)
          .withContact(contact)
          .withCredential(credential)
          .asInternalUser()
          .withPublicId(publicID)
          .create(bundle)

          // setAuthorityLimitProfile
          user.AuthorityProfile = authority

          bundle.commit()
        }
      )
    }
    return user
  }

  /**
  * <p>Returns user Super User (su/ gw)
  **/
  public static function getUserSuperUser() : User {
    var userName = "su" + version
    var firstName = "Super"
    var lastName = "User" + version
    var roleName = "Superuser"
    var authorityLimitPublicId = getAuthorityLimitProfilePublicId01()  // This gives the user has super user authority
    var publicID = userName
    var user = BCBaseCommand.findUser(userName)
    if (user == null)
      user = createUser(firstName, lastName, userName, publicID, roleName, authorityLimitPublicId)
    return user;
  }

  /**
  * <p>Returns user Alice Applegate (aapplegate/ gw)
  **/
  public static function getUserAApplegate() : User {
    var userName = "aapplegate" + version
    var firstName = "Alice"
    var lastName = "Applegate" + version
    var roleName = "Superuser"
    var authorityLimitPublicId = getAuthorityLimitProfilePublicId01()   // getAuthorityLimitProfilePublicId01() provides su authority
    var publicID = userName
    var user = BCBaseCommand.findUser(userName)
    if (user == null)
      user = createUser(firstName, lastName, userName, publicID, roleName, authorityLimitPublicId)
    return user;
  }

  /**
  * <p>Returns user Bruce Baker (bbaker/ gw)
  **/
  public static function getUserBBaker() : User {
    var userName = "bbaker" + version
    var firstName = "Bruce"
    var lastName = "Baker" + version
    var roleName = "Superuser"
    var authorityLimitPublicId = getAuthorityLimitProfilePublicId01()  // getAuthorityLimitProfilePublicId01() provides su authority
    var publicID = userName
    var user = BCBaseCommand.findUser(userName)
    if (user == null)
      user = createUser(firstName, lastName, userName, publicID, roleName, authorityLimitPublicId)
    return user;
  }

  /**
  * <p>Returns user Marla Maples (mmaples/ gw)
  **/
  public static function getUserMMaples() : User {
    var userName = "mmaples" + version
    var firstName = "Marla"
    var lastName = "Maples" + version
    var roleName = "Superuser"
    var authorityLimitPublicId = getAuthorityLimitProfilePublicId02()    
    var publicID = userName
    var user = BCBaseCommand.findUser(userName)
    if (user == null)
      user = createUser(firstName, lastName, userName, publicID, roleName, authorityLimitPublicId)
    return user;
  }

  /**
  * <p>Returns user Sally Smith (ssmith/ gw)
  **/
  public static function getUserSSmith() : User {
    var userName = "ssmith" + version
    var firstName = "Sally"
    var lastName = "Smith" + version
    var roleName = "Superuser"
    var authorityLimitPublicId = getAuthorityLimitProfilePublicId02()    
    var publicID = userName
    var user = BCBaseCommand.findUser(userName)
    if (user == null)
      user = createUser(firstName, lastName, userName, publicID, roleName, authorityLimitPublicId)
    return user;
  }

  /**
  * <p>This method creates a user with the passed params<br>
  * Just wanted to avoid repeating the same lines multiple times.
  **/
  private static function createUser(firstName : String, lastName : String, userName: String, publicID : String, roleName: String, authorityLimitPublicId: String) : User {
      var contact = getUserContact01(firstName, lastName)
      var credential = getCredentialWithUserName( userName )
      var role = GeneralUtil.findRoleByPublicName( roleName)  // TODO: Make it null proof
      var authority = GeneralUtil.findAuthorityLimitProfileByPublicId(authorityLimitPublicId)   // TODO: Make it null proof
      var user :User

      // create user
      Transaction.runWithNewBundle( \ bundle -> 
        { 
          user = new UserBuilder()
          .withRole(role)
          .withContact(contact)
          .withCredential(credential)
          .asInternalUser()
          .withPublicId(publicID)
          .withGroup( getGroup01() )
          .withAuthorityProfile( authority)
          .create(bundle)
        }
      )
      return user
  }

  /**
  * <p>This returns a group with name Group + Version (which is used for all users)
  **/
  private static function getGroup01() : Group {
    var groupName = "Group01" + version
    var organization = Query.make(Organization).select().getFirstResult()
    var supervisor = getUserSupervisor()

    var group = GeneralUtil.findGroupByUserName(groupName)
    if (group  == null) {
      Transaction.runWithNewBundle( \ bundle -> 
        {
          // create group
          group = new GroupBuilder()
            .withName(groupName)
            .withParentGroup( organization.RootGroup )
            .withSupervisor( supervisor )
            .withDefaultGroupType()
            .create(bundle)

          // add supervisor to group
          var groupUser = new GroupUserBuilder()
            .onGroup(group)
            .onUser( supervisor )
            .create(bundle);
      
          group.addToUsers(groupUser);
        }
      )
    }
    return group;
  }

  /**
  * <p>This returns a standard contact with address.
  **/
  private static function getUserContact01(firstName: String, lastName: String):UserContact {

    var address = new AddressBuilder()
      .withAddressLine1( "2211 Bridgepointe Parkway, Ste 300")
      .withCity( "San Mateo")
      .withState( "CA")
      .withPostalCode( "94404")
      .withCounty( "US")
      .withAddressType( "Business")
      .createAndCommit();

    return new UserContactBuilder()
      .withPrimaryAddress(address)
      .withFirstName(firstName)
      .withLastName(lastName)
      .withEmailAddress1(firstName + "." + lastName + "@insuranceco.com")
      .withPrimaryPhone(PrimaryPhoneType.TC_WORK)
      .withWorkPhone("650-357-9100")
      .withHomePhone("650-357-0019")
      .withCellPhone("650-357-0020")
      .withFax("650-357-9101")
      .createAndCommit()
  }

  /**
  * <p>This returns a credential<br>
  * with username as param &lt;String username&gt; and<br>
  * with password set as "gw"
  **/
  private static function getCredentialWithUserName(username: String) : Credential {
    var credential = GeneralUtil.findCredentialByUserName(username)
    if (credential == null) {
    credential = new CredentialBuilder()
      .withUserName(username)
      .withPassword("gw")
      .createAndCommit();
    }
    return credential
  }

  /**
  * This returns authority limit for supervisor.
  **/
  private static function getAuthorityLimitProfilePublicId01() : String {
    return "default_data:1"  // some magic string... seems to work.
  }

  /**
  * This returns authority limit for normal users.
  **/
  private static function getAuthorityLimitProfilePublicId02() : String {
    return "default_data:2"  // once again some magic string... seems to work. 
  }
}