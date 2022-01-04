import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import parseISO from "date-fns/parseISO";
import { getTodaysDate } from "../../../lib/dateTools";
import {
  HomeQueryQuery,
  ShowingNeueFragment,
} from "../../../__generated__/types";

type ShowingFilterFn = (s: HomeQueryQuery["showings"][0]) => boolean;

const today = getTodaysDate();

export const showingDate = (
  showing: Pick<ShowingNeueFragment, "date" | "time">
) => parseISO(showing.date + " " + showing.time);

export const filterShowingsCreatedByMe =
  (meId: string): ShowingFilterFn =>
  (s) =>
    s.admin.id === meId;

export const filterShowingsParticipatedByMe =
  (meId: string): ShowingFilterFn =>
  (s) =>
    s.attendees.some((p) => p.userID === meId);

export const filterShowingsParticipatedByMeAndAfterToday =
  (meId: string): ShowingFilterFn =>
  (s) =>
    filterShowingsParticipatedByMe(meId)(s) && isAfter(showingDate(s), today);

export const filterShowingsParticipatedByMeAndBeforeToday =
  (meId: string): ShowingFilterFn =>
  (s) =>
    filterShowingsParticipatedByMe(meId)(s) && isBefore(showingDate(s), today);
