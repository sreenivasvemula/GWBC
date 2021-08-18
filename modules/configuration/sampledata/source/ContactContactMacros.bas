Attribute VB_Name = "ContactContactMacros"
Option Explicit


Public Sub ContactContact()
    Call ConvertContactContacts(Sheet2)
    Call ConvertContactContacts(Sheet3)
End Sub



Private Sub ConvertContactContacts(ByVal aSheet As Worksheet)
    Call ConvertPersonContacts(aSheet)
    Call ConvertCompanyContacts(aSheet)
End Sub



Private Sub ConvertPersonContacts(ByVal aSheet As Worksheet)
    Call ConvertContact(aSheet, "Person", "company", "PersonEmployer", "personemployers", "employer")
    'Call ConvertContact(aSheet, "Person", "guardian", "PersonGuardian", "personguardians", "guardian")
End Sub



Private Sub ConvertCompanyContacts(ByVal aSheet As Worksheet)
    Call ConvertContact(aSheet, "Company", "primarycontact", "CompanyPrimaryContact", "companyprimarycontacts", "primarycontact")
End Sub


Private Sub ConvertContact(ByVal aSheet As Worksheet, ByVal entityName As String, ByVal colName As String, ByVal arrayTableName As String, ByVal arrayFieldName, ByVal contactFieldName)
    Dim ti As TableInfo
    Dim col As Integer
    Dim i As Integer
    Dim fk As String
    
    Set ti = New TableInfo
    Call ti.InitWithEntityName(aSheet, entityName)
    Let col = ti.GetColumn(colName)
    Let aSheet.Cells(ti.startRow, col) = arrayFieldName
    For i = ti.startRow + 1 To ti.EndRow
        Let fk = aSheet.Cells(i, col)
        If fk <> "" Then
            Let aSheet.Cells(i, col) = ConvertForeignKey(fk, arrayTableName, contactFieldName)
        End If
    Next
End Sub


Private Function ConvertForeignKey(ByVal fk As String, ByVal arrayTableName As String, ByVal contactFieldName As String) As String
    Let ConvertForeignKey = arrayTableName & "|" & contactFieldName & "[" & fk & "]"
End Function
