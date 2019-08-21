import React, { createContext, useContext, useEffect } from "react";

const PageTitleContext = createContext<string | null>(null);

interface PageTitleTemplateProps {
  titleTemplate: string | null;
}

export const PageTitleTemplate: React.FC<PageTitleTemplateProps> = ({
  titleTemplate,
  children
}) => {
  return (
    <PageTitleContext.Provider value={titleTemplate}>
      {children}
    </PageTitleContext.Provider>
  );
};

interface PageTitleProps {
  title: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  const titleTemplate = useContext(PageTitleContext);

  useEffect(() => {
    document.title = titleTemplate ? titleTemplate.replace("%s", title) : title;
  }, [titleTemplate, title]);

  return null;
};
