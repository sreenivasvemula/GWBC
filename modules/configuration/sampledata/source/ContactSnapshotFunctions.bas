Attribute VB_Name = "ContactSnapshotFunctions"
Option Explicit



Sub ContactSnapshot()
    
    ' contacts in security
    Call AddSnapshotColumns(Sheet2)
    ' contacts in claims
    Call AddSnapshotColumns(Sheet3)
    
End Sub

Private Sub InitContactTables(ByRef aSheet As Worksheet, ByRef personTable As TableInfo, ByRef companyTable As TableInfo)
    Set personTable = New TableInfo
    Call personTable.InitWithEntityName(aSheet, "Person")
    Set companyTable = New TableInfo
    Call companyTable.InitWithEntityName(aSheet, "Company")
End Sub

Private Sub AddIndividualColumn(ByVal ti As TableInfo)
    Dim startRow As Integer
    Dim newColumn As Integer
    Dim i As Integer
    
    Let startRow = ti.startRow
    Let newColumn = ti.numColumns + 1
    
    Let ti.sheet.Cells(startRow, newColumn) = "individual"
    For i = startRow + 1 To ti.EndRow
        Let ti.sheet.Cells(i, newColumn) = ti.sheet.Cells(i, ti.GetColumn("entityid"))
    Next
    
End Sub

Private Sub AddSnapshotStatusColumn(ByVal ti As TableInfo)
    Dim startRow As Integer
    Dim newColumn As Integer
    Dim i As Integer
    
    Let startRow = ti.startRow
    Let newColumn = ti.numColumns + 1
    
    Let ti.sheet.Cells(startRow, newColumn) = "snapshotstatus"
    For i = startRow + 1 To ti.EndRow
        Let ti.sheet.Cells(i, newColumn) = "current"
    Next
End Sub

Private Sub AddSnapshotColumns(ByVal aSheet As Worksheet)
    Dim personTable As TableInfo
    Dim companyTable As TableInfo
    
    Call InitContactTables(aSheet, personTable, companyTable)
    Call AddIndividualColumn(personTable)
    Call AddIndividualColumn(companyTable)
    Call InitContactTables(aSheet, personTable, companyTable)
    Call AddSnapshotStatusColumn(personTable)
    Call AddSnapshotStatusColumn(companyTable)
End Sub
