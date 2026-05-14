const express = require('express');
const cors = require('cors');
const config = require('./common/config/env');
const logger = require('./common/config/logger');
const errorHandler = require('./common/middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const doctorRoutes = require('./modules/doctors/doctor.routes');
const patientRoutes = require('./modules/patients/patient.routes');
const diagnosisRoutes = require('./modules/diagnoses/diagnosis.routes');
const diseaseCategoryRoutes = require('./modules/disease-categories/diseaseCategory.routes');
const diseaseRoutes = require('./modules/diseases/disease.routes');
const diseaseSuggestionRoutes = require('./modules/disease-suggestions/diseaseSuggestion.routes');
const medicalRecordRoutes = require('./modules/medical-records/medicalRecord.routes');
const appointmentRoutes = require('./modules/appointments/appointment.routes');
const auditLogRoutes = require('./modules/audit-logs/auditLog.routes');
const receptionistRoutes = require('./modules/receptionists/receptionist.routes');

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

app.use((req, _res, next) => {
  req.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/diagnoses', diagnosisRoutes);
app.use('/api/v1/disease-categories', diseaseCategoryRoutes);
app.use('/api/v1/diseases', diseaseRoutes);
app.use('/api/v1/disease-suggestions', diseaseSuggestionRoutes);
app.use('/api/v1/medical-records', medicalRecordRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/receptionists', receptionistRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

module.exports = app;
