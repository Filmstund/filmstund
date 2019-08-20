import styled from "@emotion/styled";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { parse } from "date-fns";
import addDays from "date-fns/add_days";
import { keys } from "lodash-es";
import React, { lazy, useCallback, useState } from "react";
import { DataProps } from "react-apollo";
import { RouteChildrenProps } from "react-router";
import { useDeleteShowing } from "../../apollo/mutations/showings/useDeleteShowing";
import { useUpdateShowing } from "../../apollo/mutations/showings/useUpdateShowing";
import { formatLocalTime, formatYMD } from "../../lib/dateTools";
import { margin } from "../../lib/style-vars";
import * as navigators from "../common/navigators/index";
import Showing from "../common/showing/Showing";
import Field from "../common/ui/Field";

import Header, { SmallHeader } from "../common/ui/Header";
import Input from "../common/ui/Input";
import { LocationSelect } from "../common/ui/LocationSelect";
import MainButton, { RedButton } from "../common/ui/MainButton";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { SfShowingsQuery_movie_showings } from "../new-showing/hooks/__generated__/SfShowingsQuery";
import { useSfShowings } from "../new-showing/hooks/useSfShowings";
import { SfTimeSelector } from "../new-showing/SfTimeSelector";
import { EditShowing, EditShowing_showing } from "./__generated__/EditShowing";

const DatePicker = lazy(() => import("../common/ui/date-picker/DatePicker"));

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

interface EditShowingFormState {
  errors: Error[] | null;
  showing: EditShowingFormShowing;
}

const getInitialState = (
  showing: EditShowing_showing
): EditShowingFormState => ({
  errors: null,
  showing: {
    date: showing.date,
    filmstadenRemoteEntityId: showing.filmstadenRemoteEntityId,
    expectedBuyDate: addDays(today, 7),
    location: showing.location.name,
    time: showing.time,
    price: showing.price !== null ? String(showing.price / 100) : ""
  }
});

interface Props
  extends DataProps<EditShowing>,
    RouteChildrenProps<{ webId: string }> {}

const EditShowingForm: React.FC<Props> = ({ data, history }) => {
  const showing = data.showing!;
  const [{ errors, showing: newValues }, setState] = useState<
    EditShowingFormState
  >(() => getInitialState(showing));

  const { movie, admin, ticketsBought } = showing;

  const city = showing.location.cityAlias || "GB";

  const [sfdates] = useSfShowings(movie.id, city);

  const previousLocations = data.previousLocations || [];

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
      date: newValues.date,
      expectedBuyDate: formatYMD(newValues.expectedBuyDate),
      private: showing.private,
      payToUser: showing.payToUser.id,
      location: newValues.location,
      time: newValues.time,
      filmstadenRemoteEntityId: newValues.filmstadenRemoteEntityId,
      price: (parseInt(newValues.price, 10) || 0) * 100
    })
      .then(() => {
        return navigators.navigateToShowing(history, showing);
      })
      .catch(errors => {
        setState(state => ({
          ...state,
          errors
        }));
      });
  };

  const setShowingValue = useCallback<SetShowingValueFn>((key, value) => {
    setState(state => ({
      ...state,
      showing: { ...state.showing, [key]: value }
    }));
  }, []);

  const handleSfTimeSelect = (sfShowing: SfShowingsQuery_movie_showings) => {
    const { filmstadenRemoteEntityId, cinemaName, timeUtc } = sfShowing;
    setState(state => ({
      ...state,
      showing: {
        ...state.showing,
        filmstadenRemoteEntityId,
        location: cinemaName,
        time: formatLocalTime(timeUtc)
      }
    }));
  };

  return (
    <PageWidthWrapper>
      <Header>Redigera besök</Header>
      <div>
        <Showing
          date={formatYMD(newValues.date) + " " + newValues.time}
          admin={admin}
          location={newValues.location}
          movie={movie}
        />
        <StatusMessageBox errors={errors} />
        <Field text="Datum:">
          <DatePicker
            value={parse(newValues.date)}
            onChange={(value: Date) => {
              setShowingValue("date", formatYMD(value));
            }}
            disabledDays={{ before: today }}
            modifiers={{ filmstadendays: keys(sfdates).map(s => new Date(s)) }}
            modifiersStyles={{
              filmstadendays: {
                backgroundColor: "#fff",
                borderColor: "#d0021b",
                color: "#d0021b"
              }
            }}
          />
        </Field>
        <SfTimeSelector
          date={newValues.date}
          selectedValue={newValues.filmstadenRemoteEntityId || undefined}
          onSelect={handleSfTimeSelect}
          city={city}
          movieId={movie.id}
        />
        <SmallHeader>...eller skapa egen tid</SmallHeader>
        <Field text="Tid:">
          <Input
            type="time"
            value={newValues.time}
            onChange={event => {
              setShowingValue("filmstadenRemoteEntityId", null);
              setShowingValue("time", event.target.value);
            }}
          />
        </Field>
        <Field text="Plats:">
          <LocationSelect
            previousLocations={previousLocations}
            value={newValues.location}
            onChange={(value: string) => setShowingValue("location", value)}
          />
        </Field>
        <Field text="Pris:">
          <Input
            type="text"
            value={newValues.price}
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
