import React from "react";
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

export const ScreenSeats = ({ ticketRange, seatMap }) => {
  if (seatMap.length === 0) {
    return null;
  }

  const maxWidth = 464;
  const maxHeight = 351;

  const [{ dimensions: { width, height } }] = seatMap;

  const minY = _.minBy(seatMap, s => s.coordinates.y).coordinates.y;

  const minX = _.minBy(seatMap, s => s.coordinates.x).coordinates.x;

  const maxX =
    _.maxBy(seatMap, s => s.coordinates.x).coordinates.x + width - minX;
  const maxY =
    _.maxBy(seatMap, s => s.coordinates.y).coordinates.y + height - minY;

  const scaleX = maxWidth / (maxX - minX);
  const scaleY = maxHeight / maxY;

  const numbers = _.flatMap(ticketRange.seatings, seating => seating.numbers);

  return (
    <Screen width={maxWidth} height={maxHeight}>
      {seatMap.map(data => (
        <Seat
          key={data.number}
          selected={numbers.includes(data.number)}
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
