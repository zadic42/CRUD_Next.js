import { gql } from '@apollo/client';

export const GET_EMPLOYEES = gql`
  query GetUsers {
    users {
      id
      name
      email
      position
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      position
    }
  }
`;
