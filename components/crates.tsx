"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

type CratesProps = {
  language: "ja" | "en";
};

type CrateRow = { id: number };

const copy = {
  ja: {
    title: "クレートのサイズ",
    yes: "分かる",
    no: "分からない・相談したい",
    note: "国際航空輸送では、cm（センチ）・kg（キログラム）での確認が一般的です。インチ・ポンドしか分からない場合は、その他の相談内容へご記入ください。",
    crate: "クレート",
    length: "長さ",
    width: "幅",
    height: "高さ",
    weight: "クレート重量",
    add: "クレートを追加",
    remove: "削除",
  },
  en: {
    title: "Crate dimensions",
    yes: "Known",
    no: "Unknown / need advice",
    note: "International air transport is generally checked in centimeters and kilograms. If you only know inches or pounds, add them under additional details.",
    crate: "Crate",
    length: "Length",
    width: "Width",
    height: "Height",
    weight: "Crate weight",
    add: "Add another crate",
    remove: "Remove",
  },
} as const;

export function Crates({ language }: CratesProps) {
  const [known, setKnown] = useState<"yes" | "no" | "">("");
  const [rows, setRows] = useState<CrateRow[]>([{ id: 1 }]);
  const text = copy[language];

  return (
    <fieldset className="grid gap-3 sm:col-span-2">
      <legend className="font-bold">{text.title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {[["yes", text.yes], ["no", text.no]].map(([value, label]) => (
          <label key={value} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 font-bold has-[:checked]:border-[#1766ba] has-[:checked]:bg-[#eaf5ff]">
            <input className="h-5 w-5 accent-[#073273]" type="radio" name="crateSizeKnown" value={value} checked={known === value} onChange={() => setKnown(value as "yes" | "no")} />
            {label}
          </label>
        ))}
      </div>
      {known === "yes" ? (
        <div className="mt-2 grid gap-4">
          <p className="text-sm font-medium leading-6 text-[#506783]">{text.note}</p>
          {rows.map((row, index) => (
            <fieldset key={row.id} className="grid gap-3 rounded-2xl border border-[#c9def2] bg-[#f9fcff] p-4 sm:grid-cols-2 lg:grid-cols-4">
              <legend className="px-2 font-bold">{text.crate} {index + 1}</legend>
              {[["Length", text.length, "cm"], ["Width", text.width, "cm"], ["Height", text.height, "cm"], ["Weight", text.weight, "kg"]].map(([key, label, unit]) => (
                <label key={key} className="grid gap-2 text-sm font-bold"><span>{label}</span><span className="flex items-center overflow-hidden rounded-xl border border-[#c9def2] bg-white"><input type="number" min="0" step="0.1" name={`crate${key}[]`} className="min-h-12 min-w-0 flex-1 bg-transparent px-3 outline-none" /><span className="pr-3 text-[#6c829d]">{unit}</span></span></label>
              ))}
              {rows.length > 1 ? <button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#c9def2] bg-white px-4 font-bold text-[#506783] sm:col-span-2 lg:col-span-4 lg:justify-self-end" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}><Minus size={17} />{text.remove}</button> : null}
            </fieldset>
          ))}
          <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1766ba] bg-white px-5 font-bold text-[#1766ba] sm:justify-self-start" onClick={() => setRows((current) => [...current, { id: Math.max(...current.map((item) => item.id)) + 1 }])}><Plus size={18} />{text.add}</button>
        </div>
      ) : null}
    </fieldset>
  );
}
