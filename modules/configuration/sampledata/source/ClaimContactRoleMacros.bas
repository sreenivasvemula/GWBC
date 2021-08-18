Attribute VB_Name = "ClaimContactRoleMacros"
Option Explicit

Sub MakeRolesKeyable()
    Dim ccTableInfo As TableInfo
    
    Call CreateClaimContactRolesTable(Sheet5)
    
    Set ccTableInfo = New TableInfo
    Call ccTableInfo.InitWithEntityName(Sheet3, "ClaimContact")
    Call AddRolesToTable(ccTableInfo, Sheet5)
    
End Sub

Private Sub CreateClaimContactRolesTable(ByVal aSheet As Worksheet)
    Dim colNames(1 To 7) As String
    Dim i As Integer
    
    Let colNames(1) = "type"
    Let colNames(2) = "data-set"
    Let colNames(3) = "entityid"
    Let colNames(4) = "claimcontact"
    Let colNames(5) = "exposure"
    Let colNames(6) = "role"
    Let colNames(7) = "active"
    
    For i = 1 To 7
        Let aSheet.Cells(1, i) = colNames(i)
    Next
    
End Sub



Public Sub AddRolesToTable(ByVal ti As TableInfo, ByVal aSheet As Worksheet)
    Dim i As Integer
    Dim nextRow As Integer
    Dim rolesString As String
    Dim leftBracketIndex As Integer
    Dim ccrs() As String
    Dim csv As String
    Dim ccid As String
    Dim dataSet As String
    Dim j As Integer
    
    Let nextRow = 2
    For i = ti.startRow + 1 To ti.EndRow
        Let rolesString = ti.GetValue(i, "roles")
        Let leftBracketIndex = InStr(rolesString, "[")
        Let csv = Mid(rolesString, leftBracketIndex + 1, Len(rolesString) - leftBracketIndex - 1)
        Let ccrs = Split(csv, ",", -1, vbTextCompare)
        Let ccid = ti.GetValue(i, "entityid")
        Let dataSet = ti.GetValue(i, "data-set")
        For j = LBound(ccrs) To UBound(ccrs)
            Call AddRoleToTable(aSheet, ccrs(j), ccid, dataSet, nextRow)
        Next
    Next
End Sub

Private Sub AddRoleToTable(ByVal aSheet As Worksheet, ByVal ccr As String, ByVal ccid As String, ByVal dataSet As String, ByRef row As Integer)
    Dim roleParts() As String
    Dim exposureID As String
    Dim exposureSource As String
    Dim roleName As String
    Dim active As String
    
    Let roleParts = Split(ccr, "|", -1, vbTextCompare)
    Let exposureID = roleParts(0)
    Let exposureSource = roleParts(1)
    Let roleName = roleParts(2)
    Let active = roleParts(3)
    
    ' We're ready: Now fill in the columns
    Let aSheet.Cells(row, 1) = "ClaimContactRole"
    Let aSheet.Cells(row, 2) = dataSet
    Let aSheet.Cells(row, 3) = "demo_sample:" & (row - 1)
    Let aSheet.Cells(row, 4) = ConvertIDToFK(ccid)
    If exposureID <> "" Then
        Let aSheet.Cells(row, 5) = exposureID & "|" & exposureSource
    End If
    Let aSheet.Cells(row, 6) = roleName
    Let aSheet.Cells(row, 7) = active
    
    ' Advance the row
    Let row = row + 1
End Sub

' Expects an ID of the form <source>:<id>, and returns an FK of the form <id>|<source>
Private Function ConvertIDToFK(ByVal id As String) As String
    Dim idParts() As String
    
    Let idParts = Split(id, ":", -1, vbTextCompare)
    Let ConvertIDToFK = idParts(1) & "|" & idParts(0)
End Function
