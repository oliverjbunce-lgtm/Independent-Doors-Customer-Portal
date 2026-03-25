import React from 'react';
import { Calendar, User, MapPin, Hash, Building2, Truck, Package } from 'lucide-react';
import { OrderData } from '../types';

interface Props {
  data: OrderData;
  onChange: (field: keyof OrderData, value: any) => void;
}

export const OrderHeader: React.FC<Props> = ({ data, onChange }) => {
  return (
    <div className="apple-card p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-8 mb-8 sm:mb-12">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="bg-apple-blue/10 p-3 sm:p-4 rounded-[16px]">
            <Building2 className="text-apple-blue w-6 sm:w-7 h-6 sm:h-7" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Order Details</h2>
            <p className="text-[14px] text-apple-gray font-medium">Job and merchant information</p>
          </div>
        </div>
        
        {/* Segmented Control — full-width on mobile */}
        <div className="bg-black/[0.05] p-1.5 rounded-[14px] flex w-full sm:w-auto">
          <button
            onClick={() => onChange('deliveryType', 'Delivery')}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-[11px] text-[14px] font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              data.deliveryType === 'Delivery'
                ? 'bg-white text-apple-blue shadow-sm'
                : 'text-black/40 hover:text-black/60'
            }`}
          >
            <Truck className="w-4 h-4" strokeWidth={2.5} />
            Delivery
          </button>
          <button
            onClick={() => onChange('deliveryType', 'Collection')}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-[11px] text-[14px] font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              data.deliveryType === 'Collection'
                ? 'bg-white text-apple-blue shadow-sm'
                : 'text-black/40 hover:text-black/60'
            }`}
          >
            <Package className="w-4 h-4" strokeWidth={2.5} />
            Collection
          </button>
        </div>
      </div>

      {/* 1-col on mobile, 2-col on sm, 3-col on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 sm:gap-x-10 gap-y-6 sm:gap-y-8">
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-black/60 ml-1 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" /> Job Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={data.jobName}
            onChange={(e) => onChange('jobName', e.target.value)}
            className="apple-input"
            placeholder="Required"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-black/60 ml-1 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Contact <span className="text-black/20 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.contactName}
            onChange={(e) => onChange('contactName', e.target.value)}
            className="apple-input"
            placeholder="Full Name"
          />
        </div>

        <div className="space-y-2 sm:col-span-2 md:col-span-1">
          <label className="text-[13px] font-semibold text-black/60 ml-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Site Address <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={data.siteAddress}
            onChange={(e) => onChange('siteAddress', e.target.value)}
            className="apple-input"
            placeholder="Required"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-black/60 ml-1 flex items-center gap-2">
            <Hash className="w-3.5 h-3.5" /> Order # <span className="text-black/20 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.orderNumber}
            onChange={(e) => onChange('orderNumber', e.target.value)}
            className="apple-input"
            placeholder="Reference"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-black/60 ml-1 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" /> Merchant <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              required
              value={data.merchant}
              onChange={(e) => onChange('merchant', e.target.value)}
              className="apple-input appearance-none pr-10"
            >
              <option value="">Select Merchant</option>
              <option value="ITM">ITM</option>
              <option value="PlaceMakers">PlaceMakers</option>
              <option value="Carters">Carters</option>
              <option value="Bunnings">Bunnings</option>
              <option value="Mitre 10">Mitre 10</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-black/60 ml-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Required By <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="date"
            value={data.requiredBy}
            onChange={(e) => onChange('requiredBy', e.target.value)}
            className="apple-input"
          />
        </div>
      </div>
    </div>
  );
};
