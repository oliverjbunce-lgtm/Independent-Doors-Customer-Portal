import React from 'react';
import { Settings, Layers, Ruler } from 'lucide-react';
import { GlobalSpecs, JambMaterial, JambStyle } from '../types';

interface Props {
  specs: GlobalSpecs;
  onChange: (field: keyof GlobalSpecs, value: any) => void;
}

export const GlobalSpecsCard: React.FC<Props> = ({ specs, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
      <div className="apple-card p-6 sm:p-10">
        <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
          <div className="bg-apple-blue/10 p-3 sm:p-4 rounded-[16px]">
            <Settings className="text-apple-blue w-5 sm:w-6 h-5 sm:h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-black tracking-tight">Hardware & Tracks</h3>
            <p className="text-[14px] text-apple-gray font-medium">Common hardware settings</p>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* 1-col on mobile, 2-col on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[13px] font-semibold text-black/60 ml-1">Hinge Details <span className="text-black/20 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={specs.hingeDetails}
                onChange={(e) => onChange('hingeDetails', e.target.value)}
                className="apple-input"
                placeholder="e.g. 3.5' Satin"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[13px] font-semibold text-black/60 ml-1">Robe Track <span className="text-black/20 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={specs.robeTrackColour}
                onChange={(e) => onChange('robeTrackColour', e.target.value)}
                className="apple-input"
                placeholder="e.g. White"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[13px] font-semibold text-black/60 ml-1">Hardware Brand <span className="text-black/20 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={specs.hardwareBrand}
                onChange={(e) => onChange('hardwareBrand', e.target.value)}
                className="apple-input"
                placeholder="e.g. Gainsborough"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[13px] font-semibold text-black/60 ml-1">Handle Height <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={specs.handleHeight}
                  onChange={(e) => onChange('handleHeight', e.target.value)}
                  className="apple-input pr-12"
                  placeholder="1000"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-black/20">MM</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-black/60 ml-1">Drilling Required</label>
            <div className="bg-black/[0.05] p-1.5 rounded-[14px] flex">
              <button
                onClick={() => onChange('drillingRequired', true)}
                className={`flex-1 py-3 rounded-[11px] text-[14px] font-bold transition-all min-h-[44px] ${
                  specs.drillingRequired ? 'bg-white text-apple-blue shadow-sm' : 'text-black/40'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => onChange('drillingRequired', false)}
                className={`flex-1 py-3 rounded-[11px] text-[14px] font-bold transition-all min-h-[44px] ${
                  !specs.drillingRequired ? 'bg-white text-apple-blue shadow-sm' : 'text-black/40'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="apple-card p-6 sm:p-10">
        <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
          <div className="bg-idd-gold/10 p-3 sm:p-4 rounded-[16px]">
            <Layers className="text-apple-blue w-5 sm:w-6 h-5 sm:h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-black tracking-tight">Jamb Specs</h3>
            <p className="text-[14px] text-apple-gray font-medium">Material and style</p>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-black/60 ml-1">Jamb Style</label>
            <div className="bg-black/[0.05] p-1.5 rounded-[14px] flex">
              {(['Flat', 'Groove'] as JambStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => onChange('jambStyle', style)}
                  className={`flex-1 py-3 rounded-[11px] text-[14px] font-bold transition-all min-h-[44px] ${
                    specs.jambStyle === style ? 'bg-white text-apple-blue shadow-sm' : 'text-black/40'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-black/60 ml-1">Jamb Material</label>
            <div className="bg-black/[0.05] p-1.5 rounded-[14px] flex">
              {(['MDF', 'Pine'] as JambMaterial[]).map((mat) => (
                <button
                  key={mat}
                  onClick={() => onChange('jambMaterial', mat)}
                  className={`flex-1 py-3 rounded-[11px] text-[14px] font-bold transition-all min-h-[44px] ${
                    specs.jambMaterial === mat ? 'bg-white text-apple-blue shadow-sm' : 'text-black/40'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 p-4 bg-apple-blue/[0.03] rounded-[16px] border border-apple-blue/[0.05] flex items-start gap-3">
          <Ruler className="w-4 h-4 text-apple-blue/40 mt-0.5 shrink-0" strokeWidth={2.5} />
          <p className="text-[12px] text-apple-gray font-medium leading-relaxed">
            These specs apply to all doors unless overridden in individual row notes.
          </p>
        </div>
      </div>
    </div>
  );
};
