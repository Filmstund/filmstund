import { atom } from "jotai";
import { useAtomValue, useUpdateAtom } from "jotai/utils";
import { v4 as uuid } from "uuid";

interface Toast {
  text: string;
  variant: "success" | "danger";
  id: string;
}

type InputToast = Omit<Toast, "id">;

const toastAtom = atom<Toast[]>([]);

const appendAtom = atom(null, (get, set, arg: InputToast) =>
  set(toastAtom, [...get(toastAtom), { ...arg, id: uuid() }])
);

const popAtom = atom(null, (get, set, arg: string) =>
  set(
    toastAtom,
    get(toastAtom).filter((t) => t.id !== arg)
  )
);

export const useToast = () => useAtomValue(toastAtom);
export const useToaster = () => useUpdateAtom(appendAtom);
export const useEjectToast = () => useUpdateAtom(popAtom);
