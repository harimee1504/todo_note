import { gql } from '@apollo/client';

export const GET_NOTES = gql`
  query GetNotes($input: NotesFilter!) {
    getNotes(input: $input) {
      id
      title
      note
      createdBy {
        id
        firstName
        lastName
        email
        imageUrl
      }
      updatedBy {
        id
        firstName
        lastName
        email
        imageUrl
      }
      org_id
      startTime
      endTime
      createdAt
      updatedAt
      attendees {
        id
        firstName
        lastName
        email
        imageUrl
      }
      mentions {
        id
        firstName
        lastName
        email
        imageUrl
      }
      comments {
        id
      }
      tags {
        id
        tag
      }
    }
  }
`; 