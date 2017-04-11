import React from "react";
import styled from "styled-components";

const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  font-style: italic;
  color: #8E1B1B;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
`;

const Box = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  width: 100%;
`;

const Lable = styled.div`
  display: inline-block;
  width: 30vw;
`

const Tag = styled.div`
  display: inline-block;
  border-radius: 1.4em;
  background-color: #9B9B9B;
  color: white;
  font-size: 0.8em;
  padding: 0.4em 0.7em;
  margin: 0 0.2em;
`;


const SelectBox = ({ options, onChange, ...props }) => (
    <Box>
        {options.map(option => (
            <Option key={option.localTime} onClick={() => onChange(option)}>
                <div>
                    <Lable>{option.localTime} {option.saloon}</Lable>
                    {option.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </div>
                <span>&gt;</span>
            </Option>
        ))}
    </Box>
);


export default SelectBox;
