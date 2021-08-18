
package gw.command

uses com.guidewire.bc.domain.invoice.impl.StatementBilledWorkQueue
uses com.guidewire.pl.quickjump.Argument
uses com.guidewire.pl.quickjump.BaseCommand
uses com.guidewire.pl.system.bundle.EntityBundleImpl

uses java.lang.Integer

@Export
class PartialBatch extends BaseCommand {

  construct() {
    super()
  }

  @Argument("limit")
  function statementBilled() {
    var queue = new StatementBilledWorkQueue()
    var worker = queue.createWorker()
    var creator = queue.WorkItemCreator
    var targets = queue.getFinder(null).findTargets()
    var limit = Integer.parseInt(getArgumentAsString("limit"))
    var count = 0
    while(targets.hasNext() and count < limit) {
      var target = targets.next()
      var workItem = creator.createWorkItem(target , null, new EntityBundleImpl())
      worker.processWorkItem(workItem)
      count++
    }
  }
}
