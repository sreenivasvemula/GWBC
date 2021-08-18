Attribute VB_Name = "PolicyContactMacros"

Public Sub MakePolicyContacts()
    Dim policyTable As TableInfo
    Dim claimContactTable As TableInfo
    Dim claimTable As TableInfo

    Dim newClaimContactCount As Integer
    Dim newClaimContactRoleCount As Integer
    Dim i As Integer
    
    Set policyTable = New TableInfo
    Call policyTable.InitWithEntityName(Sheet8, "Policy")
    Set claimContactTable = New TableInfo
    Call claimContactTable.InitWithEntityName(Sheet10, "ClaimContact")
    Set claimTable = New TableInfo
    Call claimTable.InitWithEntityName(Sheet9, "Claim")
    Let newClaimContactCount = 0
    Let newClaimContactRoleCount = 0
    
    For i = policyTable.startRow + 1 To policyTable.EndRow
        Call ProcessPolicyContacts(policyTable, i, claimTable, claimContactTable, newClaimContactCount, newClaimContactRoleCount)
    Next i
    
End Sub



Private Sub ProcessPolicyContacts(ByVal policyTable As TableInfo, ByVal policyRow As Integer, ByVal claimTable As TableInfo, ByVal claimContactTable As TableInfo, ByRef newClaimContactCount As Integer, ByRef newClaimContactRoleCount As Integer)
    Dim insuredFK As String
    Dim claimContactRow As Integer
    Dim claimContactFK As String
    Dim claimRow As Integer
    Dim policyFK As String
    
    Let policyFK = PublicIdToForeignKey(policyTable.GetValue(policyRow, "entityid"))
    Let claimRow = claimTable.GetRowForValue("policy", policyFK)
    If (claimRow <> 0) Then
        Call TransferPolicyContact("insured", claimRow, policyFK, policyTable, policyRow, claimTable, claimContactTable, newClaimContactCount, newClaimContactRoleCount)
        Call TransferPolicyContact("agent", claimRow, policyFK, policyTable, policyRow, claimTable, claimContactTable, newClaimContactCount, newClaimContactRoleCount)
    End If
End Sub

Private Sub TransferPolicyContact(ByVal role As String, ByVal claimRow As Integer, ByVal policyFK As String, ByVal policyTable As TableInfo, ByVal policyRow As Integer, ByVal claimTable As TableInfo, ByVal claimContactTable As TableInfo, ByRef newClaimContactCount As Integer, ByRef newClaimContactRoleCount As Integer)
    Dim contactFK As String
    Dim claimContactRow As Integer
    Dim claimContactFK As String
    
    
    Let contactFK = policyTable.GetValue(policyRow, role)
    Let claimContactRow = claimContactTable.GetRowForValue("contact", contactFK)
    If (claimContactRow = 0) Then
        Let newClaimContactCount = newClaimContactCount + 1
        Let Sheet14.Cells(newClaimContactCount, 1) = "ClaimContact"
        Let Sheet14.Cells(newClaimContactCount, 2) = policyTable.GetValue(policyRow, "data-set")
        Let Sheet14.Cells(newClaimContactCount, 3) = "demo_sample:" & (newClaimContactCount + 2000)
        Let Sheet14.Cells(newClaimContactCount, 4) = PublicIdToForeignKey(claimTable.GetValue(claimRow, "entityid"))
        Let Sheet14.Cells(newClaimContactCount, 5) = contactFK
        Let claimContactFK = PublicIdToForeignKey(Sheet14.Cells(newClaimContactCount, 3))
    Else
        Let claimContactFK = PublicIdToForeignKey(claimContactTable.GetValue(claimContactRow, "entityid"))
    End If
    Let newClaimContactRoleCount = newClaimContactRoleCount + 1
    Let Sheet15.Cells(newClaimContactRoleCount, 1) = "ClaimContactRole"
    Let Sheet15.Cells(newClaimContactRoleCount, 2) = policyTable.GetValue(policyRow, "data-set")
    Let Sheet15.Cells(newClaimContactRoleCount, 3) = "demo_sample:" & (newClaimContactRoleCount + 4000)
    Let Sheet15.Cells(newClaimContactRoleCount, 4) = claimContactFK
    Let Sheet15.Cells(newClaimContactRoleCount, 6) = role
    Let Sheet15.Cells(newClaimContactRoleCount, 8) = policyFK
End Sub

Public Sub FindBadClaimFK()
    Dim claimContactTable As TableInfo
    Dim claimTable As TableInfo
    Dim i As Integer
    Dim claimFK As String
    Dim claimRow As Integer
    Dim claimContactDataSet As Integer
    Dim claimDataSet As Integer
    
    Set claimContactTable = New TableInfo
    Call claimContactTable.InitWithEntityName(Sheet10, "ClaimContact")
    Set claimTable = New TableInfo
    Call claimTable.InitWithEntityName(Sheet9, "Claim")
    
    For i = claimContactTable.startRow + 1 To claimContactTable.EndRow
        Let claimFK = claimContactTable.GetValue(i, "claim")
        Let claimContactDataSet = claimContactTable.GetValue(i, "data-set")
        Let claimRow = claimTable.GetRowForId(claimFK)
        If (claimRow = 0) Then
            MsgBox "Could not find Claim with ID: " & ForeignKeyToPublicId(claimFK)
        Else
            Let claimDataSet = claimTable.GetValue(claimRow, "data-set")
            If (claimDataSet > claimContactDataSet) Then
                MsgBox "ClaimContact at row " & i & " refers to Claim at row " & claimRow
            End If
        End If
    Next i
    
End Sub
