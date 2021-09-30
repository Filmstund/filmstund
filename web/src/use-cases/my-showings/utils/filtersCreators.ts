import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import parseISO from "date-fns/parseISO";
import { getTodaysDate } from "../../../lib/dateTools";
import { HomeQuery_showings } from "../__generated__/HomeQuery";

type ShowingFilterFn = (s: HomeQuery_showings) => boolean;

const today = getTodaysDate();

export const showingDate = (
  showing: Pick<HomeQuery_showings, "date" | "time">
) => parseISO(showing.date + " " + showing.time);

export const filterShowingsCreatedByMe =
  (meId: string): ShowingFilterFn =>
  (s) =>
    s.admin.id === meId;

export const filterShowingsParticipatedByMe =
  (meId: string): ShowingFilterFn =>
  (s) =>
    s.participants.some((p) => p.user && p.user.id === meId);

export const filterShowingsParticipatedByMeAndAfterToday =
  (meId: string): ShowingFilterFn =>
  (s) =>
    filterShowingsParticipatedByMe(meId)(s) && isAfter(showingDate(s), today);

export const filterShowingsParticipatedByMeAndBeforeToday =
  (meId: string): ShowingFilterFn =>
  (s) =>
    filterShowingsParticipatedByMe(meId)(s) && isBefore(showingDate(s), today);
