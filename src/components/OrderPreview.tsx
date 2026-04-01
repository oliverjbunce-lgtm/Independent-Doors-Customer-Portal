import React from 'react';
import { Building2, User, MapPin, Settings, Layers, CheckCircle2 } from 'lucide-react';
import { OrderData } from '../types';

interface Props {
  order: OrderData;
}

export const OrderPreview: React.FC<Props> = ({ order }) => {
  return (
    <div className="bg-white text-black">
      {/* Document Header */}
      <div className="flex justify-between items-start border-b border-black/[0.05] pb-6 sm:pb-10 mb-8 sm:mb-16 gap-4">
        <div>
          <h4 className="text-[12px] font-bold text-apple-blue uppercase tracking-tight mb-2">Order Summary</h4>
          <h3 className="text-2xl sm:text-4xl font-bold text-black tracking-tight">Confirmation</h3>
        </div>
        <div className="text-right shrink-0">
          <h4 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-2">Reference</h4>
          <p className="text-base sm:text-xl font-bold text-apple-blue">{order.orderNumber || 'Pending'}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 mb-8 sm:mb-16">
        <div className="space-y-6 sm:space-y-10">
          <div>
            <h5 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-4 sm:mb-6 flex items-center gap-3">
              <Building2 className="w-4 h-4" strokeWidth={2.5} /> Job Details
            </h5>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xl sm:text-2xl font-bold text-black tracking-tight">{order.jobName || 'Untitled Job'}</p>
              <div className="flex items-center gap-3 text-[14px] sm:text-[15px] font-medium text-black/60">
                <User className="w-4 h-4 shrink-0" /> {order.contactName || 'No contact specified'}
              </div>
              <div className="flex items-start gap-3 text-[14px] sm:text-[15px] font-medium text-black/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {order.siteAddress || 'No address specified'}
              </div>
            </div>
          </div>

          {/* Merchant / Date / Method — stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-10 border-t border-black/[0.03]">
            <div>
              <h5 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-2">Merchant</h5>
              <p className="text-[15px] font-bold text-black">{order.merchant || 'TBC'}</p>
            </div>
            <div>
              <h5 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-2">Required By</h5>
              <p className="text-[15px] font-bold text-black">{order.requiredBy || 'TBC'}</p>
            </div>
            <div>
              <h5 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-2">Method</h5>
              <p className="text-[15px] font-bold text-black">{order.deliveryType}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/[0.02] rounded-[24px] sm:rounded-[32px] p-6 sm:p-12 border border-black/[0.03]">
          <h5 className="text-[12px] font-bold text-apple-blue uppercase tracking-tight mb-5 sm:mb-8 flex items-center gap-3">
            <Settings className="w-4 h-4" strokeWidth={2.5} /> Global Specs
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 sm:gap-y-8 gap-x-6 sm:gap-x-12">
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-apple-gray uppercase tracking-tight">Jamb</p>
              <p className="text-[15px] font-bold text-black">{order.globalSpecs.jambStyle} / {order.globalSpecs.jambMaterial}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-apple-gray uppercase tracking-tight">Hinges</p>
              <p className="text-[15px] font-bold text-black">{order.globalSpecs.hingeDetails || 'Standard'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-apple-gray uppercase tracking-tight">Handle Ht</p>
              <p className="text-[15px] font-bold text-black">{order.globalSpecs.handleHeight}mm</p>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-apple-gray uppercase tracking-tight">Drilling</p>
              <p className="text-[15px] font-bold text-black">{order.globalSpecs.drillingRequired ? 'Yes' : 'No'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-apple-gray uppercase tracking-tight">Hardware Brand</p>
              <p className="text-[15px] font-bold text-black">{order.globalSpecs.hardwareBrand || '—'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-apple-gray uppercase tracking-tight">Robe Track</p>
              <p className="text-[15px] font-bold text-black">{order.globalSpecs.robeTrackColour || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Door Schedule */}
      <div className="mb-8 sm:mb-16">
        <h5 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-5 sm:mb-8 flex items-center gap-3">
          <Layers className="w-4 h-4" strokeWidth={2.5} /> Door Schedule
        </h5>

        {/* Desktop table (md+) */}
        <div className="hidden md:block border border-black/[0.05] rounded-[20px] sm:rounded-[32px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '680px' }}>
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/[0.05]">
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">#</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Location</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Hang</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">H×W×T (mm)</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Trim H×W</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Gap/Gib</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Finish</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Core</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Frame</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Soft ×</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Hw Code</th>
                  <th className="p-3 sm:p-4 text-[11px] font-bold text-apple-gray uppercase tracking-tight">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {order.doors.map((door, i) => (
                  <tr key={door.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="p-3 sm:p-4 text-[13px] font-bold text-black/30">{i + 1}</td>
                    <td className="p-3 sm:p-4 text-[14px] font-bold text-black">{door.location || `Door ${i + 1}`}</td>
                    <td className="p-3 sm:p-4 text-[14px] font-bold text-apple-blue">{door.hanging}</td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60 whitespace-nowrap">{door.height}×{door.width}×{door.thickness}</td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60 whitespace-nowrap">
                      {door.trimHeight && door.trimWidth ? `${door.trimHeight}×${door.trimWidth}` : '—'}
                    </td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60 whitespace-nowrap">{door.floorGap}/{door.gibFrameSize}</td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60">{door.doorFinish}</td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60">{door.doorCore}</td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60">{door.frameType}</td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60">{door.softClose ? '✓' : '—'}</td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60">{door.hardwareCode || '—'}</td>
                    <td className="p-3 sm:p-4 text-[13px] font-medium text-black/60 max-w-[120px] sm:max-w-[160px] truncate">{door.notes || '—'}</td>
                  </tr>
                ))}
                {order.doors.length === 0 && (
                  <tr>
                    <td colSpan={12} className="p-10 sm:p-16 text-center text-[15px] text-apple-gray font-medium italic">No doors added to schedule.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card list (< md) */}
        <div className="md:hidden space-y-3">
          {order.doors.length === 0 ? (
            <p className="text-[15px] text-apple-gray font-medium italic text-center py-8">No doors added to schedule.</p>
          ) : (
            order.doors.map((door, i) => (
              <div key={door.id} className="border border-black/[0.07] rounded-[18px] p-4 bg-white space-y-3">
                {/* Door header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-apple-blue/10 text-apple-blue text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-[15px] font-bold text-black">{door.location || `Door ${i + 1}`}</span>
                  </div>
                  <span className="text-[13px] font-bold text-apple-blue">{door.hanging}</span>
                </div>
                {/* Dimensions row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/[0.03] rounded-[10px] px-3 py-2 text-center">
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-tight">H</p>
                    <p className="text-[13px] font-bold text-black">{door.height}</p>
                  </div>
                  <div className="bg-black/[0.03] rounded-[10px] px-3 py-2 text-center">
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-tight">W</p>
                    <p className="text-[13px] font-bold text-black">{door.width}</p>
                  </div>
                  <div className="bg-black/[0.03] rounded-[10px] px-3 py-2 text-center">
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-tight">T</p>
                    <p className="text-[13px] font-bold text-black">{door.thickness}</p>
                  </div>
                </div>
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-black/40 font-medium">Finish</span>
                    <span className="font-semibold text-black">{door.doorFinish}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/40 font-medium">Core</span>
                    <span className="font-semibold text-black">{door.doorCore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/40 font-medium">Frame</span>
                    <span className="font-semibold text-black">{door.frameType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/40 font-medium">Soft Close</span>
                    <span className="font-semibold text-black">{door.softClose ? '✓ Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/40 font-medium">Gap/Gib</span>
                    <span className="font-semibold text-black">{door.floorGap}/{door.gibFrameSize}</span>
                  </div>
                  {(door.trimHeight || door.trimWidth) && (
                    <div className="flex justify-between">
                      <span className="text-black/40 font-medium">Trim</span>
                      <span className="font-semibold text-black">{door.trimHeight}×{door.trimWidth}</span>
                    </div>
                  )}
                  {door.hardwareCode && (
                    <div className="flex justify-between col-span-2">
                      <span className="text-black/40 font-medium">Hw Code</span>
                      <span className="font-semibold text-black">{door.hardwareCode}</span>
                    </div>
                  )}
                </div>
                {door.notes && (
                  <p className="text-[12px] text-black/50 font-medium border-t border-black/[0.05] pt-2">{door.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="bg-apple-blue/[0.03] rounded-[24px] sm:rounded-[32px] p-6 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-0 border border-apple-blue/[0.05]">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="bg-apple-blue text-white p-4 sm:p-5 rounded-[18px] sm:rounded-[20px] shadow-lg shadow-apple-blue/20">
            <CheckCircle2 className="w-6 sm:w-8 h-6 sm:h-8" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-apple-blue uppercase tracking-tight">Status</p>
            <p className="text-xl sm:text-2xl font-bold text-black tracking-tight">Ready to Send</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-[12px] font-bold text-apple-gray uppercase tracking-tight">Total Doors</p>
          <p className="text-4xl sm:text-5xl font-bold text-apple-blue leading-none">{order.doors.length}</p>
        </div>
      </div>
    </div>
  );
};
