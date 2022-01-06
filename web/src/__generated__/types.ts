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
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Base64ID: any;
  FilmstadenMembershipID: any;
  IMDbID: any;
  LocalDate: any;
  LocalTime: any;
  SEK: any;
  TMDbID: any;
  Time: any;
  UUID: any;
};

export type AdminPaymentDetails = {
  __typename?: "AdminPaymentDetails";
  attendees: Array<Attendee>;
  filmstadenBuyLink?: Maybe<Scalars["String"]>;
  showingID: Scalars["UUID"];
};

export type Attendee = {
  __typename?: "Attendee";
  amountOwed: Scalars["SEK"];
  filmstadenMembershipID?: Maybe<Scalars["String"]>;
  giftCertificateUsed?: Maybe<GiftCertificate>;
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
  swishLink?: Maybe<Scalars["String"]>;
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
  name?: InputMaybe<Scalars["String"]>;
};

export type Commandments = {
  __typename?: "Commandments";
  number: Scalars["Int"];
  phrase: Scalars["String"];
};

export type CreateShowingInput = {
  date: Scalars["LocalDate"];
  filmstadenRemoteEntityID?: InputMaybe<Scalars["String"]>;
  filmstadenScreen?: InputMaybe<CinemaScreenInput>;
  location: Scalars["String"];
  movieID: Scalars["UUID"];
  time: Scalars["LocalTime"];
};

export type FilmstadenCityAlias = {
  __typename?: "FilmstadenCityAlias";
  alias: Scalars["String"];
  name: Scalars["String"];
};

export type FilmstadenLiteScreen = {
  __typename?: "FilmstadenLiteScreen";
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
  cinemaName: Scalars["String"];
  filmstadenRemoteEntityID: Scalars["String"];
  screen: FilmstadenLiteScreen;
  seatCount: Scalars["Int"];
  tags: Array<Scalars["String"]>;
  timeUtc: Scalars["String"];
};

export type GiftCertificate = {
  __typename?: "GiftCertificate";
  expireTime: Scalars["Time"];
  number: Scalars["String"];
  status: GiftCertificate_Status;
};

export type GiftCertificateInput = {
  expireTime?: InputMaybe<Scalars["Time"]>;
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
  imdbID?: Maybe<Scalars["IMDbID"]>;
  popularity: Scalars["Float"];
  poster?: Maybe<Scalars["String"]>;
  productionYear: Scalars["Int"];
  releaseDate: Scalars["String"];
  runtime: Scalars["String"];
  slug: Scalars["String"];
  title: Scalars["String"];
  tmdbID?: Maybe<Scalars["TMDbID"]>;
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
  giftCerts?: InputMaybe<Array<GiftCertificateInput>>;
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
  ticketUrls?: InputMaybe<Array<Scalars["String"]>>;
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
  newValues?: InputMaybe<UpdateShowingInput>;
  showingID: Scalars["UUID"];
};

export type MutationUpdateUserArgs = {
  newInfo: UserDetailsInput;
};

export type PaymentOption = {
  ticketNumber?: InputMaybe<Scalars["String"]>;
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
  avatarURL?: Maybe<Scalars["String"]>;
  firstName: Scalars["String"];
  id: Scalars["UUID"];
  lastName: Scalars["String"];
  name: Scalars["String"];
  nick?: Maybe<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
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
  movie?: Maybe<Movie>;
  previouslyUsedLocations: Array<Scalars["String"]>;
  publicShowings: Array<Showing>;
  randomCommandment: Commandments;
  showing?: Maybe<Showing>;
  showingForMovie: Array<Showing>;
};

export type QueryFilmstadenShowingsArgs = {
  afterDate?: InputMaybe<Scalars["LocalDate"]>;
  city?: InputMaybe<Scalars["String"]>;
  movieID: Scalars["UUID"];
};

export type QueryMovieArgs = {
  id: Scalars["UUID"];
};

export type QueryPublicShowingsArgs = {
  afterDate?: InputMaybe<Scalars["LocalDate"]>;
};

export type QueryShowingArgs = {
  id?: InputMaybe<Scalars["UUID"]>;
  webID?: InputMaybe<Scalars["Base64ID"]>;
};

