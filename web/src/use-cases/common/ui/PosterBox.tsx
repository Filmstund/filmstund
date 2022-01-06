import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Header } from "./RedHeader";
import { first } from "lodash";

const pointerHover = css`
  &:hover {
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 1);
  }
`;

const PaddingContainer = styled.div`
  flex: 1;
  padding: 1em;
`;

const PosterImg = styled.img`
  object-fit: cover;
  height: 100%;
  width: 100px;
`;

const createSrcSets = (src: string) => {
  const url = new URL(src);
  const searchParams = url.searchParams;

  const initialWidth = Number(searchParams.get("width"));

  // const sizes = [180, 360, 720, 1440];
  const sizes = [180, 720, 1440].filter((s) => s <= initialWidth);

  return sizes.map((width) => {
    const widthString = String(width);
    url.searchParams.set("width", widthString);
    return `${url.toString()} ${widthString}w`;
  });
};

interface PosterProps {
  src: string;
  alt: string;
}

const Poster: React.VFC<PosterProps> = ({ src, alt }) => {
  if (
    src.startsWith("https://catalog.cinema-api.com/cf/images/ncg-images") &&
    src.includes("width=")
  ) {
    const srcSets = createSrcSets(src);
    return (
      <picture>
        {srcSets.map((src, i) => (
          <source key={i} srcSet={src} />
        ))}
        <PosterImg src={first(srcSets) ?? src} alt={alt} />
      </picture>
    );
  } else {
    return (
      <picture>
        <PosterImg src={src} alt={alt} />
      </picture>
    );
  }
};

const filterEnterKey = (event: React.KeyboardEvent, callback?: Function) => {
  if (event.key === "Enter") {
    callback?.();
  }
};

interface PosterBoxProps {
  poster: string | null | undefined;
  onClick?: () => void;
  headerText: string;
  className?: string;
}

const PosterBox: React.FC<PosterBoxProps> = ({
  className,
  poster,
  onClick,
  headerText,
  children,
}) => (
  <div
    tabIndex={onClick ? 0 : -1}
    className={className}
    onClick={onClick}
    onKeyDown={(e) => filterEnterKey(e, onClick)}
  >
    {poster && <Poster src={poster} alt={"Movie poster for " + headerText} />}
    <PaddingContainer>
      <Header>{headerText}</Header>
      {children}
    </PaddingContainer>
  </div>
);

export default styled(PosterBox)`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  height: 150px;
  width: 100%;
  background: #fff;
  ${(props) => props.onClick && pointerHover};
`;
