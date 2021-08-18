Attribute VB_Name = "DuplicatePolicyContacts"
Option Explicit

Sub DuplicatePolicyContacts()
    Dim allContacts As Map
    Dim policyTable As TableInfo
    Dim personTable As TableInfo
    Dim companyTable As TableInfo
    Dim userPersonTable As TableInfo
    Dim userCompanyTable As TableInfo
    
    Dim i As Integer
    Dim newRow As Integer
    
    
    Set allContacts = New Map
    Set policyTable = New TableInfo
    Call policyTable.InitWithEntityName(Sheet8, "Policy")
    Set personTable = New TableInfo
    Call personTable.InitWithEntityName(Sheet3, "Person")
    Set companyTable = New TableInfo
    Call companyTable.InitWithEntityName(Sheet3, "Company")
    Set userPersonTable = New TableInfo
    Call userPersonTable.InitWithEntityName(Sheet6, "Person")
    Set userCompanyTable = New TableInfo
    Call userCompanyTable.InitWithEntityName(Sheet6, "Company")
    Let newRow = 1
    
    For i = policyTable.startRow + 1 To policyTable.EndRow
        Call DuplicatePolicyContactsIfNecessary(policyTable, personTable, companyTable, userPersonTable, userCompanyTable, i, allContacts, newRow)
    Next i
    
    
End Sub

Public Sub TestMaps()
    Dim m As Map
    Dim val As Object
    
    Set m = New Map
    
    Set val = m.GetValue("a")
    If Not val Is Nothing Then
        MsgBox "Did not expect to find 'a', but got " & val
        Exit Sub
    End If
    
    Set val = m.PutValue("a", VariantToObject(1))
    If Not val Is Nothing Then
        MsgBox "Did not expect to find 'a', but got " & val
        Exit Sub
    End If
        
    Set val = m.PutValue("a", VariantToObject(2))
    If val.Value <> 1 Then
        MsgBox "Expected to find value 1 for 'a', but got " & val
        Exit Sub
    End If
    Set val = m.GetValue("a")
    If val.Value <> 2 Then
        MsgBox "Expected to find value 2 for 'a', but got " & val
        Exit Sub
    End If
    If Not m.ContainsKey("a") Then
        MsgBox "Expected ContainsKey to return true for 'a'"
        Exit Sub
    End If
    If m.ContainsKey("b") Then
        MsgBox "Expected ContainsKey to return false for 'b'"
        Exit Sub
    End If
        
    MsgBox "Success"
End Sub


Private Sub DuplicatePolicyContactsIfNecessary(ByVal policyTable As TableInfo, ByVal personTable As TableInfo, ByVal companyTable As TableInfo, ByVal userPersonTable As TableInfo, ByVal userCompanyTable As TableInfo, ByVal policyRow As Integer, ByVal allContacts As Map, ByRef newRow As Integer)
    Call DuplicatePolicyContactIfNecessary(policyTable, personTable, companyTable, userPersonTable, userCompanyTable, policyRow, allContacts, newRow, "insured")
    Call DuplicatePolicyContactIfNecessary(policyTable, personTable, companyTable, userPersonTable, userCompanyTable, policyRow, allContacts, newRow, "agent")
End Sub

Private Sub DuplicatePolicyContactIfNecessary(ByVal policyTable As TableInfo, ByVal personTable As TableInfo, ByVal companyTable As TableInfo, ByVal userPersonTable As TableInfo, ByVal userCompanyTable As TableInfo, ByVal policyRow As Integer, ByVal allContacts As Map, ByRef newRow As Integer, ByVal fkName As String)
    Dim dataSet As String
    Dim oldContactFk As String
    Dim oldContactRow As Integer
    Dim oldContactWorksheet As Worksheet
    Dim newContactWorksheet As Worksheet
    Dim newPublicId As String
    
    Set newContactWorksheet = Sheet14
    
    Let oldContactFk = policyTable.GetValue(policyRow, fkName)
    Let dataSet = policyTable.GetValue(policyRow, "data-set")
    If allContacts.ContainsKey(oldContactFk) Then
        ' Need to duplicate: find the old row in one of the four contact tables
        Set oldContactWorksheet = personTable.sheet
        Let oldContactRow = personTable.GetRowForId(oldContactFk)
        If oldContactRow = 0 Then
            Set oldContactWorksheet = companyTable.sheet
            Let oldContactRow = companyTable.GetRowForId(oldContactFk)
            If oldContactRow = 0 Then
                Set oldContactWorksheet = userPersonTable.sheet
                Let oldContactRow = userPersonTable.GetRowForId(oldContactFk)
                If oldContactRow = 0 Then
                    Set oldContactWorksheet = userCompanyTable.sheet
                    Let oldContactRow = userCompanyTable.GetRowForId(oldContactFk)
                End If
            End If
        End If
        ' Copy the row
        Call oldContactWorksheet.Rows(oldContactRow).Copy(newContactWorksheet.Rows(newRow))
        ' Assign a new publicId
        Let newPublicId = "demo_sample:" & (10000 + newRow)
        Let newContactWorksheet.Cells(newRow, 3) = newPublicId
        ' Set the data-set to referer's
        Let newContactWorksheet.Cells(newRow, 2) = dataSet
        ' Change the referer
        Call policyTable.SetValue(policyRow, fkName, PublicIdToForeignKey(newPublicId))
        Let newRow = newRow + 1
    Else
        Call allContacts.PutValue(oldContactFk, VariantToObject(""))
    End If
    
    
End Sub



