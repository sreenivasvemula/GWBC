VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "ClaimContactInfo"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private iRow As Integer
Private colRoles As Collection


Private Sub Class_Initialize()
    Set colRoles = New Collection
End Sub



Public Property Get row() As Integer
    Let row = iRow
End Property

Public Property Let row(ByVal vNewValue As Integer)
    Let iRow = vNewValue
End Property

Public Property Get roles() As Collection
    Set roles = colRoles
End Property


