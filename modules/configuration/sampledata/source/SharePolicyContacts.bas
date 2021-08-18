Attribute VB_Name = "SharePolicyContacts"
Option Explicit

Sub SharePolicyContacts()
    Dim i As Integer
    Dim policyTable As TableInfo
    Dim policyId As String
    Dim role As String
    Dim oldId As String
    Dim newId As String
    Dim policyContacts As Worksheet
    Dim policyRow As Integer
    
    Set policyTable = New TableInfo
    Call policyTable.InitWithEntityName(Sheet8, "Policy")
    Set policyContacts = Sheet15
    
    For i = 1 To 19
        Let policyId = policyContacts.Cells(i, 1)
        Let role = policyContacts.Cells(i, 2)
        Let oldId = policyContacts.Cells(i, 3)
        Let newId = policyContacts.Cells(i, 4)
        
        Let policyRow = policyTable.GetRowForId(PublicIdToForeignKey(policyId))
        If policyRow = 0 Then
            Call MsgBox("Could not find Policy with ID: " & policyId)
        Else
            If role <> "coveredparty" Then
                Call policyTable.SetValue(policyRow, role, PublicIdToForeignKey(newId))
            End If
        End If
        
    Next i

End Sub
Sub SetVendors()
    Dim personTable As TableInfo
    Dim companyTable As TableInfo
    
    Set personTable = New TableInfo
    Call personTable.InitWithEntityName(Sheet3, "Person")
    Call SetVendorOnContactTable(personTable)
    
    Set companyTable = New TableInfo
    Call companyTable.InitWithEntityName(Sheet3, "Company")
    Call SetVendorOnContactTable(companyTable)
    
    
End Sub

Private Sub SetVendorOnContactTable(ByVal contactTable As TableInfo)
    Dim i As Integer
    
    For i = contactTable.startRow + 1 To contactTable.EndRow
        If contactTable.GetValue(i, "vendortype") <> "" Then
            Call contactTable.SetValue(i, "contactclass", "vendor")
        End If
    Next i
End Sub
