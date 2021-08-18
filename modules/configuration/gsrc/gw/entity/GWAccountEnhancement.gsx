package gw.entity

@Export
enhancement GWAccountEnhancement : entity.Account {

  property get AccountNameLocalized() : String {
    return this.AccountNameKanji.HasContent ? this.AccountNameKanji : this.AccountName
  }

}
