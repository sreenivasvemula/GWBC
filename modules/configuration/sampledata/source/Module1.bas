Attribute VB_Name = "Module1"
Sub ClaimAccess()
  Dim ti As TableInfo
  Dim eti As TableInfo
  Dim ati As TableInfo
  Dim i As Integer
  Dim j As Integer
  Dim groups As Collection
  Dim accessString As String
  
  Set ti = New TableInfo
  Call ti.InitWithEntityName(Sheet9, "Claim")
  
  Set eti = New TableInfo
  Call eti.InitWithEntityName(Sheet9, "Exposure")
  
  Set ati = New TableInfo
  Call ati.InitWithEntityName(Sheet11, "Activity")
  
  For i = ti.startRow + 1 To ti.EndRow
    Let assignedGroup = ti.GetValue(i, "assignedgroup")
    
'    Set groups = GetAssignedGroupsForClaim(convertPublicId(ti.GetValue(i, "entityid")), ati, eti)
    Set groups = New Collection
    Call groups.Add(assignedGroup)
    
    Let accessString = "ClaimAccess|group["
    
    For j = 1 To groups.Count
        If j <> 1 Then
            Let accessString = accessString & ","
        End If
        Let accessString = accessString & groups.Item(j) & "|edit," & groups.Item(j) & "|view"
    Next
    
    Let accessString = accessString & "]"
      
    Call ti.SetValue(i, "access", accessString)
  Next

End Sub

Public Function GetAssignedGroupsForClaim(ByVal publicId As String, ByVal ActivityTable As TableInfo, ByVal ExposureTable As TableInfo) As Collection
    Dim groups As Collection
    Dim i As Integer
    
    Set groups = New Collection
    
    
    For i = ActivityTable.startRow + 1 To ActivityTable.EndRow
        If ActivityTable.GetValue(i, "claim") = publicId Then
            Call groups.Add(ActivityTable.GetValue(i, "assignedgroup"))
        End If
    Next
    
    For i = ExposureTable.startRow + 1 To ExposureTable.EndRow
        If ExposureTable.GetValue(i, "claim") = publicId Then
            Call groups.Add(ExposureTable.GetValue(i, "assignedgroup"))
        End If
    Next

    Set GetAssignedGroupsForClaim = groups
End Function

Public Function convertPublicId(ByVal publicId As String) As String
    Dim fk As String
    Dim arr() As String
    
    ' fk is a foreign key of the form <externalid>|<externalsource>
    ' We want it to be in the form <externalsource>:<externalid>
    Let arr = Split(publicId, ":", 2, vbTextCompare)
    Let fk = arr(1) & "|" & arr(0)
    Let convertPublicId = fk
End Function

