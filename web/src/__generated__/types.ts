import gql from "graphql-tag";
import * as Urql from "urql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Base64ID: string;
  FilmstadenMembershipID: string;
  IMDbID: string;
  LocalDate: import("@js-temporal/polyfill").Temporal.PlainDate;
  LocalTime: import("@js-temporal/polyfill").Temporal.PlainTime;
  SEK: string;
  TMDbID: string;
  Time: import("@js-temporal/polyfill").Temporal.PlainDate;
  UUID: string;
};

export type AdminPaymentDetails = {
  __typename?: "AdminPaymentDetails";
  attendees: Array<Attendee>;
  filmstadenBuyLink: Maybe<Scalars["String"]>;
  showingID: Scalars["UUID"];
};

export type Attendee = {
  __typename?: "Attendee";
  amountOwed: Scalars["SEK"];
  filmstadenMembershipID: Maybe<Scalars["String"]>;
  giftCertificateUsed: Maybe<GiftCertificate>;
  hasPaid: Scalars["Boolean"];
  showingID: Scalars["UUID"];
  type: PaymentType;
  user: PublicUser;
  userID: Scalars["UUID"];
};

export type AttendeePaymentDetails = {
  __typename?: "AttendeePaymentDetails";
  amountOwed: Scalars["SEK"];
  hasPaid: Scalars["Boolean"];
  payTo: PublicUser;
  payer: PublicUser;
  swishLink: Maybe<Scalars["String"]>;
};

export type AttendeePaymentInfoInput = {
  amountOwed: Scalars["SEK"];
  hasPaid: Scalars["Boolean"];
  showingID: Scalars["UUID"];
  userID: Scalars["UUID"];
};

export type CinemaScreen = {
  __typename?: "CinemaScreen";
  id: Scalars["ID"];
  name: Scalars["String"];
};

export type CinemaScreenInput = {
  id: Scalars["String"];
  name: InputMaybe<Scalars["String"]>;
};

export type Commandments = {
  __typename?: "Commandments";
  number: Scalars["Int"];
  phrase: Scalars["String"];
};

export type CreateShowingInput = {
  date: Scalars["LocalDate"];
  filmstadenRemoteEntityID: InputMaybe<Scalars["String"]>;
  filmstadenScreen: InputMaybe<CinemaScreenInput>;
  location: Scalars["String"];
  movieID: Scalars["UUID"];
  time: Scalars["LocalTime"];
};

export type FilmstadenCinema = {
  __typename?: "FilmstadenCinema";
  filmstadenID: Scalars["ID"];
  name: Scalars["String"];
};

export type FilmstadenCityAlias = {
  __typename?: "FilmstadenCityAlias";
  alias: Scalars["String"];
  name: Scalars["String"];
};

export type FilmstadenScreen = {
  __typename?: "FilmstadenScreen";
  filmstadenID: Scalars["ID"];
  name: Scalars["String"];
};

export type FilmstadenSeatCoordinates = {
  __typename?: "FilmstadenSeatCoordinates";
  x: Scalars["Float"];
  y: Scalars["Float"];
};

export type FilmstadenSeatDimensions = {
  __typename?: "FilmstadenSeatDimensions";
  height: Scalars["Int"];
  width: Scalars["Int"];
};

export type FilmstadenSeatMap = {
  __typename?: "FilmstadenSeatMap";
  coordinates: FilmstadenSeatCoordinates;
  dimensions: FilmstadenSeatDimensions;
  number: Scalars["Int"];
  row: Scalars["Int"];
  seatType: Scalars["String"];
};

export type FilmstadenShowing = {
  __typename?: "FilmstadenShowing";
  cinema: FilmstadenCinema;
  id: Scalars["String"];
  screen: FilmstadenScreen;
  tags: Array<Scalars["String"]>;
  timeUtc: Scalars["Time"];
};

export type GiftCertificate = {
  __typename?: "GiftCertificate";
  expireTime: Scalars["Time"];
  number: Scalars["String"];
  status: GiftCertificate_Status;
};

export type GiftCertificateInput = {
  expireTime: InputMaybe<Scalars["Time"]>;
  number: Scalars["String"];
};

export enum GiftCertificate_Status {
  Available = "AVAILABLE",
  Expired = "EXPIRED",
  Pending = "PENDING",
  Unknown = "UNKNOWN",
  Used = "USED",
}

export type Movie = {
  __typename?: "Movie";
  archived: Scalars["Boolean"];
  createTime: Scalars["String"];
  filmstadenID: Scalars["String"];
  genres: Array<Scalars["String"]>;
  id: Scalars["UUID"];
  imdbID: Maybe<Scalars["IMDbID"]>;
  popularity: Scalars["Float"];
  poster: Maybe<Scalars["String"]>;
  productionYear: Scalars["Int"];
  releaseDate: Scalars["String"];
  runtime: Scalars["String"];
  slug: Scalars["String"];
  title: Scalars["String"];
  tmdbID: Maybe<Scalars["TMDbID"]>;
  updateTime: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  addGiftCertificates: User;
  attendShowing: Showing;
  createShowing: Showing;
  deleteGiftCertificate: User;
  deleteShowing: Array<Showing>;
  disableCalendarFeed: User;
  fetchNewMoviesFromFilmstaden: Array<Movie>;
  invalidateCalendarFeed: User;
  markAsBought: Showing;
  processTicketUrls: Showing;
  promoteToAdmin: Showing;
  unattendShowing: Showing;
  updateAttendeePaymentInfo: Attendee;
  updateShowing: Showing;
  updateUser: User;
};

