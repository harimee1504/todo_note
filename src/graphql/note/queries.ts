import { gql } from '@apollo/client';

export const GET_NOTE = gql`
  query GetNotes($input: NotesFilter) {
    getNotes(input: $input) {
    id
    title
    note
    org_id
    createdAt
    updatedAt
    startTime
    endTime
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
        comment
        mentions {
            id
            firstName
            lastName
            email
            imageUrl
        }
        note_id
        org_id
        createdBy {
            id
            firstName
            lastName
            email
            imageUrl
        }
        updatedBy{
            id
            firstName
            lastName
            email
            imageUrl
        }
        createdAt
        updatedAt
    }
    tags {
        id
        tag
    } 
  }
  }
`;