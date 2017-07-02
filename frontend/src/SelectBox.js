import React from "react";
import styled from "styled-components";

const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  color: #8E1B1B;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
`;

const Box = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  width: 100%;
`;

const Lable = styled.div`
  display: inline-block;
  font-style: italic;
  font-size: 0.9em;
`;

const Tag = styled.div`
  display: inline-block;
  border-radius: 1.4em;
  background-color: #9B9B9B;
  color: white;
  font-size: 0.7em;
  padding: 0.4em;
  margin: 0 0.2em;
`;

const RightArrow = styled.div`
  display: inline-block;
  margin-left: 0.4em;
`;

const SelectBox = ({ options, onChange, ...props }) =>
  <Box>
    {options.map(option =>
      <Option key={option.localTime} onClick={() => onChange(option)}>
        <Lable>
          {option.localTime} {option.screen},{" "}
          {option.cinema.replace(/ ?Filmstaden ?/, "")}
        </Lable>
        <div>
          {option.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
          <RightArrow>&gt;</RightArrow>
        </div>
      </Option>
    )}
  </Box>;

export default SelectBox;
