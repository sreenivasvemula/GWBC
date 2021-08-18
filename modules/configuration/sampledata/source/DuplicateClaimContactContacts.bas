Attribute VB_Name = "DuplicateClaimContactContacts"
Option Explicit

Sub DuplicateClaimContactContacts()
    Dim ccTable As TableInfo
    Dim personTable As TableInfo
    Dim companyTable As TableInfo
    Dim i As Integer
    Dim newRow As Integer
    
    
    Set ccTable = New TableInfo
    Call ccTable.InitWithEntityName(Sheet10, "ClaimContact")
    Set personTable = New TableInfo
    Call personTable.InitWithEntityName(Sheet3, "Person")
    Set companyTable = New TableInfo
    Call companyTable.InitWithEntityName(Sheet3, "Company")
    Let newRow = 1
    For i = ccTable.startRow + 1 To ccTable.EndRow
        Call DuplicateClaimContactContact(ccTable, personTable, companyTable, i, newRow)
    Next i
    
    
End Sub

Private Sub DuplicateClaimContactContact( _
    ByVal ccTable As TableInfo, ByVal personTable As TableInfo, ByVal companyTable As TableInfo, ByVal i As Integer, _
    ByRef newRow As Integer)
    
    Dim dataSet As String
    Dim oldContactFk As String
    Dim oldContactRow As Integer
    Dim oldContactWorksheet As Worksheet
    Dim newContactWorksheet As Worksheet
    Dim newPersonWorksheet As Worksheet
    Dim newCompanyworksheet As Worksheet
    Dim newPublicId As String
    
    Set oldContactWorksheet = Sheet3
    Set newPersonWorksheet = Sheet13
    Set newCompanyworksheet = Sheet14
    
    
    ' Only duplicate if from data-set 1; data-set 0 is OK
    Let dataSet = ccTable.GetValue(i, "data-set")
    If dataSet <> "0" Then
        Let oldContactFk = ccTable.GetValue(i, "contact")
        Let oldContactRow = personTable.GetRowForId(oldContactFk)
        Set newContactWorksheet = newPersonWorksheet
        If oldContactRow = 0 Then
            Let oldContactRow = companyTable.GetRowForId(oldContactFk)
            Set newContactWorksheet = newCompanyworksheet
        End If
        ' Copy the row
        Call oldContactWorksheet.Rows(oldContactRow).Copy(newContactWorksheet.Rows(newRow))
        ' Assign a new publicId
        Let newPublicId = "demo_sample:" & (6000 + newRow)
        Let newContactWorksheet.Cells(newRow, 3) = newPublicId
        ' Set the data-set to referer's
        Let newContactWorksheet.Cells(newRow, 2) = dataSet
        ' Change the referer
        Call ccTable.SetValue(i, "contact", PublicIdToForeignKey(newPublicId))
        Let newRow = newRow + 1
    End If
End Sub
