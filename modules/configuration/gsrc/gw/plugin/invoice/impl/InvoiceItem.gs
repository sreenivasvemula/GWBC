package gw.plugin.invoice.impl
uses gw.plugin.invoice.IInvoiceItem
uses gw.pl.currency.MonetaryAmount
uses gw.api.domain.invoice.InvoiceItemExceptionEvent
uses java.lang.Iterable
uses java.util.Set
uses java.util.HashSet
uses gw.api.domain.invoice.InvoiceItemExceptionContext

@Export
class InvoiceItem implements IInvoiceItem {
  private enum ExceptionStatusEnum {
    MarkException,
    ClearException,
    DoNothing
  }

  /**
   * This plugin called is used on the last step of the AgencyDistributionWizard (AgencyDistributionWizard_DispositionsScreen).
   * It will be called with all distribution items on the distribution the wizard is currently in the process of making
   * that don't have an explicit {@link gw.bc.producer.agencybill.typekey.DistItemDisposition}.  Note,
   * since the wizard is the process of making the distribution, these distribution items will not yet be executed.
   *
   * The plugin should return a subset of those distribution items that were passed in, which as a result of executing
   * the distribution items, will result in the invoice items they are targeting, becoming exceptions.  This logic
   * should line up with the same logic as used in {@link #updateExceptionInfo(gw.bc.payment.entity.BaseDistItem, gw.api.domain.invoice.InvoiceItemExceptionEvent)},
   * though be aware, that as the dist items are not executed yet, the invoice items values won't yet have changed to
   * reflect the passed in dist items.
   *
   * This set of items will be shown to the user on the last screen of the wizard along with all of the distribution
   * items that have an explicit disposition, in order for the user to be aware of which distribution items are about
   * to affect exception status.
   *
   * @param agencyDistributionItems The set of distribution items that are currently being created by the
   * AgencyDistributionWizard that do not have explicit dispositions already
   * @return The subset of the passed in items which, when executed, will result in exceptions
   */
  override function agencyDistributionItemsAboutToCauseExceptions(agencyDistributionItems : Iterable<BaseDistItem>) : Set<BaseDistItem> {
    var aboutToCauseExceptions = new HashSet<BaseDistItem>()
    for (var distItem in agencyDistributionItems) {
      if (new UnexecutedAgencyDistItemBridge(distItem).ExceptionStatus == ExceptionStatusEnum.MarkException) {
        aboutToCauseExceptions.add(distItem)  
      }
    }
    return aboutToCauseExceptions
  }

  /**
   * Hook to allow the user to specify whether or not an invoice item that has recently had a dist item executed
   * or reversed against it, should have its exception info changed.
   * @param distItem The dist item that has either been executed or reversed, causing this plugin method to be called
   * @param context Context of the action on the dist item that caused this plugin method to be called
   * Possible values for context.Event are: {@link InvoiceItemExceptionEvent#Execute}, {@link InvoiceItemExceptionEvent#Reverse},
   * {@link InvoiceItemExceptionEvent#PromiseActivate}, and {@link InvoiceItemExceptionEvent#PromiseDeactivate}
   */
  override function updateExceptionInfo(distItem : BaseDistItem, context : InvoiceItemExceptionContext) {
    var invoiceItem = distItem.InvoiceItem
    new InvoiceItemPromiseBridge(invoiceItem, context).updateItemExceptionStatus()
    new InvoiceItemPaymentBridge(invoiceItem, context).updateItemExceptionStatus()
  }
  
  /**
   * Hook to allow the user to specify whether or not an invoice item that has recently had a write-off executed
   * or reversed against it, should have its exception info changed.
   * @param writeOff The write-off that has either been executed or reversed, causing this plugin method to be called
   * @param invoiceItem The invoice item targeted by the recently changed write-off
   * @param context Context for the action on the write-off that caused this plugin method to be called
   * Possible values of context.Event are: {@link InvoiceItemExceptionEvent#Execute}, and {@link InvoiceItemExceptionEvent#Reverse}
   */
  override function updateExceptionInfo(writeoff : Writeoff, invoiceItem : InvoiceItem, context : InvoiceItemExceptionContext) {
    new InvoiceItemPromiseBridge(invoiceItem, context).updateItemExceptionStatus()
    new InvoiceItemPaymentBridge(invoiceItem, context).updateItemExceptionStatus()
  }
  
    /**
   * Hook to allow the user to specify whether or not an invoice item that has had its primary active commission or
   * gross amount changed should have its exception info changed.
   *
   * @param oldAmount   The amount before the change took place
   * @param invoiceItem the invoice item that has had one of its amounts changed
   * @param context       Context of operation; context.Event specifies whether the amount that was changed was primary active
   * commission, or gross. Possible values of context.Event are: {@link InvoiceItemExceptionEvent#CommissionChange}, and
   * {@link InvoiceItemExceptionEvent#GrossChange}
   */
  override function updateExceptionInfo(oldCommissionAmount : MonetaryAmount, invoiceItem : InvoiceItem, context : InvoiceItemExceptionContext) {
    new InvoiceItemPaymentBridge(invoiceItem, context).updateItemExceptionStatus()
    new InvoiceItemPromiseBridge(invoiceItem, context).updateItemExceptionStatus()
  }  
  
