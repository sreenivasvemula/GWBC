require 'Setup'
require 'common/LoginLogoutMethods'

class BCLoginLogout < Test::Unit::TestCase

  def test_loginLogout
    LoginLogoutMethods.login('aapplegate')

    $ie.frame(:name, "top_frame").button(:id, "TabBar:DesktopTab").click
    assert($ie.frame(:name, "top_frame").contains_text("My Activities"))

    $ie.frame(:name, "top_frame").button(:id, "TabBar:AccountsTab").click
    assert($ie.frame(:name, "top_frame").contains_text("Accounts"))

    $ie.frame(:name, "top_frame").button(:id, "TabBar:PoliciesTab").click
    assert($ie.frame(:name, "top_frame").contains_text("Policies"))

    $ie.frame(:name, "top_frame").button(:id, "TabBar:ProducersTab").click
    assert($ie.frame(:name, "top_frame").contains_text("Producers"))

    $ie.frame(:name, "top_frame").button(:id, "TabBar:SearchTab").click
    assert($ie.frame(:name, "top_frame").contains_text("Search Criteria"))

    $ie.frame(:name, "top_frame").button(:id, "TabBar:AdministrationTab").click
    assert($ie.frame(:name, "top_frame").contains_text("Billing Plans"))

    LoginLogoutMethods.logout()
    $ie.close
  end
end