// biome-ignore-all lint/correctness/noUnusedVariables: needed for codegen

import { graphql } from '@/__generated__/gql'

export const ANNOUNCEMENT_QUERY = graphql(/* GraphQL */ `
    query AppAnnouncements {
        appAnnouncements(active: true) {
            ...AnnouncementFields
        }
    }
`)

const APP_ANNOUNCEMENT_FRAGMENT = graphql(/* GraphQL */ `
    fragment AnnouncementFields on Announcement {
        id
        title {
            de
            en
        }
        description {
            de
            en
        }
        startDateTime
        endDateTime
        priority
        url
        platform
        userKind
        imageUrl
    }
`)

export const FOOD_QUERY = graphql(/* GraphQL */ `
    query FoodPlan($locations: [LocationInput!]!, $language: String) {
        food(locations: $locations, language: $language) {
            ...FoodFields
        }
    }
`)

const FOOD_FRAGMENT = graphql(/* GraphQL */ `
    fragment FoodFields on FoodResponse {
        foodData {
            timestamp
            meals {
                name {
                    de
                    en
                }
                id
                category
                prices {
                    student
                    employee
                    guest
                }
                allergens
                additives
                flags
                nutrition {
                    kj
                    kcal
                    fat
                    fatSaturated
                    carbs
                    sugar
                    fiber
                    protein
                    salt
                }
                variants {
                    name {
                        de
                        en
                    }
                    additional
                    id
                    allergens
                    flags
                    originalLanguage
                    static
                    restaurant
                    parent {
                        id
                        category
                    }
                    prices {
                        student
                        employee
                        guest
                    }
                }
                originalLanguage
                static
                restaurant
            }
        }
        errors {
            location
            message
        }
    }
`)

export const HAW_CLUBS_QUERY = graphql(/* GraphQL */ `
 query HawClubs($language: String) {
  hawClubs(language: $language) {
   available stale updatedAt sourceUrl
   clubs { id title description sourceUrl links { title url } }
  }
 }
`)

export const CREATE_ROOM_REPORT = graphql(/* GraphQL */ `
    mutation CreateRoomReport($input: RoomReportInput!) {
        createRoomReport(input: $input) {
            id
        }
    }
`)

export const ACADEMIC_CALENDAR_QUERY = graphql(/* GraphQL */ `
    query AcademicCalendar {
        academicCalendar {
            available
            stale
            updatedAt
            semesters {
                key
                name { de en }
                events { id name { de en } begin end hasHours }
            }
        }
    }
`)

export const HAW_EVENTS_QUERY = graphql(/* GraphQL */ `
    query HawEvents($language: String!) {
        hawEvents(language: $language) {
            available stale updatedAt truncated sourceUrl managedAvailable
            events { id title origin sourceUrl date endDate dateLabel timeLabel startTime endTime location }
        }
    }
`)

export const CAMPUS_LIFE_QUERY = graphql(/* GraphQL */ `
 query CampusLife {
  campusLifeEvents {
   available
   events { id organizerId organizerName title { de en } description { de en } startDateTime endDateTime location eventUrl }
   organizers { id name description { de en } location website instagram linkedin nonProfit registrationNumber }
  }
 }
`)
