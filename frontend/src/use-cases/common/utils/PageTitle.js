import React, { createContext, useContext, useEffect } from "react";

const PageTitleContext = createContext(null);

export const PageTitleTemplate = ({ titleTemplate, children }) => {
  return (
    <PageTitleContext.Provider value={titleTemplate}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const PageTitle = ({ title }) => {
  const titleTemplate = useContext(PageTitleContext);

  useEffect(
    () => {
      document.title = titleTemplate
        ? titleTemplate.replace("%s", title)
        : title;
    },
    [titleTemplate, title]
  );

  return null;
};
