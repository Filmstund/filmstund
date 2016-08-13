class MeSerializer < ActiveModel::Serializer
  attributes :id, :nick, :email, :bioklubbsnummer, :sf_membership_level, :phone_number, :pushover_key
end