export type MutationAddGiftCertificatesArgs = {
  giftCerts: InputMaybe<Array<GiftCertificateInput>>;
};

export type MutationAttendShowingArgs = {
  paymentOption: PaymentOption;
  showingID: Scalars["UUID"];
};

export type MutationCreateShowingArgs = {
  showing: CreateShowingInput;
};

export type MutationDeleteGiftCertificateArgs = {
  giftCert: GiftCertificateInput;
};

export type MutationDeleteShowingArgs = {
  showingID: Scalars["UUID"];
};

export type MutationFetchNewMoviesFromFilmstadenArgs = {
  cityAlias?: Scalars["String"];
};

export type MutationMarkAsBoughtArgs = {
  price: Scalars["SEK"];
  showingID: Scalars["UUID"];
};

export type MutationProcessTicketUrlsArgs = {
  showingID: Scalars["UUID"];
  ticketUrls: InputMaybe<Array<Scalars["String"]>>;
};

export type MutationPromoteToAdminArgs = {
  showingID: Scalars["UUID"];
  userToPromote: Scalars["UUID"];
};

export type MutationUnattendShowingArgs = {
  showingID: Scalars["UUID"];
};

export type MutationUpdateAttendeePaymentInfoArgs = {
  paymentInfo: AttendeePaymentInfoInput;
};

export type MutationUpdateShowingArgs = {
  newValues: InputMaybe<UpdateShowingInput>;
  showingID: Scalars["UUID"];
};

export type MutationUpdateUserArgs = {
  newInfo: UserDetailsInput;
};

export type PaymentOption = {
  ticketNumber: InputMaybe<Scalars["String"]>;
  type: PaymentType;
};

export enum PaymentType {
  GiftCertificate = "GIFT_CERTIFICATE",
  Swish = "SWISH",
}

export type PublicAttendee = {
  __typename?: "PublicAttendee";
  showingID: Scalars["UUID"];
  userID: Scalars["UUID"];
  userInfo: PublicUser;
};

export type PublicUser = {
  __typename?: "PublicUser";
  avatarURL: Maybe<Scalars["String"]>;
  firstName: Scalars["String"];
  id: Scalars["UUID"];
  lastName: Scalars["String"];
  name: Scalars["String"];
  nick: Maybe<Scalars["String"]>;
  phone: Maybe<Scalars["String"]>;
};

export type Query = {
  __typename?: "Query";
  allCommandments: Array<Commandments>;
  allMovies: Array<Movie>;
  allUsers: Array<PublicUser>;
  archivedMovies: Array<Movie>;
  currentUser: User;
  filmstadenCities: Array<FilmstadenCityAlias>;
  filmstadenShowings: Array<FilmstadenShowing>;
  movie: Maybe<Movie>;
  previouslyUsedLocations: Array<Scalars["String"]>;
  publicShowings: Array<Showing>;
  randomCommandment: Commandments;
  showing: Maybe<Showing>;
  showingForMovie: Array<Showing>;
};

export type QueryFilmstadenShowingsArgs = {
  afterDate: InputMaybe<Scalars["LocalDate"]>;
  city?: InputMaybe<Scalars["String"]>;
  movieID: Scalars["UUID"];
};

export type QueryMovieArgs = {
  id: Scalars["UUID"];
};

export type QueryPublicShowingsArgs = {
  afterDate: InputMaybe<Scalars["LocalDate"]>;
};

export type QueryShowingArgs = {
  id: InputMaybe<Scalars["UUID"]>;
  webID: InputMaybe<Scalars["Base64ID"]>;
};

export type QueryShowingForMovieArgs = {
  movieId: InputMaybe<Scalars["UUID"]>;
};

export enum Role {
  ShowingAdmin = "SHOWING_ADMIN",
  User = "USER",
}

export type Seat = {
  __typename?: "Seat";
  number: Scalars["Int"];
  row: Scalars["Int"];
};

export type SeatRange = {
  __typename?: "SeatRange";
  numbers: Array<Scalars["Int"]>;
  row: Scalars["Int"];
};

export type Showing = {
  __typename?: "Showing";
  admin: PublicUser;
  adminPaymentDetails: Maybe<AdminPaymentDetails>;
  attendeePaymentDetails: Maybe<AttendeePaymentDetails>;
  attendees: Array<PublicAttendee>;
  cinemaScreen: Maybe<CinemaScreen>;
  createTime: Scalars["Time"];
  date: Scalars["LocalDate"];
  filmstadenSeatMap: Array<FilmstadenSeatMap>;
  filmstadenShowingID: Maybe<Scalars["String"]>;
  id: Scalars["UUID"];
  location: Scalars["String"];
  movie: Movie;
  movieID: Scalars["UUID"];
  myTickets: Array<Ticket>;
  payToUser: PublicUser;
  price: Maybe<Scalars["SEK"]>;
  private: Scalars["Boolean"];
  slug: Scalars["String"];
  ticketRange: Maybe<TicketRange>;
  ticketsBought: Scalars["Boolean"];
  time: Scalars["LocalTime"];
  updateTime: Scalars["Time"];
  webID: Scalars["Base64ID"];
};

export type Ticket = {
  __typename?: "Ticket";
  assignedToUser: Scalars["UUID"];
  attributes: Array<Scalars["String"]>;
  barcode: Scalars["String"];
  cinema: Scalars["String"];
  cinemaCity: Maybe<Scalars["String"]>;
  customerType: Scalars["String"];
  customerTypeDefinition: Scalars["String"];
  date: Scalars["LocalDate"];
  id: Scalars["String"];
  movieName: Scalars["String"];
  movieRating: Scalars["String"];
  profileID: Maybe<Scalars["String"]>;
  screen: Scalars["String"];
  seat: Seat;
  showingID: Scalars["UUID"];
  time: Scalars["String"];
};

