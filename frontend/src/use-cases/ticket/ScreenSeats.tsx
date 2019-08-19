import styled from "@emotion/styled";
import { flatMap, groupBy, map } from "lodash-es";
import React from "react";
import {
  TicketQuery_showing_sfSeatMap,
  TicketQuery_showing_ticketRange
} from "../showing-tickets/__generated__/TicketQuery";

const Seat = styled.div<{ selected: boolean }>(({ selected }) => ({
  backgroundColor: selected ? "#d0021b" : "#9b9b9b",
  position: "absolute",
  borderRadius: 2
}));

const Screen = styled.div<{ height: number; width: number }>`
  margin: 20px 0;
  position: relative;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
`;

interface Props {
  ticketRange: TicketQuery_showing_ticketRange;
  seatMap: TicketQuery_showing_sfSeatMap[];
}

export const ScreenSeats: React.FC<Props> = ({ ticketRange, seatMap }) => {
  if (seatMap.length === 0) {
    return null;
  }

  const rows = groupBy(seatMap, s => s.row);
  const widestRowLength = Math.max(...map(rows, row => row.length));

  const width = Math.min(window.innerWidth - 40, window.innerHeight, 650);

  const optimalSeatWidth = 17;
  const seatWidth = Math.min(optimalSeatWidth, width / (widestRowLength * 1.2));
  const seatHeight = Math.floor(13 * seatWidth / optimalSeatWidth);

  const minY = Math.min(...seatMap.map(s => s.coordinates.y));
  const maxY = Math.max(...seatMap.map(s => s.coordinates.y));
  const minX = Math.min(...seatMap.map(s => s.coordinates.x));
  const maxX = Math.max(...seatMap.map(s => s.coordinates.x));

  const scale = width / (maxX - minX);

  const numbers = flatMap(
    ticketRange.seatings,
    seating => seating.numbers || []
  );

  return (
    <Screen
      height={(maxY - minY) * scale + seatHeight}
      width={(maxX - minX) * scale + seatWidth}
    >
      {seatMap.map(data => (
        <Seat
          style={{
            left: Math.floor((data.coordinates.x - minX) * scale),
            top: Math.floor((data.coordinates.y - minY) * scale),
            height: seatHeight,
            width: seatWidth
          }}
          key={data.number}
          selected={numbers.includes(data.number)}
        />
      ))}
    </Screen>
  );
};
