import CreatableSelect from "react-select/creatable";
import React from "react";

const transformToSelectOptions = locations =>
  locations.map(({ name }) => ({
    value: name,
    label: name
  }));

const handleOnChangeEvent = onChange => (option, { action }) => {
  if (action === "pop-value") {
    return;
  }

  onChange(option.value);
};

export const LocationSelect = ({ previousLocations, value, onChange }) => (
  <CreatableSelect
    options={transformToSelectOptions(previousLocations)}
    formatCreateLabel={label => `Skapa '${label}'`}
    value={{ value: value, label: value }}
    onChange={handleOnChangeEvent(onChange)}
  />
);
