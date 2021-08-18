package SampleData

uses gw.api.databuilder.GroupBuilder
uses gw.api.databuilder.GroupUserBuilder

@Export
class Group {
  // creates a group under the root group
  function create(
                  name: String,
                  organization : Organization,
                  supervisor : User,
                  securityZone : SecurityZone) : Group {
    var existing = gw.api.database.Query.make(Group).compare("Name", Equals, name).select()
    if (existing.Empty) {
      var group = new GroupBuilder()
        .withName(name)
        .withParentGroup( organization.RootGroup )
        .withSupervisor( supervisor )
        .withSecurityZone( securityZone )
        .withDefaultGroupType()
        .create()

      // add supervisor to group
      var groupUser = new GroupUserBuilder().onGroup(group).create(group.Bundle)
      groupUser.User = supervisor
      
      group.addToUsers(groupUser)
      group.Bundle.commit()

      return group
    } else {
      return existing.AtMostOneRow
    }
  }
}
