# Medical CRM System - Use Case Diagram

## Overview

This document outlines the use cases for the Medical CRM (Customer Relationship Management) system designed to improve patient-hospital interaction and enhance service delivery.

## Actors

### Primary Actors

1. **Patient** - End user seeking medical services
2. **Doctor** - Medical professional providing healthcare services
3. **Administrator** - System administrator managing hospital operations
4. **Staff** - Hospital staff (nurses, receptionists, etc.)

### Secondary Actors

5. **System** - Automated system processes and notifications

## Use Cases by Actor

### Patient Use Cases

#### Account Management

- **Register Account**: Create new patient account
- **Login**: Authenticate to access system
- **Update Profile**: Modify personal information
- **View Profile**: Access personal information

#### Appointment Management

- **Book Appointment**: Schedule new appointment with doctor
- **View Appointments**: See upcoming and past appointments
- **Cancel Appointment**: Cancel existing appointment
- **Reschedule Appointment**: Change appointment date/time

#### Health Records

- **View Medical Records**: Access medical history and records
- **View Medications**: See prescribed medications
- **View Lab Results**: Access test results
- **Download Records**: Export medical documents

#### Communication

- **Submit Feedback**: Send complaints, suggestions, or praise
- **Send Messages**: Communicate with doctors/staff
- **View Messages**: Read received messages
- **View Notifications**: See system notifications

### Doctor Use Cases

#### Account Management

- **Register Account**: Create doctor profile
- **Login**: Authenticate to access system
- **Update Profile**: Modify professional information
- **View Profile**: Access professional information

#### Patient Care

- **View Patient List**: See assigned patients
- **View Patient History**: Access complete patient records
- **Create Medical Record**: Add new medical entry
- **Update Medical Record**: Modify existing records

#### Appointment Management

- **View Schedule**: See daily/weekly appointments
- **Manage Appointments**: Confirm, cancel, or reschedule
- **Conduct Appointment**: Record appointment details
- **Prescribe Medication**: Create medication prescriptions

#### Test & Results

- **Order Lab Tests**: Request diagnostic tests
- **Review Lab Results**: Analyze and interpret test results
- **Update Test Status**: Mark tests as reviewed

#### Communication

- **Send Messages**: Communicate with patients/staff
- **Respond to Feedback**: Handle patient inquiries
- **View Notifications**: See system alerts

### Administrator Use Cases

#### User Management

- **Manage Users**: Create, update, deactivate user accounts
- **Assign Roles**: Set user permissions and roles
- **View User Activity**: Monitor user actions

#### Department Management

- **Create Department**: Add new hospital departments
- **Manage Departments**: Update department information
- **Assign Staff**: Allocate staff to departments

#### System Management

- **View Reports**: Access system analytics and reports
- **Generate Reports**: Create custom reports
- **Manage System Settings**: Configure system parameters
- **Monitor System Health**: Check system performance

#### Appointment Oversight

- **View All Appointments**: See hospital-wide appointments
- **Manage Conflicts**: Resolve scheduling conflicts
- **Override Appointments**: Administrative appointment changes

#### Feedback Management

- **View Feedback**: Access all patient feedback
- **Assign Feedback**: Delegate feedback to appropriate staff
- **Track Resolution**: Monitor feedback status
- **Analyze Trends**: Identify patterns in feedback

### Staff Use Cases

#### Daily Operations

- **View Schedule**: See assigned tasks
- **Update Patient Records**: Modify basic patient information
- **Manage Appointments**: Handle appointment logistics
- **Assist Patients**: Provide administrative support

#### Communication

- **Send Messages**: Communicate with patients/doctors
- **Handle Inquiries**: Respond to patient questions
- **Escalate Issues**: Forward complex issues to appropriate personnel

## System Use Cases

#### Automated Processes

- **Send Notifications**: Automated alerts and reminders
- **Generate Reports**: Scheduled report creation
- **Backup Data**: Automated data backups
- **Monitor Appointments**: Track appointment status
- **Send Reminders**: Appointment and medication reminders

## Use Case Relationships

### Include Relationships

- "Update Profile" includes "View Profile"
- "Reschedule Appointment" includes "Cancel Appointment" and "Book Appointment"
- "Conduct Appointment" includes "Create Medical Record"

### Extend Relationships

- "Emergency Appointment" extends "Book Appointment"
- "Urgent Review" extends "Review Lab Results"
- "Admin Override" extends "Manage Appointments"

## Security Considerations

- All use cases require proper authentication
- Role-based access control for sensitive operations
- Audit logging for critical actions
- Data encryption for sensitive information

## Performance Requirements

- Response time < 2 seconds for common operations
- Support for concurrent users
- Real-time notifications
- Offline capability for critical functions
