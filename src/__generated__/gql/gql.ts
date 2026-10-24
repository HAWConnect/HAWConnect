/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    query AppAnnouncements {\n        appAnnouncements(active: true) {\n            ...AnnouncementFields\n        }\n    }\n": typeof types.AppAnnouncementsDocument,
    "\n    fragment AnnouncementFields on Announcement {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        priority\n        url\n        platform\n        userKind\n        imageUrl\n    }\n": typeof types.AnnouncementFieldsFragmentDoc,
    "\n    query FoodPlan($locations: [LocationInput!]!, $language: String) {\n        food(locations: $locations, language: $language) {\n            ...FoodFields\n        }\n    }\n": typeof types.FoodPlanDocument,
    "\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                additives\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n": typeof types.FoodFieldsFragmentDoc,
    "\n query HawClubs($language: String) {\n  hawClubs(language: $language) {\n   available stale updatedAt sourceUrl\n   clubs { id title description sourceUrl links { title url } }\n  }\n }\n": typeof types.HawClubsDocument,
    "\n    mutation CreateRoomReport($input: RoomReportInput!) {\n        createRoomReport(input: $input) {\n            id\n        }\n    }\n": typeof types.CreateRoomReportDocument,
    "\n    query AcademicCalendar {\n        academicCalendar {\n            available\n            stale\n            updatedAt\n            semesters {\n                key\n                name { de en }\n                events { id name { de en } begin end hasHours }\n            }\n        }\n    }\n": typeof types.AcademicCalendarDocument,
    "\n    query HawEvents($language: String!) {\n        hawEvents(language: $language) {\n            available stale updatedAt truncated sourceUrl managedAvailable\n            events { id title origin sourceUrl date endDate dateLabel timeLabel startTime endTime location }\n        }\n    }\n": typeof types.HawEventsDocument,
    "\n query CampusLife {\n  campusLifeEvents {\n   available\n   events { id organizerId organizerName title { de en } description { de en } startDateTime endDateTime location eventUrl }\n   organizers { id name description { de en } location website instagram linkedin nonProfit registrationNumber }\n  }\n }\n": typeof types.CampusLifeDocument,
};
const documents: Documents = {
    "\n    query AppAnnouncements {\n        appAnnouncements(active: true) {\n            ...AnnouncementFields\n        }\n    }\n": types.AppAnnouncementsDocument,
    "\n    fragment AnnouncementFields on Announcement {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        priority\n        url\n        platform\n        userKind\n        imageUrl\n    }\n": types.AnnouncementFieldsFragmentDoc,
    "\n    query FoodPlan($locations: [LocationInput!]!, $language: String) {\n        food(locations: $locations, language: $language) {\n            ...FoodFields\n        }\n    }\n": types.FoodPlanDocument,
    "\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                additives\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n": types.FoodFieldsFragmentDoc,
    "\n query HawClubs($language: String) {\n  hawClubs(language: $language) {\n   available stale updatedAt sourceUrl\n   clubs { id title description sourceUrl links { title url } }\n  }\n }\n": types.HawClubsDocument,
    "\n    mutation CreateRoomReport($input: RoomReportInput!) {\n        createRoomReport(input: $input) {\n            id\n        }\n    }\n": types.CreateRoomReportDocument,
    "\n    query AcademicCalendar {\n        academicCalendar {\n            available\n            stale\n            updatedAt\n            semesters {\n                key\n                name { de en }\n                events { id name { de en } begin end hasHours }\n            }\n        }\n    }\n": types.AcademicCalendarDocument,
    "\n    query HawEvents($language: String!) {\n        hawEvents(language: $language) {\n            available stale updatedAt truncated sourceUrl managedAvailable\n            events { id title origin sourceUrl date endDate dateLabel timeLabel startTime endTime location }\n        }\n    }\n": types.HawEventsDocument,
    "\n query CampusLife {\n  campusLifeEvents {\n   available\n   events { id organizerId organizerName title { de en } description { de en } startDateTime endDateTime location eventUrl }\n   organizers { id name description { de en } location website instagram linkedin nonProfit registrationNumber }\n  }\n }\n": types.CampusLifeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AppAnnouncements {\n        appAnnouncements(active: true) {\n            ...AnnouncementFields\n        }\n    }\n"): typeof import('./graphql').AppAnnouncementsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment AnnouncementFields on Announcement {\n        id\n        title {\n            de\n            en\n        }\n        description {\n            de\n            en\n        }\n        startDateTime\n        endDateTime\n        priority\n        url\n        platform\n        userKind\n        imageUrl\n    }\n"): typeof import('./graphql').AnnouncementFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query FoodPlan($locations: [LocationInput!]!, $language: String) {\n        food(locations: $locations, language: $language) {\n            ...FoodFields\n        }\n    }\n"): typeof import('./graphql').FoodPlanDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment FoodFields on FoodResponse {\n        foodData {\n            timestamp\n            meals {\n                name {\n                    de\n                    en\n                }\n                id\n                category\n                prices {\n                    student\n                    employee\n                    guest\n                }\n                allergens\n                additives\n                flags\n                nutrition {\n                    kj\n                    kcal\n                    fat\n                    fatSaturated\n                    carbs\n                    sugar\n                    fiber\n                    protein\n                    salt\n                }\n                variants {\n                    name {\n                        de\n                        en\n                    }\n                    additional\n                    id\n                    allergens\n                    flags\n                    originalLanguage\n                    static\n                    restaurant\n                    parent {\n                        id\n                        category\n                    }\n                    prices {\n                        student\n                        employee\n                        guest\n                    }\n                }\n                originalLanguage\n                static\n                restaurant\n            }\n        }\n        errors {\n            location\n            message\n        }\n    }\n"): typeof import('./graphql').FoodFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n query HawClubs($language: String) {\n  hawClubs(language: $language) {\n   available stale updatedAt sourceUrl\n   clubs { id title description sourceUrl links { title url } }\n  }\n }\n"): typeof import('./graphql').HawClubsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CreateRoomReport($input: RoomReportInput!) {\n        createRoomReport(input: $input) {\n            id\n        }\n    }\n"): typeof import('./graphql').CreateRoomReportDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query AcademicCalendar {\n        academicCalendar {\n            available\n            stale\n            updatedAt\n            semesters {\n                key\n                name { de en }\n                events { id name { de en } begin end hasHours }\n            }\n        }\n    }\n"): typeof import('./graphql').AcademicCalendarDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query HawEvents($language: String!) {\n        hawEvents(language: $language) {\n            available stale updatedAt truncated sourceUrl managedAvailable\n            events { id title origin sourceUrl date endDate dateLabel timeLabel startTime endTime location }\n        }\n    }\n"): typeof import('./graphql').HawEventsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n query CampusLife {\n  campusLifeEvents {\n   available\n   events { id organizerId organizerName title { de en } description { de en } startDateTime endDateTime location eventUrl }\n   organizers { id name description { de en } location website instagram linkedin nonProfit registrationNumber }\n  }\n }\n"): typeof import('./graphql').CampusLifeDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
