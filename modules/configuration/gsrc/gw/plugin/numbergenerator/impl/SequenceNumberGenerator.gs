package gw.plugin.numbergenerator.impl

uses gw.plugin.numbergenerator.INumberGenerator
uses gw.api.system.database.SequenceUtil

/**
 * Generates a non-repeating, unique number based on a Sequence. See SequenceUtil.next().
 * 
 * Transaction numbers are generated using SeedWithNumericAdjuncts.
 * See the GosuDoc for SeedWithNumericAdjuncts to see how this method of number generation differs from the default.
 * Transaction numbers are generated using this alternate method for the following reasons:
 * <ul>
 *   <li>Default method of number generation updates to a database row for each number generated which holds a lock on the row.
 *       When many threads are attempting to generate a number, there is contention for this lock and threads go idle while
 *       waiting for the lock - reducing throughput.</li>
 *   <li>Of all the numbers generated, transaction numbers caused by far the most lock contention.
 *       Tests show a significant increase in the performance of transaction number generation.</li>
 * </ul>
 * This class can be changed to use the default number generation for transaction numbers.
 * This class can be changed to use SeedWithNumericAdjunct number generation for numbers other than transaction numbers.
 */
@Export
class SequenceNumberGenerator implements INumberGenerator {
  // See GosuDoc on SeedWithNumericAdjuncts for details on the values passed into its constructor.
  // To generate transaction numbers using the default method, comment out next line and scroll down for further instructions.
  private final var transactionNumberGenerator = new SeedWithNumericAdjuncts(9999, \->generateSequencedID("transaction"))

  construct() {
  }

  public override function generateAccountNumber(account : Account) : String {
    if (account.AccountNumber == null) {
      return generateSequencedID("account")
    } else {
      return account.AccountNumber;
    }
  }

  public override function generateDisbursementNumber(disbursement : Disbursement) : String {
    return generateSequencedID("disbursement")
  }

  public override function generateInvoiceNumber(invoice : Invoice) : String {
    return generateSequencedID("invoice")
  }

  public override function generateStatementNumber(statement : ProducerStatement) : String {
    return generateSequencedID("statement")
  }

  public override function generateTransactionNumber(transaction : Transaction) : String {
    // To generate transaction numbers using the default method, comment out next line and scroll down for further instructions.
    return transactionNumberGenerator.nextNumber()
    // To generate transaction numbers using the default method, UNcomment next line.
    // return generateSequencedID("transaction")
  }

  override function generateCollateralRequirementNumber(requirement : CollateralRequirement) : String {
    return generateSequencedID("requirement")
  }

  public override function generateTroubleTicketNumber(troubleTicket : TroubleTicket) : String {
    return generateSequencedID("troubletkt")
  }

  /**
  * Creates the next number in the sequence for the given key. The key will be, at a minimum, 10-digits long.
  */
  private function generateSequencedID( sequenceKey : String ) : String {
    return SequenceUtil.next( 1000000000, sequenceKey ) as String
  }
}
