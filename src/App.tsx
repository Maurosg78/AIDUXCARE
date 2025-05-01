import React from 'react';
import { useRoutes } from "react-router-dom";
import routes from "./core/config/routes";
import DevTools from "./modules/emr/components/dev/DevTools";

const App: React.FC = () => {
  const element = useRoutes(routes);
  return (
    <>
      {element}
      <DevTools />
    </>
  );
};

export default App;

