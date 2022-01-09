import CreatableSelect from "react-select/creatable";
import React from "react";

const transformToSelectOptions = (locations: string[]) =>
  locations.map((name) => ({
    value: name,
    label: name,
  }));

interface Props {
  previousLocations: string[];
  value: string;
  onChange: (value: string) => void;
}

export const LocationSelect: React.VFC<Props> = ({
  previousLocations,
  value,
  onChange,
}) => (
  <CreatableSelect
    options={transformToSelectOptions(previousLocations)}
    formatCreateLabel={(label) => `Skapa '${label}'`}
    value={{ value: value, label: value }}
    onCreateOption={(value) => onChange(value)}
    onChange={(option) => {
      if (option) {
        onChange(option.value);
      }
    }}
  />
);
