"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createMedicalRecord, updateMedicalRecord } from "@/actions";
import {
  CreateMedicalRecordData,
  UpdateMedicalRecordData,
} from "@/actions/medical-actions";

interface MedicalRecordFormProps {
  record?: MedicalRecordData | null; // For edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

interface MedicalRecordData {
  record: {
    id: number;
    patientId: number;
    recordType: string;
    title: string;
    description: string | null;
    diagnosis: string | null;
    treatment: string | null;
    medications: string | null;
    labTests: string | null;
    vitalSigns: string | null;
    attachments: string | null;
    isConfidential: boolean | null;
  };
  patient: {
    id: number | null;
    name: string | null;
  };
}

export function CreateMedicalRecordForm({
  record,
  onSuccess,
  onCancel,
}: MedicalRecordFormProps) {
  const isEditMode = !!record;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateMedicalRecordData>({
    patientId: record?.patient?.id || 0,
    recordType: record?.record?.recordType || "consultation",
    title: record?.record?.title || "",
    description: record?.record?.description || "",
    diagnosis: record?.record?.diagnosis || "",
    treatment: record?.record?.treatment || "",
    medications: record?.record?.medications || "",
    labTests: record?.record?.labTests || "",
    vitalSigns: record?.record?.vitalSigns || "",
    attachments: record?.record?.attachments
      ? JSON.parse(record.record.attachments)
      : [],
    isConfidential: record?.record?.isConfidential || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isEditMode && record?.record?.id) {
        // Update existing record
        const updateData: UpdateMedicalRecordData = {
          recordType: formData.recordType,
          title: formData.title,
          description: formData.description,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          medications: formData.medications,
          labTests: formData.labTests,
          vitalSigns: formData.vitalSigns,
          attachments: formData.attachments,
          isConfidential: formData.isConfidential,
        };
        result = await updateMedicalRecord(record.record.id, updateData);
      } else {
        // Create new record
        result = await createMedicalRecord(formData);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(
          result.error ||
            `Failed to ${isEditMode ? "update" : "create"} medical record`
        );
      }
    } catch {
      setError(
        `An error occurred while ${
          isEditMode ? "updating" : "creating"
        } the medical record`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateMedicalRecordData,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {isEditMode ? "Edit Medical Record" : "Create Medical Record"}
        </h2>
        <p className="text-gray-600">
          {isEditMode
            ? "Update the medical record details"
            : "Enter the details for the new medical record"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID *</Label>
            <Input
              id="patientId"
              type="number"
              value={formData.patientId || ""}
              onChange={(e) =>
                handleInputChange("patientId", parseInt(e.target.value))
              }
              required
              disabled={isEditMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recordType">Record Type *</Label>
            <Select
              value={formData.recordType}
              onValueChange={(value) => handleInputChange("recordType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                <SelectItem value="treatment">Treatment</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Textarea
            id="diagnosis"
            value={formData.diagnosis || ""}
            onChange={(e) => handleInputChange("diagnosis", e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="treatment">Treatment</Label>
          <Textarea
            id="treatment"
            value={formData.treatment || ""}
            onChange={(e) => handleInputChange("treatment", e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="medications">Medications (JSON)</Label>
            <Textarea
              id="medications"
              value={formData.medications || ""}
              onChange={(e) => handleInputChange("medications", e.target.value)}
              placeholder='["Medication 1", "Medication 2"]'
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="labTests">Lab Tests (JSON)</Label>
            <Textarea
              id="labTests"
              value={formData.labTests || ""}
              onChange={(e) => handleInputChange("labTests", e.target.value)}
              placeholder='["CBC", "CMP"]'
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vitalSigns">Vital Signs (JSON)</Label>
          <Textarea
            id="vitalSigns"
            value={formData.vitalSigns || ""}
            onChange={(e) => handleInputChange("vitalSigns", e.target.value)}
            placeholder='{"bloodPressure": "120/80", "heartRate": "72"}'
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isConfidential"
            checked={formData.isConfidential || false}
            onCheckedChange={(checked) =>
              handleInputChange("isConfidential", checked)
            }
          />
          <Label htmlFor="isConfidential">Mark as confidential</Label>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Record"
              : "Create Record"}
          </Button>
        </div>
      </form>
    </div>
  );
}