export type TicketRange = {
  __typename?: "TicketRange";
  rows: Array<Scalars["Int"]>;
  seatings: Array<SeatRange>;
  totalCount: Scalars["Int"];
};

export type UpdateShowingInput = {
  date: Scalars["LocalDate"];
  filmstadenRemoteEntityID: InputMaybe<Scalars["String"]>;
  location: Scalars["String"];
  payToUser: Scalars["UUID"];
  price: Scalars["SEK"];
  time: Scalars["LocalTime"];
};

export type User = {
  __typename?: "User";
  avatarURL: Maybe<Scalars["String"]>;
  calendarFeedID: Maybe<Scalars["UUID"]>;
  calendarFeedUrl: Maybe<Scalars["String"]>;
  email: Scalars["String"];
  filmstadenMembershipID: Maybe<Scalars["FilmstadenMembershipID"]>;
  firstName: Scalars["String"];
  giftCertificates: Array<GiftCertificate>;
  id: Scalars["UUID"];
  lastLoginTime: Scalars["Time"];
  lastName: Scalars["String"];
  name: Scalars["String"];
  nick: Maybe<Scalars["String"]>;
  phone: Maybe<Scalars["String"]>;
  signupTime: Scalars["Time"];
  updateTime: Scalars["Time"];
};

export type UserDetailsInput = {
  filmstadenMembershipID: InputMaybe<Scalars["FilmstadenMembershipID"]>;
  firstName: InputMaybe<Scalars["String"]>;
  lastName: InputMaybe<Scalars["String"]>;
  nick: InputMaybe<Scalars["String"]>;
  phone: InputMaybe<Scalars["String"]>;
};

export type AddGiftCertificatesMutationVariables = Exact<{
  tickets: InputMaybe<Array<GiftCertificateInput> | GiftCertificateInput>;
}>;

export type AddGiftCertificatesMutation = {
  __typename?: "Mutation";
  addGiftCertificates: {
    __typename?: "User";
    id: string;
    giftCertificates: Array<{
      __typename?: "GiftCertificate";
      number: string;
      expireTime: import("@js-temporal/polyfill").Temporal.PlainDate;
      status: GiftCertificate_Status;
    }>;
  };
};

export type AddTicketsMutationVariables = Exact<{
  showingId: Scalars["UUID"];
  tickets: InputMaybe<Array<Scalars["String"]> | Scalars["String"]>;
}>;

export type AddTicketsMutation = {
  __typename?: "Mutation";
  processTicketUrls: { __typename?: "Showing" } & TicketFragment;
};

export type AttendShowingMutationVariables = Exact<{
  showingId: Scalars["UUID"];
  paymentOption: PaymentOption;
}>;

export type AttendShowingMutation = {
  __typename?: "Mutation";
  attendShowing: { __typename?: "Showing" } & ShowingParticipantFragment;
};

export type DeleteGiftCertificateMutationVariables = Exact<{
  ticket: GiftCertificateInput;
}>;

export type DeleteGiftCertificateMutation = {
  __typename?: "Mutation";
  deleteGiftCertificate: {
    __typename?: "User";
    id: string;
    giftCertificates: Array<{
      __typename?: "GiftCertificate";
      number: string;
      expireTime: import("@js-temporal/polyfill").Temporal.PlainDate;
      status: GiftCertificate_Status;
    }>;
  };
};

export type DeleteShowingMutationVariables = Exact<{
  showingId: Scalars["UUID"];
}>;

export type DeleteShowingMutation = {
  __typename?: "Mutation";
  deleteShowing: Array<{ __typename?: "Showing"; id: string }>;
};

export type MarkShowingAsBoughtVariables = Exact<{
  showingId: Scalars["UUID"];
  price: Scalars["SEK"];
}>;

export type MarkShowingAsBought = {
  __typename?: "Mutation";
  markAsBought: {
    __typename?: "Showing";
    id: string;
    ticketsBought: boolean;
    price: string | null | undefined;
    private: boolean;
    date: import("@js-temporal/polyfill").Temporal.PlainDate;
    time: import("@js-temporal/polyfill").Temporal.PlainTime;
    payToUser: { __typename?: "PublicUser"; id: string };
    myTickets: Array<{ __typename?: "Ticket"; id: string }>;
    attendeePaymentDetails:
      | {
          __typename?: "AttendeePaymentDetails";
          swishLink: string | null | undefined;
          hasPaid: boolean;
          amountOwed: string;
          payTo: {
            __typename?: "PublicUser";
            id: string;
            nick: string | null | undefined;
            firstName: string;
            lastName: string;
            phone: string | null | undefined;
          };
        }
      | null
      | undefined;
    adminPaymentDetails:
      | {
          __typename?: "AdminPaymentDetails";
          attendees: Array<{
            __typename?: "Attendee";
            userID: string;
            hasPaid: boolean;
            amountOwed: string;
            user: {
              __typename?: "PublicUser";
              id: string;
              nick: string | null | undefined;
              name: string;
              phone: string | null | undefined;
            };
          }>;
        }
      | null
      | undefined;
  };
};

export type PromoteToAdminMutationVariables = Exact<{
  showingId: Scalars["UUID"];
  userId: Scalars["UUID"];
}>;

