import gql from 'graphql-tag';

export const ContractsQuery = gql`
  query ContractsQuery($limit: Int!, $skip: Int!) {
    contracts(first: $limit, skip: $skip, orderBy: createdAt) {
      id
      name
      createdAt
      parent {
        id
        name
      }
      children {
        id
      }
    }
  }
`;
