import React from "react";
import styled from "@emotion/styled";
import { minBy, maxBy, flatMap } from "lodash-es";

const Seat = styled.div(({ selected }) => ({
  backgroundColor: selected ? "#d0021b" : "#9b9b9b",
  position: "absolute"
}));

const Screen = styled.div`
  position: relative;
  height: ${props => props.height}px;
  overflow: scroll;
`;

export const ScreenSeats = ({ ticketRange, seatMap }) => {
  if (seatMap.length === 0) {
    return null;
  }

  const heightRatio = 351 / 464;

  const maxWidth = Math.min(window.innerWidth - 80, 464);
  const maxHeight = maxWidth * heightRatio;

  const width = 10;
  const height = 10;

  const minY = minBy(seatMap, s => s.coordinates.y).coordinates.y;

  const minX = minBy(seatMap, s => s.coordinates.x).coordinates.x;

  const maxX = maxBy(seatMap, s => s.coordinates.x).coordinates.x + width;
  const maxY = maxBy(seatMap, s => s.coordinates.y).coordinates.y + height;

  const scaleX = maxWidth / (maxX - minX);
  const scaleY = maxHeight / (maxY - minY);

  const numbers = flatMap(ticketRange.seatings, seating => seating.numbers);

  return (
    <Screen height={maxHeight}>
      {seatMap.map(data => (
        <Seat
          style={{
            top: parseInt((data.coordinates.y - minY) * scaleY, 10),
            left: parseInt((data.coordinates.x - minX) * scaleX, 10),
            height: parseInt(height * scaleY, 10),
            width: parseInt(width * scaleX, 10)
          }}
          key={data.number}
          selected={numbers.includes(data.number)}
        />
      ))}
    </Screen>
  );
};