export type PromoteToAdminMutation = {
  __typename?: "Mutation";
  promoteToAdmin: {
    __typename?: "Showing";
    admin: { __typename?: "PublicUser"; id: string };
    payToUser: { __typename?: "PublicUser"; id: string };
    attendeePaymentDetails:
      | {
          __typename?: "AttendeePaymentDetails";
          swishLink: string | null | undefined;
          hasPaid: boolean;
          amountOwed: string;
          payTo: {
            __typename?: "PublicUser";
            id: string;
            nick: string | null | undefined;
            firstName: string;
            lastName: string;
            phone: string | null | undefined;
          };
        }
      | null
      | undefined;
  };
};

export type ShowingParticipantFragment = {
  __typename?: "Showing";
  id: string;
  attendees: Array<{
    __typename?: "PublicAttendee";
    userInfo: {
      __typename?: "PublicUser";
      id: string;
      nick: string | null | undefined;
      firstName: string;
      lastName: string;
      avatarURL: string | null | undefined;
    };
  }>;
};

export type TogglePaidChangeMutationVariables = Exact<{
  paymentInfo: AttendeePaymentInfoInput;
}>;

export type TogglePaidChangeMutation = {
  __typename?: "Mutation";
  updateAttendeePaymentInfo: {
    __typename?: "Attendee";
    userID: string;
    hasPaid: boolean;
  };
};

export type UnattendShowingMutationVariables = Exact<{
  showingId: Scalars["UUID"];
}>;

export type UnattendShowingMutation = {
  __typename?: "Mutation";
  unattendShowing: { __typename?: "Showing" } & ShowingParticipantFragment;
};

export type UpdateShowingMutationVariables = Exact<{
  showingId: Scalars["UUID"];
  showing: UpdateShowingInput;
}>;

export type UpdateShowingMutation = {
  __typename?: "Mutation";
  updateShowing: {
    __typename?: "Showing";
    id: string;
    time: import("@js-temporal/polyfill").Temporal.PlainTime;
    date: import("@js-temporal/polyfill").Temporal.PlainDate;
    ticketsBought: boolean;
    price: string | null | undefined;
    private: boolean;
    payToUser: { __typename?: "PublicUser"; id: string };
  };
};

export type MovieFragment = {
  __typename?: "Movie";
  id: string;
  poster: string | null | undefined;
  title: string;
  releaseDate: string;
};

export type ShowingFragment = {
  __typename?: "Showing";
  id: string;
  date: import("@js-temporal/polyfill").Temporal.PlainDate;
  time: import("@js-temporal/polyfill").Temporal.PlainTime;
  webID: string;
  slug: string;
  movie: { __typename?: "Movie" } & MovieFragment;
  myTickets: Array<{ __typename?: "Ticket"; id: string }>;
  attendees: Array<{
    __typename?: "PublicAttendee";
    userInfo: {
      __typename?: "PublicUser";
      id: string;
      avatarURL: string | null | undefined;
    };
  }>;
};

export type BioordQueryVariables = Exact<{ [key: string]: never }>;

export type BioordQuery = {
  __typename?: "Query";
  allCommandments: Array<{
    __typename?: "Commandments";
    number: number;
    phrase: string;
  }>;
};

export type EditShowingQueryVariables = Exact<{
  webID: Scalars["Base64ID"];
}>;

export type EditShowingQuery = {
  __typename?: "Query";
  previouslyUsedLocations: Array<string>;
  showing:
    | ({ __typename?: "Showing" } & EditShowingFragment)
    | null
    | undefined;
};

export type EditShowingFragment = {
  __typename?: "Showing";
  price: string | null | undefined;
  private: boolean;
  filmstadenShowingID: string | null | undefined;
  location: string;
  ticketsBought: boolean;
  admin: {
    __typename?: "PublicUser";
    id: string;
    name: string;
    nick: string | null | undefined;
  };
  payToUser: { __typename?: "PublicUser"; id: string };
} & ShowingFragment;

export type HomeQueryVariables = Exact<{ [key: string]: never }>;

export type HomeQuery = {
  __typename?: "Query";
  showings: Array<
    {
      __typename?: "Showing";
      id: string;
      webID: string;
      slug: string;
      date: import("@js-temporal/polyfill").Temporal.PlainDate;
      time: import("@js-temporal/polyfill").Temporal.PlainTime;
      admin: { __typename?: "PublicUser"; id: string };
      attendees: Array<{ __typename?: "PublicAttendee"; userID: string }>;
    } & ShowingFragment
  >;
  me: { __typename?: "User"; id: string };
};

export type CreateShowingQueryVariables = Exact<{
  movieID: Scalars["UUID"];
}>;

export type CreateShowingQuery = {
  __typename?: "Query";
  previouslyUsedLocations: Array<string>;
  movie:
    | ({ __typename?: "Movie"; releaseDate: string } & MovieFragment)
    | null
    | undefined;
  me: {
    __typename?: "User";
    id: string;
    nick: string | null | undefined;
    name: string;
  };
  filmstadenCities: Array<{
    __typename?: "FilmstadenCityAlias";
    name: string;
    alias: string;
  }>;
};

export type CreateShowingMutationVariables = Exact<{
  showing: CreateShowingInput;
}>;

export type CreateShowingMutation = {
  __typename?: "Mutation";
  showing: { __typename?: "Showing" } & ShowingFragment;
};

export type FetchMoviesMutationVariables = Exact<{ [key: string]: never }>;

export type FetchMoviesMutation = {
  __typename?: "Mutation";
  fetchNewMoviesFromFilmstaden: Array<
    {
      __typename?: "Movie";
      id: string;
      popularity: number;
      releaseDate: string;
    } & MovieFragment
  >;
};

export type FilmstadenShowingsQueryVariables = Exact<{
  movieID: Scalars["UUID"];
  city: InputMaybe<Scalars["String"]>;
}>;

