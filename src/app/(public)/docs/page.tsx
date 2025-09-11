"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Calendar,
  FileText,
  Pill,
  TestTube,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  ArrowRight,
  ChevronDown,
  User,
  Stethoscope,
  Hospital,
  Settings,
  Bell,
  Search,
} from "lucide-react";

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const userRoles = [
    {
      icon: Shield,
      title: "Administrator",
      color: "bg-blue-500",
      description: "System-wide management and oversight",
      capabilities: [
        "Manage departments and staff",
        "Oversee all doctors and patients",
        "Generate comprehensive reports",
        "Configure system settings",
        "Monitor platform performance",
        "Handle user access and permissions",
      ],
    },
    {
      icon: Stethoscope,
      title: "Doctor",
      color: "bg-green-500",
      description: "Patient care and medical management",
      capabilities: [
        "Manage patient appointments",
        "Create and update medical records",
        "Prescribe medications",
        "Order and review lab tests",
        "Access patient history",
        "Communicate with patients and staff",
      ],
    },
    {
      icon: User,
      title: "Patient",
      color: "bg-purple-500",
      description: "Access personal health information",
      capabilities: [
        "View medical records and history",
        "Book and manage appointments",
        "Access medication information",
        "View lab test results",
        "Send feedback and messages",
        "Update personal profile",
      ],
    },
    {
      icon: Hospital,
      title: "Staff",
      color: "bg-orange-500",
      description: "Support and administrative functions",
      capabilities: [
        "Assist with patient coordination",
        "Manage department operations",
        "Handle administrative tasks",
        "Support doctors and patients",
        "Process requests and updates",
        "Maintain department records",
      ],
    },
  ];

  const features = [
    {
      icon: Calendar,
      title: "Appointment Management",
      description:
        "Streamlined scheduling system for efficient healthcare delivery",
      details:
        "Book, reschedule, and manage appointments with automated reminders and conflict resolution.",
    },
    {
      icon: FileText,
      title: "Medical Records",
      description:
        "Comprehensive digital health records for complete patient care",
      details:
        "Secure, accessible medical history with diagnosis, treatments, and progress tracking.",
    },
    {
      icon: Pill,
      title: "Medication Tracking",
      description:
        "Complete medication management from prescription to administration",
      details:
        "Prescription management, dosage tracking, refill reminders, and medication history.",
    },
    {
      icon: TestTube,
      title: "Lab Management",
      description: "Integrated laboratory testing and results management",
      details:
        "Order tests, track progress, review results, and maintain comprehensive lab records.",
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Secure messaging system for healthcare coordination",
      details:
        "Internal messaging, patient communication, feedback system, and notifications.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive reporting and analytics dashboard",
      details:
        "Performance metrics, patient statistics, department analytics, and custom reports.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card shadow-lg border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="max-md:hidden">
                <h1 className="text-2xl font-bold text-card-foreground">
                  City Gate Hospital
                </h1>
                <p className="text-sm text-muted-foreground">
                  Healthcare Management Platform
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => scrollToSection("overview")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeSection === "overview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection("roles")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeSection === "roles"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                User Roles
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeSection === "features"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                Features
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.section
          id="overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-6">
                Welcome to City Gate Hospital
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                A comprehensive healthcare management platform designed to
                provide exceptional patient care, streamline medical operations,
                and enhance communication between healthcare providers and
                patients.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  Patient-Centered Care
                </h3>
                <p className="text-muted-foreground">
                  Putting patients first with personalized healthcare services
                  and easy access to medical information.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  Secure & Compliant
                </h3>
                <p className="text-muted-foreground">
                  HIPAA-compliant platform with enterprise-grade security to
                  protect sensitive health information.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  24/7 Access
                </h3>
                <p className="text-muted-foreground">
                  Round-the-clock access to healthcare services and medical
                  records for convenience and peace of mind.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Technical Architecture Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Technical Architecture
            </h2>
            <p className="text-xl text-muted-foreground">
              Built with modern technologies for enterprise-grade healthcare
              management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Frontend Stack
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      Next.js 15
                    </span>
                    <p className="text-sm text-muted-foreground">
                      React framework with App Router
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      React 19
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Latest React with concurrent features
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      TypeScript
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Type-safe development
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      Tailwind CSS 4
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Utility-first CSS framework
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      Framer Motion
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Smooth animations and transitions
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Backend Stack
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      PostgreSQL
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Enterprise-grade relational database
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      Drizzle ORM
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Type-safe database operations
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      Better Auth
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Secure authentication system
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      Server Actions
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Next.js server-side operations
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-card-foreground">
                      Zod Validation
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Runtime type validation
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-xl shadow-lg md:col-span-2"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Key Features
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    🔒 Security
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• HIPAA-compliant authentication</li>
                    <li>• Role-based access control (RBAC)</li>
                    <li>• Encrypted data transmission</li>
                    <li>• Audit logging for all actions</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    ⚡ Performance
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Server-side rendering (SSR)</li>
                    <li>• Optimized database queries</li>
                    <li>• Lazy loading components</li>
                    <li>• CDN-ready asset optimization</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    🔧 Developer Experience
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Type-safe development</li>
                    <li>• Hot reload development</li>
                    <li>• Comprehensive error handling</li>
                    <li>• Automated testing ready</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Database Schema Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Database Architecture
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive data model supporting all healthcare operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Core Entities
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Users</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Base
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Patients</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Extended
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Doctors</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Extended
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Staff</span>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    Extended
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Departments</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Reference
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Medical Records
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Appointments</span>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    Core
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Medical Records</span>
                  <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                    History
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Medications</span>
                  <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                    Treatment
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Lab Results</span>
                  <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                    Diagnostic
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Vital Signs</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Monitoring
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Communication
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Messages</span>
                  <span className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded">
                    Internal
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Feedback</span>
                  <span className="text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded">
                    Patient
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Notifications</span>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    System
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Sessions</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                    Auth
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Reports</span>
                  <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded">
                    Analytics
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card p-6 rounded-xl shadow-lg md:col-span-3"
            >
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Database Relationships
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-card-foreground mb-3">
                    Foreign Key Relationships
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        patients.user_id → users.id
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        doctors.user_id → users.id
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        staff.user_id → users.id
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        appointments.patient_id → patients.id
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        appointments.doctor_id → doctors.id
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        medical_records.patient_id → patients.id
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        medications.patient_id → patients.id
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        lab_results.patient_id → patients.id
                      </code>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground mb-3">
                    Data Integrity
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cascade delete on user removal</li>
                    <li>• Referential integrity constraints</li>
                    <li>• Unique constraints on critical fields</li>
                    <li>• Audit trails with created_at/updated_at</li>
                    <li>• Soft delete capabilities</li>
                    <li>• Version control for medical records</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Security & Authentication Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Security & Authentication
            </h2>
            <p className="text-xl text-muted-foreground">
              Enterprise-grade security for healthcare data protection
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Authentication System
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-card-foreground mb-2">
                    Better Auth Integration
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Secure authentication with session management
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email and password authentication</li>
                    <li>• JWT token-based sessions</li>
                    <li>• Session persistence and validation</li>
                    <li>• Automatic session refresh</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-card-foreground mb-2">
                    Role-Based Access Control
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Granular permissions system
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Admin: Full system access</li>
                    <li>• Doctor: Patient and medical data</li>
                    <li>• Patient: Personal health records</li>
                    <li>• Staff: Department operations</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Data Protection
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-card-foreground mb-2">
                    HIPAA Compliance
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Healthcare data protection standards
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Encrypted data storage</li>
                    <li>• Secure data transmission</li>
                    <li>• Access logging and audit trails</li>
                    <li>• Data retention policies</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-card-foreground mb-2">
                    Security Features
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Advanced protection mechanisms
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Input validation and sanitization</li>
                    <li>• SQL injection prevention</li>
                    <li>• XSS protection</li>
                    <li>• CSRF protection</li>
                    <li>• Rate limiting</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-xl shadow-lg md:col-span-2"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                API Security & Server Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    🔐 Server-Side Validation
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Zod schema validation</li>
                    <li>• Type-safe API endpoints</li>
                    <li>• Input sanitization</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    📊 Audit & Logging
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Action logging</li>
                    <li>• User activity tracking</li>
                    <li>• Error reporting</li>
                    <li>• Performance monitoring</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    🚀 Performance Security
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Rate limiting</li>
                    <li>• Request throttling</li>
                    <li>• Resource optimization</li>
                    <li>• CDN protection</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* API Reference Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              API Reference
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive server actions for healthcare operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                User Management
              </h3>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    createUser()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Register new users with role assignment
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    getUsers()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Retrieve user list with pagination
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    updateUser()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Modify user profile and settings
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    toggleUserBan()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Enable/disable user access
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Medical Operations
              </h3>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    createAppointment()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Schedule patient appointments
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    createMedicalRecord()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Add patient medical history
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    prescribeMedication()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Create medication prescriptions
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    orderLabTest()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Request laboratory tests
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Communication
              </h3>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    sendMessage()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Send secure internal messages
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    submitFeedback()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Collect patient feedback
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    markMessageAsRead()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Update message status
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    getUnreadMessagesCount()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Get notification counts
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Analytics & Reports
              </h3>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    generateAppointmentReport()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Create appointment analytics
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    generatePatientReport()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Patient statistics and trends
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    getDashboardStatistics()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Real-time dashboard metrics
                  </p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <code className="text-sm text-card-foreground">
                    getRecentActivities()
                  </code>
                  <p className="text-xs text-muted-foreground">
                    Activity feed and logs
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card p-8 rounded-xl shadow-lg md:col-span-2"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Advanced Server Actions
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    Patient Portal
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getPatientProfile()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getPatientHealthSummary()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        exportPatientData()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        requestAccountDeletion()
                      </code>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    Doctor Dashboard
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getDoctorDashboardStats()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getDoctorTodaySchedule()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getDoctorPatients()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getDoctorPatientDetails()
                      </code>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    Administrative
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        createDepartment()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getDepartments()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getAvailableDoctors()
                      </code>
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-muted px-1 rounded">
                        getDepartmentStats()
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Advanced Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Advanced Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Cutting-edge healthcare management capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Smart Scheduling System
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Intelligent Booking
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      AI-powered appointment scheduling with conflict resolution
                      and availability optimization.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Automated Reminders
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Multi-channel notifications (email, SMS, in-app) with
                      customizable timing and templates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Resource Optimization
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Dynamic scheduling based on doctor availability, room
                      capacity, and equipment requirements.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Digital Health Records
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mt-1">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Unified Patient Timeline
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Chronological view of all patient interactions,
                      treatments, and medical history in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mt-1">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Blockchain Security
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Immutable audit trails for all medical record
                      modifications with cryptographic verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center mt-1">
                    <TestTube className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Lab Integration
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Real-time lab result integration with automated
                      interpretation and clinical decision support.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Analytics & Intelligence
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-1">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Predictive Analytics
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Machine learning models for patient readmission risk,
                      treatment effectiveness, and resource planning.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mt-1">
                    <Users className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Population Health
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Aggregate health trends analysis for community health
                      management and preventive care programs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mt-1">
                    <Heart className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Clinical Decision Support
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Evidence-based treatment recommendations and drug
                      interaction alerts powered by medical knowledge bases.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Integration & Connectivity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mt-1">
                    <MessageSquare className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      HL7/FHIR APIs
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Standards-compliant healthcare interoperability with
                      external systems and EHR platforms.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mt-1">
                    <Pill className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      Pharmacy Integration
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Direct integration with pharmacy systems for electronic
                      prescribing and medication reconciliation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mt-1">
                    <Settings className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">
                      IoT Device Support
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Integration with wearable devices and remote monitoring
                      equipment for continuous care.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Configuration & Deployment Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Configuration & Deployment
            </h2>
            <p className="text-xl text-muted-foreground">
              Setting up and deploying the healthcare management platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Environment Setup
              </h3>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-card-foreground mb-2">
                    Prerequisites
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Node.js 18+ or Bun runtime</li>
                    <li>• PostgreSQL 14+ database</li>
                    <li>• Redis (optional, for caching)</li>
                    <li>• SSL certificate for production</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-card-foreground mb-2">
                    Environment Variables
                  </h4>
                  <div className="text-sm font-mono bg-background p-2 rounded text-card-foreground">
                    DATABASE_URL=postgresql://user:pass@localhost:5432/medi_crm
                    <br />
                    NEXTAUTH_SECRET=your-secret-key
                    <br />
                    NEXTAUTH_URL=https://your-domain.com
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Database Migration
              </h3>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-card-foreground mb-2">
                    Migration Commands
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-background p-2 rounded">
                      <code className="text-sm text-card-foreground">
                        bun x drizzle-kit generate
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Generate migration files
                      </p>
                    </div>
                    <div className="bg-background p-2 rounded">
                      <code className="text-sm text-card-foreground">
                        bun x drizzle-kit push
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Apply migrations to database
                      </p>
                    </div>
                    <div className="bg-background p-2 rounded">
                      <code className="text-sm text-card-foreground">
                        bun x drizzle-kit studio
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Open database management UI
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-card-foreground mb-2">
                    Seed Data
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Populate initial data for development
                  </p>
                  <div className="bg-background p-2 rounded">
                    <code className="text-sm text-card-foreground">
                      bun run db:seed
                    </code>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-xl shadow-lg md:col-span-2"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Deployment Options
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    🚀 Vercel Deployment
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• One-click deployment</li>
                    <li>• Automatic scaling</li>
                    <li>• Built-in CDN</li>
                    <li>• Environment management</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    🐳 Docker Deployment
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Containerized deployment</li>
                    <li>• Multi-environment support</li>
                    <li>• Orchestration ready</li>
                    <li>• Consistent environments</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">
                    ☁️ Cloud Platforms
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AWS, Azure, GCP support</li>
                    <li>• Managed database services</li>
                    <li>• Auto-scaling capabilities</li>
                    <li>• Backup and recovery</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* User Roles Section */}
        <motion.section
          id="roles"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              User Roles & Capabilities
            </h2>
            <p className="text-xl text-muted-foreground">
              Four distinct user roles designed to meet different healthcare
              needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {userRoles.map((role, index) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <div className={`p-3 ${role.color} rounded-lg mr-4`}>
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-card-foreground">
                      {role.title}
                    </h3>
                    <p className="text-muted-foreground">{role.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground mb-3">
                    Key Capabilities:
                  </h4>
                  {role.capabilities.map((capability, idx) => (
                    <div
                      key={idx}
                      className="flex items-center text-card-foreground"
                    >
                      <ArrowRight className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Core Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive healthcare management tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {feature.details}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Workflows Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Key Workflows
            </h2>
            <p className="text-xl text-muted-foreground">
              Understanding how our platform streamlines healthcare processes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Patient Registration & Onboarding
              </h3>
              <div className="space-y-4">
                {[
                  "Patient creates account or is registered by staff",
                  "Complete profile with medical history and insurance",
                  "Emergency contact and preference setup",
                  "Initial appointment booking",
                  "Welcome and orientation",
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                      {idx + 1}
                    </div>
                    <p className="text-card-foreground leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Appointment Workflow
              </h3>
              <div className="space-y-4">
                {[
                  "Patient books appointment online or via phone",
                  "Doctor reviews and confirms appointment",
                  "Automated reminders sent to patient",
                  "Check-in process and vital signs recording",
                  "Consultation and treatment",
                  "Follow-up instructions and next steps",
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                      {idx + 1}
                    </div>
                    <p className="text-card-foreground leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Medical Treatment Process
              </h3>
              <div className="space-y-4">
                {[
                  "Patient arrives for appointment",
                  "Medical history review and vital signs",
                  "Diagnosis and treatment planning",
                  "Prescription and medication instructions",
                  "Lab tests ordered if needed",
                  "Follow-up appointment scheduling",
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                      {idx + 1}
                    </div>
                    <p className="text-card-foreground leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-semibold text-card-foreground mb-6">
                Lab Testing Workflow
              </h3>
              <div className="space-y-4">
                {[
                  "Doctor orders required tests",
                  "Sample collection and processing",
                  "Results analysis and interpretation",
                  "Doctor reviews and validates results",
                  "Results shared with patient",
                  "Integration with medical records",
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                      {idx + 1}
                    </div>
                    <p className="text-card-foreground leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Getting Started Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Getting Started</h2>
              <p className="text-xl mb-8 opacity-90">
                Follow these simple steps to begin your healthcare journey with
                City Gate Hospital
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    1. Create Account
                  </h3>
                  <p className="opacity-90">
                    Register with your personal information and verify your
                    identity
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    2. Complete Profile
                  </h3>
                  <p className="opacity-90">
                    Add your medical history, insurance details, and preferences
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    3. Book Appointment
                  </h3>
                  <p className="opacity-90">
                    Schedule your first appointment and start your healthcare
                    journey
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Common questions and helpful answers
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: "How do I book an appointment?",
                answer:
                  "Patients can book appointments through the patient portal by selecting their preferred doctor, date, and time. The system will check availability and send confirmation with automated reminders.",
              },
              {
                question: "Can I access my medical records anytime?",
                answer:
                  "Yes, all patients have 24/7 access to their medical records through the secure patient portal. Records include history, medications, test results, and treatment plans.",
              },
              {
                question: "How are my health records protected?",
                answer:
                  "We use industry-standard encryption and security measures. Access is strictly controlled with role-based permissions, and all activities are logged for audit purposes.",
              },
              {
                question: "What should I do in case of emergency?",
                answer:
                  "For emergencies, call our emergency line at (555) 123-4567 immediately. Do not use the online system for emergency situations.",
              },
              {
                question: "How do I update my personal information?",
                answer:
                  "You can update your profile information through the settings section of your dashboard. Changes to medical information should be discussed with your doctor.",
              },
              {
                question: "Can I communicate with my doctor between visits?",
                answer:
                  "Yes, you can send secure messages to your doctor through the messaging system. Non-urgent questions can be addressed this way, while urgent matters require immediate phone contact.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <span className="text-lg font-semibold text-card-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      expandedFAQ === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-card-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="bg-gray-900 text-white rounded-2xl p-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Need Help?</h2>
              <p className="text-xl mb-8 opacity-90">
                Our support team is here to help you navigate the platform and
                answer any questions
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Emergency</h3>
                  <p className="opacity-90 mb-2">(555) 123-4567</p>
                  <p className="text-sm opacity-75">Available 24/7</p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Support</h3>
                  <p className="opacity-90 mb-2">
                    support@citygatehospital.com
                  </p>
                  <p className="text-sm opacity-75">Response within 24 hours</p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Help Center</h3>
                  <p className="opacity-90 mb-2">Visit our help center</p>
                  <p className="text-sm opacity-75">Self-service resources</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-semibold">
                  City Gate Hospital
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm opacity-75">
                <span>© 2025 City Gate Hospital</span>
                <span>•</span>
                <span>All rights reserved</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Documentation;
