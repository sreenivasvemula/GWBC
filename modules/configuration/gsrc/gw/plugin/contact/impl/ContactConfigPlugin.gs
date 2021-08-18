package gw.plugin.contact.impl

uses gw.plugin.contact.IContactConfigPlugin

@Export
class ContactConfigPlugin implements IContactConfigPlugin {
    override function minimumCriteriaSet(searchCriteria : ContactSearchCriteria) : boolean {
        return nameCriteriaSet(searchCriteria) or taxIdCriteriaSet(searchCriteria) or addressCriteriaSet(searchCriteria)
    }

   private function nameCriteriaSet(searchCriteria : ContactSearchCriteria) : boolean {
    // Keyword functions as LastName for Persons, and Name for all other contact types
    if (searchCriteria.ContactSubtype == typekey.Contact.TC_PERSON) {
      return (searchCriteria.FirstName.HasContent or searchCriteria.Keyword.HasContent
              or searchCriteria.FirstNameKanji.HasContent or searchCriteria.KeywordKanji.HasContent)
    } else {
      return searchCriteria.Keyword.HasContent or searchCriteria.KeywordKanji.HasContent
    }
  }

  private function taxIdCriteriaSet(searchCriteria : ContactSearchCriteria) : boolean {
    return searchCriteria.TaxID.HasContent
  }

  private function addressCriteriaSet(searchCriteria : ContactSearchCriteria) : boolean {
    var address = searchCriteria.Address
    return (address.City.HasContent and address.State != null)
  }
}
