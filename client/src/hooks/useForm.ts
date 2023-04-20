import { RefObject, useRef } from "react";

// type TRef = RefObject<HTMLInputElement> | RefObject<HTMLSelectElement>;

// type TInputType =
//   | "text"
//   | "file"
//   | "select"
//   | "multiple-file"
//   | "multiple-select";

// type TRefsMapElement = {
//   key: string;
//   inputType: TInputType;
// };

// type TRefsMapValue = {
//   inputType: TInputType;
//   ref: TRef;
// };

// type TRefsMapEntry = [string, TRefsMapValue];

type TUseForm = [
  ReadonlyMap<string, RefsMapElement>,
  {
    createFormData: () => FormData;
    formToObj: () => Record<string, unknown>;
    setForm: (obj: Record<string, unknown>) => void;
    clearForm: () => void;
  }
];

export abstract class RefsMapElement<T = HTMLInputElement | HTMLSelectElement> {
  protected readonly ref: RefObject<T> = useRef<T>(null);

  constructor(readonly key: string) {}

  getCurrentRef(): T | null {
    return this.ref.current;
  }

  abstract getValue(): string;
  abstract setValue(value?: unknown): void;
  abstract getDefaultValue(): string;
  abstract appendTo(formData: FormData): void;
  abstract assignTo(obj: Record<string, unknown>): void;
}

export class RefText extends RefsMapElement<HTMLInputElement> {
  getValue(): string {
    if (!this.ref.current) throw new Error("ref.current is null");
    return this.ref.current.value;
  }
  setValue(value: unknown): void {
    if (!this.ref.current) return;
    this.ref.current.value = value ? String(value) : this.getDefaultValue();
  }
  getDefaultValue(): string {
    if (!this.ref.current) throw new Error("ref.current is null");
    return this.ref.current.defaultValue;
  }
  appendTo(formData: FormData): void {
    if (!this.ref.current || !this.ref.current.value) return;
    formData.append(this.key, this.ref.current.value);
  }
  assignTo(obj: Record<string, unknown>): void {
    if (!this.ref.current || !this.ref.current.value) return;
    obj[this.key] = this.ref.current.value;
  }
}

export class RefFile extends RefsMapElement<HTMLInputElement> {
  getValue(): string {
    if (!this.ref.current) throw new Error("ref.current is null");
    return this.ref.current.value;
  }
  setValue(): void {
    if (!this.ref.current) return;
    this.ref.current.value = this.getDefaultValue();
    this.ref.current.files = null;
  }
  getDefaultValue(): string {
    if (!this.ref.current) throw new Error("ref.current is null");
    return this.ref.current.defaultValue;
  }
  appendTo(formData: FormData): void {
    if (!this.ref.current || !this.ref.current.files) return;
    Array.from(this.ref.current.files).forEach((file) =>
      formData.append(this.key, file)
    );
  }
  assignTo(_: Record<string, unknown>): void {}
}

export class RefSelect extends RefsMapElement<HTMLSelectElement> {
  getValue(): string {
    if (!this.ref.current) throw new Error("ref.current is null");
    return this.ref.current.value;
  }
  setValue(value: unknown): void {
    if (!this.ref.current) return;
    this.ref.current.value = value ? String(value) : this.getDefaultValue();
  }
  getDefaultValue(): string {
    if (!this.ref.current) throw new Error("ref.current is null");
    if (this.ref.current.options.length === 0)
      throw new Error("html select has no options");
    return this.ref.current.options!.item(0)!.value;
  }
  appendTo(formData: FormData): void {
    if (!this.ref.current || !this.ref.current.value) return;
    formData.append(this.key, this.ref.current.value);
  }
  assignTo(obj: Record<string, unknown>): void {
    if (!this.ref.current || !this.ref.current.value) return;
    obj[this.key] = this.ref.current.value;
  }
}

function initializeMap(refs: RefsMapElement[]): [string, RefsMapElement][] {
  return refs.map((ref) => [ref.key, ref]);
}

