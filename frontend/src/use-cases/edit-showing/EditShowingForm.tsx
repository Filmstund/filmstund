import React, { lazy, useState, useCallback } from "react";

import Header from "../common/ui/Header";
import Showing from "../common/showing/Showing";
import Input from "../common/ui/Input";
import Field from "../common/ui/Field";
import MainButton, { RedButton } from "../common/ui/MainButton";
import { formatYMD } from "../../lib/dateTools";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import * as navigators from "../common/navigators/index";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import styled from "@emotion/styled";
import { margin } from "../../lib/style-vars";
import addDays from "date-fns/add_days";
import { LocationSelect } from "../common/ui/LocationSelect";
import { EditShowing_showing, EditShowing } from "./__generated__/EditShowing";
import { DataProps } from "react-apollo";
import { RouteChildrenProps } from "react-router";
import { useUpdateShowing } from "../../apollo/mutations/showings/useUpdateShowing";
import { useDeleteShowing } from "../../apollo/mutations/showings/useDeleteShowing";

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
  expectedBuyDate: Date;
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

  const { movie, admin, date, ticketsBought } = showing;
  const previousLocations = data.previousLocations || [];

  const updateShowing = useUpdateShowing();
  const deleteShowing = useDeleteShowing();

  const handleDelete = useCallback(() => {
    const proceed = window.confirm("Är du säker? Går ej att ångra!");

    if (proceed) {
      deleteShowing(showing.id).then(() => {
        history.push("/showings");
      });
    }
  }, [deleteShowing, showing, history]);

  const handleSubmit = useCallback(() => {
    updateShowing(showing.id, {
      expectedBuyDate: formatYMD(newValues.expectedBuyDate),
      private: showing.private,
      payToUser: showing.payToUser.id,
      location: newValues.location,
      time: newValues.time,
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
  }, [showing, setState, newValues, history, updateShowing]);

  const setShowingValue = useCallback<SetShowingValueFn>((key, value) => {
    setState(state => ({
      ...state,
      showing: { ...state.showing, [key]: value }
    }));
  }, []);

  const setShowingDate = useCallback(
    (v: Date) => setShowingValue("expectedBuyDate", v),
    [setShowingValue]
  );

  return (
    <PageWidthWrapper>
      <Header>Redigera besök</Header>
      <div>
        <Showing
          date={formatYMD(date) + " " + newValues.time}
          admin={admin}
          location={newValues.location}
          movie={movie}
        />
        <StatusMessageBox errors={errors} />
        <Field text="Förväntat köpdatum:">
          <DatePicker
            value={newValues.expectedBuyDate}
            onChange={setShowingDate}
            disabledDays={[
              {
                before: today,
                after: new Date(date)
              }
            ]}
          />
        </Field>
        <Field text="Visningstid:">
          <Input
            type="time"
            value={newValues.time}
            onChange={event => setShowingValue("time", event.target.value)}
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
