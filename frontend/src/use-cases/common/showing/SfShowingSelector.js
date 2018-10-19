import Field from "../ui/Field";
import { groupBy, keys } from "lodash-es";
import React from "react";
import { formatYMD } from "../../../lib/dateTools";
import Header from "../ui/Header";
import SelectBox from "../ui/SelectBox";
import Loadable from "react-loadable";

const DatePickerInput = Loadable({
  loader: () => import("../ui/date-picker/DatePickerInput"),
  loading: () => null
});

const DatePicker = Loadable({
  loader: () => import("../ui/date-picker/DatePicker"),
  loading: () => null
});

const now = new Date();

const getSfDates = sfShowings => groupBy(sfShowings, s => formatYMD(s.timeUtc));

const renderPickerOrPickerInput = (usePickerInput, props) => {
  if (usePickerInput) {
    return <DatePickerInput {...props} />;
  } else {
    return <DatePicker {...props} />;
  }
};

export const SfShowingSelector = ({
  sfShowings,
  showing,
  selectedDate,
  usePickerInput = false,
  onChangeDate,
  onChangeTime
}) => {
  const sfdates = getSfDates(sfShowings);
  const sfTimes = sfdates[formatYMD(selectedDate)];

  return (
    <>
      <Field text="Datum:">
        {renderPickerOrPickerInput(usePickerInput, {
          value: showing.date,
          onChange: onChangeDate,
          disabledDays: { before: now },
          modifiers: { sfdays: keys(sfdates).map(s => new Date(s)) },
          modifiersStyles: {
            sfdays: {
              backgroundColor: "#fff",
              borderColor: "#d0021b",
              color: "#d0021b"
            }
          }
        })}
      </Field>
      {!sfTimes || sfTimes.length === 0 ? (
        <div>Inga tider från SF för {formatYMD(showing.date)}</div>
      ) : (
        <div>
          <Header>Välj tid från SF</Header>
          <Field text="Tid:">
            <SelectBox options={sfTimes} onChange={onChangeTime} />
          </Field>
        </div>
      )}
    </>
  );
};
