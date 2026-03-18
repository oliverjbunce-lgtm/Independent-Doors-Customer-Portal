import React from 'react';
import { Trash2, AlertCircle, Check } from 'lucide-react';
import { DoorOrderRow, Hanging, DoorCore } from '../types';

interface Props {
  row: DoorOrderRow;
  index: number;
  onUpdate: (id: string, field: keyof DoorOrderRow, value: any) => void;
  onDelete: (id: string) => void;
}

export const DoorRow: React.FC<Props> = ({ row, index, onUpdate, onDelete }) => {
  const isBathroom = row.location.toLowerCase().includes('bathroom') || row.location.toLowerCase().includes('ensuite');
  const isGarage = row.location.toLowerCase().includes('garage');

  const DesktopRow = (
    <tr className="hidden md:table-row group hover:bg-black/[0.01] transition-colors border-b border-black/[0.05]">
      <td className="p-6 text-center">
        <span className="text-[12px] font-bold text-black/20 group-hover:text-apple-blue transition-colors">{index + 1}</span>
      </td>
      
      <td className="p-6 min-w-[240px]">
        <div className="space-y-2">
          <input
            type="text"
            value={row.location}
            onChange={(e) => onUpdate(row.id, 'location', e.target.value)}
            className="w-full px-3 py-1.5 text-[15px] font-semibold bg-transparent border-none focus:ring-0 outline-none placeholder:text-black/10"
            placeholder="Location"
          />
          {isBathroom && (
            <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold px-2">
              <AlertCircle className="w-3 h-3" />
              PINE JAMBS
            </div>
          )}
          {isGarage && (
            <div className="flex items-center gap-1.5 text-[10px] text-apple-blue font-bold px-2">
              <AlertCircle className="w-3 h-3" />
              SOLID CORE
            </div>
          )}
        </div>
      </td>

      <td className="p-6">
        <div className="flex items-center gap-1.5 bg-black/[0.05] p-1 rounded-[12px] w-fit">
          {(['LH', 'RH', 'Slider', 'Bi-Fold'] as Hanging[]).map((h) => (
            <button
              key={h}
              onClick={() => onUpdate(row.id, 'hanging', h)}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-[9px] transition-all ${
                row.hanging === h ? 'bg-white text-apple-blue shadow-sm' : 'text-black/40 hover:text-black/60'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </td>

      <td className="p-6">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={row.height}
            onChange={(e) => onUpdate(row.id, 'height', e.target.value)}
            className="w-16 px-2.5 py-1.5 text-[14px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
          />
          <span className="text-black/10 font-bold">×</span>
          <input
            type="text"
            value={row.width}
            onChange={(e) => onUpdate(row.id, 'width', e.target.value)}
            className="w-16 px-2.5 py-1.5 text-[14px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
          />
          <span className="text-black/10 font-bold">×</span>
          <input
            type="text"
            value={row.thickness}
            onChange={(e) => onUpdate(row.id, 'thickness', e.target.value)}
            className="w-12 px-2.5 py-1.5 text-[14px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
          />
        </div>
      </td>

      <td className="p-6">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={row.trimHeight}
            onChange={(e) => onUpdate(row.id, 'trimHeight', e.target.value)}
            className="w-16 px-2.5 py-1.5 text-[14px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
          />
          <span className="text-black/10 font-bold">×</span>
          <input
            type="text"
            value={row.trimWidth}
            onChange={(e) => onUpdate(row.id, 'trimWidth', e.target.value)}
            className="w-16 px-2.5 py-1.5 text-[14px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
          />
        </div>
      </td>

      <td className="p-6">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={row.floorGap}
            onChange={(e) => onUpdate(row.id, 'floorGap', e.target.value)}
            className="w-12 px-2.5 py-1.5 text-[14px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
          />
          <span className="text-black/10 font-bold">/</span>
          <input
            type="text"
            value={row.gibFrameSize}
            onChange={(e) => onUpdate(row.id, 'gibFrameSize', e.target.value)}
            className="w-12 px-2.5 py-1.5 text-[14px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
          />
        </div>
      </td>

      <td className="p-6">
        <select
          value={row.doorCore}
          onChange={(e) => onUpdate(row.id, 'doorCore', e.target.value)}
          className="w-full px-3 py-1.5 text-[14px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none appearance-none"
        >
          {(['Honeycomb', 'Poly', 'Solid'] as DoorCore[]).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </td>

      <td className="p-6">
        <button
          onClick={() => onUpdate(row.id, 'softClose', !row.softClose)}
          className={`w-full py-2 rounded-[10px] transition-all flex items-center justify-center ${
            row.softClose ? 'bg-emerald-500 text-white shadow-sm' : 'bg-black/[0.05] text-black/20'
          }`}
        >
          <Check className={`w-5 h-5 ${row.softClose ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
        </button>
      </td>

      <td className="p-6">
        <input
          type="text"
          value={row.notes}
          onChange={(e) => onUpdate(row.id, 'notes', e.target.value)}
          className="w-full px-3 py-1.5 text-[14px] font-medium bg-transparent border-none focus:ring-0 outline-none placeholder:text-black/10"
          placeholder="Notes"
        />
      </td>

      <td className="p-6 text-right no-print">
        <button
          onClick={() => onDelete(row.id)}
          className="p-3 text-black/10 hover:text-red-500 hover:bg-red-50 rounded-[12px] transition-all"
        >
          <Trash2 className="w-5 h-5" strokeWidth={2} />
        </button>
      </td>
    </tr>
  );

  const MobileCard = (
    <div className="md:hidden p-6 space-y-6 bg-white border-b border-black/[0.05] last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-apple-blue/10 text-apple-blue text-[11px] font-bold">
            {index + 1}
          </span>
          <input
            type="text"
            value={row.location}
            onChange={(e) => onUpdate(row.id, 'location', e.target.value)}
            className="text-lg font-bold text-black bg-transparent border-none focus:ring-0 p-0 placeholder:text-black/10"
            placeholder="Location"
          />
        </div>
        <button
          onClick={() => onDelete(row.id)}
          className="p-2 text-black/10 hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-all"
        >
          <Trash2 className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {(isBathroom || isGarage) && (
        <div className="flex flex-col gap-2">
          {isBathroom && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-[12px] text-[11px] text-amber-700 font-bold">
              <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
              PINE JAMBS RECOMMENDED
            </div>
          )}
          {isGarage && (
            <div className="flex items-center gap-2 p-3 bg-apple-blue/[0.03] rounded-[12px] text-[11px] text-apple-blue font-bold">
              <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
              SOLID CORE RECOMMENDED
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Hanging Type</label>
          <div className="grid grid-cols-4 gap-2 bg-black/[0.05] p-1 rounded-[12px]">
            {(['LH', 'RH', 'Slider', 'Bi-Fold'] as Hanging[]).map((h) => (
              <button
                key={h}
                onClick={() => onUpdate(row.id, 'hanging', h)}
                className={`py-2.5 text-[11px] font-bold rounded-[10px] transition-all ${
                  row.hanging === h ? 'bg-white text-apple-blue shadow-sm' : 'text-black/40'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Size (H×W×T)</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={row.height}
                onChange={(e) => onUpdate(row.id, 'height', e.target.value)}
                className="apple-input text-center"
                placeholder="H"
              />
              <span className="text-black/10 font-bold">×</span>
              <input
                type="text"
                value={row.width}
                onChange={(e) => onUpdate(row.id, 'width', e.target.value)}
                className="apple-input text-center"
                placeholder="W"
              />
              <span className="text-black/10 font-bold">×</span>
              <input
                type="text"
                value={row.thickness}
                onChange={(e) => onUpdate(row.id, 'thickness', e.target.value)}
                className="apple-input text-center w-20"
                placeholder="T"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Trim (H×W)</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={row.trimHeight}
                onChange={(e) => onUpdate(row.id, 'trimHeight', e.target.value)}
                className="apple-input text-center"
                placeholder="TH"
              />
              <span className="text-black/10 font-bold">×</span>
              <input
                type="text"
                value={row.trimWidth}
                onChange={(e) => onUpdate(row.id, 'trimWidth', e.target.value)}
                className="apple-input text-center"
                placeholder="TW"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Gap / Gib</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={row.floorGap}
                onChange={(e) => onUpdate(row.id, 'floorGap', e.target.value)}
                className="apple-input text-center"
                placeholder="Gap"
              />
              <span className="text-black/10 font-bold">/</span>
              <input
                type="text"
                value={row.gibFrameSize}
                onChange={(e) => onUpdate(row.id, 'gibFrameSize', e.target.value)}
                className="apple-input text-center"
                placeholder="Gib"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Core & Soft</label>
            <div className="flex gap-2">
              <select
                value={row.doorCore}
                onChange={(e) => onUpdate(row.id, 'doorCore', e.target.value)}
                className="apple-input appearance-none"
              >
                {(['Honeycomb', 'Poly', 'Solid'] as DoorCore[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={() => onUpdate(row.id, 'softClose', !row.softClose)}
                className={`px-4 rounded-[12px] transition-all flex items-center justify-center ${
                  row.softClose ? 'bg-emerald-500 text-white shadow-sm' : 'bg-black/[0.05] text-black/20'
                }`}
              >
                <Check className={`w-5 h-5 ${row.softClose ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Notes</label>
          <textarea
            value={row.notes}
            onChange={(e) => onUpdate(row.id, 'notes', e.target.value)}
            className="apple-input min-h-[100px] py-4"
            placeholder="Special requirements..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {DesktopRow}
      {MobileCard}
    </>
  );
};
