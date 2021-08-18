package gw.command

uses com.guidewire.pl.metadata.datatype.PLDataTypes
uses com.guidewire.pl.system.util.DateTimeUtil
uses com.guidewire.testharness.assertion.AssertionHelperFactory
uses gw.api.databuilder.AccountBuilder
uses gw.api.databuilder.BCDataBuilder
uses gw.api.databuilder.PolicyPeriodBuilder
uses gw.api.databuilder.ProducerBuilder
uses gw.api.util.DateUtil

uses java.lang.Double
uses java.sql.Timestamp
uses java.util.Date

@Export
class Report extends BCBaseCommand {

  construct() {
    super()
  }

  private static function formatDateLiteral(date : Date) : String {
    var value = DateTimeUtil.trimToDay(date)
    return PLDataTypes.datetime().asPersistentDataType().toSqlLiteral(value)
  }

  function withTrialBalanceVerifyPolicyUponClosureTest(){
    Date.CurrentDate.nextDayOfMonth(1).setClock()

    var account = new AccountBuilder()
        .withBillingPlan("QA1BILLINGPLAN01")
        .withDelinquencyPlan("QA1DELINQUENCYPLAN01")
        .withInvoiceDayOfMonth(1)
        .withDistributionUpToAmountUnderContract()
        .createAndCommit()

      var producer = new ProducerBuilder()
        .withProducerCodeHavingCommissionPlan(BCDataBuilder.createRandomWordPair(), "QA1COMMISSIONPLAN01")
        .createAndCommit()

    var policyPeriod = new PolicyPeriodBuilder()
        .onAccount(account)
        .withPaymentPlan("QA1PAYMENTPLAN01")
        .withPrimaryProducerCode(producer.ProducerCodes[0])
        .withPremiumAndTaxes(1000, 100)
        .createAndCommit()

    account.makeSingleCashPaymentUsingNewBundle(1100bd.ofCurrency(account.Currency))
        
    policyPeriod.PolicyPerExpirDate.addDays(1).setClock()
    runBatchProcess(BatchProcessType.TC_INVOICE)
    runBatchProcess(BatchProcessType.TC_INVOICEDUE)
    runBatchProcess(BatchProcessType.TC_CHARGEPRORATATX)
    runBatchProcess(BatchProcessType.TC_POLICYCLOSURE)

  }
  
   function withUnearnedPremiumReportNoEarnedPremium(){
    Date.CurrentDate.nextDayOfMonth(1).setClock()
    var effectiveDate = Date.CurrentDate
    var expirationDate = effectiveDate.addDays(6)
   
    var account = new AccountBuilder()
                      .createAndCommit()
                      
    new PolicyPeriodBuilder()
          .onAccount(account)
          .withEffectiveDate(effectiveDate)
          .withExpirationDate(expirationDate)
          .withPremiumWithDepositAndInstallments(1000)
          .createAndCommit()
  }

  function AccountBalanceReport_createDataFirst() : String {
    print("**** in AccountBalanceReport_createDataFirst() ****")
    // TODO: account parameter
         //1) use supplied account (name or number? --> name, i think) if any.
         //2) allows for selecting an account (ie, with  "?")
         //3) else use currentAccount, if any,
         //4) else create a new account. 
    var transCmd = new Transactions()
    transCmd.doDirectBillMoneyReceivedTxn()
    // add calls to do other relevant transactions here, as they are written.
    
    var returnString = AccountBalanceReport_reportOnly()
    return(returnString)
  }
  