export default function useForm(refs: RefsMapElement[]): TUseForm {
  const refsMap: ReadonlyMap<string, RefsMapElement> = new Map(
    initializeMap(refs)
  );

  function createFormData() {
    const formData = new FormData();
    refsMap.forEach((ref) => ref.appendTo(formData));
    return formData;
  }

  function formToObj() {
    const obj: Record<string, unknown> = {};
    refsMap.forEach((ref) => ref.assignTo(obj));
    return obj;
  }

  function setForm(obj: Record<string, unknown>) {
    Object.entries(obj).forEach(([key, value]) =>
      refsMap.get(key)?.setValue(value)
    );
  }

  function clearForm() {
    refsMap.forEach((ref) => ref.setValue());
  }

  return [refsMap, { createFormData, formToObj, setForm, clearForm }];
}

// export default function useForm(attributes: TRefsMapElement[]) {
//   const refsMap = new Map<string, TRefsMapValue>(initializeMap(attributes));

//   function getRef(inputType: TInputType): TRef {
//     switch (inputType) {
//       case "text":
//       case "file":
//       case "multiple-file":
//         return useRef<HTMLInputElement>(null);
//       case "select":
//       case "multiple-select":
//         return useRef<HTMLSelectElement>(null);
//     }
//   }

//   function initializeMap(attributes: TRefsMapElement[]): TRefsMapEntry[] {
//     return attributes.map(({ key, inputType }) => [
//       key,
//       { inputType, ref: getRef(inputType) } as TRefsMapValue,
//     ]);
//   }

//   function createFormData() {
//     const formData = new FormData();

//     refsMap.forEach(({ inputType, ref }, key) => {
//       if (!ref.current) return;

//       switch (inputType) {
//         case "text":
//         case "select":
//           const { value } = ref.current;
//           if (!value) return;
//           formData.append(key, value);
//           break;
//         case "file":
//         case "multiple-file":
//          const { files } = ref.current as HTMLInputElement;
//          if (!files) return;
//          Array.from(files).forEach((file) => formData.append(key, file));
//           break;
//         case "multiple-select":
//           const { selectedOptions } = ref.current as HTMLSelectElement;
//           if (selectedOptions.length === 0) return;
//           const values = JSON.stringify(
//             Array.from(selectedOptions, (option) => option.value).filter(
//               (value) => value
//             )
//           );
//           formData.append(key, values);
//           break;
//       }
//     });

//     return formData;
//   }

//   function formToObj() {
//     const obj: Record<string, unknown> = {};

//     refsMap.forEach(({ inputType, ref }, key) => {
//       if (!ref.current) return;

//       switch (inputType) {
//         case "text":
//         case "select":
//           obj[key] = ref.current.value;
//           break;
//         case "multiple-select":
//           const { selectedOptions } = ref.current as HTMLSelectElement;
//           obj[key] = Array.from(
//             selectedOptions,
//             (option) => option.value
//           ).filter((value) => value);
//           break;
//       }
//     });

//     return obj;
//   }

//   function setForm(obj: Record<string, unknown>) {
//     Object.entries(obj).forEach(([key, value]) => {
//       const mapValue = refsMap.get(key);
//       if (!mapValue) return;

//       const { inputType, ref } = mapValue;
//       if (!ref.current) return;

//       switch (inputType) {
//         case "text":
//           if (!(ref.current instanceof HTMLInputElement)) return;
//           ref.current.value = value ? String(value) : ref.current.defaultValue;
//           break;
//         case "file":
//         case "multiple-file":
//           if (!(ref.current instanceof HTMLInputElement)) return;
//           ref.current.value = value ? String(value) : ref.current.defaultValue;
//           ref.current.files = null;
//           break;
//         case "select":
//         case "multiple-select":
//           if (!(ref.current instanceof HTMLSelectElement)) return;
//           ref.current.value = value
//             ? String(value)
//             : ref.current.options.item(0)?.value || "";
//           break;
//       }
//     });
//   }

//   function clearForm() {
//     setForm({});
//   }

//   return [refsMap, { createFormData, formToObj, setForm, clearForm }];
// }
