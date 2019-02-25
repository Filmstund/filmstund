/** @jsx jsx */
import { jsx } from "@emotion/core";
import { PageWidthWrapper } from "../ui/PageWidthWrapper";

import alfons from "../../../assets/alfons.jpg";
import Header, { SmallHeader } from "../ui/Header";

export const MissingShowing = () => (
  <PageWidthWrapper>
    <div css={{ backgroundColor: "#fff" }}>
      <div
        css={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Header>Det finns ingen sådan visning</Header>
      </div>
      <div
        css={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <SmallHeader>Kanske någon har raderat den...?</SmallHeader>
        <div
          css={{
            alignSelf: "flex-end",
            backgroundImage: `url(${alfons})`,
            height: 50,
            width: 200
          }}
        />
      </div>
    </div>
  </PageWidthWrapper>
);
