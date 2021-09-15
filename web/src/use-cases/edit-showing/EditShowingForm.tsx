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
import { useHistory } from "react-router-dom";
import * as navigators from "../common/navigators/index";
import { FilmstadenShowingSelector } from "../common/showing/FilmstadenShowingSelector";
import Showing from "../common/showing/Showing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { RedButton } from "../common/ui/MainButton";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { SfShowingsQuery_movie_showings } from "../new-showing/hooks/__generated__/SfShowingsQuery";
import {
  EditShowing_previousLocations,
  EditShowing_showing
} from "./__generated__/EditShowing";

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
  filmstadenRemoteEntityId: string | null;
  location: string;
  time: string;
  price: string;
}

const getInitialState = (
  showing: EditShowing_showing
): EditShowingFormShowing => ({
  date: showing.date,
  filmstadenRemoteEntityId: showing.filmstadenRemoteEntityId,
  expectedBuyDate: addDays(today, 7),
  location: showing.location.name,
  time: showing.time,
  price: showing.price !== null ? String(showing.price / 100) : ""
});

interface Props {
  showing: EditShowing_showing;
  previousLocations: EditShowing_previousLocations[];
}

const EditShowingForm: React.FC<Props> = ({ showing, previousLocations }) => {
  const history = useHistory();
  const [errors, setErrors] = useState<Error[] | null>(null);
  const [formState, setFormState] = useState<EditShowingFormShowing>(() =>
    getInitialState(showing)
  );

  const { movie, admin, ticketsBought } = showing;

  const updateShowing = useUpdateShowing();
  const deleteShowing = useDeleteShowing();

  const handleDelete = useCallback(
    () => {
      const proceed = window.confirm("Är du säker? Går ej att ångra!");

      if (proceed) {
        deleteShowing(showing.id).then(() => {
          history.push("/showings");
        });
      }
    },
    [deleteShowing, showing, history]
  );

  const handleSubmit = () => {
    updateShowing(showing.id, {
      date: formState.date,
      expectedBuyDate: formatYMD(formState.expectedBuyDate),
      private: showing.private,
      payToUser: showing.payToUser.id,
      location: formState.location,
      time: formState.time,
      filmstadenRemoteEntityId: formState.filmstadenRemoteEntityId,
      price: (parseInt(formState.price, 10) || 0) * 100
    })
      .then(() => {
        setErrors(null);
        navigators.navigateToShowing(history, showing);
      })
      .catch(errors => {
        setErrors(errors);
      });
  };

  const setShowingValue = useCallback<SetShowingValueFn>((key, value) => {
    setFormState(state => ({
      ...state,
      [key]: value
    }));
  }, []);

  const handleSfTimeSelect = (sfShowing: SfShowingsQuery_movie_showings) => {
    const { filmstadenRemoteEntityId, cinemaName, timeUtc } = sfShowing;
    setFormState(state => ({
      ...state,
      filmstadenRemoteEntityId,
      location: cinemaName,
      time: formatLocalTime(timeUtc)
    }));
  };

  const handleOtherTimeSelect = (time: string) => {
    setFormState(state => ({
      ...state,
      filmstadenRemoteEntityId: null,
      time
    }));
  };

  return (
    <PageWidthWrapper>
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
          onChangeDate={value => setShowingValue("date", value)}
          onSelectShowing={handleSfTimeSelect}
          movieId={movie.id}
          date={formState.date}
          filmstadenRemoteEntityId={formState.filmstadenRemoteEntityId}
          city={showing.location.cityAlias || "GB"}
        />
        <SmallHeader>...eller skapa egen tid</SmallHeader>
        <Field text="Tid:">
          <Input
            type="time"
            value={formState.time}
            onChange={event => handleOtherTimeSelect(event.target.value)}
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
            onChange={event => setShowingValue("price", event.target.value)}
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
    </PageWidthWrapper>
  );
};

export default EditShowingForm;
