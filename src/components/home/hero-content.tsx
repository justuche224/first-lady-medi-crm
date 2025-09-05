"use client";

export default function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-lg bg-background/80 backdrop-blur-lg rounded-lg p-4">
      <div className="text-left">
        <div
          className="inline-flex items-center px-3 py-1 rounded-full bg-accent/5 backdrop-blur-sm mb-4 relative"
          style={{
            filter: "url(#glass-effect)",
          }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full" />
          <span className="text-foreground/90 text-xs font-light relative z-10">
            ✨ New Medical CRM Experience
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-foreground mb-4">
          <span className="font-medium italic instrument text-primary">
            Medical
          </span>{" "}
          CRM
          <br />
          <span className="font-light tracking-tight text-foreground">
            Excellence
          </span>
        </h1>

        {/* Description */}
        <p className="text-xs font-light text-muted-foreground mb-4 leading-relaxed">
          Streamline your medical practice with our comprehensive CRM solution.
          Manage patient records, appointments, and staff workflows with
          intuitive tools designed for healthcare professionals.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <button className="px-8 py-3 rounded-full bg-transparent border border-primary/30 text-foreground font-normal text-xs transition-all duration-200 hover:bg-primary/10 hover:border-primary/50 cursor-pointer">
            Staff Portal
          </button>
          <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-normal text-xs transition-all duration-200 hover:bg-primary/90 cursor-pointer">
            Patients
          </button>
        </div>
      </div>
    </main>
  );
}
