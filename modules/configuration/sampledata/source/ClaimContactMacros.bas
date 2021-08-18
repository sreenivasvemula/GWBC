Attribute VB_Name = "ClaimContactMacros"
Option Explicit

Dim ccRowMap As Collection
Const source = "demo_sample"
Const DRIVER_ROLE = "driver"
Const MAINCONTACT_ROLE = "maincontact"
Const REPORTER_ROLE = "reporter"
Const CLAIMANT_ROLE = "claimant"
Const ALTCONTACT_ROLE = "altcontact"
Const DOCTOR_ROLE = "doctor"
Const HOSPITAL_ROLE = "hospital"


' Moves contact-specific fields out of the Claim table to the ClaimContact join table.
Sub MakeClaimContacts()
    Dim claimTable As TableInfo
    Dim ccTable As TableInfo
    Dim bidTable As TableInfo
    Dim vdTable As TableInfo
    Dim wcidTable As TableInfo
    Dim ppdTable As TableInfo
    Dim pdTable As TableInfo
    Dim loudTable As TableInfo
    Dim generateJoinTables As Boolean
    
    Let generateJoinTables = True
    Set ccRowMap = New Collection
    
    Set claimTable = New TableInfo
    Call claimTable.Init(Sheet3, 763, 1681)
    Set bidTable = New TableInfo
    Call bidTable.Init(Sheet3, 2379, 2382)
    Set vdTable = New TableInfo
    Call vdTable.Init(Sheet3, 1683, 2377)
    Set wcidTable = New TableInfo
    Call wcidTable.Init(Sheet3, 2384, 2575)
    Set ppdTable = New TableInfo
    Call ppdTable.Init(Sheet3, 2577, 2578)
    Set pdTable = New TableInfo
    Call pdTable.Init(Sheet3, 2580, 2791)
    Set loudTable = New TableInfo
    Call loudTable.Init(Sheet3, 2793, 2793)
    
    Set ccTable = New TableInfo
    Call ccTable.InitOwnSheet(ClaimContactSheet)
    
    If generateJoinTables Then
        Call MoveContact(claimTable, ccTable, False, DRIVER_ROLE, "driver")
        Call MoveContact(claimTable, ccTable, False, MAINCONTACT_ROLE, "maincontact")
        Call MoveContact(claimTable, ccTable, False, REPORTER_ROLE, "reportedby")
        'Call MoveContact(ClaimTable, ccTable, False, CLAIMANT_ROLE, "claimant")
        
        Call MoveContact(vdTable, ccTable, True, CLAIMANT_ROLE, "claimant")
        Call MoveContact(vdTable, ccTable, True, DRIVER_ROLE, "driver")
        
        Call MoveContact(bidTable, ccTable, True, CLAIMANT_ROLE, "claimant")
        Call MoveContact(bidTable, ccTable, True, ALTCONTACT_ROLE, "altcontact")
        Call MoveContact(bidTable, ccTable, True, DOCTOR_ROLE, "primarydoctor")
        
        Call MoveContact(wcidTable, ccTable, True, CLAIMANT_ROLE, "claimant")
        'Call MoveContact(wcidTable, ccTable, True, ALTCONTACT_ROLE, "wcaltcontact")
        Call MoveContact(wcidTable, ccTable, True, DOCTOR_ROLE, "wcprimarydoctor")
        Call MoveContact(wcidTable, ccTable, True, HOSPITAL_ROLE, "wchospital")
        
        Call MoveContact(ppdTable, ccTable, True, CLAIMANT_ROLE, "claimant")
        
        Call MoveContact(pdTable, ccTable, True, CLAIMANT_ROLE, "claimant")
        
        Call MoveContact(loudTable, ccTable, True, CLAIMANT_ROLE, "claimant")
        
        Call AddRolesToClaimContacts(ccTable)
    End If
    
    ' remove the columns
    Call claimTable.RemoveColumn("driver")
    Call claimTable.RemoveColumn("maincontact")
    Call claimTable.RemoveColumn("reportedby")
    
    Call vdTable.RemoveColumn("claimant")
    Call vdTable.RemoveColumn("driver")
    
    Call bidTable.RemoveColumn("claimant")
    Call bidTable.RemoveColumn("altcontact")
    Call bidTable.RemoveColumn("primarydoctor")
    
    Call wcidTable.RemoveColumn("claimant")
    Call wcidTable.RemoveColumn("wcprimarydoctor")
    Call wcidTable.RemoveColumn("wchospital")
    
    Call ppdTable.RemoveColumn("claimant")
    
    Call pdTable.RemoveColumn("claimant")
    
    Call loudTable.RemoveColumn("claimant")
    
End Sub

' Clears the ClaimContact table. After calling this, it will likely also be necessary
' to paste the original data in sample_claims over, as it is likely that the former
' columns required to rebuild the join table will have been removed.
Sub Reset()
    Dim ccColumns(1 To 8) As String
    
    Let ccColumns(1) = "type"
    Let ccColumns(2) = "data-set"
    Let ccColumns(3) = "entityid"
    Let ccColumns(4) = "entitysource"
    Let ccColumns(5) = "claim"
    Let ccColumns(6) = "contact"
    Let ccColumns(7) = "comments"
    Let ccColumns(8) = "roles"
    
    Call ResetSheet(ClaimContactSheet, ccColumns)
    
