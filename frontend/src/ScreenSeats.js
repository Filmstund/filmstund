import React from "react";
import seatingdata from "./seatingdata.json";
import styled from "styled-components";
import _ from "lodash";

const Seat = styled.div.attrs({
  style: ({ x, y, scaleX, scaleY, height, width }) => ({
    top: y * scaleY,
    left: x * scaleX,
    height: height * scaleY,
    width: width * scaleX
  })
})`
  position: absolute;
  background-color: ${props => (props.selected ? "#d0021b" : "#9b9b9b")};
`;

const Screen = styled.div`
  position: relative;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
`;

export const ScreenSeats = ({ ticketRange }) => {
  const maxWidth = 464;
  const maxHeight = 351;

  const [{ dimensions: { width, height } }] = seatingdata;

  const minY = _.minBy(seatingdata, s => s.coordinates.y).coordinates.y;

  const minX = _.minBy(seatingdata, s => s.coordinates.x).coordinates.x;

  const maxX =
    _.maxBy(seatingdata, s => s.coordinates.x).coordinates.x + width - minX;
  const maxY =
    _.maxBy(seatingdata, s => s.coordinates.y).coordinates.y + height - minY;

  const scaleX = maxWidth / (maxX - minX);
  const scaleY = maxHeight / maxY;

  return (
    <Screen width={maxWidth} height={maxHeight}>
      {seatingdata.map(data => (
        <Seat
          key={data.remoteEntityId}
          selected={seatInRange(data, ticketRange)}
          scaleX={scaleX}
          scaleY={scaleY}
          x={data.coordinates.x - minX}
          y={data.coordinates.y - minY}
          width={width}
          height={height}
        />
      ))}
    </Screen>
  );
};

const seatInRange = (data, ticketRange) => {
  const row = ticketRange.seatings.find(range => range.row === data.row);

  if (row) {
    return row.numbers.includes(data.number);
  } else {
    return false;
  }
};
