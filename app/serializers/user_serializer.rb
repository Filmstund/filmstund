class UserSerializer < ActiveModel::Serializer
  attributes :id, :nick, :sf_membership_level
end