export type FilmstadenShowingsQuery = {
  __typename?: "Query";
  filmstadenShowings: Array<
    { __typename?: "FilmstadenShowing" } & FilmstadenShowingFragment
  >;
};

export type FilmstadenShowingFragment = {
  __typename?: "FilmstadenShowing";
  id: string;
  timeUtc: import("@js-temporal/polyfill").Temporal.PlainDate;
  tags: Array<string>;
  cinema: { __typename?: "FilmstadenCinema"; name: string; id: string };
  screen: { __typename?: "FilmstadenScreen"; name: string; id: string };
};

export type NewShowingQueryVariables = Exact<{ [key: string]: never }>;

export type NewShowingQuery = {
  __typename?: "Query";
  movies: Array<
    {
      __typename?: "Movie";
      id: string;
      popularity: number;
      releaseDate: string;
    } & MovieFragment
  >;
};

export type TicketFragment = {
  __typename?: "Showing";
  id: string;
  webID: string;
  slug: string;
  admin: { __typename?: "PublicUser"; id: string };
  ticketRange:
    | {
        __typename?: "TicketRange";
        rows: Array<number>;
        seatings: Array<{
          __typename?: "SeatRange";
          row: number;
          numbers: Array<number>;
        }>;
      }
    | null
    | undefined;
  filmstadenSeatMap: Array<{
    __typename?: "FilmstadenSeatMap";
    row: number;
    number: number;
    seatType: string;
    coordinates: {
      __typename?: "FilmstadenSeatCoordinates";
      x: number;
      y: number;
    };
    dimensions: {
      __typename?: "FilmstadenSeatDimensions";
      width: number;
      height: number;
    };
  }>;
  myTickets: Array<{
    __typename?: "Ticket";
    id: string;
    barcode: string;
    customerType: string;
    customerTypeDefinition: string;
    cinema: string;
    screen: string;
    profileID: string | null | undefined;
    date: import("@js-temporal/polyfill").Temporal.PlainDate;
    time: string;
    movieName: string;
    movieRating: string;
    attributes: Array<string>;
    seat: { __typename?: "Seat"; row: number; number: number };
  }>;
};

export type TicketQueryVariables = Exact<{
  webID: Scalars["Base64ID"];
}>;

export type TicketQuery = {
  __typename?: "Query";
  me: { __typename?: "User"; id: string };
  showing: ({ __typename?: "Showing" } & TicketFragment) | null | undefined;
};

export type ShowingsQueryVariables = Exact<{ [key: string]: never }>;

export type ShowingsQuery = {
  __typename?: "Query";
  showings: Array<
    {
      __typename?: "Showing";
      id: string;
      webID: string;
      slug: string;
      date: import("@js-temporal/polyfill").Temporal.PlainDate;
      time: import("@js-temporal/polyfill").Temporal.PlainTime;
    } & ShowingFragment
  >;
};

export type ParticipantsListFragment = {
  __typename?: "PublicAttendee";
  userInfo: {
    __typename?: "PublicUser";
    id: string;
    nick: string | null | undefined;
    firstName: string;
  } & UserItemFragment;
};

export type UserItemFragment = {
  __typename?: "PublicUser";
  avatarURL: string | null | undefined;
  firstName: string;
  nick: string | null | undefined;
  lastName: string;
  phone: string | null | undefined;
};

export type SingleShowingQueryVariables = Exact<{
  webID: Scalars["Base64ID"];
}>;

export type SingleShowingQuery = {
  __typename?: "Query";
  me: { __typename?: "User"; id: string } & PendingShowingFragment;
  showing:
    | ({
        __typename?: "Showing";
        webID: string;
        slug: string;
        price: string | null | undefined;
        private: boolean;
        location: string;
        admin: {
          __typename?: "PublicUser";
          id: string;
          name: string;
          nick: string | null | undefined;
        };
        movie: { __typename?: "Movie"; imdbID: string | null | undefined };
        attendees: Array<
          { __typename?: "PublicAttendee" } & ParticipantsListFragment
        >;
      } & ShowingFragment &
        ShowingAdminFragment &
        BoughtShowingFragment)
    | null
    | undefined;
};

export type BoughtShowingFragment = {
  __typename?: "Showing";
  myTickets: Array<{ __typename?: "Ticket"; id: string }>;
  attendeePaymentDetails:
    | {
        __typename?: "AttendeePaymentDetails";
        amountOwed: string;
        swishLink: string | null | undefined;
        hasPaid: boolean;
        payTo: {
          __typename?: "PublicUser";
          id: string;
          phone: string | null | undefined;
          firstName: string;
          nick: string | null | undefined;
          lastName: string;
        };
      }
    | null
    | undefined;
};

export type PendingShowingFragment = {
  __typename?: "User";
  giftCertificates: Array<{
    __typename?: "GiftCertificate";
    expireTime: import("@js-temporal/polyfill").Temporal.PlainDate;
    number: string;
    status: GiftCertificate_Status;
  }>;
};

export type ShowingAdminFragment = {
  __typename?: "Showing";
  id: string;
  price: string | null | undefined;
  private: boolean;
  filmstadenShowingID: string | null | undefined;
  ticketsBought: boolean;
  cinemaScreen:
    | { __typename?: "CinemaScreen"; id: string; name: string }
    | null
    | undefined;
  payToUser: { __typename?: "PublicUser"; id: string };
  adminPaymentDetails:
    | {
        __typename?: "AdminPaymentDetails";
        filmstadenBuyLink: string | null | undefined;
        attendees: Array<{
          __typename?: "Attendee";
          userID: string;
          hasPaid: boolean;
          amountOwed: string;
          filmstadenMembershipID: string | null | undefined;
          giftCertificateUsed:
            | { __typename?: "GiftCertificate"; number: string }
            | null
            | undefined;
          user: {
            __typename?: "PublicUser";
            id: string;
            nick: string | null | undefined;
            firstName: string;
            lastName: string;
            phone: string | null | undefined;
          };
        }>;
      }
    | null
    | undefined;
};

