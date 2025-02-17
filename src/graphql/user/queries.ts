import { gql } from '@apollo/client';

export const GET_USERS_BY_ORG = gql`
  query GetUsersByOrg {
    getUsersByOrg {
      id
      firstName
      lastName
      email
      imageUrl
    }
  }
`;