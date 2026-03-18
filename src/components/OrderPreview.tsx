import React from 'react';
import { Building2, User, MapPin, Hash, Calendar, Settings, Layers, CheckCircle2 } from 'lucide-react';
import { OrderData } from '../types';

interface Props {
  order: OrderData;
}

export const OrderPreview: React.FC<Props> = ({ order }) => {
  return (
    <div className="bg-white text-black">
      {/* Document Header */}
      <div className="flex justify-between items-start border-b border-black/[0.05] pb-10 mb-16">
        <div>
          <h4 className="text-[12px] font-bold text-apple-blue uppercase tracking-tight mb-2">Order Summary</h4>
          <h3 className="text-4xl font-bold text-black tracking-tight">Confirmation</h3>
        </div>
        <div className="text-right">
          <h4 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-2">Reference</h4>
          <p className="text-xl font-bold text-apple-blue">{order.orderNumber || 'Pending'}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
        <div className="space-y-10">
          <div>
            <h5 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-6 flex items-center gap-3">
              <Building2 className="w-4 h-4" strokeWidth={2.5} /> Job Details
            </h5>
            <div className="space-y-4">
              <p className="text-2xl font-bold text-black tracking-tight">{order.jobName || 'Untitled Job'}</p>
              <div className="flex items-center gap-3 text-[15px] font-medium text-black/60">
                <User className="w-4 h-4" /> {order.contactName || 'No contact specified'}
              </div>
              <div className="flex items-start gap-3 text-[15px] font-medium text-black/60">
                <MapPin className="w-4 h-4 mt-0.5" /> {order.siteAddress || 'No address specified'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 pt-10 border-t border-black/[0.03]">
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

        <div className="bg-black/[0.02] rounded-[32px] p-12 border border-black/[0.03]">
          <h5 className="text-[12px] font-bold text-apple-blue uppercase tracking-tight mb-8 flex items-center gap-3">
            <Settings className="w-4 h-4" strokeWidth={2.5} /> Global Specs
          </h5>
          <div className="grid grid-cols-2 gap-y-8 gap-x-12">
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
          </div>
        </div>
      </div>

      {/* Mini Schedule */}
      <div className="mb-16">
        <h5 className="text-[12px] font-bold text-apple-gray uppercase tracking-tight mb-8 flex items-center gap-3">
          <Layers className="w-4 h-4" strokeWidth={2.5} /> Door Schedule
        </h5>
        <div className="border border-black/[0.05] rounded-[32px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-black/[0.05]">
                <th className="p-6 text-[12px] font-bold text-apple-gray uppercase tracking-tight">Location</th>
                <th className="p-6 text-[12px] font-bold text-apple-gray uppercase tracking-tight">Hanging</th>
                <th className="p-6 text-[12px] font-bold text-apple-gray uppercase tracking-tight">Size (mm)</th>
                <th className="p-6 text-[12px] font-bold text-apple-gray uppercase tracking-tight">Core</th>
                <th className="p-6 text-[12px] font-bold text-apple-gray uppercase tracking-tight text-right">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {order.doors.map((door, i) => (
                <tr key={door.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="p-6 text-[15px] font-bold text-black">{door.location || `Door ${i+1}`}</td>
                  <td className="p-6 text-[15px] font-bold text-apple-blue">{door.hanging}</td>
                  <td className="p-6 text-[15px] font-medium text-black/60">{door.height}×{door.width}×{door.thickness}</td>
                  <td className="p-6 text-[15px] font-medium text-black/60">{door.doorCore}</td>
                  <td className="p-6 text-[15px] font-bold text-black text-right">1</td>
                </tr>
              ))}
              {order.doors.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-[15px] text-apple-gray font-medium italic">No doors added to schedule.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="bg-apple-blue/[0.03] rounded-[32px] p-12 flex items-center justify-between border border-apple-blue/[0.05]">
        <div className="flex items-center gap-6">
          <div className="bg-apple-blue text-white p-5 rounded-[20px] shadow-lg shadow-apple-blue/20">
            <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-apple-blue uppercase tracking-tight">Status</p>
            <p className="text-2xl font-bold text-black tracking-tight">Ready to Send</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-bold text-apple-gray uppercase tracking-tight">Total Doors</p>
          <p className="text-5xl font-bold text-apple-blue leading-none">{order.doors.length}</p>
        </div>
      </div>
    </div>
  );
};
