import styled from "@emotion/styled";
import React from "react";
import { formatLocalTime } from "../../../lib/dateTools";
import { SMALL_FONT_SIZE } from "../../../lib/style-vars";
import { SfShowingsQuery_movie_showings } from "../../new-showing/hooks/__generated__/SfShowingsQuery";


const Option = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  background: ${props => (props.selected ? "#8e1b1b" : "none")};
  color: ${props => (props.selected ? "#fff" : "#8e1b1b")};
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
  options: SfShowingsQuery_movie_showings[];
  onChange: (v: SfShowingsQuery_movie_showings) => void;
}

const SelectBox: React.FC<Props> = ({ options, onChange }) => (
  <Box>
    {options.map(option => (
      <Option
        key={
          option.cinemaName +
          (option.screen ? option.screen.filmstadenId : "") +
          option.timeUtc
        }
        onClick={() => onChange(option)}
        selected={false}
      >
        <Lable>
          {option.timeUtc && formatLocalTime(option.timeUtc)}{" "}
          {option.screen && option.screen.name},{" "}
          {option.cinemaName && option.cinemaName.replace(/ ?Filmstaden ?/, "")}
        </Lable>
        <div>
          {option.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
          <RightArrow>&gt;</RightArrow>
        </div>
      </Option>
    ))}
  </Box>
);

export default SelectBox;