export type CompleteUser = {
  __typename?: "User";
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  nick: string | null | undefined;
  email: string;
  filmstadenMembershipID: string | null | undefined;
  phone: string | null | undefined;
  avatarURL: string | null | undefined;
};

export type GiftCertificateFragment = {
  __typename?: "GiftCertificate";
  number: string;
  expireTime: import("@js-temporal/polyfill").Temporal.PlainDate;
  status: GiftCertificate_Status;
};

export type UpdateUserMutationVariables = Exact<{
  user: UserDetailsInput;
}>;

export type UpdateUserMutation = {
  __typename?: "Mutation";
  editedUser: {
    __typename?: "User";
    calendarFeedUrl: string | null | undefined;
  } & CompleteUser;
};

export type UserProfileQueryVariables = Exact<{ [key: string]: never }>;

export type UserProfileQuery = {
  __typename?: "Query";
  me: {
    __typename?: "User";
    calendarFeedUrl: string | null | undefined;
    giftCertificates: Array<
      { __typename?: "GiftCertificate" } & GiftCertificateFragment
    >;
  } & CompleteUser;
};

export const ShowingParticipantFragment = gql`
  fragment ShowingParticipantFragment on Showing {
    id
    attendees {
      userInfo {
        id
        nick
        firstName
        lastName
        avatarURL
      }
    }
  }
`;
export const MovieFragment = gql`
  fragment MovieFragment on Movie {
    id
    poster
    title
    releaseDate
  }
`;
export const ShowingFragment = gql`
  fragment ShowingFragment on Showing {
    id
    date
    time
    webID
    slug
    movie {
      ...MovieFragment
    }
    myTickets {
      id
    }
    attendees {
      userInfo {
        id
        avatarURL
      }
    }
  }
  ${MovieFragment}
`;
export const EditShowingFragment = gql`
  fragment EditShowingFragment on Showing {
    ...ShowingFragment
    price
    private
    filmstadenShowingID
    location
    ticketsBought
    admin {
      id
      name
      nick
    }
    payToUser {
      id
    }
  }
  ${ShowingFragment}
`;
export const FilmstadenShowingFragment = gql`
  fragment FilmstadenShowingFragment on FilmstadenShowing {
    id
    cinema {
      name
      id: filmstadenID
    }
    screen {
      id: filmstadenID
      name
    }
    timeUtc
    tags
  }
`;
export const TicketFragment = gql`
  fragment TicketFragment on Showing {
    id
    webID
    slug
    admin {
      id
    }
    ticketRange {
      rows
      seatings {
        row
        numbers
      }
    }
    filmstadenSeatMap {
      row
      number
      seatType
      coordinates {
        x
        y
      }
      dimensions {
        width
        height
      }
    }
    myTickets {
      id
      barcode
      customerType
      customerTypeDefinition
      cinema
      screen
      profileID
      seat {
        row
        number
      }
      date
      time
      movieName
      movieRating
      attributes
    }
  }
`;
export const UserItemFragment = gql`
  fragment UserItemFragment on PublicUser {
    avatarURL
    firstName
    nick
    lastName
    phone
  }
`;
export const ParticipantsListFragment = gql`
  fragment ParticipantsListFragment on PublicAttendee {
    userInfo {
      ...UserItemFragment
      id
      nick
      firstName
    }
  }
  ${UserItemFragment}
`;
export const BoughtShowingFragment = gql`
  fragment BoughtShowingFragment on Showing {
    myTickets {
      id
    }
    attendeePaymentDetails {
      amountOwed
      swishLink
      hasPaid
      payTo {
        id
        phone
        firstName
        nick
        lastName
      }
    }
  }
`;
export const PendingShowingFragment = gql`
  fragment PendingShowingFragment on User {
    giftCertificates {
      expireTime
      number
      status
    }
  }
`;
export const ShowingAdminFragment = gql`
  fragment ShowingAdminFragment on Showing {
    id
    price
    private
    filmstadenShowingID
    ticketsBought
    cinemaScreen {
      id
      name
    }
    payToUser {
      id
    }
    adminPaymentDetails {
      filmstadenBuyLink
      attendees {
        userID
        hasPaid
        amountOwed
        filmstadenMembershipID
        giftCertificateUsed {
          number
        }
        user {
          id
          nick
          firstName
          lastName
          phone
        }
      }
    }
  }
`;
export const CompleteUser = gql`
  fragment CompleteUser on User {
    id
    name
    firstName
    lastName
    nick
    email
    filmstadenMembershipID
    phone
    avatarURL
  }
`;
export const GiftCertificateFragment = gql`
  fragment GiftCertificateFragment on GiftCertificate {
    number
    expireTime
    status
  }
`;
export const AddGiftCertificatesMutationDocument = gql`
  mutation AddGiftCertificatesMutation($tickets: [GiftCertificateInput!]) {
    addGiftCertificates(giftCerts: $tickets) {
      id
      giftCertificates {
        number
        expireTime
        status
      }
    }
  }
`;

export function useAddGiftCertificatesMutation() {
  return Urql.useMutation<
    AddGiftCertificatesMutation,
    AddGiftCertificatesMutationVariables
  >(AddGiftCertificatesMutationDocument);
}
export const AddTicketsMutationDocument = gql`
  mutation AddTicketsMutation($showingId: UUID!, $tickets: [String!]) {
    processTicketUrls(showingID: $showingId, ticketUrls: $tickets) {
      ...TicketFragment
    }
  }
  ${TicketFragment}
`;

