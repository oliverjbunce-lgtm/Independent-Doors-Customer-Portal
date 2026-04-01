import React from 'react';
import { Trash2, AlertCircle, Check } from 'lucide-react';
import { DoorOrderRow, Hanging, DoorCore, DoorFinish, FrameType } from '../types';

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
      <td className="p-4 text-center">
        <span className="text-[12px] font-bold text-black/20 group-hover:text-apple-blue transition-colors">{index + 1}</span>
      </td>

      {/* Location */}
      <td className="p-4 min-w-[180px]">
        <div className="space-y-1">
          <input
            type="text"
            value={row.location}
            onChange={(e) => onUpdate(row.id, 'location', e.target.value)}
            className="w-full px-3 py-1.5 text-[14px] font-semibold bg-transparent border-none focus:ring-0 outline-none placeholder:text-black/10"
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

      {/* Hanging */}
      <td className="p-4">
        <div className="flex items-center gap-1 bg-black/[0.05] p-1 rounded-[10px] w-fit">
          {(['LH', 'RH', 'Slider', 'Bi-Fold'] as Hanging[]).map((h) => (
            <button
              key={h}
              onClick={() => onUpdate(row.id, 'hanging', h)}
              className={`px-3 py-1 text-[11px] font-bold rounded-[8px] transition-all whitespace-nowrap ${
                row.hanging === h ? 'bg-white text-apple-blue shadow-sm' : 'text-black/40 hover:text-black/60'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </td>

      {/* Dimensions H × W × T */}
      <td className="p-4">
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={row.height}
            onChange={(e) => onUpdate(row.id, 'height', e.target.value)}
            className="w-14 px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
            inputMode="numeric"
          />
          <span className="text-black/10 font-bold text-[11px]">×</span>
          <input
            type="text"
            value={row.width}
            onChange={(e) => onUpdate(row.id, 'width', e.target.value)}
            className="w-14 px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
            inputMode="numeric"
          />
          <span className="text-black/10 font-bold text-[11px]">×</span>
          <input
            type="text"
            value={row.thickness}
            onChange={(e) => onUpdate(row.id, 'thickness', e.target.value)}
            className="w-10 px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
            inputMode="numeric"
          />
        </div>
      </td>

      {/* Trim H × W */}
      <td className="p-4">
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={row.trimHeight}
            onChange={(e) => onUpdate(row.id, 'trimHeight', e.target.value)}
            className="w-14 px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
            placeholder="TH"
            inputMode="numeric"
          />
          <span className="text-black/10 font-bold text-[11px]">×</span>
          <input
            type="text"
            value={row.trimWidth}
            onChange={(e) => onUpdate(row.id, 'trimWidth', e.target.value)}
            className="w-14 px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
            placeholder="TW"
            inputMode="numeric"
          />
        </div>
      </td>

      {/* Gap / Gib */}
      <td className="p-4">
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={row.floorGap}
            onChange={(e) => onUpdate(row.id, 'floorGap', e.target.value)}
            className="w-12 px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
            inputMode="numeric"
          />
          <span className="text-black/10 font-bold text-[11px]">/</span>
          <input
            type="text"
            value={row.gibFrameSize}
            onChange={(e) => onUpdate(row.id, 'gibFrameSize', e.target.value)}
            className="w-12 px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none text-center"
            inputMode="numeric"
          />
        </div>
      </td>

      {/* Door Finish */}
      <td className="p-4">
        <select
          value={row.doorFinish}
          onChange={(e) => onUpdate(row.id, 'doorFinish', e.target.value)}
          className="w-full px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none appearance-none"
        >
          {(['Primed', 'White', 'RAW', 'Custom'] as DoorFinish[]).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </td>

      {/* Door Core */}
      <td className="p-4">
        <select
          value={row.doorCore}
          onChange={(e) => onUpdate(row.id, 'doorCore', e.target.value)}
          className="w-full px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none appearance-none"
        >
          {(['Honeycomb', 'Poly', 'Solid'] as DoorCore[]).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </td>

      {/* Frame Type */}
      <td className="p-4">
        <select
          value={row.frameType}
          onChange={(e) => onUpdate(row.id, 'frameType', e.target.value)}
          className="w-full px-2 py-1.5 text-[13px] font-semibold bg-black/[0.03] border-none rounded-[8px] focus:ring-2 focus:ring-apple-blue/20 outline-none appearance-none"
        >
          {(['Standard', 'Cavity', 'Bifold', 'Wardrobe', 'Custom'] as FrameType[]).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </td>

      {/* Soft Close */}
      <td className="p-4">
        <button
          onClick={() => onUpdate(row.id, 'softClose', !row.softClose)}
          className={`w-full py-2 rounded-[10px] transition-all flex items-center justify-center ${
            row.softClose ? 'bg-emerald-500 text-white shadow-sm' : 'bg-black/[0.05] text-black/20'
          }`}
        >
          <Check className={`w-4 h-4 ${row.softClose ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
        </button>
      </td>

      {/* Hardware Code */}
      <td className="p-4 min-w-[120px]">
        <input
          type="text"
          value={row.hardwareCode}
          onChange={(e) => onUpdate(row.id, 'hardwareCode', e.target.value)}
          className="w-full px-3 py-1.5 text-[13px] font-medium bg-transparent border-none focus:ring-0 outline-none placeholder:text-black/10"
          placeholder="Code"
        />
      </td>

      {/* Notes */}
      <td className="p-4 min-w-[140px]">
        <input
          type="text"
          value={row.notes}
          onChange={(e) => onUpdate(row.id, 'notes', e.target.value)}
          className="w-full px-3 py-1.5 text-[13px] font-medium bg-transparent border-none focus:ring-0 outline-none placeholder:text-black/10"
          placeholder="Notes"
        />
      </td>

      {/* Delete */}
      <td className="p-4 text-right no-print">
        <button
          onClick={() => onDelete(row.id)}
          className="p-2 text-black/10 hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-all"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </td>
    </tr>
  );

  const MobileCard = (
    <div className="md:hidden p-5 space-y-5 bg-white border-b border-black/[0.05] last:border-0">
      {/* Header row: number, location, delete */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-apple-blue/10 text-apple-blue text-[11px] font-bold shrink-0">
            {index + 1}
          </span>
          <input
            type="text"
            value={row.location}
            onChange={(e) => onUpdate(row.id, 'location', e.target.value)}
            className="text-base font-bold text-black bg-transparent border-none focus:ring-0 p-0 placeholder:text-black/20 min-w-0 w-full"
            placeholder="Door Location"
          />
        </div>
        <button
          onClick={() => onDelete(row.id)}
          className="p-2.5 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-[10px] transition-all shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
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

      <div className="space-y-5">
        {/* Hanging */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Hanging Type</label>
          <div className="grid grid-cols-4 gap-2 bg-black/[0.05] p-1 rounded-[12px]">
            {(['LH', 'RH', 'Slider', 'Bi-Fold'] as Hanging[]).map((h) => (
              <button
                key={h}
                onClick={() => onUpdate(row.id, 'hanging', h)}
                className={`py-3 text-[11px] font-bold rounded-[10px] transition-all min-h-[44px] ${
                  row.hanging === h ? 'bg-white text-apple-blue shadow-sm' : 'text-black/40'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions — each in its own labeled field for readability */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Size (mm)</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-black/30 ml-1">Height</span>
              <input type="text" value={row.height} onChange={(e) => onUpdate(row.id, 'height', e.target.value)}
                className="apple-input text-center px-2 text-sm" placeholder="H" inputMode="numeric" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-black/30 ml-1">Width</span>
              <input type="text" value={row.width} onChange={(e) => onUpdate(row.id, 'width', e.target.value)}
                className="apple-input text-center px-2 text-sm" placeholder="W" inputMode="numeric" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-black/30 ml-1">Thick</span>
              <input type="text" value={row.thickness} onChange={(e) => onUpdate(row.id, 'thickness', e.target.value)}
                className="apple-input text-center px-2 text-sm" placeholder="T" inputMode="numeric" />
            </div>
          </div>
        </div>

        {/* Trim & Gap/Gib */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Trim H × W</label>
            <div className="flex items-center gap-1">
              <input type="text" value={row.trimHeight} onChange={(e) => onUpdate(row.id, 'trimHeight', e.target.value)}
                className="apple-input text-center px-2 text-sm" placeholder="TH" inputMode="numeric" />
              <span className="text-black/20 font-bold text-sm">×</span>
              <input type="text" value={row.trimWidth} onChange={(e) => onUpdate(row.id, 'trimWidth', e.target.value)}
                className="apple-input text-center px-2 text-sm" placeholder="TW" inputMode="numeric" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Gap / Gib</label>
            <div className="flex items-center gap-1">
              <input type="text" value={row.floorGap} onChange={(e) => onUpdate(row.id, 'floorGap', e.target.value)}
                className="apple-input text-center px-2 text-sm" placeholder="Gap" inputMode="numeric" />
              <span className="text-black/20 font-bold text-sm">/</span>
              <input type="text" value={row.gibFrameSize} onChange={(e) => onUpdate(row.id, 'gibFrameSize', e.target.value)}
                className="apple-input text-center px-2 text-sm" placeholder="Gib" inputMode="numeric" />
            </div>
          </div>
        </div>

        {/* Finish / Core / Frame — 2-col + 1 stacked */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Finish</label>
            <select value={row.doorFinish} onChange={(e) => onUpdate(row.id, 'doorFinish', e.target.value)}
              className="apple-input appearance-none text-sm">
              {(['Primed', 'White', 'RAW', 'Custom'] as DoorFinish[]).map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Core</label>
            <select value={row.doorCore} onChange={(e) => onUpdate(row.id, 'doorCore', e.target.value)}
              className="apple-input appearance-none text-sm">
              {(['Honeycomb', 'Poly', 'Solid'] as DoorCore[]).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Frame Type</label>
            <select value={row.frameType} onChange={(e) => onUpdate(row.id, 'frameType', e.target.value)}
              className="apple-input appearance-none text-sm">
              {(['Standard', 'Cavity', 'Bifold', 'Wardrobe', 'Custom'] as FrameType[]).map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Hardware Code</label>
            <input type="text" value={row.hardwareCode} onChange={(e) => onUpdate(row.id, 'hardwareCode', e.target.value)}
              className="apple-input text-sm" placeholder="Code" inputMode="text" autoComplete="off" />
          </div>
        </div>

        {/* Soft Close */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Soft Close</label>
          <button
            onClick={() => onUpdate(row.id, 'softClose', !row.softClose)}
            className={`w-full py-3 rounded-[12px] transition-all flex items-center justify-center gap-2 text-[13px] font-bold min-h-[44px] ${
              row.softClose ? 'bg-emerald-500 text-white' : 'bg-black/[0.05] text-black/30'
            }`}
          >
            <Check className={`w-4 h-4 ${row.softClose ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
            {row.softClose ? 'Soft Close: Yes' : 'Soft Close: No'}
          </button>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-black/40 uppercase tracking-tight ml-1">Notes</label>
          <textarea
            value={row.notes}
            onChange={(e) => onUpdate(row.id, 'notes', e.target.value)}
            className="apple-input min-h-[80px] py-4 text-sm"
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
