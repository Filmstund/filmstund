import styled from "@emotion/styled";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import addDays from "date-fns/addDays";
import React, { useCallback, useState } from "react";
import { formatYMD } from "../../lib/dateTools";
import { margin } from "../../lib/style-vars";
import { useNavigate } from "react-router-dom";
import * as navigators from "../common/navigators";
import { FilmstadenShowingSelector } from "../common/showing/FilmstadenShowingSelector";
import SimpleShowing from "../common/showing/SimpleShowing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { RedButton } from "../common/ui/MainButton";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import {
  EditShowingFragment,
  FilmstadenShowingFragment,
  useDeleteShowingMutation,
  useEditShowingQuery,
  useUpdateShowingMutation,
} from "../../__generated__/types";
import { Temporal } from "@js-temporal/polyfill";
import { useToaster } from "../../common/toast/ToastContext";

const today = new Date();

const FaIcon = styled(FontAwesomeIcon)`
  margin-right: ${margin};
`;

type SetShowingValueFn = <K extends keyof EditShowingFormShowing>(
  key: K,
  value: EditShowingFormShowing[K]
) => void;

interface EditShowingFormShowing {
  date: string;
  expectedBuyDate: Date;
  filmstadenRemoteEntityID: string | null | undefined;
  location: string;
  time: string;
  price: string;
}

const getInitialState = (
  showing: EditShowingFragment
): EditShowingFormShowing => ({
  date: showing.date.toString(),
  filmstadenRemoteEntityID: showing.filmstadenShowingID,
  expectedBuyDate: addDays(today, 7),
  location: showing.location,
  time: showing.time.toString(),
  price: showing.price ?? "",
});

interface Props {
  webID: string;
}

const EditShowingForm: React.VFC<Props> = ({ webID }) => {
  const [{ data }] = useEditShowingQuery({
    variables: { webID },
  });
  const { showing, previouslyUsedLocations } = data!;

  if (!showing) {
    throw new Error("Missing showing...");
  }

  const navigate = useNavigate();
  const [errors, setErrors] = useState<Error[] | null>(null);
  const [formState, setFormState] = useState<EditShowingFormShowing>(() =>
    getInitialState(showing)
  );

  const { movie, admin, ticketsBought } = showing;

  const toast = useToaster();
  const [, updateShowing] = useUpdateShowingMutation();
  const [, deleteShowing] = useDeleteShowingMutation();

  const handleDelete = useCallback(() => {
    const proceed = window.confirm("Är du säker? Går ej att ångra!");

    if (proceed) {
      deleteShowing({ showingId: showing.id }).then(() => {
        navigate("/showings");
      });
    }
  }, [deleteShowing, showing, navigate]);

  const handleSubmit = () => {
    updateShowing({
      showingId: showing.id,
      showing: {
        date: Temporal.PlainDate.from(formState.date),
        //      expectedBuyDate: formatYMD(formState.expectedBuyDate), // TODO re-add these two maybe?
        //      private: showing.private,
        payToUser: showing.payToUser.id,
        location: formState.location,
        time: Temporal.PlainTime.from(formState.time).toString({
          smallestUnit: "minutes",
        }) as any,
        filmstadenRemoteEntityID: formState.filmstadenRemoteEntityID ?? null,
        price: formState.price,
      },
    }).then(({ data, error }) => {
      if (data) {
        navigators.navigateToShowing(navigate, showing);
        toast({ variant: "success", text: "Visning har sparats" });
      } else if (error) {
        toast({ variant: "danger", text: error.message });
      }
    });
  };

  const setShowingValue = useCallback<SetShowingValueFn>((key, value) => {
    setFormState((state) => ({
      ...state,
      [key]: value,
    }));
  }, []);

  const handleSfTimeSelect = ({
    cinema,
    id,
    timeUtc,
  }: FilmstadenShowingFragment) => {
    setFormState((state) => ({
      ...state,
      filmstadenRemoteEntityID: id,
      location: cinema.name,
      time: timeUtc.toZonedDateTimeISO("utc").toPlainTime().toString(),
    }));
  };

  const handleOtherTimeSelect = (time: string) => {
    setFormState((state) => ({
      ...state,
      filmstadenRemoteEntityID: null,
      time,
    }));
  };

  return (
    <>
      <Header>Redigera besök</Header>
      <div>
        <SimpleShowing
          date={`${formatYMD(formState.date)} ${formState.time}`}
          admin={admin}
          location={formState.location}
          movie={movie}
        />
        <StatusMessageBox errors={errors} />
        <FilmstadenShowingSelector
          onChangeDate={(value) => setShowingValue("date", value)}
          onSelectShowing={handleSfTimeSelect}
          movieID={movie.id}
          date={formState.date}
          filmstadenRemoteEntityId={formState.filmstadenRemoteEntityID}
          city={"GB"} // TODO: allow for variable
        />
        <SmallHeader>...eller skapa egen tid</SmallHeader>
        <Field text="Tid:">
          <Input
            type="time"
            value={formState.time}
            onChange={(event) => handleOtherTimeSelect(event.target.value)}
          />
        </Field>
        <Field text="Plats:">
          <LocationSelect
            previousLocations={previouslyUsedLocations}
            value={formState.location}
            onChange={(value) => setShowingValue("location", value)}
          />
        </Field>
        <Field text="Pris:">
          <Input
            type="text"
            value={formState.price}
            onChange={(event) => setShowingValue("price", event.target.value)}
          />
        </Field>
        {!ticketsBought && (
          <RedButton onClick={handleDelete}>
            <FaIcon icon={faTrash} /> Ta bort besök
          </RedButton>
        )}
        <MainButton onClick={handleSubmit}>
          <FaIcon icon={faEdit} /> Uppdatera besök
        </MainButton>
      </div>
    </>
  );
};

export default EditShowingForm;