export function useAddTicketsMutation() {
  return Urql.useMutation<AddTicketsMutation, AddTicketsMutationVariables>(
    AddTicketsMutationDocument
  );
}
export const AttendShowingMutationDocument = gql`
  mutation AttendShowingMutation(
    $showingId: UUID!
    $paymentOption: PaymentOption!
  ) {
    attendShowing(showingID: $showingId, paymentOption: $paymentOption) {
      ...ShowingParticipantFragment
    }
  }
  ${ShowingParticipantFragment}
`;

export function useAttendShowingMutation() {
  return Urql.useMutation<
    AttendShowingMutation,
    AttendShowingMutationVariables
  >(AttendShowingMutationDocument);
}
export const DeleteGiftCertificateMutationDocument = gql`
  mutation DeleteGiftCertificateMutation($ticket: GiftCertificateInput!) {
    deleteGiftCertificate(giftCert: $ticket) {
      id
      giftCertificates {
        number
        expireTime
        status
      }
    }
  }
`;

export function useDeleteGiftCertificateMutation() {
  return Urql.useMutation<
    DeleteGiftCertificateMutation,
    DeleteGiftCertificateMutationVariables
  >(DeleteGiftCertificateMutationDocument);
}
export const DeleteShowingMutationDocument = gql`
  mutation DeleteShowingMutation($showingId: UUID!) {
    deleteShowing(showingID: $showingId) {
      id
    }
  }
`;

export function useDeleteShowingMutation() {
  return Urql.useMutation<
    DeleteShowingMutation,
    DeleteShowingMutationVariables
  >(DeleteShowingMutationDocument);
}
export const MarkShowingAsBoughtDocument = gql`
  mutation MarkShowingAsBought($showingId: UUID!, $price: SEK!) {
    markAsBought(showingID: $showingId, price: $price) {
      id
      ticketsBought
      price
      private
      payToUser {
        id
      }
      date
      time
      myTickets {
        id
      }
      attendeePaymentDetails {
        payTo {
          id
          nick
          firstName
          lastName
          phone
        }
        swishLink
        hasPaid
        amountOwed
      }
      adminPaymentDetails {
        attendees {
          userID
          hasPaid
          amountOwed
          user {
            id
            nick
            name
            phone
          }
        }
      }
    }
  }
`;

export function useMarkShowingAsBought() {
  return Urql.useMutation<MarkShowingAsBought, MarkShowingAsBoughtVariables>(
    MarkShowingAsBoughtDocument
  );
}
export const PromoteToAdminMutationDocument = gql`
  mutation PromoteToAdminMutation($showingId: UUID!, $userId: UUID!) {
    promoteToAdmin(showingID: $showingId, userToPromote: $userId) {
      admin {
        id
      }
      payToUser {
        id
      }
      attendeePaymentDetails {
        payTo {
          id
          nick
          firstName
          lastName
          phone
        }
        swishLink
        hasPaid
        amountOwed
      }
    }
  }
`;

export function usePromoteToAdminMutation() {
  return Urql.useMutation<
    PromoteToAdminMutation,
    PromoteToAdminMutationVariables
  >(PromoteToAdminMutationDocument);
}
export const TogglePaidChangeMutationDocument = gql`
  mutation TogglePaidChangeMutation($paymentInfo: AttendeePaymentInfoInput!) {
    updateAttendeePaymentInfo(paymentInfo: $paymentInfo) {
      userID
      hasPaid
    }
  }
`;

export function useTogglePaidChangeMutation() {
  return Urql.useMutation<
    TogglePaidChangeMutation,
    TogglePaidChangeMutationVariables
  >(TogglePaidChangeMutationDocument);
}
export const UnattendShowingMutationDocument = gql`
  mutation UnattendShowingMutation($showingId: UUID!) {
    unattendShowing(showingID: $showingId) {
      ...ShowingParticipantFragment
    }
  }
  ${ShowingParticipantFragment}
`;

export function useUnattendShowingMutation() {
  return Urql.useMutation<
    UnattendShowingMutation,
    UnattendShowingMutationVariables
  >(UnattendShowingMutationDocument);
}
export const UpdateShowingMutationDocument = gql`
  mutation UpdateShowingMutation(
    $showingId: UUID!
    $showing: UpdateShowingInput!
  ) {
    updateShowing(showingID: $showingId, newValues: $showing) {
      id
      time
      date
      ticketsBought
      price
      private
      payToUser {
        id
      }
    }
  }
`;

export function useUpdateShowingMutation() {
  return Urql.useMutation<
    UpdateShowingMutation,
    UpdateShowingMutationVariables
  >(UpdateShowingMutationDocument);
}
export const BioordQueryDocument = gql`
  query BioordQuery {
    allCommandments {
      number
      phrase
    }
  }
`;

export function useBioordQuery(
  options: Omit<Urql.UseQueryArgs<BioordQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<BioordQuery>({ query: BioordQueryDocument, ...options });
}
export const EditShowingQueryDocument = gql`
  query EditShowingQuery($webID: Base64ID!) {
    showing(webID: $webID) {
      ...EditShowingFragment
    }
    previouslyUsedLocations
  }
  ${EditShowingFragment}
`;

