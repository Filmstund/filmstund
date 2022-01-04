import styled from "@emotion/styled";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import addDays from "date-fns/addDays";
import React, { useCallback, useState } from "react";
import { useDeleteShowing } from "../../apollo/mutations/showings/useDeleteShowing";
import { useUpdateShowing } from "../../apollo/mutations/showings/useUpdateShowing";
import { formatLocalTime, formatYMD } from "../../lib/dateTools";
import { margin } from "../../lib/style-vars";
import { useNavigate } from "react-router-dom";
import * as navigators from "../common/navigators";
import { FilmstadenShowingSelector } from "../common/showing/FilmstadenShowingSelector";
import Showing from "../common/showing/Showing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { RedButton } from "../common/ui/MainButton";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { EditShowingQuery, FilmstadenShowing } from "../../__generated__/types";

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
  showing: EditShowingQuery["showing"]
): EditShowingFormShowing => ({
  date: showing!.date,
  filmstadenRemoteEntityID: showing!.filmstadenShowingID,
  expectedBuyDate: addDays(today, 7),
  location: showing!.location,
  time: showing!.time,
  price: showing!.price !== null ? String(showing!.price / 100) : "",
});

interface Props {
  showing: EditShowingQuery["showing"];
  previousLocations: EditShowingQuery["previouslyUsedLocations"];
}

const EditShowingForm: React.FC<Props> = ({ showing, previousLocations }) => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Error[] | null>(null);
  const [formState, setFormState] = useState<EditShowingFormShowing>(() =>
    getInitialState(showing)
  );

  const { movie, admin, ticketsBought } = showing!;

  const updateShowing = useUpdateShowing();
  const deleteShowing = useDeleteShowing();

  const handleDelete = useCallback(() => {
    const proceed = window.confirm("Är du säker? Går ej att ångra!");

    if (proceed) {
      deleteShowing(showing!.id).then(() => {
        navigate("/showings");
      });
    }
  }, [deleteShowing, showing, navigate]);

  const handleSubmit = () => {
    updateShowing(showing!.id, {
      date: formState.date,
      //      expectedBuyDate: formatYMD(formState.expectedBuyDate), // TODO re-add these two maybe?
      //      private: showing!.private,
      payToUser: showing!.payToUser.id,
      location: formState.location,
      time: formState.time,
      filmstadenRemoteEntityID: formState.filmstadenRemoteEntityID,
      price: (parseInt(formState.price, 10) || 0) * 100,
    })
      .then(() => {
        setErrors(null);
        navigators.navigateToShowing(navigate, showing!);
      })
      .catch((errors) => {
        setErrors(errors);
      });
  };

  const setShowingValue = useCallback<SetShowingValueFn>((key, value) => {
    setFormState((state) => ({
      ...state,
      [key]: value,
    }));
  }, []);

  const handleSfTimeSelect = (sfShowing: FilmstadenShowing) => {
    const { filmstadenRemoteEntityID, cinemaName, timeUtc } = sfShowing;
    setFormState((state) => ({
      ...state,
      filmstadenRemoteEntityID: filmstadenRemoteEntityID,
      location: cinemaName,
      time: formatLocalTime(timeUtc),
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
        <Showing
          date={formatYMD(formState.date) + " " + formState.time}
          admin={admin}
          location={formState.location}
          movie={movie}
        />
        <StatusMessageBox errors={errors} />
        <FilmstadenShowingSelector
          onChangeDate={(value) => setShowingValue("date", value)}
          onSelectShowing={handleSfTimeSelect}
          movieId={movie.id}
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
            previousLocations={previousLocations}
            value={formState.location}
            onChange={(value: string) => setShowingValue("location", value)}
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
