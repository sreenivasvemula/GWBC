package libraries

uses gw.pl.currency.MonetaryAmount

uses java.math.BigDecimal
uses java.math.RoundingMode

@Export
enhancement ItemEventExt : ItemEvent {
  
  property get DisplayString() : String {
    var display = this.EventType.DisplayName
    var eventType = this.EventType
    if (eventType == ItemEventType.TC_ASSIGNED) {
      var sourcePayer = this.FromInvoice.Payer
      var sourcePayerType = sourcePayer typeis Account ? Account.Type.RelativeName : Producer.Type.RelativeName
      var targetPayer = this.ToInvoice.Payer
      var targetPayerType = targetPayer typeis Account ? Account.Type.RelativeName : Producer.Type.RelativeName
      display = displaykey.Java.ItemEvent.Assigned(sourcePayerType,
              sourcePayer,
              targetPayerType, 
              targetPayer)
    } else if (eventType == ItemEventType.TC_MOVED) {
      if (this.FromInvoice == null) {
        display = displaykey.Java.ItemEvent.Moved(this.FromInvoice, this.ToInvoice);
      } else {
        display = displaykey.Java.ItemEvent.MovedRefactor(this.ToInvoice);
      }
    } else if (eventType == ItemEventType.TC_POINTINTIME) {
      display = displaykey.Java.ItemEvent.PointInTime(this.FromPolicyCommission.ProducerCode, this.ToPolicyCommission.ProducerCode)
    } else if (eventType == ItemEventType.TC_RETROACTIVE) {
      display = displaykey.Java.ItemEvent.Retroactive(this.FromPolicyCommission.ProducerCode, this.ToPolicyCommission.ProducerCode)
    } else if (eventType == ItemEventType.TC_PAYMENTMOVEDFROM) {
      var originalInvoiceItem = this.InvoiceItem.InvoiceItemForWhichThisIsTheOnset
      var transaction = this.Transaction as ChargePaidFromUnapplied
      var paymentAmount = transaction.PaymentItem.getGrossAmountToApply();
      var invoice = originalInvoiceItem.Invoice
      var payer = invoice.Payer
      var payerType = payer typeis Account ? Account.Type.RelativeName : Producer.Type.RelativeName

      display = displaykey.Java.ItemEvent.PaymentMovedFrom(
              paymentAmount.render(),
              originalInvoiceItem.getAmount().render(),
              invoice,
              payerType,
              payer)
    } else if (eventType == ItemEventType.TC_PAYMENTMOVEDTO) {
      var onsetInvoiceItem = this.InvoiceItem.OnsetItem
      var transaction = this.Transaction as ChargePaidFromUnapplied
      var paymentAmount = transaction.PaymentItem.GrossAmountToApply
      var invoice = onsetInvoiceItem.Invoice
      var payer = invoice.Payer
      var payerType = payer typeis Account ? Account.Type.RelativeName : Producer.Type.RelativeName

      display = displaykey.Java.ItemEvent.PaymentMovedTo(
              paymentAmount.render(),
              onsetInvoiceItem.getAmount().render(),
              invoice,
              payerType,
              payer);
    } else if (eventType == ItemEventType.TC_PAYMENT) {
      var transaction = this.Transaction as ChargePaidFromUnapplied
      if (transaction.PaymentItem typeis AgencyPaymentItem) {
        display = displaykey.Java.ItemEvent.AgencyBillPayment
      } else if (transaction.PaymentItem typeis DirectBillPaymentItem) {
        display = displaykey.Java.ItemEvent.DirectBillPayment
      }
    } else if (eventType == ItemEventType.TC_EARNED) {
      if (!this.Transaction.isReversal()) {
        display = displaykey.Java.ItemEvent.CommissionEarned(this.PolicyCommission.ProducerCode, (this.Transaction as ReserveCmsnEarned).PayableCriteria)
      } else {
        display = displaykey.Java.ItemEvent.CommissionEarnedReversed(this.PolicyCommission.ProducerCode)
      }
    } else if (eventType == ItemEventType.TC_COMMISSIONMOVEDTO or eventType == ItemEventType.TC_COMMISSIONMOVEDFROM) {
      if (this.Transaction typeis ReserveCmsnEarned) {
        display = displaykey.Java.ItemEvent.CommissionEarningMoved
      } else  if (this.Transaction typeis PolicyCmsnPayable) {
        display =  displaykey.Java.ItemEvent.CommissionPaymentMoved
      }
    } else if (eventType == ItemEventType.TC_CMSNRESERVED) {
        display = displaykey.Java.ItemEvent.CommissionReserved(this.PolicyCommission.ProducerCode, this.PolicyCommission.Role.DisplayName)
    } else if (eventType == ItemEventType.TC_CMSNREDISTRIBUTED) {
        display = displaykey.Java.ItemEvent.CommissionRedistributed(this.PolicyCommission.ProducerCode, this.PolicyCommission.Role.DisplayName)
    } else if (eventType == ItemEventType.TC_RATECHANGE) {
        display = displaykey.Java.ItemEvent.CommissionRateChange(this.PolicyCommission.ProducerCode)
    } else if (eventType == ItemEventType.TC_CMSNREVERSED) {
        display = displaykey.Java.ItemEvent.CommissionReversed(this.PolicyCommission.ProducerCode)
    } else if (eventType == ItemEventType.TC_CMSNWRITEOFF) {
        display = displaykey.Java.ItemEvent.CommissionWrittenOff(this.PolicyCommission.ProducerCode)
    } else if (eventType == ItemEventType.TC_CMSNWRITEOFFMOVEDFROM) {
        var fromInvoice = this.FromInvoice
        var fromInvoicePayer = fromInvoice.Payer
        var fromInvoicePayerType = typeof fromInvoicePayer == Account ? displaykey.Java.ItemEvent.AccountPayerType : displaykey.Java.ItemEvent.ProducerPayerType
        display = displaykey.Java.ItemEvent.CommissionWriteoffMovedFrom(fromInvoice, fromInvoicePayerType, fromInvoicePayer)
    } else if (eventType == ItemEventType.TC_CMSNWRITEOFFMOVEDTO) {
        var toInvoice = this.ToInvoice
        var toInvoicePayer = toInvoice.Payer
        var toInvoicePayerType = typeof toInvoicePayer == Account ? displaykey.Java.ItemEvent.AccountPayerType : displaykey.Java.ItemEvent.ProducerPayerType
        display = displaykey.Java.ItemEvent.CommissionWriteoffMovedTo(toInvoice, toInvoicePayerType, toInvoicePayer)
    } else if (eventType == ItemEventType.TC_CMSNPAYMENT) {
        display = displaykey.Java.ItemEvent.CommissionPayment(this.PolicyCommission.ProducerCode)
    }       
    return display
  }
   
  property get CommissionWriteoff() : MonetaryAmount{
    var writeoffAmount : MonetaryAmount
    var eventType = this.EventType    
    if (eventType == ItemEventType.TC_CMSNWRITEOFF or eventType == ItemEventType.TC_CMSNWRITEOFFMOVEDFROM
        or eventType == ItemEventType.TC_CMSNWRITEOFFMOVEDTO) {
      writeoffAmount = this.CmsnReserveChanged.negate()
    }
    return writeoffAmount 
  }
  
  property get Payable() : MonetaryAmount{
    var payableAmount : MonetaryAmount
    var eventType = this.EventType
    if (eventType == ItemEventType.TC_EARNED) {
      payableAmount = this.CmsnReserveChanged.negate()
    } else if (eventType == ItemEventType.TC_CMSNPAYMENT) {
      payableAmount = this.Transaction.Amount.negate()
    } else if (eventType == ItemEventType.TC_COMMISSIONMOVEDTO) {
      if (this.Transaction typeis ReserveCmsnEarned) {
        payableAmount = this.CmsnReserveChanged.negate()
      } else  if (this.Transaction typeis PolicyCmsnPayable) {
        payableAmount = this.Transaction.Amount
      }
    } else if (eventType == ItemEventType.TC_COMMISSIONMOVEDFROM) {
      if (this.Transaction typeis ReserveCmsnEarned) {
        payableAmount = this.CmsnReserveChanged.negate()
      } else  if (this.Transaction typeis PolicyCmsnPayable) {
        payableAmount = this.Transaction.Amount.negate()
      }
    }
    return payableAmount 
  }
   
  property get Paid() : MonetaryAmount{
    var paidAmount : MonetaryAmount
    var eventType = this.EventType
    if (this.Transaction typeis PolicyCmsnPayable) {
      if (eventType == ItemEventType.TC_CMSNPAYMENT) {
        paidAmount = this.Transaction.Amount
      } else if (eventType == ItemEventType.TC_COMMISSIONMOVEDTO) {
        paidAmount = this.Transaction.Amount.negate()      
      } else if (eventType == ItemEventType.TC_COMMISSIONMOVEDFROM) {
        paidAmount = this.Transaction.Amount            
      }
    } else if ((eventType == ItemEventType.TC_PAYMENT or eventType == ItemEventType.TC_PAYMENTMOVEDTO
        or eventType == ItemEventType.TC_PAYMENTMOVEDFROM ) and this.CmsnReserveChanged != null) {
      paidAmount = this.CmsnReserveChanged.negate()        
    } else if (eventType == ItemEventType.TC_PAYMENTREVERSED) {
        var transaction = this.Transaction as ChargePaidFromUnapplied
        if (transaction.PaymentItem typeis AgencyPaymentItem) {
          paidAmount = transaction.PaymentItem.CommissionAmountToApply.negate()
        }
    }   
    return paidAmount 
  }  
  
  property get RelatedAccount() : Account {
    var invoiceItem = this.InvoiceItem
    var invoice = invoiceItem.Invoice
    if (typeof invoice == AccountInvoice) {
      var accountInvoice = invoice as AccountInvoice
      return accountInvoice.Account
    } else {
      return null
    }
  }
  
  property get RelatedCharge() : Charge {
    return this.InvoiceItem.Charge
  }

  property get RelatedPolicyPeriod() : PolicyPeriod {
    var polPeriod = RelatedCharge.PolicyPeriod
    return polPeriod
  }
  
  property get RelatedPolicyRole() : PolicyRole {
    var transaction = this.Transaction
    if (ProducerTransaction.Type.isAssignableFrom(typeof transaction)) {
      var producerTransaction = transaction as ProducerTransaction
      var policyCommission = producerTransaction.PolicyCommission
      return policyCommission.Role
    } else {
      return null
    }
  }
  
  property get Basis() : MonetaryAmount {
    //todo:  this needs to check if the criteria is "pay on paid" and if so, it needs to get the payment amount
    // (possibly from the related commission reserve transaction)
    var transaction = this.Transaction
    if (ProducerTransaction.Type.isAssignableFrom(typeof transaction)) {
      var producerTransaction = transaction as ProducerTransaction
      var criteria = producerTransaction.PolicyCommission.CommissionSubPlan.PayableCriteria
      if (criteria == PayableCriteria.TC_PAYMENTRECEIVED && ReserveCmsnEarned.Type.isAssignableFrom(typeof transaction)) {
        var rsvCmsnEarned = transaction as ReserveCmsnEarned
        var distItem = rsvCmsnEarned.DistItem
        if (distItem != null) {
          return distItem.GrossAmountToApply
        }
      }
    }
    return this.InvoiceItem.Amount
  }
  
  property get CommissionAmount() : MonetaryAmount {
    var transaction = this.Transaction
    if (transaction typeis ProducerTransaction) {
      return transaction.Amount
    } else {
      return 0bd.ofCurrency(this.Currency)
    }
  }
  
  property get CommissionPercentage() : BigDecimal {
    return CommissionAmount.multiply(BigDecimal.valueOf(100)).divide(Basis, RoundingMode.HALF_UP)
  }
  
  property get EarningType() : String {
    var transaction = this.Transaction
    if (transaction typeis ReserveCmsnEarned) {
      return transaction.PayableCriteria.DisplayName
    } else {
      return this.EventType.DisplayName
    }
  }
  
  property get ItemType() : String {
    var invoiceItem = this.InvoiceItem
    var type = invoiceItem.Type
    if (type == InvoiceItemType.TC_INSTALLMENT) {
      return type.DisplayName + " " + invoiceItem.InstallmentNumber
    } else {
      return type.DisplayName
    }
  }
}
  