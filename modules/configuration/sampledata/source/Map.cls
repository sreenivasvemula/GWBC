VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Map"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

' VB 6 Collection has some annoying characteristics. This class hides those behind a nice familiar
' interface a la java.util.Map.

Private items As Collection


Private Sub Class_Initialize()
    Set items = New Collection
End Sub


Public Function GetValue(ByVal key As Variant) As Object
    On Error GoTo NotFound
    Set GetValue = items.Item(key)
    Exit Function
NotFound:
    Set GetValue = Nothing
End Function

Public Function PutValue(ByVal key As Variant, ByVal newValue As Object) As Object
    Dim oldValue As Object
    
    Set oldValue = GetValue(key)
    If Not oldValue Is Nothing Then
        Call items.Remove(key)
    End If
    Call items.Add(newValue, key)
    Set PutValue = oldValue
End Function

Public Function ContainsKey(ByVal key As Variant) As Boolean
    Let ContainsKey = Not GetValue(key) Is Nothing
End Function


