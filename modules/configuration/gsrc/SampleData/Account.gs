package SampleData
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.AccountContactBuilder
uses gw.api.databuilder.PersonBuilder

@Export
class Account {
  function create(currency : Currency,
                  name : String,
                  number : String,
                  billingPlan : BillingPlan,
                  delinquencyPlan : DelinquencyPlan,
                  address : Address,
                  segment : String): Account {
    var existing = gw.api.database.Query.make(Account).compare("AccountNumber", Equals, number).select()
    if (existing.Empty) {
      var accountBuilder = new AccountBuilder()
        .withCurrency(currency)
        .withName(name)
        .withNumber(number)
        .withInvoiceDayOfMonth(1)
        .withInvoiceDeliveryType( InvoiceDeliveryMethod.TC_EMAIL )
        .withSegment( segment )
        .withBillingPlan(billingPlan)
        .withDelinquencyPlan( delinquencyPlan )
        
        var person = new PersonBuilder()
              .withFirstName("Bill")
              .withLastName("Baker")
              .withAddress(address)
              .create()
        
        var contact = new AccountContactBuilder()
              .withContact(person)
              .asPrimaryPayer()
              .withAccountRole(AccountRole.TC_INSURED)

      accountBuilder.addSoleContact(contact)


      return accountBuilder.createAndCommit()
    } else {
      return existing.AtMostOneRow
    }
  }
}
