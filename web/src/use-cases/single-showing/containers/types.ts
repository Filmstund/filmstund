import { SingleShowingQuery } from "../../../__generated__/types";

export type SingleShowingScreenShowing = NonNullable<
  SingleShowingQuery["showing"]
>;

export type AdminPaymentDetails = NonNullable<
  SingleShowingScreenShowing["adminPaymentDetails"]
>;
export type AdminAttendeePaymentDetails =
  AdminPaymentDetails["attendees"][number];
export type AttendeePaymentDetails = NonNullable<
  SingleShowingScreenShowing["attendeePaymentDetails"]
>;
