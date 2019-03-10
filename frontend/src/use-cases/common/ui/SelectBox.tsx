import React from "react";
import styled from "@emotion/styled";
import { formatLocalTime } from "../../../lib/dateTools";
import { SMALL_FONT_SIZE } from "../../../lib/style-vars";
import { CreateShowingQuery_movie_sfShowings } from "../../new-showing/__generated__/CreateShowingQuery";

const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  color: #8e1b1b;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

const Box = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  width: 100%;
`;

const Lable = styled.div`
  display: inline-block;
  font-style: italic;
  font-size: ${SMALL_FONT_SIZE};
`;

const Tag = styled.div`
  display: inline-block;
  border-radius: 1.4em;
  background-color: #9b9b9b;
  color: white;
  font-size: ${SMALL_FONT_SIZE};
  padding: 0.4em;
  margin: 0 0.2em;
`;

const RightArrow = styled.div`
  display: inline-block;
  margin-left: 0.4em;
`;

interface Props {
  options: CreateShowingQuery_movie_sfShowings[];
  onChange: (v: CreateShowingQuery_movie_sfShowings) => void;
}

const SelectBox: React.FC<Props> = ({ options, onChange }) => (
  <Box>
    {options.map(option => (
      <Option
        key={option.cinemaName + option.screen.sfId + option.timeUtc}
        onClick={() => onChange(option)}
      >
        <Lable>
          {formatLocalTime(option.timeUtc)} {option.screen.name},{" "}
          {option.cinemaName.replace(/ ?Filmstaden ?/, "")}
        </Lable>
        <div>
          {option.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          <RightArrow>&gt;</RightArrow>
        </div>
      </Option>
    ))}
  </Box>
);

export default SelectBox;
