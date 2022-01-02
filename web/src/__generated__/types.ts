export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  FilmstadenMembershipID: any;
  IMDbID: any;
  MovieID: any;
  TMDbID: any;
  Time: any;
  UUID: any;
};

export type Commandments = {
  __typename?: 'Commandments';
  number: Scalars['Int'];
  phrase: Scalars['String'];
};

export type GiftCertificate = {
  __typename?: 'GiftCertificate';
  expireTime: Scalars['Time'];
  number: Scalars['String'];
  status: GiftCertificate_Status;
};

export type GiftCertificateInput = {
  expireTime?: InputMaybe<Scalars['Time']>;
  number: Scalars['String'];
};

export enum GiftCertificate_Status {
  Available = 'AVAILABLE',
  Expired = 'EXPIRED',
  Pending = 'PENDING',
  Unknown = 'UNKNOWN',
  Used = 'USED'
}

export type Mutation = {
  __typename?: 'Mutation';
  addGiftCertificates: User;
  deleteGiftCertificate: User;
  disableCalendarFeed: User;
  invalidateCalendarFeed: User;
  updateUser: User;
};


export type MutationAddGiftCertificatesArgs = {
  giftCerts?: InputMaybe<Array<GiftCertificateInput>>;
};


export type MutationDeleteGiftCertificateArgs = {
  giftCert: GiftCertificateInput;
};


export type MutationUpdateUserArgs = {
  newInfo: UserDetailsInput;
};

export type Query = {
  __typename?: 'Query';
  allCommandments: Array<Commandments>;
  currentUser: User;
  randomCommandment: Commandments;
};

export type User = {
  __typename?: 'User';
  avatarURL?: Maybe<Scalars['String']>;
  calendarFeedId?: Maybe<Scalars['String']>;
  calendarFeedUrl?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  filmstadenMembershipId?: Maybe<Scalars['FilmstadenMembershipID']>;
  firstName: Scalars['String'];
  giftCertificates: Array<GiftCertificate>;
  id: Scalars['UUID'];
  lastLoginTime: Scalars['Time'];
  lastName: Scalars['String'];
  name: Scalars['String'];
  nick?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  signupTime: Scalars['Time'];
  updateTime: Scalars['Time'];
};

export type UserDetailsInput = {
  filmstadenMembershipId?: InputMaybe<Scalars['FilmstadenMembershipID']>;
  firstName?: InputMaybe<Scalars['String']>;
  lastName?: InputMaybe<Scalars['String']>;
  nick?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
};
