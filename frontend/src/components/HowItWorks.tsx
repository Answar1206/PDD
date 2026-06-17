import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      title: "1. Select a Module",
      description: "Choose the specific analysis tool from the home page. Whether you're working with video footage, images, text logs, or PDF documents, our specialized AI models are ready.",
      icon: "grid_view"
    },
    {
      title: "2. Upload Evidence",
      description: "Upload your files securely. All data is processed using clinical-grade encryption to ensure chain of custody and maintain forensic integrity.",
      icon: "cloud_upload"
    },
    {
      title: "3. AI Analysis & Processing",
      description: "Our advanced models will scan the media for anomalies, deepfakes, alterations, and hidden metadata. This process typically takes only a few seconds.",
      icon: "memory"
    },
    {
      title: "4. Review the Report",
      description: "Get a comprehensive, detailed breakdown of the findings. Export the results as certified PDF reports suitable for legal and investigative use.",
      icon: "assignment"
    }
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center pt-12 pb-16 px-4 relative overflow-hidden bg-transparent mt-16">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-[0.02]">
        <div className="w-[800px] h-[800px] rounded-full border-[2px] border-[#300000] absolute scale-150"></div>
        <div className="w-[400px] h-[400px] rounded-full border-[2px] border-[#800000] absolute scale-100"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center mb-12 text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-[#300000] tracking-tight mb-4 uppercase">
          How It Works
        </h1>
        <p className="text-[#300000]/60 text-lg font-medium">
          Forensiq AI simplifies complex digital forensics. Follow these straightforward steps to analyze your digital evidence.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="bg-white border border-black/10 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#800000] to-[#500000] flex items-center justify-center text-white shadow-md mb-6">
              <span className="material-symbols-outlined text-2xl">{step.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-[#300000] mb-3">{step.title}</h3>
            <p className="text-[#300000]/70 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
      
      {/* Call to action */}
      <div className="relative z-10 mt-16 text-center">
        <p className="text-[#300000]/50 text-sm uppercase tracking-widest font-bold mb-4">Ready to start?</p>
      </div>
    </div>
  );
}
