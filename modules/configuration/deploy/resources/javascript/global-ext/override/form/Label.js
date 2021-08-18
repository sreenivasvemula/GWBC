Ext.define("Gw.override.form.Label", {
  override: 'Ext.form.Label',
  requires: ['Ext.XTemplate'],

  initComponent: function () {
    var me = this;

    if (me.labelClsExtra) {
        me.addCls(me.labelClsExtra);
    }
    me.callParent(arguments);
  }
});