  function AccountBalanceReport_reportOnly() : String {
         // TODO: take account(number?) parameter
           //1) use supplied account (name or number? --> name, i think) if any.
           //2) allows for selecting an account (ie, with  "?")
           //3) else use currentAccount, if any,
           //4) else fail, because we have to report on a supplied account
          // TODO: take start and end date parameters  (default: back one year and forward one day?)
          
        //  TODO:USE SUPPLIED Parms.   for now, set values for accountnum, reportStartDate, and ReportEndDate
        var acctNum = "Block-74-Cappuccino"
        var rptStartDate =  Date.CurrentDate
        rptStartDate =  DateUtil.addMonths( rptStartDate, -12 )
        var rptEndDate =  Date.CurrentDate
        rptEndDate = DateUtil.addMonths( rptEndDate, 1)
        
        
//      Declare about 27 vars for all AcctBalRpt fields.

        var acctName = "<acctName>"

        var prev_unbilled = 0.00
        var prev_billed   = 0.00
        var prev_due      = 0.00
        var prev_unapplied = 0.00
        var prev_TOTAL = 0.00

        var curr_unbilled = 0.00
        var curr_billed   = 0.00
        var curr_due      = 0.00
        var curr_unapplied = 0.00
        var curr_TOTAL = 0.00

        var left_NETCHANGE = 0.00

        var debit_pyAppliedToOthrAccts = 0.00
        var debit_newCharges = 0.00
        var debit_negativeWriteoffs = 0.00
        var debit_disbursements = 0.00
        var debit_TOTALDEBITS = 0.00

        var credit_payments = 0.00
        var credit_paymentsFrmOthrAccts = 0.00
        var credit_paymentsFrmProducers = 0.00
        var credit_writeoffs = 0.00
        var credit_otherCredits = 0.00
        var credit_TOTALCREDITS = 0.00

        var other_transfers = 0.00
        var other_TOTALOTHER = 0.00

        var right_NETCHANGE = 0.00

        var reportBalance = 0.00 
        
//      Construct first SQL query
  //  issues with "SUM(" and NULL:
  // Any NULL value in the argument of aggregate functions AVG, SUM, MAX, MIN, and COUNT is eliminated before the
  // respective function is calculated (except for the function COUNT(*)). 
  //
  //  >>>>  If a column contains only NULL values, the function returns NULL. <<<< 
  //
  //   The aggregate function COUNT(*) handles all NULL values the same as non-NULL values. 
  // Therefore: do this in case any sums are null ->    ISNULL(Sum(SomeValue),0) 
         var reportQuery_1 = "select ISNULL(SUM(dbo.bcrv_account_other_payments.paid_from_other_account),0), " +
           "ISNULL(SUM(dbo.bcrv_account_other_payments.paid_from_producer),0), " + 
           " ISNULL(SUM(dbo.bcrv_account_other_payments.paid_to_other_account),0) " + 
           "from dbo.bcrv_account_other_payments where dbo.bcrv_account_other_payments.account =  '" + acctNum +
           "' and dbo.bcrv_account_other_payments.transaction_date <=  " + formatDateLiteral( rptEndDate )  +
           " and dbo.bcrv_account_other_payments.transaction_date > " +  formatDateLiteral( rptStartDate )
        
        print ("******************  first query ***************\n" + reportQuery_1 + "\n\n")

//      o   Do first SQL qu (returns a single line)
            var AHF = new AssertionHelperFactory()
            var ReportQueryResult_1 = AHF.sql(reportQuery_1, {Number, Number,Number} ).hasOneItem()

            print("ReportQueryResult_1.length" + ReportQueryResult_1.length)
            print("ReportQueryResult_1.Count" + ReportQueryResult_1.Count)
            // above all return 3.  But i expected to get back object[][] ?   Well, maybe I will for other queries?
            // ReportQueryResult_1.each(\ o -> print(o + "\n") )
            print("1> " + ReportQueryResult_1[0] + " 2> " + ReportQueryResult_1[1] + " 3> " + ReportQueryResult_1[2] + "\n")
            
            //populate 3 right-side fields from SQL1 results
            credit_paymentsFrmOthrAccts = ReportQueryResult_1[0] as Number
            credit_paymentsFrmProducers = ReportQueryResult_1[1] as Number
            debit_pyAppliedToOthrAccts = ReportQueryResult_1[2] as Number
            
        //  Construct second SQL query
        //  ==================================
        //  ACCOUNT BALANCE REPORT, QUERY 2
        //    SUMs fields from bcrv_account_transactions table with date range ReportStartDate to ReportEndDate
        //  ==================================
        //  "select SUM(dbo.bcrv_account_transactio
        //  ns.payments) as "Ledger Side Metrics.Payments", SUM(dbo.bcrv_account_transactions.writeoffs) as ALIAS_0, SUM(dbo.bcrv_ac
        //  count_transactions.other_credits) as ALIAS_1, SUM(dbo.bcrv_account_transactions.new_charges) as ALIAS_2, SUM(dbo.bcrv_ac
        //  count_transactions.negative_writeoffs) as ALIAS_3, SUM(dbo.bcrv_account_transactions.disbursements) as ALIAS_4, SUM(dbo.
        //  bcrv_account_transactions.transfers) as ALIAS_5
        //  from dbo.bcrv_account_transactions
        //  where dbo.bcrv_account_transactions.account_number =  ?  and dbo.bcrv_account_transactions.transaction_date <=  ?  and d
        //  bo.bcrv_account_transactions.transaction_date >  ?"
        var reportQuery_2 = "select ISNULL(SUM(dbo.bcrv_account_transactions.payments),0), " +
        " ISNULL(SUM(dbo.bcrv_account_transactions.writeoffs),0),  " +
        " ISNULL(SUM(dbo.bcrv_account_transactions.other_credits),0),  " +
        " ISNULL(SUM(dbo.bcrv_account_transactions.new_charges),0),  " +
        " ISNULL(SUM(dbo.bcrv_account_transactions.negative_writeoffs),0),  " +
        " ISNULL(SUM(dbo.bcrv_account_transactions.disbursements),0),  " +
        " ISNULL(SUM(dbo.bcrv_account_transactions.transfers),0)  " +
        " from dbo.bcrv_account_transactions where dbo.bcrv_account_transactions.account_number =   '" +
        acctNum + "' and dbo.bcrv_account_transactions.transaction_date <=  " + formatDateLiteral( rptEndDate )  +
           " and dbo.bcrv_account_transactions.transaction_date > "  +  formatDateLiteral( rptStartDate )

        //  Do second SQL query (returns a single line)
        var ReportQueryResult_2 = AHF.sql(reportQuery_2, {Number,Number,Number,Number,Number,Number,Number} ).hasOneItem()

        print("ReportQueryResult_2.Count" + ReportQueryResult_2.Count)
        print("1> " + ReportQueryResult_2[0] + " 2> " + ReportQueryResult_2[1] + " 3> " + ReportQueryResult_2[2] + 
            " 4> " + ReportQueryResult_2[3] + " 5> " + ReportQueryResult_2[4] + " 6> " + ReportQueryResult_2[5] + 
            " 7> " + ReportQueryResult_2[6] + "\n")
            
         //populate the 7 remaining right-side fields from SQL1 results
         credit_payments  = ReportQueryResult_2[0] as Number
         credit_writeoffs = ReportQueryResult_2[1] as Number
         credit_otherCredits = ReportQueryResult_2[2] as Number
         debit_newCharges = ReportQueryResult_2[3] as Number
         debit_negativeWriteoffs = ReportQueryResult_2[4] as Number 
         debit_disbursements = ReportQueryResult_2[5] as Number
         other_transfers = ReportQueryResult_2[6] as Number


       //   Construct third SQL query
       //==================================
       //ACCOUNT BALANCE REPORT, QUERY 3
       //   Queries against bcrv_account_transactions table with date range 0 to ReportEndDate
       //==================================
       //"select dbo.bcrv_account_transactions.account_number as ALIAS_0, dbo.bcrv_account_
       //transactions.account_name as ALIAS_1, dbo.bcrv_account_transactions.transaction_date
       // as ALIAS_2, dbo.bcrv_account_transactions.unbilled as ALIAS_3, dbo.bcrv_account_
       //transactions.billed as ALIAS_4, dbo.bcrv_account_transactions.due as ALIAS_5, dbo.
       //bcrv_account_transactions.unapplied as ALIAS_6, dbo.bcrv_account_transactions.line_
       //item_amount as ALIAS_7, dbo.bcrv_account_transactions.transaction_typecode as ALIAS_8,
       // dbo.bcrv_account_transactions.taccount_typecode as ALIAS_9, dbo.bcrv_account_
       //transactions.owner as ALIAS_10, dbo.bcrv_account_transactions.transaction_id as 
       //ALIAS_11, dbo.bcrv_account_transactions.line_item_id as ALIAS_12, dbo.bcrv_account
       //_transactions.account_id as ALIAS_13, dbo.bcrv_account_transactions.payments as 
       //"Ledger Side Metrics.Payments", dbo.bcrv_account_transactions.writeoffs as ALIAS_14,
       // dbo.bcrv_account_transactions.other_credits as ALIAS_15, dbo.bcrv_account_transactions
       //.new_charges as ALIAS_16, dbo.bcrv_account_transactions.negative_writeoffs as ALIAS_17,
       // dbo.bcrv_account_transactions.disbursements as ALIAS_18, dbo.bcrv_account_transactions
       //.transfers as ALIAS_19 from dbo.bcrv_account_transactions where dbo.bcrv_account_
       //transactions.account_number =  ?  and dbo.bcrv_account_transactions.transaction
       //_date <=  ?" 

         var reportQuery_3 = "select dbo.bcrv_account_transactions.account_number, " +
         " dbo.bcrv_account_transactions.account_name,  " +
         " dbo.bcrv_account_transactions.transaction_date,  " +
         " ISNULL(dbo.bcrv_account_transactions.unbilled,0),  " +
         " ISNULL(dbo.bcrv_account_transactions.billed,0),  " +
         " ISNULL(dbo.bcrv_account_transactions.due,0),  " +
         " ISNULL(dbo.bcrv_account_transactions.unapplied,0),  " +
         " dbo.bcrv_account_transactions.line_item_amount,  " +
         " dbo.bcrv_account_transactions.transaction_typecode,  " +
         " dbo.bcrv_account_transactions.taccount_typecode,  " +
         " dbo.bcrv_account_transactions.owner,  " +
         " dbo.bcrv_account_transactions.transaction_id,  " +
         " dbo.bcrv_account_transactions.line_item_id,  " +
         " dbo.bcrv_account_transactions.account_id,  " +
         " dbo.bcrv_account_transactions.payments,  " +
         " dbo.bcrv_account_transactions.writeoffs,  " +
         " dbo.bcrv_account_transactions.other_credits,  " +
         " dbo.bcrv_account_transactions.new_charges,  " +
         " dbo.bcrv_account_transactions.negative_writeoffs,  " +
         " dbo.bcrv_account_transactions.disbursements,  " +
         " dbo.bcrv_account_transactions.transfers  " +
         " from dbo.bcrv_account_transactions  " +
         " where dbo.bcrv_account_transactions.account_number =   '" + acctNum +
         "' and dbo.bcrv_account_transactions.transaction_date <= " +  formatDateLiteral( rptEndDate )
         
//      o   Do third SQL query (returns multiple lines)
        var ReportQueryResult_3 = AHF.sql(reportQuery_3, {String,String,Timestamp,Number,Number,Number,Number,Number,String,String,
              String,Number,Number,String,Number,Number,Number,Number,Number,Number,Number } ).value()
        print("ReportQueryResult_3.Count" + ReportQueryResult_3.Count)
        
        print("1> " + ReportQueryResult_3.first()[0] + " 2> " + ReportQueryResult_3.first()[1] + " 3> " + ReportQueryResult_3.first()[2] + 
     " 4> " + ReportQueryResult_3.first()[3] + " 5> " + ReportQueryResult_3.first()[4] + " 6> " + ReportQueryResult_3.first()[5] + 
     " 7> " + ReportQueryResult_3 .first()[6] + " 8> " + ReportQueryResult_3.first()[7] + " 9> " + ReportQueryResult_3.first()[8] + 
     " 10> " + ReportQueryResult_3.first()[9] + " 11> " + ReportQueryResult_3.first()[10] + " 12> " + ReportQueryResult_3.first()[11] + 
     " 13> " + ReportQueryResult_3.first()[12] + " 14> " + ReportQueryResult_3.first()[13] + " 15> " + ReportQueryResult_3.first()[15] + 
     " 16> " + ReportQueryResult_3.first()[15] + " 17> " + ReportQueryResult_3.first()[16] + " 18> " + ReportQueryResult_3.first()[17] + 
     " 19> " + ReportQueryResult_3.first()[18] + " 18> " + ReportQueryResult_3.first()[19] + " 21> " + ReportQueryResult_3.first()[20] ) 
    
//      o   Populate acctName & Num and RepStart and End date fields.
       acctName = ReportQueryResult_3.first()[1] as String
//      o   Do ~closure against results, populating 8 of 11 LH fields as it goes.
       ReportQueryResult_3.each(\ o -> 
           {
           // all records apply to bottom totals -- since the query used      " date <=  reportEndDate"
           curr_unbilled  += o[3] as Number
           curr_billed    += o[4] as Number
           curr_due       += o[5] as Number
           curr_unapplied += o[6] as Number
           
           // also count this records values in top (prev) totals,  IF the date <= reportStartdDate.
           if ((o[2] as Date) <= rptStartDate ) {
               prev_unbilled  += o[3] as Number
               prev_billed    += o[4] as Number
               prev_due       += o[5] as Number
               prev_unapplied += o[6]  as Number
           }   // this curly brace closes the IF
               
         }   // this curly brace closes the assignment statements in the block.
       )  // end of the block
           
           
       // Calc LH and RH subtotal fields.
       prev_TOTAL =  prev_unbilled + prev_billed + prev_due + prev_unapplied

       curr_TOTAL = curr_unbilled + curr_billed + curr_due + curr_unapplied 

       debit_TOTALDEBITS  = debit_pyAppliedToOthrAccts + debit_newCharges + 
             debit_negativeWriteoffs + debit_disbursements 

       credit_TOTALCREDITS = credit_payments + credit_paymentsFrmOthrAccts + 
            credit_paymentsFrmProducers + credit_writeoffs + credit_otherCredits 

       other_TOTALOTHER = other_transfers 

       // Calc (differently) LH and RH New Change fields. 
       left_NETCHANGE = curr_TOTAL - prev_TOTAL
       
       right_NETCHANGE = debit_TOTALDEBITS + credit_TOTALCREDITS + other_TOTALOTHER
       
       // Calc diff between  LH and RH New Change fields. 
       reportBalance = left_NETCHANGE - right_NETCHANGE  // If this is not 0, then report is not balanced.
       
       
//      o   Log all report fields.
var report = "========== ACCOUNT BALANCE REPORT ==========\n"
 + "           acctNum: " + acctNum + "\n"
 + "           acctName: " + acctName + "\n"
 + "          =========================\n"
 + "\n"
 + "prev_unbilled: " + prev_unbilled + "                                                               " + "debit_pyAppliedToOthrAccts: " + debit_pyAppliedToOthrAccts + "\n"
 + "prev_billed  : " + prev_billed   + "                                                                 " + "debit_newCharges: " + debit_newCharges + "\n"
 + "prev_due     : " + prev_due      + "                                                                " + "debit_negativeWriteoffs: " + debit_negativeWriteoffs + "\n"
 + "prev_unapplied: " + prev_unapplied + "                                                             " + "debit_disbursements: " + debit_disbursements + "\n"
 + "-----------------------------                                                    " + "-----------------------------\n"
 + "prev_TOTAL: " + prev_TOTAL + "  on start date of " + rptStartDate + "                     " + "debit_TOTALDEBITS: " + debit_TOTALDEBITS + "\n"
 + "\n"
 + "curr_unbilled: " + curr_unbilled + "                                            " + "credit_payments: " + credit_payments + "\n"
 + "curr_billed  : " + curr_billed   + "                                             " + "credit_paymentsFrmOthrAccts: " + credit_paymentsFrmOthrAccts + "\n"
 + "curr_due     : " + curr_due      + "                                                        " + "credit_paymentsFrmProducers: " + credit_paymentsFrmProducers + "\n"
 + "curr_unapplied: " + curr_unapplied + "                                " + "credit_writeoffs: " + credit_writeoffs + "\n"
 + "-----------------------------                                                        credit_otherCredits: " + credit_otherCredits + "\n"
 + "curr_TOTAL: " + curr_TOTAL +  " on end date of " + rptEndDate + "                 " + "-----------------------------\n"
 + "                                                                                          credit_TOTALCREDITS: " + credit_TOTALCREDITS + "\n"
 + "\n"
 + "                                                                                          other_transfers: " + other_transfers + "\n"
 + "                                                                                          -----------------------------\n"
 + "                                                                                          other_TOTALOTHER: " + other_TOTALOTHER + "\n"
 + "\n"
 + "===============================                                                           ===============================\n"
 + "left_NETCHANGE: " + left_NETCHANGE + "                                                    right_NETCHANGE: " + right_NETCHANGE + "\n"
 + "\n"
 + "===========================================================================================\n"
 + "                              ReportBalance (should be zero!): " + reportBalance + "\n"
 + "\n"
 
 print(report)
//      o   Compose return String, beginning with "PASS" or "FAIL".
    var returnString = "fill me out"
    if ((reportBalance < 0.001) and  (reportBalance > -0.001)) {   // so, eg. a difference of 4.123e-14 will pass.
           returnString = "PASS: balance is " + reportBalance + "\n"
    } else {
           returnString = "!!!!!!!  FAIL  !!!!!!!!: balance is " + reportBalance + "\n"
    }
    returnString = returnString + report
    //     Return return String.
    print("in AccountBalanceReport_reportOnly(), returning this string: " + returnString + "\n")
    return(returnString)
  }
}