  /**
   * Class to connect the logic of how an about to be executed dist item and an
   * invoice item that already had all actions executed against it, should both
   * consider exception status in a similar fashion.
   */
  abstract class ItemBridge {  
    abstract protected property get HasActiveItemsForException() : boolean
    abstract protected property get Settled() : boolean
    abstract protected property get ShouldClearException() : boolean
    abstract protected property get ShouldMarkException() : boolean
    
    property get ExceptionStatus() : ExceptionStatusEnum {
      if ((!HasActiveItemsForException  || Settled) && ShouldClearException) {
        return ExceptionStatusEnum.ClearException
      } else if (ShouldMarkException) {
        return ExceptionStatusEnum.MarkException
      }
      return ExceptionStatusEnum.DoNothing
  }
  }
  
  /**
   * Class to calulate, and possibly update invoice item's payment exception status.
   * This should be used after all the actions that might affect the invoice item's
   * exception status have already taken place.
   * Use UnexecutedAgencyDistItemBridge if you wish to determine how an about to be 
   * executed dist item will affect the exception status of the invoice item it
   * targets.
   */
  class InvoiceItemPaymentBridge extends ItemBridge {
    private var _invoiceItem : InvoiceItem
    private var _event : InvoiceItemExceptionEvent
    
    construct (invoiceItem : InvoiceItem, context : InvoiceItemExceptionContext) {
      _invoiceItem = invoiceItem
      _event = context.Event
    }
    
    override protected property get HasActiveItemsForException() : boolean {
    // BC-8897:  This method incorrectly considers "active" to include saved (non-executed) items
      return _invoiceItem.PaymentItems.whereTypeIs(AgencyPaymentItem)
            .hasMatch(\ paymentItem -> !paymentItem.Reversed)
  }
  
    override protected property get Settled() : boolean {
      return _invoiceItem.Settled
    }

    override protected property get ShouldClearException() : boolean {
      return !_invoiceItem.LockedAsPaymentException  
    }

    override protected property get ShouldMarkException() : boolean {
      return _event == InvoiceItemExceptionEvent.CommissionChange
             || _event == InvoiceItemExceptionEvent.GrossChange
             || !_invoiceItem.LockedAsNotPaymentException
    }
    
    public function updateItemExceptionStatus() {
      switch (ExceptionStatus) {
        case ExceptionStatusEnum.MarkException:
            _invoiceItem.markAsPaymentException()
            break
        case ExceptionStatusEnum.ClearException:
            _invoiceItem.clearPaymentException()
      }
    }
  }
  
  /**
   * Class to calculate, and possibly update invoice item's promise exception status.
   * This should be used after all the actions that might affect the invoice item's
   * exception status have already taken place.
   * Use UnexecutedAgencyDistItemBridge if you wish to determine how an about to be 
   * executed dist item will affect the exception status of the invoice item it
   * targets.
   */
  class InvoiceItemPromiseBridge extends ItemBridge {
    private var _invoiceItem : InvoiceItem
    private var _event : InvoiceItemExceptionEvent
    
    construct (invoiceItem : InvoiceItem, context : InvoiceItemExceptionContext) {
      _invoiceItem = invoiceItem
      _event = context.Event
    }
    
    override property get HasActiveItemsForException() : boolean {
      return _invoiceItem.ActivePromiseItems.HasElements
    }

    /**
     * Invoice Items are considered promise exceptions if the total of 
     * Promised Gross + Paid Gross + Written Off Gross == Gross Amount of the Invoice Item
     * and
     * Promised Commission + Paid Primary Commission + Earned Primary Commission + Written Off Primary Commission == Primary Commission Amount
     */
    override property get Settled() : boolean {
      return _invoiceItem.SettledIncludingPromise
    }

    override property get ShouldClearException() : boolean {
      return !_invoiceItem.LockedAsPromiseException  
    }

    override property get ShouldMarkException() : boolean {
      return _event == InvoiceItemExceptionEvent.CommissionChange
           || _event == InvoiceItemExceptionEvent.GrossChange
           || !_invoiceItem.LockedAsNotPromiseException
    }
    
    public function updateItemExceptionStatus() {
      switch (ExceptionStatus) {
        case ExceptionStatusEnum.MarkException:
            _invoiceItem.markAsPromiseException()
            break
        case ExceptionStatusEnum.ClearException:
            _invoiceItem.clearPromiseException()
      }
    }
  }
  
  /**
   * Class to handle answering whether or not a dist item that we are about to execute, will result in an exception.
   * The out of the box logic does not have any difference between calculating mismatches on a promise dist item versus
   * a payment dist item.
   */
  class UnexecutedAgencyDistItemBridge extends ItemBridge {
    private var _agencyDistItem : BaseDistItem
    
    construct(agencyDistItem : BaseDistItem) { 
      _agencyDistItem = agencyDistItem
    }
    
    override property get HasActiveItemsForException() : boolean {
      return true // by the nature of the fact that this dist item exists and is about to be executed, there are active items to make eligible for exception
    }

    override property get Settled() : boolean {
      return _agencyDistItem.NetAmountOwed == _agencyDistItem.NetAmountToApply
    }

    override property get ShouldClearException() : boolean {
      // locks play no part in determining whether or not an agency dist item we are about to execute should be 
      // considered an exception, since we automatically clear the lock when we execute agency dist items
      return true 
    }

    override property get ShouldMarkException() : boolean {
      // locks play no part in determining whether or not an agency dist item we are about to execute should be 
      // considered an exception, since we automatically clear the lock when we execute agency dist items
      return true
    }
  }

}
