package gw.search

uses gw.api.util.DisplayableException;

/**
 * Search-related static utility functions.
 */
@Export
class SearchMethods {

  private static function isRestrictedUser() : boolean {
    return not User.util.CurrentUser.UnrestrictedUser
  }

  /**
   * Account search with validation.
   */
  public static function validateAndSearch(searchCriteria : gw.search.AccountSearchCriteria,
                                           contactCriteriaSearchMode : StringCriterionMode) : AccountSearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.AccountNumber.NotBlank or
                   searchCriteria.AccountName.NotBlank or
                   searchCriteria.PolicyNumber.NotBlank or
                   searchCriteria.FEIN.NotBlank or
                   searchCriteria.ContactCriteria.isReasonablyConstrainedForSearch())
    }
    return searchCriteria.performSearch(contactCriteriaSearchMode);
  }

  /**
   * Activity search with validation.
   */
  public static function validateAndSearch(searchCriteria : ActivitySearchCriteria) : ActivitySearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.AssignedToUser != null)
    }
    return searchCriteria.performSearch(true);
  }

  /**
   * AgencyMoneyReceived search with validation.
   * Because this search duplicates PaymentSearch functionality, it now plugs directly into PaymentSearchCriteria
   */
  public static function validateAndSearch(searchCriteria : gw.search.PaymentSearchCriteria,
                                           isAgencyReceived : Boolean) : AgencyMoneyReceivedSearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.ProducerName.NotBlank or
                   searchCriteria.ProducerCode.NotBlank)
    }
    return searchCriteria.performAgencySearchOnly()
  }

  /**
   * Charge search with validation.
   */
  public static function validateAndSearch(searchCriteria : ReversibleChargeSearchCriteria,
                                           isClearBundle : Boolean) : ChargeQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.Account != null or 
                   searchCriteria.PolicyPeriod != null)
    }
    return searchCriteria.performSearch(isClearBundle);
  }

  /**
   * Delinquency search with validation.
   */
  public static function validateAndSearch(searchCriteria : gw.search.DelinquencySearchCriteria) : DelinquencySearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.AccountNumber.NotBlank or
                   searchCriteria.PolicyNumber.NotBlank or
                   searchCriteria.ContactCriteria.isReasonablyConstrainedForSearch())
    }
    return searchCriteria.performSearch()
  }

  /**
   * Disbursement search with validation.
   */
  public static function validateAndSearch(searchCriteria : AcctDisbSearchCriteria) : AcctDisbSearchViewQuery{
    if (isRestrictedUser()) {
      validateThat(searchCriteria.CheckNumber.NotBlank or
                   searchCriteria.Payee != null or
                   searchCriteria.AccountNumber.NotBlank)
    }
    return searchCriteria.performSearch(true);
  }

  public static function validateAndSearch(searchCriteria : AgcyDisbSearchCriteria) : AgcyDisbSearchViewQuery{
    if (isRestrictedUser()) {
      validateThat(searchCriteria.CheckNumber.NotBlank or
                   searchCriteria.Payee.NotBlank)
    }
    return searchCriteria.performSearch(true);
  }

  public static function validateAndSearch(searchCriteria : CollDisbSearchCriteria) : CollDisbSearchViewQuery{
    if (isRestrictedUser()) {
      validateThat(searchCriteria.CheckNumber.NotBlank or
                   searchCriteria.Payee.NotBlank or
                   searchCriteria.AccountNumber.NotBlank)
    }
    return searchCriteria.performSearch(true);
  }

  public static function validateAndSearch(searchCriteria : SuspDisbSearchCriteria) : SuspDisbSearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.CheckNumber.NotBlank or
                   searchCriteria.Payee.NotBlank)
    }
    return searchCriteria.performSearch(true);
  }

  /**
   * Invoice search with validation.
   */
  public static function validateAndSearch(searchCriteria : gw.search.InvoiceSearchCriteria,
                                           contactCriteriaSearchMode : StringCriterionMode) : InvoiceSearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.AccountNumber.NotBlank or
                   searchCriteria.InvoiceNumber.NotBlank or
                   searchCriteria.ContactCriteria.isReasonablyConstrainedForSearch())
    }
    return searchCriteria.performSearch(contactCriteriaSearchMode);
  }

  /**
   * NegativeWriteoff transaction search with validation.
   */
  public static function validateAndSearch(searchCriteria : NegWriteoffSearchCrit) : AcctNegativeWriteoffQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.Account != null)
    }
    return searchCriteria.performSearch();
  }

  /**
   * Outgoing producer payment search with validation.
   */
  public static function validateAndSearch(searchCriteria : OutgoingProducerPmntSearchCriteria) : OutgoingProducerPmntSearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.CheckNumber.NotBlank or
                   searchCriteria.Payee.NotBlank)
    }
    return searchCriteria.performSearch(true);
  }

  /**
   * Payment search with validation.
   */
  public static function validateAndSearch(searchCriteria : gw.search.PaymentSearchCriteria) : DirectBillMoneyReceivedSearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.AccountNumber.NotBlank or
                   searchCriteria.PolicyNumber.NotBlank or
                   searchCriteria.CheckNumber.NotBlank or
                   searchCriteria.Token.NotBlank or 
                   searchCriteria.ContactCriteria.isReasonablyConstrainedForSearch())
    }
    return searchCriteria.performSearch();
  }

  /**
   * PaymentRequest search with validation.
   */
  public static function validateAndSearch(searchCriteria : PaymentRequestSearchCriteria,
                                           isClearBundle : Boolean) : PaymentRequestQuery {
    // Nothing to validate for PaymentRequestSearchCriteria
    return searchCriteria.performSearch(isClearBundle)
  }

  /**
   * Policy search with validation.
   */
  public static function validateAndSearch(searchCriteria : gw.search.PolicySearchCriteria,
                                           contactCriteriaSearchMode : StringCriterionMode) : PolicySearchViewQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.AccountNumber.NotBlank or
                   searchCriteria.PolicyNumber.NotBlank or
                   searchCriteria.ProducerCode.NotBlank or 
                   searchCriteria.ContactCriteria.isReasonablyConstrainedForSearch())
    }
    return searchCriteria.performSearch(contactCriteriaSearchMode);
  }

  /**
   * Producer search with validation.
   */
  public static function validateAndSearch(searchCriteria : gw.search.ProducerSearchCriteria,
                                           contactCriteriaSearchMode : StringCriterionMode) : ProducerSearchViewQuery{
    if (isRestrictedUser()) {
      validateThat(searchCriteria.ProducerName.NotBlank or
                   searchCriteria.ProducerCode.NotBlank or
                   searchCriteria.ContactCriteria.isReasonablyConstrainedForSearch())
    }
    return searchCriteria.performSearch(contactCriteriaSearchMode);
  }

  /**
   * Transaction search with validation.
   */
  public static function validateAndSearch(searchCriteria : TransactionSearchCrit) : TransactionQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.TransactionNumber.NotBlank)
    }
    return searchCriteria.performSearch(true);
  }

  public static function validateAndSearch(searchCriteria : gw.search.TroubleTicketSearchCriteria) : TroubleTicketQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.TroubleTicketNumber.NotBlank or
                   searchCriteria.AccountNumber.NotBlank or
                   searchCriteria.PolicyNumber.NotBlank or
                   searchCriteria.Title.NotBlank or
                   searchCriteria.ContactCriteria.isReasonablyConstrainedForSearch() or
                   searchCriteria.AssignedToUser != null)
    }
    return searchCriteria.performSearch();
  }

  /**
   * Writeoff search with validation.
   */
  public static function validateAndSearch(searchCriteria : WriteoffSearchCriteria) : WriteoffQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.Account != null or
                   searchCriteria.PolicyPeriod != null)
    }
    return searchCriteria.performSearch()
  }

  /**
   * Credit search with validation.
   */
  public static function validateAndSearch(searchCriteria : CreditSearchCriteria) : CreditQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.Account != null or
                   searchCriteria.Reason != null)
    }
    return searchCriteria.performSearch()
  }

  /**
   * Invoice Item search with validation.
   */
   public static function validateAndSearch(searchCriteria : gw.search.InvoiceItemSearchCriteria, baseDist : BaseDist) : InvoiceItemQuery {
     if (isRestrictedUser()) {
       validateThat(searchCriteria.OwnerAccount.NotBlank or
                    searchCriteria.PayerAccountNumber.NotBlank or
                    searchCriteria.PayerProducerName.NotBlank or
                    searchCriteria.PayerProducerNameKanji.NotBlank or
                    searchCriteria.PolicyPeriod.NotBlank)
     }
     if (baseDist typeis AgencyCyclePromise) {
       searchCriteria.DistributionTypeIsPromise = true
     }
     return searchCriteria.performSearch(baseDist)
   }

  /**
   * Direct Bill Suspense Item search with validation.
   */
  public static function validateAndSearch(searchCriteria : DirectSuspPmntItemSearchCriteria) : DirectSuspPmntItemQuery {
    if (isRestrictedUser()) {
      validateThat(searchCriteria.EarliestDate != null or
                   searchCriteria.LatestDate != null or
                   searchCriteria.MinAmount != null or
                   searchCriteria.MaxAmount != null)
    }
    return searchCriteria.performSearch();
  }

  /**
   * Statement Invoice search for Agency Payment Wizard with validation
   */
  public static function validateAndSearch(searchCriteria : StatementInvoiceSearchCriteria) : StatementInvoiceQuery {
    if (isRestrictedUser()) {
      //nothing to validate
    }
    return searchCriteria.performSearch()
  }
  
  
  /**
   * Policy Period search for Agency Payment Wizard with validation
   */
  public static function validateAndSearch(searchCriteria : PolicyPeriodSearchCriteria) : PolicyPeriodQuery {
    if (isRestrictedUser()) {
      // nothing to validate
    }
    return searchCriteria.performSearch()
  }


  // Private helper methods

  /**
   * Confirm that the given condition is true.  If not, throw a DisplayableException
   * with the RequiredNotPresent message.
   */
  private static function validateThat(condition : boolean) {
    if (not condition) {
      throw new DisplayableException(displaykey.Java.Search.Error.RequiredNotPresent)
    }
  }

}
