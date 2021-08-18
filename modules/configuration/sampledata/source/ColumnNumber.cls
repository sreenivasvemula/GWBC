VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "ColumnNumber"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private iColumn As Integer



Public Property Get Column() As Integer
    Let Column = iColumn
End Property

Public Property Let Column(ByVal vNewValue As Integer)
    Let iColumn = vNewValue
End Property
