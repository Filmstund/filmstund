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
  MovieID: any;
  SEK: any;
  ShowingID: any;
  TMDbID: any;
  Time: any;
  UUID: any;
  UserID: any;
};

export type AdminPaymentDetails = {
  __typename?: "AdminPaymentDetails";
  attendees: Array<Attendee>;
  filmstadenBuyLink?: Maybe<Scalars["String"]>;
  showingID?: Maybe<Scalars["ShowingID"]>;
};

export type Attendee = {
  __typename?: "Attendee";
  amountOwed: Scalars["SEK"];
  filmstadenMembershipID?: Maybe<Scalars["String"]>;
  giftCertificateUsed?: Maybe<GiftCertificate>;
  hasPaid: Scalars["Boolean"];
  showingID: Scalars["ShowingID"];
  type: PaymentType;
  user: PublicUser;
  userID: Scalars["UserID"];
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
  showingID?: InputMaybe<Scalars["ShowingID"]>;
  userID: Scalars["UserID"];
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
  movieID: Scalars["MovieID"];
  time: Scalars["LocalTime"];
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
  filmstadenShowings: Array<FilmstadenShowing>;
  genres: Array<Scalars["String"]>;
  id: Scalars["MovieID"];
  imdbID?: Maybe<Scalars["IMDbID"]>;
  poster?: Maybe<Scalars["String"]>;
  productionYear: Scalars["Int"];
  releaseDate: Scalars["String"];
  runtime: Scalars["String"];
  slug: Scalars["String"];
  title: Scalars["String"];
  tmdbID?: Maybe<Scalars["TMDbID"]>;
  updateTime: Scalars["String"];
};

export type MovieFilmstadenShowingsArgs = {
  afterDate?: InputMaybe<Scalars["LocalDate"]>;
  city?: InputMaybe<Scalars["String"]>;
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
  showingID: Scalars["ShowingID"];
};

export type MutationCreateShowingArgs = {
  showing: CreateShowingInput;
};

export type MutationDeleteGiftCertificateArgs = {
  giftCert: GiftCertificateInput;
};

export type MutationDeleteShowingArgs = {
  showingID: Scalars["ShowingID"];
};

export type MutationFetchNewMoviesFromFilmstadenArgs = {
  cityAlias?: Scalars["String"];
};

export type MutationMarkAsBoughtArgs = {
  price: Scalars["SEK"];
  showingID: Scalars["ShowingID"];
};

export type MutationProcessTicketUrlsArgs = {
  showingID: Scalars["ShowingID"];
  ticketUrls?: InputMaybe<Array<Scalars["String"]>>;
};

export type MutationPromoteToAdminArgs = {
  showingID: Scalars["ShowingID"];
  userToPromote: Scalars["UserID"];
};

export type MutationUnattendShowingArgs = {
  showingID: Scalars["ShowingID"];
};

export type MutationUpdateAttendeePaymentInfoArgs = {
  paymentInfo: AttendeePaymentInfoInput;
};

export type MutationUpdateShowingArgs = {
  newValues?: InputMaybe<UpdateShowingInput>;
  showingID: Scalars["ShowingID"];
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
  showingID: Scalars["ShowingID"];
  userID: Scalars["UserID"];
  userInfo: PublicUser;
};

export type PublicUser = {
  __typename?: "PublicUser";
  avatar?: Maybe<Scalars["String"]>;
  firstName?: Maybe<Scalars["String"]>;
  id: Scalars["UserID"];
  lastName?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
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
  movie?: Maybe<Movie>;
  publicShowings: Array<Showing>;
  randomCommandment: Commandments;
  showing?: Maybe<Showing>;
  showingForMovie: Array<Showing>;
};

export type QueryMovieArgs = {
  id: Scalars["MovieID"];
};

export type QueryPublicShowingsArgs = {
  afterDate?: InputMaybe<Scalars["LocalDate"]>;
};

export type QueryShowingArgs = {
  id?: InputMaybe<Scalars["ShowingID"]>;
  webID?: InputMaybe<Scalars["Base64ID"]>;
};

export type QueryShowingForMovieArgs = {
  movieId?: InputMaybe<Scalars["MovieID"]>;
};

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
  createdDate: Scalars["String"];
  date: Scalars["String"];
  filmstadenSeatMap: Array<FilmstadenSeatMap>;
  filmstadenShowingID?: Maybe<Scalars["String"]>;
  id: Scalars["ShowingID"];
  lastModifiedDate: Scalars["String"];
  location: Scalars["String"];
  movie: Movie;
  movieID: Scalars["MovieID"];
  movieTitle: Scalars["String"];
  myTickets: Array<Ticket>;
  payToUser: PublicUser;
  price?: Maybe<Scalars["SEK"]>;
  slug: Scalars["String"];
  ticketRange?: Maybe<TicketRange>;
  ticketsBought: Scalars["Boolean"];
  time: Scalars["String"];
  webID: Scalars["Base64ID"];
};

export type Ticket = {
  __typename?: "Ticket";
  assignedToUser: Scalars["UserID"];
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
  showingID: Scalars["ShowingID"];
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
  payToUser: Scalars["UserID"];
  price: Scalars["SEK"];
  time: Scalars["LocalTime"];
};

export type User = {
  __typename?: "User";
  avatarURL?: Maybe<Scalars["String"]>;
  calendarFeedID?: Maybe<Scalars["String"]>;
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
