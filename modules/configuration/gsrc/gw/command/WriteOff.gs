package gw.command

uses com.guidewire.pl.quickjump.Argument
uses gw.api.databuilder.BCDataBuilder
uses gw.api.databuilder.GroupBuilder
uses gw.api.databuilder.ProdWriteoffContainerBuilder
uses gw.api.databuilder.RoleBuilder
uses gw.api.databuilder.UserBuilder
uses gw.testharness.CurrentUserTestUtil

@Export
class WriteOff extends BCBaseCommand {

  @Argument("amountToWriteoff", "87")
  function unappliedRequiringApproval() {
    var producer = getCurrentProducer()
    var amountToWriteoff = getArgumentAsMonetaryAmount("amountToWriteoff", producer.Currency)

    var superUser = findUser("su")

    var role = new RoleBuilder()
      .withPermission(SystemPermissionType.TC_ACTCREATE)
      .withPermission(SystemPermissionType.TC_ACTOWN)
      .create()
    var group = new GroupBuilder()
      .withName(BCDataBuilder.createRandomWordPair())
      .withSupervisor(superUser)
      .create()
    var noAuthorityUser = new UserBuilder()
      .withName("I_Have", "No_Authority")
      .withGroup(group)
      .withRole(role)
      .createAndCommit()

    CurrentUserTestUtil.runAs( noAuthorityUser, \ -> {      
      var writeOff = new ProdWriteoffContainerBuilder()
                    .withCurrency(producer.Currency)
                    .onProducer(producer)
                    .withAmount(amountToWriteoff)
                    .create()
      writeOff.doWriteOffWithApproval()
      writeOff.Bundle.commit()
    })
  }

  @Argument("amountToWriteoff", "88")
  function unappliedNotRequiringApproval() {
    var producer = getCurrentProducer()
    var amountToWriteoff = getArgumentAsMonetaryAmount("amountToWriteoff", producer.Currency)
    var writeOff = new ProdWriteoffContainerBuilder()
                    .withCurrency(producer.Currency)
                    .onProducer(producer)
                    .withAmount(amountToWriteoff)
                    .create()

    var superUser = findUser("su")
    CurrentUserTestUtil.runAs( superUser, \ -> {      
      writeOff.doWriteOffWithApproval()
      writeOff.Bundle.commit()
    })   
  }  

}
