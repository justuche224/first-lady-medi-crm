import "dotenv/config";
import { createDoctor } from "@/actions/doctor-actions";
// Department-Specialty mapping (ID corresponds to specialty)
const departmentSpecialties = [
  { id: 1, name: "Cardiology", baseFee: 150 },
  { id: 2, name: "Neurology", baseFee: 140 },
  { id: 3, name: "Oncology", baseFee: 160 },
  { id: 4, name: "Pediatrics", baseFee: 120 },
  { id: 5, name: "Gynecology & Obstetrics", baseFee: 130 },
  { id: 6, name: "Orthopedics", baseFee: 145 },
  { id: 7, name: "Emergency Medicine", baseFee: 125 },
  { id: 8, name: "Internal Medicine", baseFee: 115 },
  { id: 9, name: "General Surgery", baseFee: 155 },
  { id: 10, name: "Radiology", baseFee: 135 },
  { id: 11, name: "Laboratory Medicine", baseFee: 110 },
  { id: 12, name: "Psychiatry", baseFee: 125 },
  { id: 13, name: "Dermatology", baseFee: 130 },
  { id: 14, name: "Ophthalmology", baseFee: 140 },
  { id: 15, name: "Otolaryngology (ENT)", baseFee: 135 },
  { id: 16, name: "Urology", baseFee: 145 },
  { id: 17, name: "Pulmonology", baseFee: 130 },
  { id: 18, name: "Gastroenterology", baseFee: 140 },
  { id: 19, name: "Endocrinology", baseFee: 125 },
  { id: 20, name: "Nephrology", baseFee: 135 },
  { id: 21, name: "Hematology", baseFee: 145 },
  { id: 22, name: "Rheumatology", baseFee: 130 },
  { id: 23, name: "Anesthesiology", baseFee: 150 },
  { id: 24, name: "Physical Medicine & Rehabilitation", baseFee: 120 },
  { id: 25, name: "Infectious Diseases", baseFee: 140 },
];

// Realistic names for doctors
const firstNames = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Carol",
  "Kevin",
  "Amanda",
  "Brian",
  "Melissa",
  "George",
  "Deborah",
  "Timothy",
  "Stephanie",
  "Ronald",
  "Dorothy",
  "Edward",
  "Rebecca",
  "Jason",
  "Sharon",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
];

// Medical education institutions
const universities = [
  "Harvard Medical School",
  "Johns Hopkins University",
  "Mayo Clinic College of Medicine",
  "Stanford University School of Medicine",
  "University of Pennsylvania Perelman School of Medicine",
  "University of California, San Francisco",
  "Columbia University Vagelos College of Physicians and Surgeons",
  "Duke University School of Medicine",
  "University of Michigan Medical School",
  "University of Pittsburgh School of Medicine",
  "Northwestern University Feinberg School of Medicine",
  "Washington University School of Medicine",
  "Cornell University Weill Medical College",
  "University of Washington School of Medicine",
  "University of Chicago Pritzker School of Medicine",
];

// Medical certifications
const certifications = [
  "Board Certified in Internal Medicine",
  "Fellow of the American College of Surgeons",
  "Board Certified in Pediatrics",
  "Certified in Emergency Medicine",
  "Board Certified in Radiology",
  "Fellow of the American College of Cardiology",
  "Board Certified in Neurology",
  "Certified in Anesthesiology",
  "Board Certified in Psychiatry",
  "Fellow of the American College of Physicians",
  "Certified in Family Medicine",
  "Board Certified in Pathology",
  "Fellow of the American Academy of Dermatology",
  "Certified in Ophthalmology",
  "Board Certified in Obstetrics & Gynecology",
];

// Generate realistic doctor data
function generateDoctors() {
  const doctors: Array<{
    name: string;
    email: string;
    password: string;
    licenseNumber: string;
    specialty: string;
    departmentId: number;
    yearsOfExperience: number;
    education: string;
    certifications: string;
    consultationFee: number;
  }> = [];
  let licenseCounter = 10001;

  // Generate 3-5 doctors per department
  departmentSpecialties.forEach((dept) => {
    const numDoctors = Math.floor(Math.random() * 3) + 3; // 3-5 doctors per department

    for (let i = 0; i < numDoctors; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `Dr. ${firstName} ${lastName}`;

      // Generate email
      const emailBase = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      const email = `${emailBase}@medhospital.com`;

      // Generate password (secure but predictable for seeding)
      const password = `${firstName.toLowerCase()}123!#`;

      // Generate license number
      const licenseNumber = `MD-${licenseCounter.toString().padStart(6, "0")}`;
      licenseCounter++;

      // Generate experience (1-25 years)
      const yearsOfExperience = Math.floor(Math.random() * 25) + 1;

      // Generate education (2-3 degrees)
      const numDegrees = Math.floor(Math.random() * 2) + 2;
      const educationDegrees = [];
      for (let j = 0; j < numDegrees; j++) {
        const university =
          universities[Math.floor(Math.random() * universities.length)];
        const degree =
          j === 0
            ? "MD"
            : ["BS Biology", "BS Chemistry", "BA Pre-Med", "MS Physiology"][
                Math.floor(Math.random() * 4)
              ];
        educationDegrees.push(`${degree} - ${university}`);
      }
      const education = educationDegrees.join(", ");

      // Generate certifications (1-3 certifications)
      const numCerts = Math.floor(Math.random() * 3) + 1;
      const doctorCerts = [];
      for (let j = 0; j < numCerts; j++) {
        const cert =
          certifications[Math.floor(Math.random() * certifications.length)];
        doctorCerts.push(cert);
      }
      const certificationsList = [...new Set(doctorCerts)].join(", ");

      // Calculate consultation fee based on specialty and experience
      const experienceMultiplier = 1 + (yearsOfExperience / 25) * 0.5; // Up to 50% increase for experienced doctors
      const consultationFee = Math.round(dept.baseFee * experienceMultiplier);

      doctors.push({
        name: fullName,
        email,
        password,
        licenseNumber,
        specialty: dept.name,
        departmentId: dept.id,
        yearsOfExperience,
        education,
        certifications: certificationsList,
        consultationFee,
      });
    }
  });

  return doctors;
}

const doctors = generateDoctors();

const list: unknown[] = [];

async function main() {
  try {
    console.log("seeding doctors");
    for (const doctor of doctors) {
      await createDoctor(doctor);
      console.log(`doctor ${doctor.name} seeded successfully`);
      list.push(doctor);
    }
    console.log("doctors seeded successfully");
    Bun.write("doctors.json", JSON.stringify(list, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
