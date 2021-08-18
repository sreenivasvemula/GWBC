package SampleData

uses gw.api.database.Query
uses gw.api.databuilder.UserContactBuilder
uses gw.api.databuilder.UserBuilder
uses gw.api.databuilder.CredentialBuilder
uses gw.transaction.Transaction

@Export
class User {

  function create(
                  group : Group,
                  role : Role,
                  authorityProfile : AuthorityLimitProfile,
                  address : Address,
                  username : String,
                  firstName : String,
                  lastName : String) : User {
    var existing = Query.make(User).join("Credential").compare("UserName", Equals, username).select()
    if (!existing.Empty) {
      return existing.AtMostOneRow
    } else {
      var user : User
      Transaction.runWithNewBundle( \ bundle -> {
        // create contact
        var contact = new UserContactBuilder().withPrimaryAddress(address)
                                .withFirstName(firstName)
                                .withLastName(lastName)
                                .withEmailAddress1(username + "@enigma_fc.com")
                                .withPrimaryPhone(PrimaryPhoneType.TC_WORK)
                                .withWorkPhone("213-555-8164")
                                .create(bundle)
                              
      
        // create credential
        var credential = new CredentialBuilder().withUserName(username)
                                                .withPassword("gw")
                                                .create(bundle)

            
        // create user
        var b = new UserBuilder().withRole(role)
                                    .withContact(contact)
                                    .withCredential(credential)
                                    .asInternalUser()
        // add user to group if group isn't null
        if (group != null) {
          b.withGroup( group )
        }
        user = b.create(bundle)

        // setAuthorityLimitProfile
        user.AuthorityProfile = authorityProfile
      })
      return user
    }
  }

  function create(
                  group : Group,
                  role : Role,
                  authorityProfile : AuthorityLimitProfile,
                  address : Address,
                  username : String,
                  firstName : String,
                  lastName : String,
                  publicID : String) : User {
    var existing = Query.make(User).join("Credential").compare("UserName", Equals, username).select()
    if (!existing.Empty) {
      return existing.AtMostOneRow
    } else {
      var user : User
      Transaction.runWithNewBundle( \ bundle -> {
        // create contact
        var contact = new UserContactBuilder().withPrimaryAddress(address)
                                .withFirstName(firstName)
                                .withLastName(lastName)
                                .withEmailAddress1(username + "@enigma_fc.com")
                                .withPrimaryPhone(PrimaryPhoneType.TC_WORK)
                                .withWorkPhone("213-555-8164")
                                .create(bundle)
                              
      
        // create credential
        var credential = new CredentialBuilder().withUserName(username)
                                                .withPassword("gw")
                                                .create(bundle)

            
        // create user
        var b = new UserBuilder().withRole(role)
                                    .withContact(contact)
                                    .withCredential(credential)
                                    .asInternalUser()
                                    .withPublicId( publicID )
        // add user to group if group isn't null
        if (group != null) {
          b.withGroup( group )
        }
        user = b.create(bundle)

        // setAuthorityLimitProfile
        user.AuthorityProfile = authorityProfile
      })
      return user
    }
  }
  
  function createExternalUser(
                  group : Group,
                  role : Role,
                  authorityProfile : AuthorityLimitProfile,
                  address : Address,
                  username : String,
                  firstName : String,
                  lastName : String) : User {
    var existing = Query.make(User).join("Credential").compare("UserName", Equals, username).select()
    if (!existing.Empty) {
      return existing.AtMostOneRow
    } else {
      var user = create(group, role, authorityProfile, address, username, firstName, lastName)
      user.ExternalUser = true
      return user
    }
  }
}
