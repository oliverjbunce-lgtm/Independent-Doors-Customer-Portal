import React from 'react';
import { Plus, Table as TableIcon } from 'lucide-react';
import { DoorOrderRow, OrderData } from '../types';
import { DoorRow } from './DoorRow';

interface Props {
  data: OrderData;
  onAddRow: () => void;
  onUpdateRow: (id: string, field: keyof DoorOrderRow, value: any) => void;
  onDeleteRow: (id: string) => void;
}

export const OrderTable: React.FC<Props> = ({ data, onAddRow, onUpdateRow, onDeleteRow }) => {
  return (
    <div className="apple-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 p-12 border-b border-black/[0.05]">
        <div className="flex items-center gap-6">
          <div className="bg-apple-blue/10 p-5 rounded-[20px]">
            <TableIcon className="text-apple-blue w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black tracking-tight">Door Schedule</h3>
            <p className="text-[15px] text-apple-gray font-medium">Add and manage door measurements</p>
          </div>
        </div>
        <button
          onClick={onAddRow}
          className="apple-button-primary no-print flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Add Door
        </button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/[0.02] border-b border-black/[0.05]">
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight text-center w-16">#</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight">Location</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight">Hanging</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight">Dimensions</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight">Trim</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight">Gap/Gib</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight">Core</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight">Soft Close</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight">Notes</th>
              <th className="p-6 text-[12px] font-bold text-black/40 uppercase tracking-tight text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.doors.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-black/20">
                    <TableIcon className="w-12 h-12" strokeWidth={1} />
                    <p className="text-sm font-semibold">No doors added yet</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.doors.map((door, index) => (
                <DoorRow
                  key={door.id}
                  row={door}
                  index={index}
                  onUpdate={onUpdateRow}
                  onDelete={onDeleteRow}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden divide-y divide-black/[0.05]">
        {data.doors.length === 0 ? (
          <div className="p-20 text-center">
            <div className="flex flex-col items-center gap-3 text-black/20">
              <TableIcon className="w-12 h-12" strokeWidth={1} />
              <p className="text-sm font-semibold">No doors added yet</p>
            </div>
          </div>
        ) : (
          data.doors.map((door, index) => (
            <DoorRow
              key={door.id}
              row={door}
              index={index}
              onUpdate={onUpdateRow}
              onDelete={onDeleteRow}
            />
          ))
        )}
      </div>
    </div>
  );
};
