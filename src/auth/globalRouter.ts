import type { NavigateFunction } from "react-router-dom";

const GlobalRouter = { navigate: null } as {
  navigate: null | NavigateFunction;
};

export default GlobalRouter;
