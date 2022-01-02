import { gql } from "@apollo/client";

export const completeUserFragment = gql`
  fragment CompleteUser on User {
    id
    name
    firstName
    lastName
    nick
    email
    filmstadenMembershipId
    phone
    avatar: avatarURL
    foretagsbiljetter: giftCertificates {
      number
      expires: expireTime
      status
    }
  }
`;
