package gw.plugin.numbergenerator.impl;

uses gw.api.util.BCUtils;
uses gw.plugin.numbergenerator.INumberGenerator

@Export
class NumberGenerator implements INumberGenerator {

  construct() {
  }

  public override function generateAccountNumber(account : Account) : String {
    if (account.AccountNumber == null) {
      return BCUtils.generateRandomID(account, 10);
    } else {
      return account.AccountNumber;
    }
  }

  public override function generateDisbursementNumber(disbursement : Disbursement) : String {
    return BCUtils.generateRandomID(disbursement, 10);
  }

  public override function generateInvoiceNumber(invoice : Invoice) : String {
    return BCUtils.generateRandomID(invoice, 10);
  }

  public override function generateStatementNumber(statement : ProducerStatement) : String {
    return BCUtils.generateRandomID(statement, 10);
  }

  public override function generateTransactionNumber(transaction : Transaction) : String {
    return BCUtils.generateRandomID(transaction, 10);
  }

  public override function generateTroubleTicketNumber(troubleTicket : TroubleTicket) : String {
    return BCUtils.generateRandomID(troubleTicket, 10);
  }

  public override function generateCollateralRequirementNumber(requirement : CollateralRequirement) : String {
    return BCUtils.generateRandomID(requirement, 10);
  }
}