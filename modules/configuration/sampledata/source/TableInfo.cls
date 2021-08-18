VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "TableInfo"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

Private iNumRows As Integer
Private iStartRow As Integer
Private columns As Collection
Private mySheet As Worksheet

Const MAX_COLS = 256
Const MAX_ROWS = 32767

Public Sub InitOwnSheet(ByVal aSheet As Worksheet)
    Dim iEndRow As Integer
    Dim i As Integer
    
    ' determine num rows
    For i = 1 To MAX_ROWS
        If aSheet.Cells(i, 1) = "" Then
            Let iEndRow = i - 1
            Exit For
        End If
    Next
    Call Init(aSheet, 1, iEndRow)
    
End Sub

Public Property Get NumRows() As Integer
    Let NumRows = iNumRows
End Property

Public Property Let NumRows(ByVal vNewValue As Integer)
    Let iNumRows = vNewValue
End Property

' Insert a blank row before the given row
Public Sub InsertRow(ByVal row As Integer)
    For i = NumRows To row Step -1
        Call sheet.Rows(i).Copy(sheet.Rows(i + 1))
    Next
    Call sheet.Rows(row).Clear
    Let NumRows = NumRows + 1
End Sub



Public Function GetColumn(ByVal colName As String)
    Let GetColumn = columns.Item(colName).Column
End Function

Public Property Get sheet() As Worksheet
    Set sheet = mySheet
End Property


Public Function AddRow() As Integer
    Let NumRows = NumRows + 1
    Let AddRow = NumRows
End Function

Public Property Get startRow() As Integer
    Let startRow = iStartRow
End Property

Public Property Let startRow(ByVal vNewValue As Integer)
    Let iStartRow = vNewValue
End Property


Public Sub Init(ByVal aSheet As Worksheet, ByVal iStartRow As Integer, ByVal iEndRow As Integer)
    Dim i As Integer
    Dim colName As String
    Dim colNum As ColumnNumber
    
    Set mySheet = aSheet
    Let startRow = iStartRow
    Let NumRows = iEndRow - iStartRow + 1
    
    ' determine columns
    Set columns = New Collection
    ' Skip the first "type" column
    For i = 2 To MAX_COLS
        If sheet.Cells(startRow, i) = "" Then
            Exit For
        End If
        Let colName = sheet.Cells(startRow, i)
        Set colNum = New ColumnNumber
        Let colNum.Column = i
        Call columns.Add(colNum, colName)
    Next
End Sub

Public Property Get EndRow() As Integer
    Let EndRow = startRow + NumRows - 1
End Property


Public Sub RemoveColumn(ByVal colName As String)
    Dim col As Integer
    Dim srcAddr1 As Variant
    Dim srcAddr2 As Variant
    Dim dstAddr1 As Variant
    Dim dstAddr2 As Variant
    Dim colNum As ColumnNumber
    Dim i As Integer
    
    Let col = GetColumn(colName)
    ' Theoretically, you should be able to do one big cut-and-paste, but I was getting
    ' weird results for large regions, so I break it up into a column-by-column cut-and-paste.
    For i = col To columns.Count
        Let srcAddr1 = sheet.Cells(startRow, i + 1).Address
        Let srcAddr2 = sheet.Cells(EndRow, i + 1).Address
        Let dstAddr1 = sheet.Cells(startRow, i).Address
        Let dstAddr2 = sheet.Cells(EndRow, i).Address
    
        Call sheet.Range(srcAddr1, srcAddr2).Cut(sheet.Range(dstAddr1, dstAddr2))
    Next
    
    ' Now update columns map
    Call columns.Remove(colName)
    For Each colNum In columns
        If colNum.Column > col Then
            Let colNum.Column = colNum.Column - 1
        End If
    Next
            
        
End Sub

Public Property Get numColumns() As Integer
    Let numColumns = columns.Count
End Property



Public Sub InitWithEntityName(ByVal aSheet As Worksheet, ByVal entityName As String)
    Dim i As Integer
    Dim iStartRow As Integer
    Dim iEndRow As Integer
    
    For i = 1 To MAX_ROWS
        If aSheet.Cells(i, 1) = entityName Then
            iStartRow = i - 1
            Exit For
        End If
    Next
    
    For i = iStartRow + 1 To MAX_ROWS
        If aSheet.Cells(i, 1) <> entityName Then
            iEndRow = i - 1
            Exit For
        End If
    Next
    
    Call Init(aSheet, iStartRow, iEndRow)
End Sub

Public Function GetValue(ByVal iRow As Integer, ByVal colName As String) As String
    Let GetValue = mySheet.Cells(iRow, GetColumn(colName))
End Function

Public Sub SetValue(ByVal iRow As Integer, ByVal colName As String, ByVal val As String)
    Let mySheet.Cells(iRow, GetColumn(colName)) = val
End Sub

' Gets the physical row with the given public ID.
' Expects the argument in "foreign key" form: <externalid>|<externalsource>
' Returns 0 if no matching row found.
Public Function GetRowForId(ByVal fk As String) As Integer
    Dim i As Integer
    Dim idCol As Integer
    Dim arr() As String
    
    Let GetRowForId = 0
    
    ' fk is a foreign key of the form <externalid>|<externalsource>
    ' We want it to be in the form <externalsource>:<externalid>
    Let arr = Split(fk, "|", 2, vbTextCompare)
    Let fk = arr(1) & ":" & arr(0)
    Let idCol = GetColumn("entityid")
    
    For i = startRow + 1 To EndRow
        If (mySheet.Cells(i, idCol) = fk) Then
            Let GetRowForId = i
            Exit For
        End If
    Next
End Function

Public Function GetRowForPair(ByVal col1Name As String, ByVal col1Value As String, ByVal col2Name As String, ByVal col2Value As String) As Integer
    Dim i As Integer
    Dim col1 As Integer
    Dim col2 As Integer
    
    Let col1 = GetColumn(col1Name)
    Let col2 = GetColumn(col2Name)
    
    For i = startRow + 1 To EndRow
        If (mySheet.Cells(i, col1) = col1Value And mySheet.Cells(i, col2) = col2Value) Then
            Let GetRowForPair = i
            Exit For
        End If
    Next
End Function

Public Function GetRowForValue(ByVal colName As String, ByVal colValue As String) As Integer
    Dim i As Integer
    Dim col As Integer
    
    Let col = GetColumn(colName)
    
    For i = startRow + 1 To EndRow
        If (mySheet.Cells(i, col) = colValue) Then
            Let GetRowForValue = i
            Exit For
        End If
    Next
End Function

