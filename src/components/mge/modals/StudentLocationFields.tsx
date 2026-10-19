import React from "react";
import { StudentFormState } from "../mgeTypes";

export default function StudentLocationFields({ form, onChange, idPrefix }: {
  form: StudentFormState;
  onChange: (form: StudentFormState) => void;
  idPrefix: string;
}) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {([['district', 'Distrito'], ['province', 'Provincia']] as const).map(([field, label]) => <div key={field}>
      <label htmlFor={`${idPrefix}-${field}`} className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">{label}</label>
      <input id={`${idPrefix}-${field}`} name={field} type="text" value={form[field]}
        onChange={(event) => onChange({ ...form, [field]: event.target.value })}
        placeholder={`Ingrese ${label.toLowerCase()}`}
        className="w-full p-2 border border-slate-300 bg-slate-50 font-bold rounded-lg focus:outline-[#9F062A]" />
    </div>)}
  </div>;
}
