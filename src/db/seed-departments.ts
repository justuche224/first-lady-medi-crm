import "dotenv/config";
import { db } from ".";
import { departments as departmentsTable } from "./schema";
const departments = [
  {
    name: "Cardiology",
    description:
      "Specializes in diagnosis and treatment of heart and cardiovascular system disorders, including heart disease, hypertension, and cardiac arrhythmias.",
  },
  {
    name: "Neurology",
    description:
      "Focuses on disorders of the nervous system, including brain, spinal cord, and peripheral nerves. Handles conditions like epilepsy, stroke, and neurodegenerative diseases.",
  },
  {
    name: "Oncology",
    description:
      "Dedicated to the diagnosis, treatment, and research of cancer. Provides comprehensive cancer care including chemotherapy, radiation therapy, and surgical oncology.",
  },
  {
    name: "Pediatrics",
    description:
      "Specializes in the medical care of infants, children, and adolescents. Provides preventive care, vaccinations, and treatment for childhood illnesses and developmental issues.",
  },
  {
    name: "Gynecology & Obstetrics",
    description:
      "Focuses on women's reproductive health, pregnancy, childbirth, and postpartum care. Handles prenatal care, delivery, and gynecological conditions.",
  },
  {
    name: "Orthopedics",
    description:
      "Deals with musculoskeletal system disorders including bones, joints, ligaments, tendons, and muscles. Specializes in sports injuries, fractures, and joint replacements.",
  },
  {
    name: "Emergency Medicine",
    description:
      "Provides immediate care for acute illnesses and injuries that require urgent medical attention. Operates 24/7 for life-threatening conditions and trauma.",
  },
  {
    name: "Internal Medicine",
    description:
      "Focuses on the prevention, diagnosis, and treatment of adult diseases. Serves as primary care physicians for complex medical conditions affecting multiple organ systems.",
  },
  {
    name: "General Surgery",
    description:
      "Performs surgical procedures for a wide range of conditions including abdominal surgery, trauma surgery, and emergency surgical interventions.",
  },
  {
    name: "Radiology",
    description:
      "Uses medical imaging techniques like X-rays, CT scans, MRI, and ultrasound to diagnose and treat various medical conditions. Provides both diagnostic and interventional services.",
  },
  {
    name: "Laboratory Medicine",
    description:
      "Conducts various laboratory tests including blood work, microbiology, pathology, and molecular diagnostics to support disease diagnosis and treatment monitoring.",
  },
  {
    name: "Psychiatry",
    description:
      "Specializes in the diagnosis, treatment, and prevention of mental health disorders. Provides therapy, medication management, and comprehensive mental health care.",
  },
  {
    name: "Dermatology",
    description:
      "Focuses on skin, hair, and nail disorders. Diagnoses and treats conditions ranging from acne and eczema to skin cancer and cosmetic dermatology.",
  },
  {
    name: "Ophthalmology",
    description:
      "Specializes in eye care and vision health. Handles eye examinations, treatment of eye diseases, vision correction, and surgical procedures for eye conditions.",
  },
  {
    name: "Otolaryngology (ENT)",
    description:
      "Deals with disorders of the ear, nose, throat, and related structures of the head and neck. Provides care for hearing, balance, and communication disorders.",
  },
  {
    name: "Urology",
    description:
      "Specializes in diseases of the urinary tract system and male reproductive organs. Handles kidney stones, urinary tract infections, and urological cancers.",
  },
  {
    name: "Pulmonology",
    description:
      "Focuses on respiratory system disorders including lungs and airways. Treats conditions like asthma, COPD, pneumonia, and sleep-related breathing disorders.",
  },
  {
    name: "Gastroenterology",
    description:
      "Specializes in digestive system disorders including stomach, intestines, liver, and pancreas. Handles conditions like ulcers, IBS, liver disease, and colon cancer.",
  },
  {
    name: "Endocrinology",
    description:
      "Focuses on hormonal and metabolic disorders including diabetes, thyroid diseases, and adrenal gland disorders. Manages hormone-related conditions and metabolic health.",
  },
  {
    name: "Nephrology",
    description:
      "Specializes in kidney diseases and disorders. Provides dialysis treatment, kidney transplant care, and management of chronic kidney disease and hypertension.",
  },
  {
    name: "Hematology",
    description:
      "Focuses on blood disorders including anemia, clotting disorders, leukemia, and lymphoma. Provides blood transfusions and bone marrow transplant services.",
  },
  {
    name: "Rheumatology",
    description:
      "Specializes in autoimmune and inflammatory diseases affecting joints, muscles, and bones. Treats conditions like rheumatoid arthritis and lupus.",
  },
  {
    name: "Anesthesiology",
    description:
      "Provides anesthesia and pain management services for surgical procedures and chronic pain conditions. Ensures patient comfort and safety during operations.",
  },
  {
    name: "Physical Medicine & Rehabilitation",
    description:
      "Focuses on restoring function and improving quality of life for patients with disabilities or chronic conditions through physical therapy and rehabilitation programs.",
  },
  {
    name: "Infectious Diseases",
    description:
      "Specializes in the diagnosis and treatment of complex infections caused by bacteria, viruses, fungi, and parasites. Handles HIV/AIDS, tuberculosis, and tropical diseases.",
  },
];

async function main() {
  try {
    console.log("seeding departments");
    for (const department of departments) {
      await db.insert(departmentsTable).values(department);
    }
    console.log("departments seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
