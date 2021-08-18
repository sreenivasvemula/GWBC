Attribute VB_Name = "AddInsuredMacros"
Option Explicit

Sub AddInsured()
    Dim claimTable As TableInfo
    Dim policyTable As TableInfo
    Dim ccTable As TableInfo
    Dim rolesCol As Integer
    Dim claimid As String
    Dim id() As String
    Dim claimFK As String
    Dim policyFK As String
    Dim policyRow As Integer
    Dim insuredFK As String
    Dim ccRow As Integer
    Dim roles As String
    Dim i As Integer
    
    
    Set claimTable = New TableInfo
    Call claimTable.InitWithEntityName(Sheet3, "Claim")
    Set policyTable = New TableInfo
    Call policyTable.InitWithEntityName(Sheet3, "Policy")
    Set ccTable = New TableInfo
    Call ccTable.InitOwnSheet(ClaimContactSheet)
    
    Let rolesCol = ccTable.GetColumn("roles")
    
    For i = claimTable.startRow + 1 To claimTable.EndRow
        Let claimid = claimTable.GetValue(i, "entityid")
        Let id = Split(claimid, ":", 2, vbTextCompare)
        Let claimFK = id(1) & "|" & id(0)
        Let policyFK = claimTable.GetValue(i, "policy")
        Let policyRow = policyTable.GetRowForId(policyFK)
        Let insuredFK = policyTable.GetValue(policyRow, "policyholder")
        Let ccRow = ccTable.GetRowForPair("claim", claimFK, "contact", insuredFK)
        If (ccRow = 0) Then
            Call AddClaimContact(ccTable, claimFK, insuredFK, claimTable.GetValue(i, "data-set"))
        Else
            Let roles = ccTable.sheet.Cells(ccRow, rolesCol)
            Let roles = Replace(roles, "]", ",||insured|true]", 1, -1, vbTextCompare)
            Let ccTable.sheet.Cells(ccRow, rolesCol) = roles
        End If
    Next
End Sub

Private Sub AddClaimContact(ByVal ti As TableInfo, ByVal claimFK As String, ByVal contactFK As String, ByVal dataSet As String)
    Dim iRow As Integer
    
    Let iRow = ti.AddRow()
    Let ti.sheet.Cells(iRow, 1) = "ClaimContact"
    Call ti.SetValue(iRow, "data-set", dataSet)
    Call ti.SetValue(iRow, "entityid", "demo_sample:" & (iRow - 1))
    Call ti.SetValue(iRow, "claim", claimFK)
    Call ti.SetValue(iRow, "contact", contactFK)
    Call ti.SetValue(iRow, "roles", "ClaimContactRole|exposure[||insured|true]")
End Sub
