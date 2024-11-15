import { createContext } from "react";
import { TUser } from "../../types/users";
import useIsMobile from "../../hooks/useIsMobile";
import { Postazione } from "../../types/postazioni";

type UseCurrentUserReturn = {
  currentUser: TUser | null;
  setCurrentUser: (value: React.SetStateAction<TUser | null>) => void;
  removeCurrentUser: () => void;
};
type UseCurrPostazioneReturn = {
  currCliente: string | undefined;
  setCurrCliente: (value: React.SetStateAction<string | undefined>) => void;
  clearCurrCliente: () => void;
  currPostazione: Postazione | undefined;
  setCurrPostazione: (
    value: React.SetStateAction<Postazione | undefined>
  ) => void;
  clearCurrPostazione: () => void;
};
type Props = {
  children: JSX.Element;
} & UseCurrentUserReturn &
  UseCurrPostazioneReturn;

export const IsMobileContext = createContext(false);
export const CurrentUserContext = createContext<UseCurrentUserReturn | null>(
  null
);
export const CurrPostazioneContext =
  createContext<UseCurrPostazioneReturn | null>(null);

export default function RootProvider({
  children,
  currentUser,
  setCurrentUser,
  removeCurrentUser,
  currCliente,
  setCurrCliente,
  clearCurrCliente,
  currPostazione,
  setCurrPostazione,
  clearCurrPostazione,
}: Props) {
  const { isMobile } = useIsMobile();

  return (
    <IsMobileContext.Provider value={isMobile}>
      <CurrentUserContext.Provider
        value={{ currentUser, setCurrentUser, removeCurrentUser }}
      >
        <CurrPostazioneContext.Provider
          value={{
            currCliente,
            setCurrCliente,
            clearCurrCliente,
            currPostazione,
            setCurrPostazione,
            clearCurrPostazione,
          }}
        >
          {isMobile === false ? (
            children
          ) : (
            <div>
              <h2>Portale web non disponibile per dispositivi mobili</h2>
              <p>
                Altrimenti si prega di mantenere la finestra del browser a
                schermo intero
              </p>
            </div>
          )}
        </CurrPostazioneContext.Provider>
      </CurrentUserContext.Provider>
    </IsMobileContext.Provider>
  );
}
