Attribute VB_Name = "Utilities"
Option Explicit


Public Function PublicIdToForeignKey(ByVal publicId As String) As String
    Dim fk As String
    Dim arr() As String
    
    ' fk is a foreign key of the form <externalid>|<externalsource>
    ' We want it to be in the form <externalsource>:<externalid>
    Let arr = Split(publicId, ":", 2, vbTextCompare)
    Let fk = arr(1) & "|" & arr(0)
    Let PublicIdToForeignKey = fk
End Function

Public Function ForeignKeyToPublicId(ByVal fk As String) As String
    Dim publicId As String
    Dim arr() As String
    
    ' fk is a foreign key of the form <externalid>|<externalsource>
    ' We want it to be in the form <externalsource>:<externalid>
    Let arr = Split(fk, "|", 2, vbTextCompare)
    Let publicId = arr(1) & ":" & arr(0)
    Let ForeignKeyToPublicId = publicId
End Function


Public Function VariantToObject(ByVal v As Variant) As VariantWrapper
    Dim wrapper As VariantWrapper
    Set wrapper = New VariantWrapper
    Let wrapper.Value = v
    Set VariantToObject = wrapper
End Function


