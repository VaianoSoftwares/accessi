import { GenericForm, TEvent, TEventInput } from "../types";

export default (
  () =>
  <T extends GenericForm>(e: TEvent, form: T, setForm: (value: T) => void) => {
    if (e.target.type === "file") {
      const changeEventHandler = (e: TEventInput) => {
        const { name, files } = e.target;
        setForm({ ...form, [name]: files![0] });
      };

      changeEventHandler(e as TEventInput);
    } else {
      const changeEventHandler = (e: TEvent) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
      };

      changeEventHandler(e);
    }
  }
)();
