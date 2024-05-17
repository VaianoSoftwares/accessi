import { createContext } from "react";
import { TUser } from "../../types/users";
import useIsMobile from "../../hooks/useIsMobile";

type UseCurrentUserReturn = {
  currentUser: TUser | null;
  setCurrentUser: (value: React.SetStateAction<TUser | null>) => void;
  removeCurrentUser: () => void;
};
type Props = {
  children: JSX.Element;
} & UseCurrentUserReturn;

export const IsMobileContext = createContext(false);
export const CurrentUserContext = createContext<UseCurrentUserReturn | null>(
  null
);

export default function RootProvider({
  children,
  currentUser,
  setCurrentUser,
  removeCurrentUser,
}: Props) {
  const { isMobile } = useIsMobile();

  return (
    <IsMobileContext.Provider value={isMobile}>
      <CurrentUserContext.Provider
        value={{ currentUser, setCurrentUser, removeCurrentUser }}
      >
        {isMobile === false ? (
          children
        ) : (
          <h2>Portale web non disponibile per dispositivi mobili</h2>
        )}
      </CurrentUserContext.Provider>
    </IsMobileContext.Provider>
  );
}
