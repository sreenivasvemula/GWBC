package gw.command.demo

uses gw.api.database.Query
uses gw.api.util.DateUtil
uses java.util.Date

@Export
class GeneralUtil {
  
  construct() { }

  public static function findChargePatternByChargeCode (name : String) : ChargePattern{
    return Query.make(ChargePattern).compare("ChargeCode", Equals, name).select().FirstResult
  }

  public static function findBillingPlanByPublicId (publicID : String) : BillingPlan {
    return Query.make(BillingPlan).compare("PublicID", Equals, publicID).select().FirstResult
  }

  public static function findBillingPlanByName (name : String) : BillingPlan {
    return Query.make(BillingPlan).compare("Name", Equals, name).select().FirstResult
  }

  public static function findDelinquencyPlanByPublicId (publicID : String) : DelinquencyPlan {
    return Query.make(DelinquencyPlan).compare("PublicID", Equals, publicID).select().FirstResult
  }

  public static function findPaymentPlanByPublicId (publicID : String) : PaymentPlan {
    return Query.make(PaymentPlan).compare("PublicID", Equals, publicID).select().FirstResult
  }

  public static function findPaymentPlanByName (name : String) : PaymentPlan {
    return Query.make(PaymentPlan).compare("Name", Equals, name).select().FirstResult
  }

  public static function findPaymentAllocationPlanByPublicId (publicID : String) : PaymentAllocationPlan {
    return Query.make(PaymentAllocationPlan).compare("PublicID", Equals, publicID).select().FirstResult
  }

  public static function findPaymentAllocationPlanByName (name : String) : PaymentAllocationPlan {
    return Query.make(PaymentAllocationPlan).compare("Name", Equals, name).select().FirstResult
  }

  public static function findAgencyBillPlanByPublicId (publicID : String) : AgencyBillPlan {
    return Query.make(AgencyBillPlan).compare("PublicID", Equals, publicID).select().FirstResult
  }

  public static function findAgencyBillPlanByName (name : String) : AgencyBillPlan {
    return Query.make(AgencyBillPlan).compare("Name", Equals, name).select().FirstResult
  }

  public static function findCommissionPlanByPublicId (publicID : String) : CommissionPlan {
    return Query.make(CommissionPlan).compare("PublicID", Equals, publicID).select().FirstResult
  }

  public static function findCommissionPlanByName (name : String) : CommissionPlan {
    return Query.make(CommissionPlan).compare("Name", Equals, name).select().FirstResult
  }

  public static function findAccountByName (accountName :String) : Account {
    return Query.make(Account).compare("AccountName", Equals, accountName).select().FirstResult
  }

  public static function doesAccountWithNameExist (accountName :String) : Boolean{
    return !Query.make(Account).compare("AccountName", Equals, accountName).select().Empty
  }

  public static function findProducerByName (producerName :String) : Producer {
    return Query.make(Producer).compare("Name", Equals, producerName).select().FirstResult
  }

  public static function findFirstProducerCode (producerName :String) : ProducerCode {
    return Query.make(Producer).compare("Name", Equals, producerName).select().FirstResult.ActiveProducerCodes[0]
  }

  public static function doesProducerWithNameExist (producerName :String) : Boolean{
  return !Query.make(Producer).compare("Name", Equals, producerName).select().Empty
  }

  public static function findPaymentPlan (paymentPlanName :String) : PaymentPlan {
    return Query.make(PaymentPlan).compare("Name", Equals, paymentPlanName).select().FirstResult
  }

  public static function findPolicyPeriod (policyNumber :String) : PolicyPeriod {
    return Query.make(PolicyPeriod).compare("PolicyNumber", Equals, policyNumber).select().FirstResult
  }

  public static function findPolicyPeriodByPolicyNumberandRenewalNumber (policyNumber :String, renewalNumber : int) : PolicyPeriod {
    var q = Query.make(PolicyPeriod)
    q.compare("PolicyNumber", Equals, policyNumber)
    q.compare("TermNumber", Equals, renewalNumber + 1)
    return q.select().FirstResult
  }

  // User Stuff
  
  public static function findGroupByUserName (groupName : String) : Group{
    return Query.make(Group).compare("Name", Equals, groupName).select().AtMostOneRow
  }

  public static function findUserByUserName (userName : String) : User{
    return Query.make(User).join("Credential").compare("UserName", Equals, userName).select().AtMostOneRow
  }

  public static function findCredentialByUserName (name : String) :Credential {
    return Query.make(Credential).compare("UserName", Equals, name).select().AtMostOneRow
  }

  public static function findUserWithMatchingCredential (credential : Credential) : User {
    return Query.make(User).compare("Credential", Equals, credential).select().AtMostOneRow
  }

  public static function findRoleByPublicName (roleName :String) : Role {
    return Query.make(Role).compare("Name", Equals, roleName).select().AtMostOneRow
  }

  public static function findRoleByPublicId (roleID :String) : Role {
    return Query.make(Role).compare("PublicID", Equals, roleID).select().AtMostOneRow
  }

  public static function findAuthorityLimitProfileByPublicId (authorityLimitProfileID : String) : AuthorityLimitProfile {
    return Query.make(AuthorityLimitProfile).compare("PublicID", Equals, authorityLimitProfileID).select().AtMostOneRow
  }

  public static function findSecurityZoneByName (name: String) :SecurityZone {
    return Query.make(SecurityZone).compare("Name", Equals, name).select().AtMostOneRow
  }


  /**************************************
           Other General  Methods
  ****************************************/
  /**
   * <p>This is a dummy method. Call it followed by a blankspace and "r". That should refresh the type system.<br>
   * You could call any method. Except that this method is safe to call at any time.
   */
  public static function refresh() : String {
    return "Refresh"
  }

  /**
   *<p>Moves clock to the specified date.
   **/
  public static function setClockToDate (targetDate: Date) {
    var currentDate = DateUtil.currentDate()
    var diffInDays = DateUtil.differenceInDays(currentDate, targetDate)
    print ("Diff in Days = " + diffInDays)
    Date.CurrentDate.addDays(diffInDays).setClock()
  }
}