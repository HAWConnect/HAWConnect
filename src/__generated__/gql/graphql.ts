/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** Enum representing the original language of a meal. */
export type OriginalLanguage =
  /** German language code */
  | 'de'
  /** English language code */
  | 'en';

/** Enum representing the platform of the user. This is used to target announcements to specific user groups. */
export type Platform =
  /** Android */
  | 'ANDROID'
  /** iOS */
  | 'IOS'
  /** Web */
  | 'WEB'
  /** Web Development Version */
  | 'WEB_DEV';

/** Enum representing the different room report categories. This is used to categorize the reason for the report. */
export type RoomReportCategory =
  | 'MISSING'
  | 'NOT_EXISTING'
  | 'OTHER'
  | 'WRONG_DESCRIPTION'
  | 'WRONG_LOCATION';

/** Room report input type. Used to create a new report about incorrect room data. */
export type RoomReportInput = {
  /** description of the report */
  description?: string | null | undefined;
  /** Reason for the report. */
  reason: RoomReportCategory;
  /** Room name */
  room: string;
};

/** Enum representing the kind of user. This is used to target announcements to specific user groups. */
export type UserKind =
  /** Employee */
  | 'EMPLOYEE'
  /** Guest */
  | 'GUEST'
  /** Student */
  | 'STUDENT';

export type AppAnnouncementsQueryVariables = Exact<{ [key: string]: never; }>;


export type AppAnnouncementsQuery = { appAnnouncements: Array<{ ' $fragmentRefs'?: { 'AnnouncementFieldsFragment': AnnouncementFieldsFragment } }> };

export type AnnouncementFieldsFragment = { id: string, startDateTime: Date, endDateTime: Date, priority: number, url: string | null, platform: Array<Platform>, userKind: Array<UserKind>, imageUrl: string | null, title: { de: string | null, en: string | null }, description: { de: string | null, en: string | null } } & { ' $fragmentName'?: 'AnnouncementFieldsFragment' };

export type FoodPlanQueryVariables = Exact<{
  locations: Array<unknown> | unknown;
  language?: string | null | undefined;
}>;


export type FoodPlanQuery = { food: { ' $fragmentRefs'?: { 'FoodFieldsFragment': FoodFieldsFragment } } };

export type FoodFieldsFragment = { foodData: Array<{ timestamp: string, meals: Array<{ id: string, category: string, allergens: Array<string | null> | null, additives: Array<string> | null, flags: Array<string | null> | null, originalLanguage: OriginalLanguage, static: boolean, restaurant: string, name: { de: string | null, en: string | null }, prices: { student: number | null, employee: number | null, guest: number | null }, nutrition: { kj: number, kcal: number, fat: number, fatSaturated: number, carbs: number, sugar: number, fiber: number, protein: number, salt: number } | null, variants: Array<{ additional: boolean, id: string, allergens: Array<string | null> | null, flags: Array<string | null> | null, originalLanguage: OriginalLanguage, static: boolean, restaurant: string | null, name: { de: string | null, en: string | null }, parent: { id: string, category: string } | null, prices: { student: number | null, employee: number | null, guest: number | null } }> | null }> | null }> | null, errors: Array<{ location: string, message: string }> | null } & { ' $fragmentName'?: 'FoodFieldsFragment' };

export type HawClubsQueryVariables = Exact<{
  language?: string | null | undefined;
}>;


export type HawClubsQuery = { hawClubs: { available: boolean, stale: boolean, updatedAt: string | null, sourceUrl: string, clubs: Array<{ id: string, title: string, description: string, descriptionHtml: string | null, contentLanguage: string | null, sourceUrl: string, links: Array<{ title: string, url: string }> }> } };

export type HawClubsLegacyQueryVariables = Exact<{
  language?: string | null | undefined;
}>;


export type HawClubsLegacyQuery = { hawClubs: { available: boolean, stale: boolean, updatedAt: string | null, sourceUrl: string, clubs: Array<{ id: string, title: string, description: string, sourceUrl: string, links: Array<{ title: string, url: string }> }> } };

export type CreateRoomReportMutationVariables = Exact<{
  input: RoomReportInput;
}>;


export type CreateRoomReportMutation = { createRoomReport: { id: string | null } | null };

export type AcademicCalendarQueryVariables = Exact<{ [key: string]: never; }>;


export type AcademicCalendarQuery = { academicCalendar: { available: boolean, stale: boolean, updatedAt: string | null, semesters: Array<{ key: string, name: { de: string | null, en: string | null }, events: Array<{ id: string, begin: string, end: string | null, hasHours: boolean, name: { de: string | null, en: string | null } }> }> } };

