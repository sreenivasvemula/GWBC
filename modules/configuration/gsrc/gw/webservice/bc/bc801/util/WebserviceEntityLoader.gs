package gw.webservice.bc.bc801.util

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.RequiredFieldException

uses java.util.ArrayList
uses gw.entity.IEntityType

@Export
class WebserviceEntityLoader {

  @Throws(RequiredFieldException, "If the accountNumber is null.")
  @Throws(BadIdentifierException, "If there are no Accounts with the given accountNumber.")
  static function loadAccountByAccountNumber( accountNumber : String ) : Account {
    WebservicePreconditions.notNull(accountNumber, "accountNumber")

    var account = Query.make(entity.Account).compare("AccountNumber", Equals, accountNumber).select().getAtMostOneRow()
    if (account == null) {
      throw new BadIdentifierException( accountNumber )
    }
    return account
  }
  
  
  @Throws(RequiredFieldException, "if the accountPublicID is null")
  @Throws(BadIdentifierException, "If there are no Accounts with the given Account PublicID.")
  static function loadAccount(accountPublicID : String) : Account {
    return loadByPublicID<Account>(accountPublicID, "accountPublicID")
  }

  @Throws(RequiredFieldException, "if the collateralPublicID is null")
  @Throws(BadIdentifierException, "If there is no Collateral with the given PublicID.")
  static function loadCollateral(collateralPublicID : String) : Collateral {
    return loadByPublicID<Collateral>(collateralPublicID, "collateralPublicID")
  }

  @Throws(RequiredFieldException, "if the policyPublicID is null")
  @Throws(BadIdentifierException, "If there is no Policy with the given PublicID.")
  static function loadPolicy(policyPublicID : String) : Policy {
    return loadByPublicID<Policy>(policyPublicID, "policyPublicID")
  }

  @Throws(RequiredFieldException, "if the policyPeriodPublicID is null")
  @Throws(BadIdentifierException, "If there are no Policy Periods with the given PolicyPeriod PublicID.")
  static function loadPolicyPeriod(policyPeriodPublicID : String) : PolicyPeriod {
    return loadByPublicID<PolicyPeriod>(policyPeriodPublicID, "policyPeriodPublicID")
  }

  @Throws(RequiredFieldException, "if the invoicePublicID is null")
  @Throws(BadIdentifierException, "If there are no Invoices with the given Invoice PublicID.")
  static function loadInvoice(invoicePublicID : String) : Invoice {
    return loadByPublicID<Invoice>(invoicePublicID, "invoicePublicID")
  }

  @Throws(RequiredFieldException, "if the producerPublicID is null")
  @Throws(BadIdentifierException, "If there are no Producers with the given Producer PublicID.")
  static function loadProducer(producerPublicID : String) : Producer {
    return loadByPublicID<Producer>(producerPublicID, "producerPublicID")
  }
  
  @Throws(RequiredFieldException, "if the addressPublicID is null")
  @Throws(BadIdentifierException, "If there are no Addresses with the given Address PublicID.")
  static function loadAddress(addressPublicID : String) : Address {
    return loadByPublicID<Address>(addressPublicID, "addressPublicID")
  }
  
  @Throws(BadIdentifierException, "If there was no InvoiceItem with the given InvoiceItem PublicID")
  static function loadInvoiceItems(invoiceItemPublicIDs : String[]) : List<InvoiceItem> {
    var partitionedIDs = com.guidewire.bc.util.BCIterables.partition(invoiceItemPublicIDs.toList(), 2100)
    
    var invoiceItems = new ArrayList<InvoiceItem>()
    for(idList in partitionedIDs) {
      var query = new Query(InvoiceItem) as Query<InvoiceItem>
      query.compareIn("PublicID", idList as Object[])
      var queryResults = query.select().toList()
      invoiceItems.addAll(queryResults)
    }
    
    validateInvoiceItems(invoiceItemPublicIDs, invoiceItems)
    return invoiceItems;
  }

  @Throws(RequiredFieldException, "if the userPublicID is null")
  @Throws(BadIdentifierException, "If there is no User with the given PublicID.")
  static function loadUser(userPublicID: String) : User {
    return loadByPublicID<User>(userPublicID, "userPublicID")
  }

  @Throws(RequiredFieldException, "if the troubleTicketPublicID is null")
  @Throws(BadIdentifierException, "If there is no TroubleTicket with the given PublicID.")
  static function loadTroubleTicket(troubleTicketPublicID: String) : TroubleTicket {
    return loadByPublicID<TroubleTicket>(troubleTicketPublicID, "troubleTicketPublicID")
  }

  @Throws(RequiredFieldException, "if the invoiceStreamPublicID is null")
  @Throws(BadIdentifierException, "If there are no Invoices with the given InvoicStream PublicID.")
  static function loadInvoiceStream(invoiceStreamPublicID : String) : InvoiceStream {
    return loadByPublicID<InvoiceStream>(invoiceStreamPublicID, "invoiceStreamPublicID")
  }


  @Throws(RequiredFieldException, "if the publicID is null")
  @Throws(BadIdentifierException, "If there is no existing Entity with the given PublicID.")
  static function loadByPublicID<T extends KeyableBean>(publicID : String) : T {
    return loadByPublicID<T>(publicID, "publicID")
  }

  @Throws(RequiredFieldException, "if the publicID is null")
  @Throws(BadIdentifierException, "If there is no existing Entity with the given PublicID.")
  static function loadByPublicID<T extends KeyableBean>(publicID : String, argName : String) : T {
    WebservicePreconditions.notNull(publicID, argName)
    var result : T
    result = new Query(T as IEntityType).compare(T#PublicID, Equals, publicID).select().AtMostOneRow as T
    if (result == null) {
      throw BadIdentifierException.badPublicId(T, publicID)
    }
    return result
  }

  private static function validateInvoiceItems(invoiceItemPublicIDs : String[], foundInvoiceItems : List<InvoiceItem>) {
    var idSet = invoiceItemPublicIDs.toSet()
    
    for (invoiceItem in foundInvoiceItems) {
      idSet.remove(invoiceItem.PublicID)
    }
    
    if (!idSet.Empty) {
      var badIDs : String
      for (id in idSet) {
        badIDs = badIDs + " " + id
      }
      
      throw new BadIdentifierException(badIDs)
    }
  
  }
}