export function useEditShowingQuery(
  options: Omit<Urql.UseQueryArgs<EditShowingQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<EditShowingQuery>({
    query: EditShowingQueryDocument,
    ...options,
  });
}
export const HomeQueryDocument = gql`
  query HomeQuery {
    showings: publicShowings {
      ...ShowingFragment
      id
      webID
      slug
      date
      time
      admin {
        id
      }
      attendees {
        userID
      }
    }
    me: currentUser {
      id
    }
  }
  ${ShowingFragment}
`;

export function useHomeQuery(
  options: Omit<Urql.UseQueryArgs<HomeQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<HomeQuery>({ query: HomeQueryDocument, ...options });
}
export const CreateShowingQueryDocument = gql`
  query CreateShowingQuery($movieID: UUID!) {
    movie(id: $movieID) {
      ...MovieFragment
      releaseDate
    }
    me: currentUser {
      id
      nick
      name
    }
    previouslyUsedLocations
    filmstadenCities {
      name
      alias
    }
  }
  ${MovieFragment}
`;

export function useCreateShowingQuery(
  options: Omit<Urql.UseQueryArgs<CreateShowingQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<CreateShowingQuery>({
    query: CreateShowingQueryDocument,
    ...options,
  });
}
export const CreateShowingMutationDocument = gql`
  mutation CreateShowingMutation($showing: CreateShowingInput!) {
    showing: createShowing(showing: $showing) {
      ...ShowingFragment
    }
  }
  ${ShowingFragment}
`;

export function useCreateShowingMutation() {
  return Urql.useMutation<
    CreateShowingMutation,
    CreateShowingMutationVariables
  >(CreateShowingMutationDocument);
}
export const FetchMoviesMutationDocument = gql`
  mutation FetchMoviesMutation {
    fetchNewMoviesFromFilmstaden {
      ...MovieFragment
      id
      popularity
      releaseDate
    }
  }
  ${MovieFragment}
`;

export function useFetchMoviesMutation() {
  return Urql.useMutation<FetchMoviesMutation, FetchMoviesMutationVariables>(
    FetchMoviesMutationDocument
  );
}
export const FilmstadenShowingsQueryDocument = gql`
  query FilmstadenShowingsQuery($movieID: UUID!, $city: String) {
    filmstadenShowings(movieID: $movieID, city: $city) {
      ...FilmstadenShowingFragment
    }
  }
  ${FilmstadenShowingFragment}
`;

export function useFilmstadenShowingsQuery(
  options: Omit<
    Urql.UseQueryArgs<FilmstadenShowingsQueryVariables>,
    "query"
  > = {}
) {
  return Urql.useQuery<FilmstadenShowingsQuery>({
    query: FilmstadenShowingsQueryDocument,
    ...options,
  });
}
export const NewShowingQueryDocument = gql`
  query NewShowingQuery {
    movies: allMovies {
      ...MovieFragment
      id
      popularity
      releaseDate
    }
  }
  ${MovieFragment}
`;

export function useNewShowingQuery(
  options: Omit<Urql.UseQueryArgs<NewShowingQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<NewShowingQuery>({
    query: NewShowingQueryDocument,
    ...options,
  });
}
export const TicketQueryDocument = gql`
  query TicketQuery($webID: Base64ID!) {
    me: currentUser {
      id
    }
    showing(webID: $webID) {
      ...TicketFragment
    }
  }
  ${TicketFragment}
`;

export function useTicketQuery(
  options: Omit<Urql.UseQueryArgs<TicketQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<TicketQuery>({ query: TicketQueryDocument, ...options });
}
export const ShowingsQueryDocument = gql`
  query ShowingsQuery {
    showings: publicShowings {
      ...ShowingFragment
      id
      webID
      slug
      date
      time
    }
  }
  ${ShowingFragment}
`;

export function useShowingsQuery(
  options: Omit<Urql.UseQueryArgs<ShowingsQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<ShowingsQuery>({
    query: ShowingsQueryDocument,
    ...options,
  });
}
export const SingleShowingQueryDocument = gql`
  query SingleShowingQuery($webID: Base64ID!) {
    me: currentUser {
      ...PendingShowingFragment
      id
    }
    showing(webID: $webID) {
      ...ShowingFragment
      ...ShowingAdminFragment
      ...BoughtShowingFragment
      webID
      slug
      price
      private
      location
      admin {
        id
        name
        nick
      }
      movie {
        imdbID
      }
      attendees {
        ...ParticipantsListFragment
      }
    }
  }
  ${PendingShowingFragment}
  ${ShowingFragment}
  ${ShowingAdminFragment}
  ${BoughtShowingFragment}
  ${ParticipantsListFragment}
`;

export function useSingleShowingQuery(
  options: Omit<Urql.UseQueryArgs<SingleShowingQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<SingleShowingQuery>({
    query: SingleShowingQueryDocument,
    ...options,
  });
}
export const UpdateUserMutationDocument = gql`
  mutation UpdateUserMutation($user: UserDetailsInput!) {
    editedUser: updateUser(newInfo: $user) {
      ...CompleteUser
      calendarFeedUrl
    }
  }
  ${CompleteUser}
`;

export function useUpdateUserMutation() {
  return Urql.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(
    UpdateUserMutationDocument
  );
}
export const UserProfileQueryDocument = gql`
  query UserProfileQuery {
    me: currentUser {
      ...CompleteUser
      calendarFeedUrl
      giftCertificates {
        ...GiftCertificateFragment
      }
    }
  }
  ${CompleteUser}
  ${GiftCertificateFragment}
`;

export function useUserProfileQuery(
  options: Omit<Urql.UseQueryArgs<UserProfileQueryVariables>, "query"> = {}
) {
  return Urql.useQuery<UserProfileQuery>({
    query: UserProfileQueryDocument,
    ...options,
  });
}