End Sub

Private Sub ResetSheet(ByVal sheet As Worksheet, ByVal columns)
    Call sheet.Cells.Clear
    ' Reset the column headings
    For i = LBound(columns) To UBound(columns)
        Let sheet.Cells(1, i) = columns(i)
    Next
    
End Sub

Private Sub MoveContact( _
    ByVal mainTable As TableInfo, ByVal ccTable As TableInfo, _
    ByVal exposure As Boolean, ByVal role As String, ByVal contactColumnName As String)
    
    Dim cci As ClaimContactInfo
    Dim contactColumn As Integer
    Dim idColumn As Integer
    Dim dataSetColumn As Integer
    Dim claimColumn As Integer
    Dim i As Integer
    Dim contactid As String
    Dim claimid As String
    Dim exposureID As String
    Dim dataSet As String
    
    Let contactColumn = mainTable.GetColumn(contactColumnName)
    Let idColumn = mainTable.GetColumn("entityid")
    Let dataSetColumn = mainTable.GetColumn("data-set")
    If exposure Then
        Let claimColumn = mainTable.GetColumn("claim")
    End If
    
    For i = mainTable.startRow + 1 To mainTable.EndRow
        Let contactid = mainTable.sheet.Cells(i, contactColumn)
        If contactid <> "" Then
            If exposure Then
                Let claimid = mainTable.sheet.Cells(i, claimColumn)
                Let exposureID = MakeForeignKey(mainTable.sheet.Cells(i, idColumn))
            Else
                Let claimid = MakeForeignKey(mainTable.sheet.Cells(i, idColumn))
                Let exposureID = ""
            End If
            Let dataSet = mainTable.sheet.Cells(i, dataSetColumn)
            Set cci = FindContact(ccTable, claimid, contactid)
            If cci Is Nothing Then
                Set cci = AddContact(ccTable, dataSet, claimid, contactid)
            End If
            Call AddContactRole(cci, exposureID, role)
        End If
    Next
    
End Sub

Private Function FindContact(ByVal ccTable As TableInfo, ByVal claimid As String, ByVal contactid As String) As ClaimContactInfo
    Dim cci As ClaimContactInfo
    
    On Error Resume Next
    Set cci = ccRowMap.Item(claimid & contactid)
    Set FindContact = cci
End Function

Private Function MakeForeignKey(ByVal id)
    Let MakeForeignKey = id & "|" & source
End Function

Private Function AddContact(ByVal ccTable As TableInfo, ByVal dataSet, ByVal claimid, ByVal contactid) As ClaimContactInfo
    Dim iRow As Integer
    Dim cci As ClaimContactInfo
    Let iRow = ccTable.AddRow
    Let ccTable.sheet.Cells(iRow, ccTable.GetColumn("type")) = "ClaimContact"
    Let ccTable.sheet.Cells(iRow, ccTable.GetColumn("data-set")) = dataSet
    Let ccTable.sheet.Cells(iRow, ccTable.GetColumn("entityid")) = GenerateIdFromRow(iRow)
    Let ccTable.sheet.Cells(iRow, ccTable.GetColumn("entitysource")) = source
    Let ccTable.sheet.Cells(iRow, ccTable.GetColumn("claim")) = claimid
    Let ccTable.sheet.Cells(iRow, ccTable.GetColumn("contact")) = contactid
    Set cci = New ClaimContactInfo
    Let cci.row = iRow
    Call ccRowMap.Add(cci, claimid & contactid)
    Set AddContact = cci
End Function

Private Sub AddContactRole(ByVal cci As ClaimContactInfo, ByVal exposureID, ByVal role)
    Dim ccr As String
    
    Let ccr = MakeClaimContactRoleString(exposureID, role)
    Call cci.roles.Add(ccr)
End Sub


Private Function GenerateIdFromRow(ByVal row As Integer)
    Let GenerateIdFromRow = row - 1
End Function

Private Function MakeClaimContactRoleString(ByVal exposureID As String, ByVal role) As String
    Dim exposureString As String
    
    If exposureID = "" Then
        Let exposureString = "|"
    Else
        Let exposureString = exposureID
    End If
    
    Let MakeClaimContactRoleString = exposureString & "|" & role & "|true"
        
End Function

Private Sub AddRolesToClaimContacts(ByVal ccTable As TableInfo)
    Dim cci As ClaimContactInfo
    
    For Each cci In ccRowMap
        If cci.roles.Count > 0 Then
            Let ccTable.sheet.Cells(cci.row, ccTable.GetColumn("roles")) = MakeRolesString(cci)
        End If
    Next
End Sub

Private Function MakeRolesString(ByVal cci As ClaimContactInfo) As String
    Dim rolesString As String
    Dim i As Integer
    
    Let rolesString = "ClaimContactRole|exposure["
    For i = 1 To cci.roles.Count
        If i > 1 Then
            Let rolesString = rolesString & ","
        End If
        Let rolesString = rolesString & cci.roles.Item(i)
    Next
    Let rolesString = rolesString & "]"
    Let MakeRolesString = rolesString
End Function
