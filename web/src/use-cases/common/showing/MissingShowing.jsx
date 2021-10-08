import React from "react";
import alfons from "../../../assets/alfons.jpg";
import Header, { SmallHeader } from "../ui/Header";

export const MissingShowing = () => (
  <>
    <div style={{ backgroundColor: "#fff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Header>Det finns ingen sådan visning</Header>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SmallHeader>Kanske någon har raderat den...?</SmallHeader>
        <div
          style={{
            alignSelf: "flex-end",
            backgroundImage: `url(${alfons})`,
            height: 50,
            width: 200,
          }}
        />
      </div>
    </div>
  </>
);
