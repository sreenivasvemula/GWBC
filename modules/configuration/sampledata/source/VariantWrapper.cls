VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "VariantWrapper"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private mValue As Variant



Public Property Get Value() As Variant
    Let Value = mValue
End Property

Public Property Let Value(ByVal vNewValue As Variant)
    Let mValue = vNewValue
End Property