export type QueryShowingForMovieArgs = {
  movieId?: InputMaybe<Scalars["UUID"]>;
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
  adminPaymentDetails?: Maybe<AdminPaymentDetails>;
  attendeePaymentDetails?: Maybe<AttendeePaymentDetails>;
  attendees: Array<PublicAttendee>;
  cinemaScreen?: Maybe<CinemaScreen>;
  createTime: Scalars["Time"];
  date: Scalars["LocalDate"];
  filmstadenSeatMap: Array<FilmstadenSeatMap>;
  filmstadenShowingID?: Maybe<Scalars["String"]>;
  id: Scalars["UUID"];
  location: Scalars["String"];
  movie: Movie;
  movieID: Scalars["UUID"];
  myTickets: Array<Ticket>;
  payToUser: PublicUser;
  price?: Maybe<Scalars["SEK"]>;
  private: Scalars["Boolean"];
  slug: Scalars["String"];
  ticketRange?: Maybe<TicketRange>;
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
  cinemaCity?: Maybe<Scalars["String"]>;
  customerType: Scalars["String"];
  customerTypeDefinition: Scalars["String"];
  date: Scalars["LocalDate"];
  id: Scalars["String"];
  movieName: Scalars["String"];
  movieRating: Scalars["String"];
  profileID?: Maybe<Scalars["String"]>;
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
  filmstadenRemoteEntityID?: InputMaybe<Scalars["String"]>;
  location: Scalars["String"];
  payToUser: Scalars["UUID"];
  price: Scalars["SEK"];
  time: Scalars["LocalTime"];
};

export type User = {
  __typename?: "User";
  avatarURL?: Maybe<Scalars["String"]>;
  calendarFeedID?: Maybe<Scalars["UUID"]>;
  calendarFeedUrl?: Maybe<Scalars["String"]>;
  email: Scalars["String"];
  filmstadenMembershipID?: Maybe<Scalars["FilmstadenMembershipID"]>;
  firstName: Scalars["String"];
  giftCertificates: Array<GiftCertificate>;
  id: Scalars["UUID"];
  lastLoginTime: Scalars["Time"];
  lastName: Scalars["String"];
  name: Scalars["String"];
  nick?: Maybe<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
  signupTime: Scalars["Time"];
  updateTime: Scalars["Time"];
};

export type UserDetailsInput = {
  filmstadenMembershipID?: InputMaybe<Scalars["FilmstadenMembershipID"]>;
  firstName?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  nick?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
};

export type ShowingParticipantFragment = {
  __typename?: "Showing";
  id: any;
  attendees: Array<{
    __typename?: "PublicAttendee";
    userInfo: {
      __typename?: "PublicUser";
      id: any;
      nick?: string | null | undefined;
      firstName: string;
      lastName: string;
      avatarURL?: string | null | undefined;
    };
  }>;
};

export type AttendShowingMutationVariables = Exact<{
  showingId: Scalars["UUID"];
  paymentOption: PaymentOption;
}>;

export type AttendShowingMutation = {
  __typename?: "Mutation";
  attendShowing: { __typename?: "Showing" } & ShowingParticipantFragment;
};

export type UnattendShowingMutationVariables = Exact<{
  showingId: Scalars["UUID"];
}>;

export type UnattendShowingMutation = {
  __typename?: "Mutation";
  unattendShowing: { __typename?: "Showing" } & ShowingParticipantFragment;
};

export type DeleteShowingMutationVariables = Exact<{
  showingId: Scalars["UUID"];
}>;

export type DeleteShowingMutation = {
  __typename?: "Mutation";
  deleteShowing: Array<{ __typename?: "Showing"; id: any }>;
};

export type MarkShowingAsBoughtMutationVariables = Exact<{
  showingId: Scalars["UUID"];
  price: Scalars["SEK"];
}>;