export type HawEventsQueryVariables = Exact<{
  language: string;
}>;


export type HawEventsQuery = { hawEvents: { available: boolean, stale: boolean, updatedAt: string | null, truncated: boolean, sourceUrl: string, managedAvailable: boolean, events: Array<{ id: string, title: string, origin: string, sourceUrl: string, date: string, endDate: string | null, dateLabel: string, timeLabel: string | null, startTime: string | null, endTime: string | null, location: string | null }> } };

export type CampusLifeQueryVariables = Exact<{ [key: string]: never; }>;


export type CampusLifeQuery = { campusLifeEvents: { available: boolean, events: Array<{ id: number, organizerId: number, organizerName: string, startDateTime: string, endDateTime: string | null, location: string | null, eventUrl: string | null, title: { de: string | null, en: string | null }, description: { de: string | null, en: string | null } }>, organizers: Array<{ id: number, name: string, location: string | null, website: string | null, instagram: string | null, linkedin: string | null, nonProfit: boolean | null, registrationNumber: string | null, description: { de: string | null, en: string | null } }> } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const AnnouncementFieldsFragmentDoc = new TypedDocumentString(`
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
    `, {"fragmentName":"AnnouncementFields"}) as unknown as TypedDocumentString<AnnouncementFieldsFragment, unknown>;
export const FoodFieldsFragmentDoc = new TypedDocumentString(`
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
    `, {"fragmentName":"FoodFields"}) as unknown as TypedDocumentString<FoodFieldsFragment, unknown>;
export const AppAnnouncementsDocument = new TypedDocumentString(`
    query AppAnnouncements {
  appAnnouncements(active: true) {
    ...AnnouncementFields
  }
}
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
}`) as unknown as TypedDocumentString<AppAnnouncementsQuery, AppAnnouncementsQueryVariables>;
export const FoodPlanDocument = new TypedDocumentString(`
    query FoodPlan($locations: [LocationInput!]!, $language: String) {
  food(locations: $locations, language: $language) {
    ...FoodFields
  }
}
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
}`) as unknown as TypedDocumentString<FoodPlanQuery, FoodPlanQueryVariables>;
export const HawClubsDocument = new TypedDocumentString(`
    query HawClubs($language: String) {
  hawClubs(language: $language) {
    available
    stale
    updatedAt
    sourceUrl
    clubs {
      id
      title
      description
      descriptionHtml
      contentLanguage
      sourceUrl
      links {
        title
        url
      }
    }
  }
}
    `) as unknown as TypedDocumentString<HawClubsQuery, HawClubsQueryVariables>;
export const HawClubsLegacyDocument = new TypedDocumentString(`
    query HawClubsLegacy($language: String) {
  hawClubs(language: $language) {
    available
    stale
    updatedAt
    sourceUrl
    clubs {
      id
      title
      description
      sourceUrl
      links {
        title
        url
      }
    }
  }
}
    `) as unknown as TypedDocumentString<HawClubsLegacyQuery, HawClubsLegacyQueryVariables>;
export const CreateRoomReportDocument = new TypedDocumentString(`
    mutation CreateRoomReport($input: RoomReportInput!) {
  createRoomReport(input: $input) {
    id
  }
}
    `) as unknown as TypedDocumentString<CreateRoomReportMutation, CreateRoomReportMutationVariables>;
export const AcademicCalendarDocument = new TypedDocumentString(`
    query AcademicCalendar {
  academicCalendar {
    available
    stale
    updatedAt
    semesters {
      key
      name {
        de
        en
      }
      events {
        id
        name {
          de
          en
        }
        begin
        end
        hasHours
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AcademicCalendarQuery, AcademicCalendarQueryVariables>;
export const HawEventsDocument = new TypedDocumentString(`
    query HawEvents($language: String!) {
  hawEvents(language: $language) {
    available
    stale
    updatedAt
    truncated
    sourceUrl
    managedAvailable
    events {
      id
      title
      origin
      sourceUrl
      date
      endDate
      dateLabel
      timeLabel
      startTime
      endTime
      location
    }
  }
}
    `) as unknown as TypedDocumentString<HawEventsQuery, HawEventsQueryVariables>;
export const CampusLifeDocument = new TypedDocumentString(`
    query CampusLife {
  campusLifeEvents {
    available
    events {
      id
      organizerId
      organizerName
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
      location
      eventUrl
    }
    organizers {
      id
      name
      description {
        de
        en
      }
      location
      website
      instagram
      linkedin
      nonProfit
      registrationNumber
    }
  }
}
    `) as unknown as TypedDocumentString<CampusLifeQuery, CampusLifeQueryVariables>;