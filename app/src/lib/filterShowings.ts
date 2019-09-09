import format from "date-fns/format";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import parseISO from "date-fns/parseISO";
import { ShowingsByMovieQuery_publicShowings } from "../__generated__/ShowingsByMovieQuery";

type ShowingFilterFn = (s: ShowingsByMovieQuery_publicShowings) => boolean;

export const today = parseISO(format(new Date(), "yyyy-MM-dd"));

export const showingDate = (
  showing: Pick<ShowingsByMovieQuery_publicShowings, "date" | "time">
) => parseISO(showing.date + " " + showing.time);

export const filterShowingsParticipatedByMe = (
  meId: string
): ShowingFilterFn => s =>
  s.participants.some(p => p.user && p.user.id === meId);

export const filterShowingsParticipatedByMeAndAfterToday = (
  meId: string
): ShowingFilterFn => s =>
  filterShowingsParticipatedByMe(meId)(s) && isAfter(showingDate(s), today);

export const filterShowingsParticipatedByMeAndBeforeToday = (
  meId: string
): ShowingFilterFn => s =>
  filterShowingsParticipatedByMe(meId)(s) && isBefore(showingDate(s), today);