export type MarkShowingAsBoughtMutation = {
  __typename?: "Mutation";
  markAsBought: {
    __typename?: "Showing";
    id: any;
    ticketsBought: boolean;
    price?: any | null | undefined;
    private: boolean;
    date: any;
    time: any;
    payToUser: { __typename?: "PublicUser"; id: any };
    myTickets: Array<{ __typename?: "Ticket"; id: string }>;
    attendeePaymentDetails?:
      | {
          __typename?: "AttendeePaymentDetails";
          swishLink?: string | null | undefined;
          hasPaid: boolean;
          amountOwed: any;
          payTo: {
            __typename?: "PublicUser";
            id: any;
            nick?: string | null | undefined;
            firstName: string;
            lastName: string;
            phone?: string | null | undefined;
          };
        }
      | null
      | undefined;
    adminPaymentDetails?:
      | {
          __typename?: "AdminPaymentDetails";
          attendees: Array<{
            __typename?: "Attendee";
            userID: any;
            hasPaid: boolean;
            amountOwed: any;
            user: {
              __typename?: "PublicUser";
              id: any;
              nick?: string | null | undefined;
              name: string;
              phone?: string | null | undefined;
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
    admin: { __typename?: "PublicUser"; id: any };
    payToUser: { __typename?: "PublicUser"; id: any };
    attendeePaymentDetails?:
      | {
          __typename?: "AttendeePaymentDetails";
          swishLink?: string | null | undefined;
          hasPaid: boolean;
          amountOwed: any;
          payTo: {
            __typename?: "PublicUser";
            id: any;
            nick?: string | null | undefined;
            firstName: string;
            lastName: string;
            phone?: string | null | undefined;
          };
        }
      | null
      | undefined;
  };
};

export type TogglePaidChangeMutationVariables = Exact<{
  paymentInfo: AttendeePaymentInfoInput;
}>;

export type TogglePaidChangeMutation = {
  __typename?: "Mutation";
  updateAttendeePaymentInfo: {
    __typename?: "Attendee";
    userID: any;
    hasPaid: boolean;
  };
};

export type UpdateShowingMutationVariables = Exact<{
  showingId: Scalars["UUID"];
  showing: UpdateShowingInput;
}>;

export type UpdateShowingMutation = {
  __typename?: "Mutation";
  updateShowing: {
    __typename?: "Showing";
    id: any;
    time: any;
    date: any;
    ticketsBought: boolean;
    price?: any | null | undefined;
    private: boolean;
    payToUser: { __typename?: "PublicUser"; id: any };
  };
};

export type TicketFragment = {
  __typename?: "Showing";
  id: any;
  webID: any;
  slug: string;
  admin: { __typename?: "PublicUser"; id: any };
  ticketRange?:
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
    profileID?: string | null | undefined;
    date: any;
    time: string;
    movieName: string;
    movieRating: string;
    attributes: Array<string>;
    seat: { __typename?: "Seat"; row: number; number: number };
  }>;
};

export type AddTicketsMutationVariables = Exact<{
  showingId: Scalars["UUID"];
  tickets?: InputMaybe<Array<Scalars["String"]> | Scalars["String"]>;
}>;

export type AddTicketsMutation = {
  __typename?: "Mutation";
  processTicketUrls: { __typename?: "Showing" } & TicketFragment;
};

export type UpdateUserMutationVariables = Exact<{
  user: UserDetailsInput;
}>;

export type UpdateUserMutation = {
  __typename?: "Mutation";
  editedUser: {
    __typename?: "User";
    calendarFeedUrl?: string | null | undefined;
  } & CompleteUserFragment;
};

export type CompleteUserFragment = {
  __typename?: "User";
  id: any;
  name: string;
  firstName: string;
  lastName: string;
  nick?: string | null | undefined;
  email: string;
  filmstadenMembershipID?: any | null | undefined;
  phone?: string | null | undefined;
  avatarURL?: string | null | undefined;
  giftCertificates: Array<{
    __typename?: "GiftCertificate";
    number: string;
    expireTime: any;
    status: GiftCertificate_Status;
  }>;
};

export type FetchMoviesMutationVariables = Exact<{ [key: string]: never }>;

export type FetchMoviesMutation = {
  __typename?: "Mutation";
  fetchNewMoviesFromFilmstaden: Array<
    {
      __typename?: "Movie";
      id: any;
      popularity: number;
      releaseDate: string;
    } & MovieFragment
  >;
};

export type MovieFragment = {
  __typename?: "Movie";
  id: any;
  poster?: string | null | undefined;
  title: string;
  releaseDate: string;
};

export type ShowingMovieFragment = {
  __typename?: "Movie";
  id: any;
  title: string;
  poster?: string | null | undefined;
};

export type OldShowingFragment = {
  __typename?: "Showing";
  id: any;
  webID: any;
  slug: string;
  date: any;
  time: any;
  location: string;
  ticketsBought: boolean;
  movie: { __typename?: "Movie" } & ShowingMovieFragment;
  admin: {
    __typename?: "PublicUser";
    id: any;
    name: string;
    nick?: string | null | undefined;
  };
};

export type ShowingNeueFragment = {
  __typename?: "Showing";
  id: any;
  date: any;
  time: any;
  webID: any;
  slug: string;
  movie: {
    __typename?: "Movie";
    id: any;
    poster?: string | null | undefined;
    title: string;
  };
  myTickets: Array<{ __typename?: "Ticket"; id: string }>;
  attendees: Array<{
    __typename?: "PublicAttendee";
    userInfo: {
      __typename?: "PublicUser";
      id: any;
      avatarURL?: string | null | undefined;
    };
  }>;
};

export type BioordQueryQueryVariables = Exact<{ [key: string]: never }>;

export type BioordQueryQuery = {
  __typename?: "Query";
  allBiobudord: Array<{
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
  me: { __typename?: "User"; id: any };
  showing?:
    | ({
        __typename?: "Showing";
        price?: any | null | undefined;
        private: boolean;
        filmstadenShowingID?: string | null | undefined;
        location: string;
        payToUser: { __typename?: "PublicUser"; id: any };
      } & OldShowingFragment)
    | null
    | undefined;
};

export type HomeQueryQueryVariables = Exact<{ [key: string]: never }>;

export type HomeQueryQuery = {
  __typename?: "Query";
  showings: Array<
    {
      __typename?: "Showing";
      id: any;
      webID: any;
      slug: string;
      date: any;
      time: any;
      admin: { __typename?: "PublicUser"; id: any };
      attendees: Array<{ __typename?: "PublicAttendee"; userID: any }>;
    } & ShowingNeueFragment
  >;
  me: { __typename?: "User"; id: any };
};

export type CreateShowingQueryQueryVariables = Exact<{
  movieID: Scalars["UUID"];
}>;

export type CreateShowingQueryQuery = {
  __typename?: "Query";
  previouslyUsedLocations: Array<string>;
  movie?:
    | ({ __typename?: "Movie"; releaseDate: string } & ShowingMovieFragment)
    | null
    | undefined;
  me: {
    __typename?: "User";
    id: any;
    nick?: string | null | undefined;
    name: string;
  };
  filmstadenCities: Array<{
    __typename?: "FilmstadenCityAlias";
    name: string;
    alias: string;
  }>;
};

export type NewShowingQueryQueryVariables = Exact<{ [key: string]: never }>;

export type NewShowingQueryQuery = {
  __typename?: "Query";
  movies: Array<
    {
      __typename?: "Movie";
      id: any;
      popularity: number;
      releaseDate: string;
    } & MovieFragment
  >;
};

export type CreateShowingMutationVariables = Exact<{
  showing: CreateShowingInput;
}>;

export type CreateShowingMutation = {
  __typename?: "Mutation";
  showing: { __typename?: "Showing" } & OldShowingFragment;
};

export type FsShowingsQueryQueryVariables = Exact<{
  movieID: Scalars["UUID"];
  city?: InputMaybe<Scalars["String"]>;
}>;

export type FsShowingsQueryQuery = {
  __typename?: "Query";
  filmstadenShowings: Array<{
    __typename?: "FilmstadenShowing";
    cinemaName: string;
    timeUtc: string;
    tags: Array<string>;
    filmstadenRemoteEntityID: string;
    screen: {
      __typename?: "FilmstadenLiteScreen";
      filmstadenID: string;
      name: string;
    };
  }>;
};

export type TicketQueryQueryVariables = Exact<{
  webID: Scalars["Base64ID"];
}>;

export type TicketQueryQuery = {
  __typename?: "Query";
  me: { __typename?: "User"; id: any };
  showing?: ({ __typename?: "Showing" } & TicketFragment) | null | undefined;
};

export type ShowingsQueryQueryVariables = Exact<{ [key: string]: never }>;

export type ShowingsQueryQuery = {
  __typename?: "Query";
  showings: Array<
    {
      __typename?: "Showing";
      id: any;
      webID: any;
      slug: string;
      date: any;
      time: any;
    } & ShowingNeueFragment
  >;
};

export type ShowingAdminFragment = {
  __typename?: "Showing";
  id: any;
  price?: any | null | undefined;
  private: boolean;
  filmstadenShowingID?: string | null | undefined;
  ticketsBought: boolean;
  cinemaScreen?:
    | { __typename?: "CinemaScreen"; id: string; name: string }
    | null
    | undefined;
  payToUser: { __typename?: "PublicUser"; id: any };
  adminPaymentDetails?:
    | {
        __typename?: "AdminPaymentDetails";
        filmstadenBuyLink?: string | null | undefined;
        attendees: Array<{
          __typename?: "Attendee";
          userID: any;
          hasPaid: boolean;
          amountOwed: any;
          filmstadenMembershipID?: string | null | undefined;
          giftCertificateUsed?:
            | { __typename?: "GiftCertificate"; number: string }
            | null
            | undefined;
          user: {
            __typename?: "PublicUser";
            id: any;
            nick?: string | null | undefined;
            firstName: string;
            lastName: string;
            phone?: string | null | undefined;
          };
        }>;
      }
    | null
    | undefined;
};

export type BoughtShowingFragment = {
  __typename?: "Showing";
  myTickets: Array<{ __typename?: "Ticket"; id: string }>;
  attendeePaymentDetails?:
    | {
        __typename?: "AttendeePaymentDetails";
        amountOwed: any;
        swishLink?: string | null | undefined;
        hasPaid: boolean;
        payTo: {
          __typename?: "PublicUser";
          id: any;
          phone?: string | null | undefined;
          firstName: string;
          nick?: string | null | undefined;
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
    expireTime: any;
    number: string;
    status: GiftCertificate_Status;
  }>;
};

export type ParticipantsListFragment = {
  __typename?: "PublicAttendee";
  userInfo: {
    __typename?: "PublicUser";
    id: any;
    nick?: string | null | undefined;
    firstName: string;
  } & UserItemFragment;
};

export type UserItemFragment = {
  __typename?: "PublicUser";
  avatarURL?: string | null | undefined;
  firstName: string;
  nick?: string | null | undefined;
  lastName: string;
  phone?: string | null | undefined;
};

export type SingleShowingQueryVariables = Exact<{
  webID: Scalars["Base64ID"];
}>;

export type SingleShowingQuery = {
  __typename?: "Query";
  me: { __typename?: "User"; id: any } & PendingShowingFragment;
  showing?:
    | ({
        __typename?: "Showing";
        webID: any;
        slug: string;
        price?: any | null | undefined;
        private: boolean;
        movie: { __typename?: "Movie"; imdbID?: any | null | undefined };
        attendees: Array<
          { __typename?: "PublicAttendee" } & ParticipantsListFragment
        >;
      } & OldShowingFragment &
        ShowingAdminFragment &
        BoughtShowingFragment)
    | null
    | undefined;
};

export type UserProfileQueryVariables = Exact<{ [key: string]: never }>;

export type UserProfileQuery = {
  __typename?: "Query";
  me: {
    __typename?: "User";
    calendarFeedUrl?: string | null | undefined;
  } & CompleteUserFragment;
};

export type AddForetagsbiljettMutationVariables = Exact<{
  tickets?: InputMaybe<Array<GiftCertificateInput> | GiftCertificateInput>;
}>;

export type AddForetagsbiljettMutation = {
  __typename?: "Mutation";
  addGiftCertificates: {
    __typename?: "User";
    id: any;
    giftCertificates: Array<{
      __typename?: "GiftCertificate";
      number: string;
      expireTime: any;
      status: GiftCertificate_Status;
    }>;
  };
};

export type DeleteForetagsbiljettMutationVariables = Exact<{
  ticket: GiftCertificateInput;
}>;

export type DeleteForetagsbiljettMutation = {
  __typename?: "Mutation";
  deleteGiftCertificate: {
    __typename?: "User";
    id: any;
    giftCertificates: Array<{
      __typename?: "GiftCertificate";
      number: string;
      expireTime: any;
      status: GiftCertificate_Status;
    }>;
  };
};
