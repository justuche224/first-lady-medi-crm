CREATE TABLE "bed_occupancy" (
	"id" serial PRIMARY KEY NOT NULL,
	"bed_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"doctor_id" integer,
	"admission_date" timestamp NOT NULL,
	"expected_discharge_date" date,
	"actual_discharge_date" timestamp,
	"admission_reason" text,
	"diagnosis" text,
	"notes" text,
	"priority" text DEFAULT 'normal',
	"status" varchar(20) DEFAULT 'active',
	"transferred_from" integer,
	"transferred_to" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bed_spaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_number" varchar(20) NOT NULL,
	"bed_number" varchar(20) NOT NULL,
	"department_id" integer,
	"ward" varchar(100),
	"floor" integer,
	"type" text NOT NULL,
	"status" text DEFAULT 'available',
	"description" text,
	"equipment" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bed_occupancy" ADD CONSTRAINT "bed_occupancy_bed_id_bed_spaces_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."bed_spaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bed_occupancy" ADD CONSTRAINT "bed_occupancy_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bed_occupancy" ADD CONSTRAINT "bed_occupancy_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bed_spaces" ADD CONSTRAINT "bed_spaces_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;